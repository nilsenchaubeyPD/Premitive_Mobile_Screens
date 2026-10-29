export const secs = (ms: number) => Math.max(0, Math.ceil(ms / 1000));

/** "X min Y sec" */
export function minSec(ms: number): string {
  const s = secs(ms);
  return `${Math.floor(s / 60)} min ${s % 60} sec`;
}

/** "X sec" under a minute, otherwise "X min Y sec". */
export function shortCountdown(ms: number): string {
  const s = secs(ms);
  return s <= 60 ? `${s} sec` : minSec(ms);
}

/** "0:SS" / "M:SS" */
export function clock(ms: number): string {
  const s = secs(ms);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function hm(ms: number): string {
  const totalMin = Math.max(0, Math.ceil(ms / 60_000));
  return `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`;
}

export function timeOfDay(t: number, withSeconds = false): string {
  return new Date(t).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    ...(withSeconds ? { second: '2-digit' } : {}),
    hour12: true,
  });
}

export function dateTime(t: number): string {
  const d = new Date(t);
  return `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, ${timeOfDay(t)}`;
}

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/** Topin countdown copy: "1 Min 53 Secs", "18 Secs". */
export function minSecsLabel(ms: number): string {
  const s = secs(ms);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m} Min ${s % 60} Secs` : `${s} Secs`;
}
