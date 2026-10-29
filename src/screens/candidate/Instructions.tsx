import { useNavigate } from 'react-router-dom';
import { ASSESSMENT, EXAM_DURATION_MIN, SECTIONS } from '../../config';
import { Button, CapsLabel } from '../../components/ui';

/** C2 · Instructions (existing layout; quit icon in header, no logout anywhere). */
export function Instructions() {
  const navigate = useNavigate();
  const totalQ = SECTIONS.reduce((n, s) => n + s.questions, 0);
  return (
    <div className="mx-auto max-w-[960px] py-10">
      <CapsLabel>Assessment</CapsLabel>
      <h1 className="clamp-2 mt-1 text-[24px] font-bold leading-8 text-fg" title={ASSESSMENT.name}>
        {ASSESSMENT.name}
      </h1>
      <div className="mt-5 grid grid-cols-3 gap-5">
        {[
          ['Duration', `${EXAM_DURATION_MIN} min`],
          ['Sections', String(SECTIONS.length)],
          ['Questions', String(totalQ)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-card border border-line px-6 py-5">
            <div className="text-[14px] font-medium leading-5 text-fg-3">{k}</div>
            <div className="mt-1 text-[20px] font-bold leading-7 text-fg">{v}</div>
          </div>
        ))}
      </div>
      <section className="mt-5 rounded-card border border-line p-7">
        <h2 className="text-[18px] font-semibold leading-7 text-fg">Instructions</h2>
        <ol className="mt-4 list-decimal space-y-4 pl-5 text-[14px] leading-5 text-fg-2 marker:font-medium marker:text-fg-3">
          <li>Sections unlock one after another. Complete a section to unlock the next.</li>
          <li>Each section has its own duration. Unanswered questions score zero.</li>
          <li>Use Mark for Review to come back to a question before you end the section.</li>
          <li>Your answers are saved automatically as you go.</li>
          <li>Click End Assessment after the last section to submit your test.</li>
        </ol>
      </section>
      <div className="mt-5 flex justify-end">
        <Button size="lg" onClick={() => navigate('/candidate/sections')}>
          Start Assessment
        </Button>
      </div>
    </div>
  );
}
