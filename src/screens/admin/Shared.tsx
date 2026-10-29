import { ReactNode } from 'react';
import { ASSESSMENT } from '../../config';
import { Pill } from '../../components/ui';
import { usePhase } from '../../lib/store';
import { Phase } from '../../lib/pin';

export function statusOf(phase: Phase): { label: string; tone: 'neutral' | 'warning' | 'success' } {
  if (phase === 'before' || phase === 'soon') return { label: 'Yet to Start', tone: 'neutral' };
  if (phase === 'live') return { label: 'In Progress', tone: 'warning' };
  return { label: 'Completed', tone: 'success' };
}

export function StatusPill() {
  const st = statusOf(usePhase());
  return <Pill tone={st.tone}>{st.label}</Pill>;
}

/** Title band (blue-gray/50): assessment title text-2xl/semibold + status badge. */
export function AdminTitleBand({ right, children }: { right?: ReactNode; children?: ReactNode }) {
  return (
    <div className="border-b border-line bg-muted-bg">
      <div className="px-16 py-7">
        <div className="flex items-center justify-between gap-8">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="clamp-2 min-w-0 text-[24px] font-semibold leading-8 text-fg" title={ASSESSMENT.name}>
              {ASSESSMENT.name}
            </h1>
            <span className="shrink-0">
              <StatusPill />
            </span>
          </div>
          {right && <div className="flex shrink-0 items-center gap-6">{right}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}

export function TitleLinks() {
  return (
    <>
      <a href="#" onClick={(e) => e.preventDefault()} className="text-[14px] font-semibold text-link hover:underline">
        View Statistics
      </a>
      <a href="#" onClick={(e) => e.preventDefault()} className="text-[14px] font-semibold text-link hover:underline">
        Clone Assessment
      </a>
    </>
  );
}

/** Card header: text-lg/semibold title, text-sm description, optional trailing control. */
export function CardHead({ title, desc, right }: { title: string; desc?: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-[18px] font-semibold leading-7 text-fg">{title}</h2>
        {desc && <p className="mt-1 text-[14px] leading-5 text-fg-3">{desc}</p>}
      </div>
      {right}
    </div>
  );
}
