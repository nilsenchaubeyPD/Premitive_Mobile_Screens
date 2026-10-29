import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ASSESSMENT, EXAM_DURATION_MIN } from '../../config';
import { AdminHeader } from '../../components/Headers';
import { CalendarIcon, ClockIcon, ExportIcon, PeopleIcon } from '../../components/icons';
import { PinSection } from '../../components/PinCards';
import { Card, Switch } from '../../components/ui';
import { dateTime } from '../../lib/format';
import { phaseOf } from '../../lib/pin';
import { actions, getState, useApp } from '../../lib/store';
import { LinkField } from './Publish';
import { AdminTitleBand, CardHead, TitleLinks, statusOf } from './Shared';

const STATUS_PHASE = { 'yet-to-start': 'before', 'in-progress': 'live', completed: 'grace', 'completed-closed': 'closed' } as const;

/** A4 · View Assessment (Yet to Start / In Progress / Completed) */
export default function ViewAssessment() {
  const { status } = useParams();
  const s = useApp();
  const [priv, setPriv] = useState(true);

  // Opening a status route puts the clock in a matching phase (if it isn't already).
  useEffect(() => {
    const want = STATUS_PHASE[status as keyof typeof STATUS_PHASE];
    if (!want) return;
    const cur = phaseOf(getState());
    if (want === 'closed' ? cur !== 'closed' : statusOf(cur).label !== statusOf(want).label) actions.setPhase(want);
  }, [status]);

  const meta = [
    { icon: <CalendarIcon size={16} />, label: 'Start:', value: dateTime(s.examStart) },
    { icon: <CalendarIcon size={16} />, label: 'End:', value: dateTime(s.examEnd) },
    { icon: <ClockIcon size={16} />, label: 'Duration:', value: `${EXAM_DURATION_MIN} min` },
    { icon: <PeopleIcon size={16} />, label: 'Candidates:', value: '148 invited' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />
      <AdminTitleBand right={<TitleLinks />}>
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
          {meta.map((m) => (
            <div key={m.label} className="flex items-center gap-1.5 text-[14px] font-medium leading-5">
              <span className="text-fg-4">{m.icon}</span>
              <dt className="text-fg-3">{m.label}</dt>
              <dd className="text-fg tabular">{m.value}</dd>
            </div>
          ))}
        </dl>
      </AdminTitleBand>

      <main className="mx-auto max-w-[1040px] py-8">
        <PinSection size="compact" />
        <div className="mt-3 flex justify-end">
          <Link to="/invigilator" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-link hover:underline">
            Open invigilator view <ExportIcon size={16} />
          </Link>
        </div>

        <Card className="mt-5 space-y-4 p-7">
          <CardHead
            title="Private Assessment"
            desc="Only candidates you invite can take this assessment."
            right={<Switch checked={priv} onChange={setPriv} label="Private Assessment" />}
          />
          <LinkField url={ASSESSMENT.url} />
        </Card>
      </main>
    </div>
  );
}
