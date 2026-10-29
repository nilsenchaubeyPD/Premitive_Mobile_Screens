import { useSyncExternalStore } from 'react';
import {
  DEFAULT_CUSTOM_PASSWORD,
  DEFAULT_REFRESH_MS,
  EXAM_DURATION_MIN,
  EXIT_TOKEN_TTL_SECONDS,
  LOCK_SECONDS,
  MAX_PIN_ATTEMPTS,
  POST_END_GRACE_MINUTES,
} from '../config';
import { Phase, phaseOf } from './pin';

export type ExitType = 'rotating' | 'custom';

export interface LogEvent {
  id: number;
  at: number; // server time
  name: string;
  data?: Record<string, unknown>;
}

export interface ExitToken {
  id: string;
  issuedAt: number;
  expiresAt: number;
  used: boolean;
}

export interface AppState {
  /** Fast-forward offset applied to the real clock to produce mocked server time. */
  offsetMs: number;
  /** Mocked server time. The single source of truth for every PIN, countdown and phase. */
  now: number;
  examStart: number;
  examEnd: number;
  /** Internal Admin Options › Enable Secure Browser: No / Fixed PIN / PIN Rotation. */
  sebEnabled: boolean;
  /** Published before release: old exit flow (fixed password in the SEB config, Logout, native Quit); no Exit PIN, no tracking. */
  legacy: boolean;
  exitType: ExitType;
  refreshMs: number;
  customPassword: string;
  submitted: boolean;
  offline: boolean;
  completedSections: number;
  attempts: number;
  lockUntil: number;
  token: ExitToken | null;
  events: LogEvent[];
}

const DURATION = EXAM_DURATION_MIN * 60_000;
const MIN = 60_000;

function phaseTimes(phase: Phase, now: number): { examStart: number; examEnd: number } {
  switch (phase) {
    case 'before': {
      const examStart = now + 20 * MIN;
      return { examStart, examEnd: examStart + DURATION };
    }
    case 'soon': {
      const examStart = now + 4 * MIN;
      return { examStart, examEnd: examStart + DURATION };
    }
    case 'live': {
      const examStart = now - 30 * MIN;
      return { examStart, examEnd: examStart + DURATION };
    }
    case 'grace': {
      const examEnd = now - 3 * MIN;
      return { examStart: examEnd - DURATION, examEnd };
    }
    case 'closed': {
      const examEnd = now - (POST_END_GRACE_MINUTES + 5) * MIN;
      return { examStart: examEnd - DURATION, examEnd };
    }
  }
}

const initialNow = Date.now();

let state: AppState = {
  offsetMs: 0,
  now: initialNow,
  ...phaseTimes('live', initialNow),
  sebEnabled: true,
  legacy: false,
  exitType: 'rotating',
  refreshMs: DEFAULT_REFRESH_MS,
  customPassword: DEFAULT_CUSTOM_PASSWORD,
  submitted: false,
  offline: false,
  completedSections: 0,
  attempts: 0,
  lockUntil: 0,
  token: null,
  events: [],
};

const listeners = new Set<() => void>();
let eventSeq = 1;

function set(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function tick() {
  const now = Date.now() + state.offsetMs;
  const patch: Partial<AppState> = { now };
  // Lock ends → attempts reset.
  if (state.lockUntil && now >= state.lockUntil) {
    patch.lockUntil = 0;
    patch.attempts = 0;
  }
  set(patch);
}

// One mocked server clock for the whole app.
setInterval(tick, 200);
// Tab hidden and resumed: resync immediately so a stale code is never shown.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') tick();
});
window.addEventListener('focus', tick);

function log(name: string, data?: Record<string, unknown>) {
  const ev: LogEvent = { id: eventSeq++, at: state.now, name, data };
  // eslint-disable-next-line no-console
  console.log(`[event] ${name}`, data ?? {});
  set({ events: [ev, ...state.events].slice(0, 200) });
}

export const actions = {
  log,
  setPhase(phase: Phase) {
    set(phaseTimes(phase, state.now));
  },
  /** Edge-case helper: keep the exam live but end it 30 s from now. */
  endExamSoon() {
    const examEnd = state.now + 30_000;
    set({ examEnd, examStart: Math.min(state.examStart, examEnd - DURATION) });
  },
  fastForward(ms: number) {
    state = { ...state, offsetMs: state.offsetMs + ms };
    tick();
  },
  /** Edge-case helper: jump to 3 s before the next Exit PIN rotation. */
  skipToRotation() {
    const next = Math.floor(state.now / state.refreshMs + 1) * state.refreshMs;
    actions.fastForward(next - 3000 - state.now);
  },
  resetClock() {
    state = { ...state, offsetMs: 0 };
    tick();
  },
  setLegacy(legacy: boolean) {
    if (legacy !== state.legacy) set({ legacy });
  },
  setSebEnabled(sebEnabled: boolean) {
    if (sebEnabled !== state.sebEnabled) set({ sebEnabled });
  },
  setExitType(exitType: ExitType) {
    if (exitType !== state.exitType || !state.sebEnabled) set({ exitType, sebEnabled: true });
  },
  setRefreshMs(refreshMs: number) {
    if (refreshMs !== state.refreshMs) set({ refreshMs });
  },
  setCustomPassword(customPassword: string) {
    set({ customPassword });
  },
  setSubmitted(submitted: boolean) {
    if (submitted !== state.submitted) set({ submitted });
  },
  setOffline(offline: boolean) {
    if (offline !== state.offline) set({ offline });
  },
  setCompletedSections(n: number) {
    if (n !== state.completedSections) set({ completedSections: n });
  },
  /** Records a failed attempt. Returns true if this attempt triggered the lock. */
  failAttempt(): boolean {
    const attempts = state.attempts + 1;
    if (attempts >= MAX_PIN_ATTEMPTS) {
      set({ attempts, lockUntil: state.now + LOCK_SECONDS * 1000 });
      return true;
    }
    set({ attempts });
    return false;
  },
  forceLock() {
    set({ attempts: MAX_PIN_ATTEMPTS, lockUntil: state.now + LOCK_SECONDS * 1000 });
  },
  issueToken(): ExitToken {
    const token: ExitToken = {
      id: Math.random().toString(36).slice(2, 10),
      issuedAt: state.now,
      expiresAt: state.now + EXIT_TOKEN_TTL_SECONDS * 1000,
      used: false,
    };
    set({ token, attempts: 0 });
    log('exit_token_issued', { token: token.id, ttl_s: EXIT_TOKEN_TTL_SECONDS });
    return token;
  },
  /** Single-use: returns false if the token is missing, used or expired. */
  consumeToken(): boolean {
    const t = state.token;
    if (!t || t.used || state.now >= t.expiresAt) return false;
    set({ token: { ...t, used: true } });
    return true;
  },
  discardToken() {
    if (state.token) set({ token: null });
  },
  clearEvents() {
    set({ events: [] });
  },
};

export function getState() {
  return state;
}

export function useApp(): AppState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export function usePhase(): Phase {
  const s = useApp();
  return phaseOf(s);
}
