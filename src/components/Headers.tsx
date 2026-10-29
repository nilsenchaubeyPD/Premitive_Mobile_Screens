import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ASSESSMENT } from '../config';
import { cx, hm } from '../lib/format';
import { ClockIcon, CoinIcon, HelpIcon, InfoIcon, LogoutIcon, WifiIcon } from './icons';

export function TopinLogo() {
  return (
    <span className="text-[20px] font-bold leading-7 text-fg">
      topin<span className="text-brand-pink">.tech</span>
    </span>
  );
}

export function NxtWaveLogo() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-fg text-[14px] font-semibold text-white">N</span>
      <span className="text-[18px] font-semibold leading-7 text-fg">NxtWave</span>
    </span>
  );
}

/** Header / Admin (72px). */
export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 h-[72px] border-b border-line bg-white">
      <div className="flex h-full items-center justify-between px-16">
        <Link to="/admin/view/in-progress" aria-label="topin.tech home">
          <TopinLogo />
        </Link>
        <nav className="flex items-center gap-7 text-[14px] font-medium text-fg-3">
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-fg">
            Home
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-fg">
            My Questions
          </a>
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-subtle px-3 text-[12px] font-medium text-slate-800">
            <CoinIcon size={16} className="text-exit-icon" /> 1,250 credits
          </span>
          <button type="button" aria-label="Help" className="inline-flex h-8 w-8 items-center justify-center rounded-full text-fg-3 hover:text-fg">
            <HelpIcon size={20} />
          </button>
          <span className="inline-flex items-center gap-2 text-fg-label">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-[12px] font-medium text-primary-hover">
              TA
            </span>
            {ASSESSMENT.admin}
          </span>
        </nav>
      </div>
    </header>
  );
}

/** Quit icon: 16px logout glyph in a 28×28 hit area, tooltip after 150 ms. */
export function QuitButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  const [tip, setTip] = useState(false);
  const timer = useRef<number>();
  const show = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setTip(true), 150);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setTip(false);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (disabled) hide();
  }, [disabled]);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="Quit Secure Exam Browser"
        disabled={disabled}
        onClick={() => {
          hide();
          onClick();
        }}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={(e) => e.currentTarget.matches(':focus-visible') && show()}
        onBlur={hide}
        className="inline-flex h-7 w-7 items-center justify-center rounded-ctl text-fg-3 hover:text-fg focus-visible:text-fg disabled:cursor-default disabled:text-line-input disabled:hover:text-line-input"
      >
        <LogoutIcon size={16} />
      </button>
      {tip && !disabled && (
        <span
          role="tooltip"
          className="pointer-events-none absolute right-0 top-[calc(100%+6px)] z-40 whitespace-nowrap rounded bg-tooltip-bg px-2 py-1 text-[11px] font-medium leading-4 text-white shadow-tf-lg"
        >
          Quit Secure Exam Browser
        </span>
      )}
    </span>
  );
}

/** Header / Candidate (56px) — variants Timer=On/Off × Network=Excellent/Offline. */
export function CandidateHeader({
  endsInMs,
  offline,
  onQuit,
  quitDisabled,
}: {
  endsInMs?: number;
  offline: boolean;
  onQuit: () => void;
  quitDisabled: boolean;
}) {
  return (
    <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-line bg-white px-6">
      <NxtWaveLogo />
      <div className="flex items-center gap-6 text-[14px] font-medium leading-5">
        {endsInMs !== undefined && (
          <span className="inline-flex items-center gap-1.5 text-timer-teal tabular">
            <ClockIcon size={16} />
            Assessment Ends in {hm(endsInMs)}
          </span>
        )}
        <button type="button" className="inline-flex items-center gap-1.5 text-fg-2 hover:text-fg">
          <InfoIcon size={16} className="text-fg-3" /> Report
        </button>
        <span className={cx('inline-flex items-center gap-1.5', offline ? 'text-danger' : 'text-success-strong')} aria-live="polite">
          <WifiIcon size={16} />
          {offline ? 'Offline' : 'Excellent'}
        </span>
        <span className="text-fg">{ASSESSMENT.candidate}</span>
        <QuitButton onClick={onQuit} disabled={quitDisabled} />
      </div>
    </header>
  );
}
