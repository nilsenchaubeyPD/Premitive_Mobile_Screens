import { useNavigate } from 'react-router-dom';
import { ASSESSMENT, SECTIONS } from '../../config';
import { CheckIcon, LockIcon } from '../../components/icons';
import { Button, Pill } from '../../components/ui';
import { cx } from '../../lib/format';
import { actions, useApp } from '../../lib/store';

/** C3 / C5 · Section list — TF Steps "Circles with text" (vertical) as the timeline. */
export function Sections() {
  const { completedSections } = useApp();
  const navigate = useNavigate();
  const canEnd = completedSections > 0;

  return (
    <div className="mx-auto max-w-[1000px] py-10">
      <div className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <h1 className="text-[24px] font-bold leading-8 text-fg">Sections</h1>
          <p className="clamp-2 mt-1 text-[14px] leading-5 text-fg-3" title={ASSESSMENT.name}>
            {ASSESSMENT.name}
          </p>
        </div>
        <Button
          variant={canEnd ? 'danger' : 'primary'}
          size="lg"
          className="shrink-0"
          disabled={!canEnd}
          onClick={() => {
            actions.setSubmitted(true);
            navigate('/candidate/feedback');
          }}
        >
          End Assessment
        </Button>
      </div>

      <ol className="mt-7">
        {SECTIONS.map((sec, i) => {
          const done = i < completedSections;
          const current = i === completedSections;
          const locked = i > completedSections;
          const last = i === SECTIONS.length - 1;
          return (
            <li key={i} className={cx('relative flex gap-5', !last && 'pb-5')}>
              <div className="relative flex w-6 shrink-0 justify-center">
                <span
                  className={cx(
                    'relative z-10 mt-6 inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-medium',
                    done && 'bg-primary text-white',
                    current && 'border-2 border-primary bg-white text-primary',
                    locked && 'border-2 border-line-input bg-white text-fg-4',
                  )}
                  aria-hidden="true"
                >
                  {done ? <CheckIcon size={14} /> : locked ? <LockIcon size={12} /> : i + 1}
                </span>
                {!last && (
                  <span className={cx('absolute bottom-[-24px] top-12 w-0.5', done ? 'bg-primary' : 'bg-line-input')} aria-hidden="true" />
                )}
              </div>

              <div className={cx('flex min-w-0 flex-1 overflow-hidden rounded-card border border-line', locked ? 'bg-muted-bg' : 'bg-white')}>
                <div className="min-w-0 flex-1 p-6">
                  <div className="flex items-start gap-3">
                    <h2 className="clamp-2 min-w-0 flex-1 text-[18px] font-semibold leading-7 text-fg" title={sec.title}>
                      {sec.title}
                    </h2>
                    {done && (
                      <Pill tone="success" className="mt-0.5 shrink-0">
                        Completed
                      </Pill>
                    )}
                  </div>
                  <p className="mt-1.5 text-[14px] font-medium leading-5 text-fg-3">
                    {sec.type} · {sec.questions} Questions
                    {locked && <span> · Unlocks after Section {i}</span>}
                  </p>
                  {!done && (
                    <Button
                      className="mt-5"
                      disabled={locked}
                      onClick={() => navigate(`/candidate/question?s=${i}`)}
                      aria-label={`Start Section ${i + 1}`}
                    >
                      Start Section
                    </Button>
                  )}
                </div>
                <dl className="flex w-[220px] shrink-0 flex-col justify-center gap-4 border-l border-line px-6 py-5">
                  <div>
                    <dt className="text-[14px] font-medium leading-5 text-fg-3">Total Score</dt>
                    <dd className="text-[18px] font-semibold leading-7 text-fg">{sec.score}</dd>
                  </div>
                  <div>
                    <dt className="text-[14px] font-medium leading-5 text-fg-3">Duration</dt>
                    <dd className="text-[18px] font-semibold leading-7 text-fg">{sec.minutes} min</dd>
                  </div>
                </dl>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
