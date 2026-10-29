import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SECTIONS } from '../../config';
import { BookmarkIcon } from '../../components/icons';
import { Button } from '../../components/ui';
import { cx } from '../../lib/format';
import { actions, getState } from '../../lib/store';

const OPTIONS = ['12 days', '15 days', '18 days', '20 days'];

/** C4 · Question page. END SECTION returns to the section list; it never exits SEB. */
export function Question() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const idx = Math.min(SECTIONS.length - 1, Math.max(0, Number(params.get('s') ?? getState().completedSections) || 0));
  const sec = SECTIONS[idx];
  const [q, setQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [review, setReview] = useState<Record<number, boolean>>({});

  const endSection = () => {
    actions.setCompletedSections(Math.max(getState().completedSections, idx + 1));
    navigate('/candidate/sections-progress');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-muted-bg px-8">
        <h1 className="truncate pr-6 text-[14px] font-semibold leading-5 text-fg" title={sec.title}>
          Section {idx + 1}: {sec.title}
        </h1>
        <button type="button" onClick={endSection} className="shrink-0 text-[14px] font-semibold uppercase leading-5 tracking-caps text-link hover:underline">
          END SECTION
        </button>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-y-auto px-10 py-8">
          <p className="text-[14px] font-medium leading-5 text-fg-3">
            Question {q + 1} of {sec.questions}
          </p>
          <p className="mt-3 max-w-[760px] text-[18px] leading-7 text-fg">
            A can finish a piece of work in 30 days and B can finish it in 20 days. If they work together, in how many days will
            they finish the work?
          </p>
          <fieldset className="mt-6 max-w-[560px] space-y-3">
            <legend className="sr-only">Options</legend>
            {OPTIONS.map((o, i) => (
              <label
                key={o}
                className={cx(
                  'flex h-12 cursor-pointer items-center gap-3 rounded-ctl border px-4 text-[14px] leading-5 text-fg',
                  answers[q] === i ? 'border-primary bg-primary-tint' : 'border-line-input hover:bg-muted-bg',
                )}
              >
                <input
                  type="radio"
                  name={`q-${q}`}
                  checked={answers[q] === i}
                  onChange={() => setAnswers({ ...answers, [q]: i })}
                  className="h-4 w-4 accent-primary"
                />
                {o}
              </label>
            ))}
          </fieldset>
          <div className="mt-10 flex items-center gap-3">
            <button
              type="button"
              aria-pressed={!!review[q]}
              onClick={() => setReview({ ...review, [q]: !review[q] })}
              className={cx(
                'inline-flex h-9 items-center gap-2 rounded-ctl border border-exit-icon px-4 text-[14px] font-medium text-exit-icon shadow-tf-sm hover:bg-exit-tint',
                review[q] && 'bg-exit-tint',
              )}
            >
              <BookmarkIcon size={16} />
              Mark for Review
            </button>
            <Button onClick={() => setQ(Math.min(sec.questions - 1, q + 1))}>Submit</Button>
          </div>
        </div>
        <aside className="w-[300px] shrink-0 overflow-y-auto border-l border-line px-6 py-8" aria-label="Questions">
          <p className="text-[14px] font-semibold leading-5 text-fg-2">Questions</p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {Array.from({ length: sec.questions }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQ(i)}
                aria-current={i === q ? 'true' : undefined}
                className={cx(
                  'h-10 rounded-ctl border text-[14px] font-semibold',
                  i === q
                    ? 'border-2 border-primary text-primary'
                    : review[i]
                      ? 'border-exit-icon bg-exit-tint text-exit-icon'
                      : answers[i] !== undefined
                        ? 'border-success-strong bg-success-tint text-green-700'
                        : 'border-line-input text-fg-2',
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
