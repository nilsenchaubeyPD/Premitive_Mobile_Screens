import { ReactNode, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { PREVIOUS_CODE_GRACE_SECONDS, REFRESH_OPTIONS } from '../config';
import { cx, secs, shortCountdown, timeOfDay } from '../lib/format';
import { PHASE_LABEL, Phase, examPinInfo, exitInfo, phaseOf } from '../lib/pin';
import { actions, useApp } from '../lib/store';
import { POPUPS, POPUP_LABEL } from '../screens/candidate/ExitModal';
import { ArrowDownIcon, ForwardIcon, SettingIcon } from './icons';

const PHASES: Phase[] = ['before', 'soon', 'live', 'grace', 'closed'];

const NAV: { group: string; items: [string, string][] }[] = [
  {
    group: 'A · Admin',
    items: [
      ['A0 Config · Secure Browser off (default)', '/admin/config/off'],
      ['A1 Config · Yes → Custom Exit PIN', '/admin/config/custom'],
      ['A2 Config · Yes → PIN Rotation', '/admin/config/rotating'],
      ['A3 Publish & Invite', '/admin/publish'],
      ['A4 View · Yet to Start', '/admin/view/yet-to-start'],
      ['A4 View · Published before release (old flow)', '/admin/view/in-progress?legacy=1'],
      ['A4 View · In Progress', '/admin/view/in-progress'],
      ['A4 View · Completed (grace)', '/admin/view/completed'],
      ['A4 View · Completed (window closed)', '/admin/view/completed-closed'],
    ],
  },
  {
    group: 'B · Invigilator',
    items: [
      ['B1 Before start', '/invigilator/before'],
      ['B2 Within 5 min', '/invigilator/soon'],
      ['B3 Live', '/invigilator/live'],
      ['B4 Ended · grace', '/invigilator/grace'],
      ['B5 Ended · closed', '/invigilator/closed'],
      ['B · Custom mode (live)', '/invigilator/live/custom'],
      ['B · Present on screen (projector)', '/invigilator/live?present=1'],
      ['B · Published before release (old flow)', '/invigilator/live?legacy=1'],
      ['B · Current state', '/invigilator'],
    ],
  },
  {
    group: 'C · Candidate (SEB)',
    items: [
      ['C1 Login PIN', '/candidate/login'],
      ['C2 Instructions', '/candidate/instructions'],
      ['C3 Sections · not started', '/candidate/sections'],
      ['C4 Question page', '/candidate/question'],
      ['C5 Sections · after a section', '/candidate/sections-progress'],
      ['C6 Feedback (submitted)', '/candidate/feedback'],
    ],
  },
  {
    group: 'D · Exit pop-ups',
    items: [
      ...POPUPS.map((p) => [POPUP_LABEL[p], `/candidate/question/exit/${p}`] as [string, string]),
      ['D2 · Custom mode', '/candidate/question/exit/pin?exit=custom'],
      ['D2 · from Feedback', '/candidate/feedback/exit/pin'],
      ['D2 · from Login link', '/candidate/login/exit/pin'],
      ['D7 · Exit complete', '/candidate/closed'],
    ],
  },
  { group: 'E · Reviewer', items: [['E1 Anti-Cheating Report', '/reviewer/report']] },
];

function readCollapsed(): boolean {
  try {
    return localStorage.getItem('proto-panel-collapsed') === '1';
  } catch {
    return false;
  }
}

const Section = ({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) => (
  <div className="border-t border-white/10 px-4 py-3">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-[10px] font-semibold uppercase tracking-[0.8px] text-slate-400">{title}</span>
      {right}
    </div>
    {children}
  </div>
);

const Chip = ({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: ReactNode; title?: string }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    aria-pressed={active}
    className={cx(
      'h-7 rounded-md px-2 text-[11px] font-semibold transition-colors',
      active ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-slate-200 hover:bg-white/20',
    )}
  >
    {children}
  </button>
);

const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex cursor-pointer items-center justify-between py-1 text-[12px] text-slate-200">
    {label}
    <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-amber-400" />
  </label>
);

export function PrototypePanel() {
  const s = useApp();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  useEffect(() => {
    try {
      localStorage.setItem('proto-panel-collapsed', collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const phase = phaseOf(s);
  const exit = exitInfo(s.now, s.refreshMs);
  const exam = examPinInfo(s.now);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="fixed bottom-3 left-3 z-[70] inline-flex h-9 items-center gap-2 rounded-full border border-dashed border-amber-400 bg-slate-900 px-3.5 text-[12px] font-semibold text-amber-300 shadow-tf-lg"
      >
        <SettingIcon size={14} /> Prototype · {exit.code}
      </button>
    );
  }

  return (
    <aside
      aria-label="Prototype panel"
      className="fixed bottom-3 left-3 z-[70] flex max-h-[calc(100vh-24px)] w-[340px] flex-col overflow-hidden rounded-xl border border-dashed border-amber-400 bg-slate-900 text-slate-100 shadow-tf-lg"
    >
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="inline-flex items-center gap-2 text-[12px] font-bold text-amber-300">
          <SettingIcon size={14} /> PROTOTYPE PANEL
          <span className="font-medium text-slate-400">dev tool</span>
        </span>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label="Collapse prototype panel"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-300 hover:bg-white/10"
        >
          <ArrowDownIcon size={16} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Section title="Current codes" right={<span className="text-[11px] text-slate-400 tabular">server {timeOfDay(s.now, true)}</span>}>
          <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1">
            <span className="text-[12px] text-slate-300">Exit PIN{s.exitType === 'custom' ? ' (fixed)' : ''}</span>
            <span className="text-[18px] font-bold tracking-[2px] text-amber-300 tabular">
              {s.exitType === 'custom' ? s.customPassword.toUpperCase() : exit.code}
            </span>
            {s.exitType === 'rotating' && (
              <>
                <span className="text-[11px] text-slate-400">next in {shortCountdown(exit.msLeft)}</span>
                <span className="text-[11px] text-slate-400 tabular">
                  {exit.previousAcceptedMs > 0 ? (
                    <>
                      prev <b className="text-slate-200">{exit.previous}</b> ok {secs(exit.previousAcceptedMs)}s
                    </>
                  ) : (
                    `prev grace ${PREVIOUS_CODE_GRACE_SECONDS}s`
                  )}
                </span>
              </>
            )}
            <span className="text-[12px] text-slate-300">Exam PIN</span>
            <span className="text-[18px] font-bold tracking-[2px] text-sky-300 tabular">{exam.pin}</span>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">
            Shown here even when hidden on screens. Attempts {s.attempts}
            {s.lockUntil > s.now ? ` · locked ${secs(s.lockUntil - s.now)}s` : ''}
            {s.token && !s.token.used ? ` · token ${secs(s.token.expiresAt - s.now)}s` : ''}
          </p>
        </Section>

        <Section title={`Exam phase · ${PHASE_LABEL[phase]}`}>
          <div className="flex flex-wrap gap-1.5">
            {PHASES.map((p) => (
              <Chip key={p} active={phase === p} onClick={() => actions.setPhase(p)}>
                {PHASE_LABEL[p]}
              </Chip>
            ))}
            <Chip onClick={() => actions.endExamSoon()} title="Edge case 2: exam timer hits zero">
              End exam in 30s
            </Chip>
          </div>
        </Section>

        <Section title="Exit PIN">
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip active={!s.sebEnabled} onClick={() => actions.setSebEnabled(false)}>
              SEB off
            </Chip>
            <Chip active={s.sebEnabled && s.exitType === 'rotating'} onClick={() => actions.setExitType('rotating')}>
              Rotating
            </Chip>
            <Chip active={s.sebEnabled && s.exitType === 'custom'} onClick={() => actions.setExitType('custom')}>
              Fixed
            </Chip>
            <span className="mx-1 h-4 w-px bg-white/15" />
            {REFRESH_OPTIONS.map((o) => (
              <Chip key={o.ms} active={s.refreshMs === o.ms} onClick={() => actions.setRefreshMs(o.ms)}>
                {o.label}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="State">
          <Toggle label="Candidate has submitted" value={s.submitted} onChange={actions.setSubmitted} />
          <Toggle label="Network offline" value={s.offline} onChange={actions.setOffline} />
          <Toggle label="Published before release (old flow)" value={s.legacy} onChange={actions.setLegacy} />
        </Section>

        <Section title="Time">
          <div className="flex flex-wrap gap-1.5">
            {[
              ['+10s', 10_000],
              ['+30s', 30_000],
              ['+1 min', 60_000],
            ].map(([l, ms]) => (
              <Chip key={l} onClick={() => actions.fastForward(ms as number)}>
                <span className="inline-flex items-center gap-1">
                  <ForwardIcon size={12} />
                  {l}
                </span>
              </Chip>
            ))}
            <Chip onClick={() => actions.skipToRotation()} title="Edge case 1: type across a rotation">
              3s before rotation
            </Chip>
            <Chip onClick={() => actions.resetClock()}>Reset</Chip>
          </div>
          {s.offsetMs !== 0 && <p className="mt-1.5 text-[11px] text-slate-400 tabular">offset +{Math.round(s.offsetMs / 1000)}s</p>}
        </Section>

        <Section title="Simulate">
          <button
            type="button"
            onClick={() =>
              actions.log('improper_exit_flagged', {
                phase: s.submitted ? 'after_submission' : 'before_submission',
                reason: 'seb_closed_without_exit_pin',
                severity: s.submitted ? 'low' : 'high',
              })
            }
            className="h-8 w-full rounded-md bg-rose-500/90 text-[12px] font-semibold text-white hover:bg-rose-500"
          >
            Simulate hard shutdown
          </button>
        </Section>

        <details className="group border-t border-white/10" open>
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.8px] text-slate-400">
            Screens & states
            <ArrowDownIcon size={14} className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-3 px-4 pb-3">
            {NAV.map((g) => (
              <div key={g.group}>
                <div className="mb-1 text-[11px] font-semibold text-slate-300">{g.group}</div>
                <ul className="space-y-0.5">
                  {g.items.map(([label, to]) => {
                    const active = location.pathname + location.search === to;
                    return (
                      <li key={to}>
                        <NavLink
                          to={to}
                          className={cx(
                            'block truncate rounded px-2 py-1 text-[12px]',
                            active ? 'bg-amber-400/20 text-amber-200' : 'text-slate-300 hover:bg-white/10 hover:text-white',
                          )}
                        >
                          {label}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </details>

        <details className="group border-t border-white/10" open>
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.8px] text-slate-400">
            Event log ({s.events.length})
            <span className="flex items-center gap-2">
              {s.events.length > 0 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    actions.clearEvents();
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && actions.clearEvents()}
                  className="normal-case tracking-normal text-slate-400 hover:text-white"
                >
                  clear
                </span>
              )}
              <ArrowDownIcon size={14} className="transition-transform group-open:rotate-180" />
            </span>
          </summary>
          <ul className="max-h-56 space-y-1 overflow-y-auto px-4 pb-3" aria-live="polite">
            {s.events.length === 0 && <li className="text-[11px] text-slate-500">No events yet.</li>}
            {s.events.map((ev) => (
              <li key={ev.id} className="rounded bg-white/5 px-2 py-1.5 text-[11px] leading-4">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-amber-200">{ev.name}</span>
                  <span className="shrink-0 text-slate-500 tabular">{timeOfDay(ev.at, true)}</span>
                </div>
                {ev.data && (
                  <div className="mt-0.5 break-all text-slate-400">
                    {Object.entries(ev.data)
                      .map(([k, v]) => `${k}: ${String(v)}`)
                      .join(' · ')}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </aside>
  );
}
