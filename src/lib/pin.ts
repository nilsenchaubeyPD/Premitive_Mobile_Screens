import {
  CUSTOM_MAX,
  CUSTOM_MIN,
  EXAM_PIN_REFRESH_MS,
  EXAM_PIN_VISIBLE_BEFORE_MIN,
  EXAM_SECRET,
  EXIT_PIN_ALPHABET,
  EXIT_PIN_LENGTH,
  EXIT_SECRET,
  POST_END_GRACE_MINUTES,
  PREVIOUS_CODE_GRACE_SECONDS,
} from '../config';

/* ---------- hashing (authenticator-style, deterministic) ---------- */

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** hash(secret + floor(serverNow / refreshMs)) → EXIT_PIN_LENGTH chars from the unambiguous alphabet. */
export function exitCodeFor(counter: number, refreshMs: number): string {
  const rand = mulberry32(fnv1a(`${EXIT_SECRET}:${refreshMs}:${counter}`));
  let out = '';
  for (let i = 0; i < EXIT_PIN_LENGTH; i++) out += EXIT_PIN_ALPHABET[Math.floor(rand() * EXIT_PIN_ALPHABET.length)];
  return out;
}

export function examPinFor(counter: number): string {
  const rand = mulberry32(fnv1a(`${EXAM_SECRET}:${counter}`));
  return String(Math.floor(rand() * 10000)).padStart(4, '0');
}

/* ---------- phase ---------- */

export type Phase = 'before' | 'soon' | 'live' | 'grace' | 'closed';

export const PHASE_LABEL: Record<Phase, string> = {
  before: 'Before start',
  soon: 'Within 5 min of start',
  live: 'Live',
  grace: 'Ended (grace)',
  closed: 'Ended (closed)',
};

export interface Clock {
  now: number;
  examStart: number;
  examEnd: number;
}

export const GRACE_MS = POST_END_GRACE_MINUTES * 60_000;

export function phaseOf({ now, examStart, examEnd }: Clock): Phase {
  if (now < examStart - EXAM_PIN_VISIBLE_BEFORE_MIN * 60_000) return 'before';
  if (now < examStart) return 'soon';
  if (now < examEnd) return 'live';
  if (now < examEnd + GRACE_MS) return 'grace';
  return 'closed';
}

/* ---------- current codes ---------- */

export interface ExitInfo {
  code: string;
  previous: string;
  windowStart: number;
  nextAt: number;
  msLeft: number;
  /** ms for which `previous` is still accepted (0 if outside the grace). */
  previousAcceptedMs: number;
}

export function exitInfo(now: number, refreshMs: number): ExitInfo {
  const counter = Math.floor(now / refreshMs);
  const windowStart = counter * refreshMs;
  const graceMs = PREVIOUS_CODE_GRACE_SECONDS * 1000;
  return {
    code: exitCodeFor(counter, refreshMs),
    previous: exitCodeFor(counter - 1, refreshMs),
    windowStart,
    nextAt: windowStart + refreshMs,
    msLeft: windowStart + refreshMs - now,
    previousAcceptedMs: Math.max(0, windowStart + graceMs - now),
  };
}

export interface ExamPinInfo {
  pin: string;
  msLeft: number;
}

export function examPinInfo(now: number): ExamPinInfo {
  const counter = Math.floor(now / EXAM_PIN_REFRESH_MS);
  return { pin: examPinFor(counter), msLeft: (counter + 1) * EXAM_PIN_REFRESH_MS - now };
}

/* ---------- verification ---------- */

export type FailReason = 'wrong' | 'expired';
export type VerifyResult = { ok: true } | { ok: false; reason: FailReason };

export function verifyExit(
  input: string,
  opts: Clock & { exitType: 'rotating' | 'custom'; refreshMs: number; customPassword: string },
): VerifyResult {
  const value = input.trim().toUpperCase();
  const windowClosed = opts.now >= opts.examEnd + GRACE_MS;

  if (opts.exitType === 'custom') {
    const match = value === opts.customPassword.toUpperCase();
    if (match && !windowClosed) return { ok: true };
    return { ok: false, reason: match ? 'expired' : 'wrong' };
  }

  const info = exitInfo(opts.now, opts.refreshMs);
  if (!windowClosed) {
    if (value === info.code) return { ok: true };
    if (value === info.previous && info.previousAcceptedMs > 0) return { ok: true };
  }
  // A code that was valid recently (or valid before the window closed) reads as "expired".
  const counter = Math.floor(opts.now / opts.refreshMs);
  for (let k = 0; k <= 20; k++) {
    if (value === exitCodeFor(counter - k, opts.refreshMs)) return { ok: false, reason: 'expired' };
  }
  return { ok: false, reason: 'wrong' };
}

export function isAllowedExitChar(c: string): boolean {
  return c.length === 1 && EXIT_PIN_ALPHABET.includes(c.toUpperCase());
}

/** Default Fixed PIN when the admin leaves it blank (8 letters + numbers, no look-alike characters). */
export function generateFixedPassword(): string {
  const a = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => a[Math.floor(Math.random() * a.length)]).join('');
}
