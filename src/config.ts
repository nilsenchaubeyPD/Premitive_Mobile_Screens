/**
 * Every [OPEN] decision from the build spec lives here. Change a value and the
 * whole prototype follows; nothing below is hard-coded elsewhere.
 */

/** [OPEN] Seconds after a rotation during which the previous Exit PIN is still accepted. */
export const PREVIOUS_CODE_GRACE_SECONDS = 10;

/**
 * Minutes after the exam end time that the Exit PIN stays live (decided: 15). Keep it ≤ 15 — a longer
 * window gives a leaked PIN more time to be misused. The PIN keeps rotating during this window.
 */
export const POST_END_GRACE_MINUTES = 15;

/** [OPEN] Wrong attempts allowed before the pop-up locks. */
export const MAX_PIN_ATTEMPTS = 5;

/** [OPEN] Lock duration after too many attempts, in seconds. */
export const LOCK_SECONDS = 30;

/** [OPEN] Does a mid-exam exit auto-submit the test? Default no: flag only. */
export const MID_EXAM_EXIT_AUTO_SUBMIT = false;

/** Single-use exit token lifetime, in seconds. */
export const EXIT_TOKEN_TTL_SECONDS = 60;

/** Mock verification latency, in ms. */
export const VERIFY_DELAY_MS = 600;

/** Exit PIN refresh options (ms) and the default for new SEB assessments. */
/**
 * [OPEN] `warnSec`: the countdown turns red when this many seconds are left — the last 25% of the
 * window, rounded up to a usable minimum for short windows (30 sec → 10 sec matches the previous-code grace).
 */
export const REFRESH_OPTIONS = [
  { ms: 15_000, label: '15 sec', warnSec: 5 },
  { ms: 30_000, label: '30 sec', warnSec: 10 },
  { ms: 60_000, label: '1 min', warnSec: 15 },
  { ms: 120_000, label: '2 min', warnSec: 30 },
] as const;
/** Fallback for any other refresh rate: last 25% of the window, at least 5 sec. */
export const warnSecondsFor = (refreshMs: number) =>
  REFRESH_OPTIONS.find((o) => o.ms === refreshMs)?.warnSec ?? Math.max(5, Math.ceil((refreshMs / 1000) * 0.25));
export const DEFAULT_REFRESH_MS = 30_000;

/** Exam PIN: 4 digits, refreshing every 2 min (existing behaviour). */
export const EXAM_PIN_REFRESH_MS = 120_000;
/** [OPEN] Exam PIN countdown turns red with this many seconds left (2 min window → 30 sec). */
export const EXAM_PIN_WARN_SECONDS = 30;
/** Exam PIN becomes visible this many minutes before start. */
export const EXAM_PIN_VISIBLE_BEFORE_MIN = 5;

/** Rotating Exit PIN: numbers only (4 digits). The Fixed PIN is the only alphanumeric option. */
export const EXIT_PIN_ALPHABET = '0123456789';
export const EXIT_PIN_LENGTH = 4;

/** Fixed PIN rules (6–9 letters or numbers). */
export const CUSTOM_MIN = 6;
export const CUSTOM_MAX = 9;
export const DEFAULT_CUSTOM_PASSWORD = 'TOPIN2026';

/** Mock secrets (would be server-side in production). */
export const EXIT_SECRET = 'topin-seb-exit-demo';
export const EXAM_SECRET = 'topin-exam-pin-demo';

/** Mock assessment. */
export const EXAM_DURATION_MIN = 90;
export const ASSESSMENT = {
  name: 'Full Stack Developer Hiring Assessment · Campus Drive 2026, Batch 12',
  candidate: 'Ravi Kumar',
  admin: 'Topin Admin',
  url: 'https://topin.tech/a/fsd-campus-2026-b12',
};
export const SECTIONS = [
  { title: 'Aptitude & Logical Reasoning', type: 'MCQ', questions: 20, score: 40, minutes: 25 },
  {
    title:
      'Data Structures and Algorithms: Arrays, Strings, Linked Lists, Trees, Graphs, Recursion and Dynamic Programming Practice Set',
    type: 'MCQ',
    questions: 15,
    score: 30,
    minutes: 25,
  },
  { title: 'Coding Challenge', type: 'Coding', questions: 2, score: 30, minutes: 40 },
];
