import { useEffect, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ASSESSMENT, EXAM_DURATION_MIN } from '../../config';
import { AdminHeader } from '../../components/Headers';
import { ArrowLeftIcon, InfoIcon } from '../../components/icons';
import { PinSection } from '../../components/PinCards';
import { Button, Card } from '../../components/ui';
import { dateTime } from '../../lib/format';
import { Phase, phaseOf } from '../../lib/pin';
import { actions, getState, useApp } from '../../lib/store';
import { StatusPill } from '../admin/Shared';

export const INVIGILATOR_PHASES: Phase[] = ['before', 'soon', 'live', 'grace', 'closed'];

/** B · Invigilator page (View Details) */
export default function Invigilator() {
  const { phase: routePhase, mode } = useParams();
  const s = useApp();
  const phase = phaseOf(s);
  const [params, setParams] = useSearchParams();
  const present = params.get('present') === '1';
  const setPresent = (on: boolean) => {
    const next = new URLSearchParams(params);
    if (on) next.set('present', '1');
    else next.delete('present');
    setParams(next, { replace: true });
  };

  // Opening a phase route puts the clock in that phase; /custom switches the exit type.
  useEffect(() => {
    if (routePhase && (INVIGILATOR_PHASES as string[]).includes(routePhase) && phaseOf(getState()) !== routePhase)
      actions.setPhase(routePhase as Phase);
    if (routePhase) actions.setExitType(mode === 'custom' ? 'custom' : 'rotating');
  }, [routePhase, mode]);

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />
      <main className="mx-auto max-w-[1040px] py-8">
        <Link to="/admin/view/in-progress" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-fg-2 hover:text-fg">
          <ArrowLeftIcon size={16} className="text-fg-3" /> Back to assessment
        </Link>
        <div className="mt-3 flex items-center justify-between gap-4">
          <h1 className="text-[24px] font-bold leading-8 text-fg">View Details</h1>
          {phase !== 'closed' && (
            <Button variant="neutral" onClick={() => setPresent(true)}>
              Present on screen
            </Button>
          )}
        </div>

        <Card className="mt-5 flex items-center gap-5 p-6">
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-fg text-[24px] font-bold text-white">N</span>
          <div className="min-w-0 flex-1">
            <h2 className="clamp-2 text-[18px] font-semibold leading-7 text-fg" title={ASSESSMENT.name}>
              {ASSESSMENT.name}
            </h2>
            <p className="mt-1 text-[14px] font-medium leading-5 text-fg-3 tabular">
              {EXAM_DURATION_MIN} min · Starts {dateTime(s.examStart)} · Ends {dateTime(s.examEnd)}
            </p>
          </div>
          <StatusPill />
        </Card>

        <div className="mt-5">
          <PinSection />
        </div>

        {phase === 'live' && !s.legacy && s.sebEnabled && (
          <p className="mt-4 flex items-center gap-1.5 text-[14px] leading-5 text-fg-3">
            <InfoIcon size={16} className="text-fg-4" /> Both codes update automatically; no need to refresh.
          </p>
        )}

        {phase === 'grace' && (
          <p className="mt-4 flex items-center gap-1.5 text-[14px] leading-5 text-fg-3">
            <InfoIcon size={16} className="text-fg-4" /> The Exit PIN keeps rotating until the exit window closes; then this page shows the
            assessment as completed.
          </p>
        )}
      </main>
      {present && <PresentView onClose={() => setPresent(false)} />}
    </div>
  );
}

/** PRD 4.2: the PIN "sized so it can be projected or read from a distance" — full-screen, live, no reload. */
function PresentView({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const el = ref.current;
    // Use real full screen when the browser allows it; the overlay works either way.
    el?.requestFullscreen?.().catch(() => {});
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    const onFs = () => !document.fullscreenElement && closeRef.current();
    document.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFs);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label="Present PINs on screen" className="fixed inset-0 z-[65] flex flex-col bg-white">
      <div className="flex items-center justify-between border-b border-line px-12 py-5">
        <p className="truncate text-[20px] font-semibold leading-7 text-fg-2" title={ASSESSMENT.name}>
          {ASSESSMENT.name}
        </p>
        <Button variant="neutral" onClick={onClose} autoFocus>
          Exit presentation · Esc
        </Button>
      </div>
      <div className="flex flex-1 flex-col justify-center px-12 py-10">
        <PinSection size="present" />
      </div>
      <p className="pb-6 text-center text-[16px] leading-6 text-fg-3">Codes update automatically; no need to refresh.</p>
    </div>
  );
}
