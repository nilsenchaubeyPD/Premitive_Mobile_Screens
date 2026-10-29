import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { EXAM_PIN_REFRESH_MS, EXAM_PIN_VISIBLE_BEFORE_MIN, EXAM_PIN_WARN_SECONDS, EXIT_PIN_LENGTH, warnSecondsFor } from '../config';
import { Link } from 'react-router-dom';
import { cx, minSecsLabel, timeOfDay } from '../lib/format';
import { GRACE_MS, examPinFor, examPinInfo, exitCodeFor, exitInfo, phaseOf } from '../lib/pin';
import { actions, useApp } from '../lib/store';
import { BulkClockIcon, BulkTickIcon, KeyIcon, LogoutIcon } from './icons';
import { Button, IconBubble } from './ui';

/** full = invigilator desk, compact = admin View Assessment, present = projector / in-hall screen. */
export type Size = 'full' | 'compact' | 'present';
const SizeCtx = createContext<Size>('full');

/** Mirrors Figma components "PIN / Exam card" and "PIN / Exit card" (Size × State). */
function CardShell({
  size,
  muted,
  bubble,
  title,
  subtitle,
  children,
  footer,
  minHeight,
}: {
  size: Size;
  muted?: boolean;
  bubble: ReactNode;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  minHeight?: number;
}) {
  return (
    <SizeCtx.Provider value={size}>
      <section
        className={cx(
          'flex flex-col rounded-card border border-line',
          muted ? 'bg-muted-bg' : 'bg-white',
          size === 'present' ? 'rounded-2xl p-12' : size === 'full' ? 'p-7' : 'p-6',
        )}
        style={{ minHeight }}
      >
        <div className="flex items-center gap-3.5">
          {size !== 'present' && bubble}
          <div className="min-w-0">
            <h3 className={cx('font-semibold text-fg', size === 'present' ? 'text-[36px] leading-10' : 'text-[16px] leading-6')}>{title}</h3>
            {size !== 'present' && <p className="text-[14px] leading-5 text-fg-3">{subtitle}</p>}
          </div>
        </div>
        <div className={cx('flex flex-1 items-center justify-center', size === 'present' ? 'py-12' : size === 'full' ? 'py-8' : 'py-6')}>{children}</div>
        <div className={cx('flex items-center justify-between gap-3', size === 'present' ? 'min-h-12' : 'min-h-9')}>{footer}</div>
      </section>
    </SizeCtx.Provider>
  );
}

function Caption({ children, warn }: { children: ReactNode; warn?: boolean }) {
  const size = useContext(SizeCtx);
  return (
    <p className={cx('font-medium tabular', size === 'present' ? 'text-[28px] leading-9' : 'text-[14px] leading-5', warn ? 'text-danger' : 'text-fg-2')}>
      {children}
    </p>
  );
}

/** "This PIN will expire in: 1 Min 53 Secs" (Topin's existing copy). Turns red in the last `warnSec`. */
const ExpiresIn = ({ ms, warnSec, suffix }: { ms: number; warnSec: number; suffix?: string }) => {
  const warn = ms <= warnSec * 1000;
  return (
    <Caption warn={warn}>
      This PIN will expire in: <b className={cx('font-semibold', warn ? 'text-danger' : 'text-fg')}>{minSecsLabel(ms)}</b>
      {suffix}
    </Caption>
  );
};

/**
 * No auto-refresh: the card keeps the PIN it last loaded. Once the server rotates past it, the card
 * shows that PIN greyed out with "This PIN has expired" until the invigilator clicks "Refresh PIN".
 * Opening the page, a phase change or a clock jump loads the current PIN.
 */
function useManualRefresh(windowStart: number, visible: boolean, resetKey: string, pin: 'exam' | 'exit') {
  const [loaded, setLoaded] = useState(windowStart);
  useEffect(() => {
    if (!visible) setLoaded(windowStart);
  }, [visible, windowStart]);
  useEffect(() => {
    setLoaded(windowStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);
  return {
    expired: visible && windowStart > loaded,
    loaded,
    refresh: () => {
      setLoaded(windowStart);
      actions.log('pin_refresh_clicked', { pin });
    },
  };
}

function ExpiredFooter({ onRefresh }: { onRefresh: () => void }) {
  const size = useContext(SizeCtx);
  return (
    <>
      <p className={cx('font-medium text-exit-icon', size === 'present' ? 'text-[28px] leading-9' : 'text-[14px] leading-5')} role="status">
        This PIN has expired
      </p>
      <Button variant="neutral" size={size === 'present' ? 'lg' : 'sm'} onClick={onRefresh}>
        Refresh PIN
      </Button>
    </>
  );
}

/** Figma "PIN / Box": Full 48×60 (30px), Full-long 40×52 (24px), Compact 36×44 (20px). Same box for Exam and Exit PIN. */
export function PinBoxes({ chars, size, dashed, expired }: { chars: string[]; size: Size; dashed?: boolean; expired?: boolean }) {
  // A Fixed PIN of 7–9 characters uses the narrower Full-long box so it fits the card.
  const long = chars.length > 6;
  // Projector boxes scale with the screen width (capped), so the PIN stays legible on any in-hall display.
  const presentStyle =
    size === 'present'
      ? long
        ? { width: 'clamp(32px, 4.2vw, 88px)', height: 'clamp(44px, 5.6vw, 120px)', fontSize: 'clamp(22px, 3vw, 64px)' }
        : { width: 'clamp(44px, 6vw, 136px)', height: 'clamp(58px, 7.8vw, 176px)', fontSize: 'clamp(32px, 4.6vw, 104px)' }
      : undefined;
  const box =
    size === 'present'
      ? 'rounded-2xl'
      : size === 'full'
        ? long
          ? 'h-[52px] w-10 text-[24px]'
          : 'h-[60px] w-12 text-[30px]'
        : long
          ? 'h-11 w-8 text-[18px]'
          : 'h-11 w-9 text-[20px]';
  const gap = size === 'present' ? 'clamp(6px, 1.2vw, 20px)' : size === 'full' ? (long ? 6 : 8) : 6;
  return (
    <div className="flex items-center" style={{ gap }}>
      {chars.map((c, i) => (
        <span
          key={i}
          style={presentStyle}
          className={cx(
            'inline-flex items-center justify-center rounded-ctl font-bold leading-none',
            box,
            dashed
              ? 'border border-dashed border-line-input bg-transparent'
              : expired
                ? 'border border-line bg-muted-bg text-fg-4'
                : 'border border-line-input bg-white text-fg',
          )}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

const EMPTY_EXIT = Array.from({ length: EXIT_PIN_LENGTH }, () => '');
const EMPTY_EXAM = ['', '', '', ''];

/* ---------------- Exam PIN ---------------- */

export function ExamPinCard({ size = 'full', minHeight }: { size?: Size; minHeight?: number }) {
  const s = useApp();
  const phase = phaseOf(s);
  const visible = phase === 'soon' || phase === 'live';
  const { pin, msLeft } = examPinInfo(s.now);
  const counter = Math.floor(s.now / EXAM_PIN_REFRESH_MS);
  const manual = useManualRefresh(counter * EXAM_PIN_REFRESH_MS, visible, `${phase}|${s.offsetMs}`, 'exam');
  const showGap = manual.expired;
  const shown = showGap ? examPinFor(manual.loaded / EXAM_PIN_REFRESH_MS) : pin;

  return (
    <CardShell
      size={size}
      minHeight={minHeight}
      bubble={
        <IconBubble tone="primary">
          <KeyIcon size={20} />
        </IconBubble>
      }
      title="Exam PIN"
      subtitle="Candidates enter this to start the exam"
      footer={
        !visible ? (
          <Caption>Visible 5 mins before the exam starts</Caption>
        ) : showGap ? (
          <ExpiredFooter onRefresh={manual.refresh} />
        ) : (
          <ExpiresIn ms={msLeft} warnSec={EXAM_PIN_WARN_SECONDS} />
        )
      }
    >
      <div aria-label={visible ? `Exam PIN ${shown.split('').join(' ')}` : 'Exam PIN hidden'} role="group">
        <PinBoxes chars={visible ? shown.split('') : EMPTY_EXAM} size={size} dashed={!visible} expired={showGap} />
      </div>
    </CardShell>
  );
}

/* ---------------- Exit PIN ---------------- */

export function ExitPinCard({ size = 'full', minHeight }: { size?: Size; minHeight?: number }) {
  const s = useApp();
  const phase = phaseOf(s);
  const custom = s.exitType === 'custom';
  const info = exitInfo(s.now, s.refreshMs);
  const visible = phase === 'live' || phase === 'grace';
  const manual = useManualRefresh(info.windowStart, visible && !custom, `${phase}|${s.offsetMs}|${s.refreshMs}|${s.exitType}`, 'exit');
  const showGap = manual.expired;
  const closesIn = s.examEnd + GRACE_MS - s.now;
  const closesLabel = ` · Window closes in ${Math.max(1, Math.ceil(closesIn / 60_000))} min`;

  const bubble = (
    <IconBubble tone="exit">
      <LogoutIcon size={20} />
    </IconBubble>
  );
  const title = phase === 'grace' ? 'Exit PIN · still active' : 'Exit PIN';
  const subtitle = 'Share only with a candidate leaving the Secure Browser';

  let body: ReactNode;
  let footer: ReactNode;

  if (!visible) {
    body = <PinBoxes chars={EMPTY_EXIT} size={size} dashed />;
    footer = <Caption>Visible once the exam starts</Caption>;
  } else if (custom) {
    body = <PinBoxes chars={s.customPassword.toUpperCase().split('')} size={size} />;
    footer = <Caption>Fixed PIN · does not change{phase === 'grace' ? closesLabel : ''}</Caption>;
  } else if (showGap) {
    body = <PinBoxes chars={exitCodeFor(manual.loaded / s.refreshMs, s.refreshMs).split('')} size={size} expired />;
    footer = <ExpiredFooter onRefresh={manual.refresh} />;
  } else {
    body = <PinBoxes chars={info.code.split('')} size={size} />;
    // In the grace window the code keeps rotating, but never outlives the window itself.
    const expiresIn = phase === 'grace' ? Math.min(info.msLeft, closesIn) : info.msLeft;
    footer = <ExpiresIn ms={expiresIn} warnSec={warnSecondsFor(s.refreshMs)} suffix={phase === 'grace' ? closesLabel : undefined} />;
  }

  return (
    <CardShell size={size} minHeight={minHeight} bubble={bubble} title={title} subtitle={subtitle} footer={footer}>
      <div aria-label={visible ? 'Exit PIN' : 'Exit PIN hidden'} role="group">
        {body}
      </div>
    </CardShell>
  );
}

/* ---------------- After the exam ---------------- */

/** Grace window: replaces the Exam PIN card — nobody can start any more; only the Exit PIN is still needed. */
export function ExamEndedCard({ size = 'full', minHeight }: { size?: Size; minHeight?: number }) {
  const s = useApp();
  return (
    <section
      className={cx('flex flex-col justify-center gap-4 rounded-card border border-line bg-muted-bg', size === 'full' ? 'p-7' : 'p-6')}
      style={{ minHeight }}
    >
      <BulkClockIcon size={40} className="text-fg-4" />
      <div>
        <h3 className="text-[16px] font-semibold leading-6 text-fg">Exam ended at {timeOfDay(s.examEnd)}</h3>
        <p className="mt-1 text-[14px] leading-5 text-fg-3">
          Exam PIN is no longer needed. The Exit PIN stays active until {timeOfDay(s.examEnd + GRACE_MS)} so candidates can close the
          Secure Browser.
        </p>
      </div>
    </section>
  );
}

/** Exit window closed: no PIN boxes at all — the assessment is simply completed. */
export function AssessmentCompletedCard() {
  const s = useApp();
  return (
    <section className="flex items-center gap-5 rounded-card border border-line bg-white p-7">
      <BulkTickIcon size={48} className="shrink-0 text-success" />
      <div className="min-w-0 flex-1">
        <h3 className="text-[18px] font-semibold leading-7 text-fg">Assessment completed</h3>
        <p className="mt-1 text-[14px] leading-5 text-fg-3">
          {s.sebEnabled
            ? `The exit window closed at ${timeOfDay(s.examEnd + GRACE_MS)}. Candidates still in the Secure Browser are flagged as Improper Exit.`
            : `The exam ended at ${timeOfDay(s.examEnd)}. All submissions are final.`}
        </p>
      </div>
      <Link
        to="/reviewer/report"
        className="inline-flex h-9 shrink-0 items-center rounded-ctl border border-line-input bg-white px-4 text-[14px] font-medium text-fg-label shadow-tf-sm hover:bg-subtle"
      >
        View Anti-Cheating Report
      </Link>
    </section>
  );
}

/** PIN area by phase — shared by the invigilator page (full) and Admin › View Assessment (compact). */
export function PinSection({ size = 'full' }: { size?: Size }) {
  const s = useApp();
  const phase = phaseOf(s);
  const noExitPin = !s.sebEnabled || s.legacy;
  const minHeight = size === 'present' ? 560 : size === 'full' ? 300 : undefined;
  if (phase === 'closed' || (noExitPin && phase === 'grace')) return <AssessmentCompletedCard />;
  // Projector: show only what the room needs — Exam PIN before/at start, Exit PIN once it is live.
  if (size === 'present') {
    const exitLive = !noExitPin && (phase === 'live' || phase === 'grace');
    const examLive = phase === 'soon' || phase === 'live';
    return (
      <div className={cx('grid gap-8', exitLive && examLive ? 'grid-cols-2' : 'grid-cols-1')}>
        {examLive && <ExamPinCard size="present" minHeight={minHeight} />}
        {exitLive && <ExitPinCard size="present" minHeight={minHeight} />}
        {!examLive && !exitLive && <ExamPinCard size="present" minHeight={minHeight} />}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-5">
      {phase === 'grace' ? <ExamEndedCard size={size} minHeight={minHeight} /> : <ExamPinCard size={size} minHeight={minHeight} />}
      {s.legacy ? <LegacyCard size={size} minHeight={minHeight} /> : s.sebEnabled ? <ExitPinCard size={size} minHeight={minHeight} /> : <SebOffCard size={size} minHeight={minHeight} />}
    </div>
  );
}

/** Published before release: old exit flow, so Topin has no Exit PIN to show and doesn't track exits. */
function LegacyCard({ size, minHeight }: { size: Size; minHeight?: number }) {
  return (
    <section
      className={cx('flex flex-col justify-center gap-2 rounded-card border border-dashed border-line-input bg-muted-bg', size === 'full' ? 'p-7' : 'p-6')}
      style={{ minHeight }}
    >
      <h3 className="text-[16px] font-semibold leading-6 text-fg-2">Old exit flow · published before release</h3>
      <p className="text-[14px] leading-5 text-fg-3">
        Candidates exit with the password set in the Secure Browser config, plus Logout and the browser&apos;s Quit button. Topin
        doesn&apos;t show an Exit PIN or track exits for this assessment.
      </p>
    </section>
  );
}

/** Enable Secure Browser = No: there is no Exit PIN for this assessment. */
function SebOffCard({ size, minHeight }: { size: Size; minHeight?: number }) {
  return (
    <section
      className={cx('flex flex-col justify-center gap-1 rounded-card border border-dashed border-line-input bg-muted-bg', size === 'full' ? 'p-7' : 'p-6')}
      style={{ minHeight }}
    >
      <h3 className="text-[16px] font-semibold leading-6 text-fg-2">Secure Browser is off</h3>
      <p className="text-[14px] leading-5 text-fg-3">No Exit PIN for this assessment. Turn it on in Final Review › Internal Admin Options.</p>
    </section>
  );
}
