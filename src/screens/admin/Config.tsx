import { ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ASSESSMENT, CUSTOM_MAX, EXAM_DURATION_MIN, REFRESH_OPTIONS, SECTIONS } from '../../config';
import { AdminHeader } from '../../components/Headers';
import { ArrowLeftIcon, CheckIcon, ChevronDownIcon, ClockIcon, InfoIcon } from '../../components/icons';
import { Button, Card, Pill } from '../../components/ui';
import { cx } from '../../lib/format';
import { generateFixedPassword } from '../../lib/pin';
import { actions, useApp } from '../../lib/store';

type SebMode = 'off' | 'custom' | 'rotating';

const ADVANCED = [
  'Shortlisting Criteria',
  'Enable Camera Proctoring',
  'Disable Termination in Camera Proctoring',
  'Enable Face Authentication',
  'Enable Audio Proctoring',
  'Enable IP Restriction',
  'Enable Peer Similarity Check',
  'Enable AI Generated Code Similarity Check',
  'Allow Multiple Submissions',
  'Disable Exam Termination',
  'Count of Inactivity Warning Termination',
  'Allow candidates to review their mistakes',
  'Allow candidates to view solution while reviewing',
  'Send results to the Candidates After Assessments',
  'Send Invitation Email',
  'Send Reminder Email 1 Hour Before Assessment',
  'Collect Candidate Feedback',
  'Allow Assessment on Mobile',
  'Enable Exam PIN',
  'Disable All Types of Proctoring',
  'Enable Integrity Report',
  'Batch run for shortlisted candidates',
];
const INTERNAL_AFTER = [
  'Enable QR Based Attendance',
  'Enable Object Detection',
  'Enable Screen Sharing Proctoring',
  'Hide Test Cases Details in Web Coding',
  'Hide Test Cases Details in Coding',
  'Hide WhatsApp Support Redirection',
  'Hide Assessment Datetime and Timer',
  'Statistics Page Access',
  'Event Triggers',
];

/** Accordion row (Advanced Options list). */
function Row({ title, open, onToggle, children }: { title: string; open?: boolean; onToggle?: () => void; children?: ReactNode }) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!!open}
        className="inline-flex items-center gap-2 text-[14px] font-semibold leading-5 text-fg-2 hover:text-fg"
      >
        {title}
        <ChevronDownIcon size={14} className={cx('transition-transform', open && 'rotate-180')} />
      </button>
      {open && children}
    </div>
  );
}

function Radio({ name, checked, label, onChange }: { name: string; checked: boolean; label: string; onChange: () => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-[14px] leading-5 text-fg-2">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="h-4 w-4 accent-primary" />
      {label}
    </label>
  );
}

/** ⓘ next to an option; tooltip on hover and keyboard focus (10–15 words). */
function InfoTip({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-fg-3 hover:text-fg"
      >
        <InfoIcon size={16} />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-[calc(100%+8px)] z-40 w-[260px] -translate-x-1/2 rounded-md bg-tooltip-bg px-3 py-2 text-[12px] font-medium leading-4 text-white shadow-tf-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}

/** A0–A2 · Final Review › Advanced Options › Internal Admin Options › Enable Secure Browser */
export default function Config() {
  const { type } = useParams();
  const navigate = useNavigate();
  const s = useApp();
  const mode: SebMode = type === 'off' ? 'off' : type === 'custom' ? 'custom' : 'rotating';
  const [draft, setDraft] = useState('');
  const [internalOpen, setInternalOpen] = useState(true);
  const [sebOpen, setSebOpen] = useState(true);
  const pwId = useId();

  // Route = selected option, mirrored into the shared store (invigilator / candidate screens follow it).
  useEffect(() => {
    if (mode === 'off') actions.setSebEnabled(false);
    else actions.setExitType(mode);
  }, [mode]);

  const pick = (m: SebMode) => {
    navigate(`/admin/config/${m}`, { replace: true });
  };

  // Sub-panel sits under the selected radio, like the Exam PIN "PIN Refresh Rate" box.
  const radioRow = useRef<HTMLDivElement>(null);
  const [panelLeft, setPanelLeft] = useState(0);
  useLayoutEffect(() => {
    const el = radioRow.current?.querySelector<HTMLElement>(`[data-mode="${mode === 'off' ? 'off' : 'yes'}"]`);
    setPanelLeft(el ? el.offsetLeft : 0);
  }, [mode, sebOpen, internalOpen]);

  const saveAndNext = () => {
    if (mode === 'custom') actions.setCustomPassword(draft.trim() || generateFixedPassword());
    navigate('/admin/publish');
  };

  const totalScore = SECTIONS.reduce((n, x) => n + x.score, 0);

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />

      {/* Title band + stepper (Final Review) */}
      <div className="relative border-b border-line bg-muted-bg">
        <div className="mx-auto flex max-w-[880px] items-center justify-between gap-6 pb-12 pt-8">
          <div className="flex min-w-0 items-center gap-3">
            <ArrowLeftIcon size={20} className="shrink-0 text-fg-2" />
            <h1 className="truncate text-[20px] font-semibold leading-7 text-fg-label" title={ASSESSMENT.name}>
              {ASSESSMENT.name}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-5 text-[14px] leading-5 text-fg-3">
            <span>
              Total Sections: <b className="font-semibold text-fg">{SECTIONS.length}</b>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon size={16} /> Total Time: <b className="font-semibold text-fg">{EXAM_DURATION_MIN} mins</b>
            </span>
            <span>
              Total Score: <b className="font-semibold text-fg">{totalScore}</b>
            </span>
          </div>
        </div>
        <ol className="absolute bottom-0 left-1/2 flex -translate-x-1/2 translate-y-1/2 items-center gap-3 rounded-full border border-line bg-white px-2 py-1.5 shadow-tf-sm">
          <li className="inline-flex h-8 items-center gap-2 rounded-full border border-line px-3 text-[12px] font-medium text-fg-2">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-success-strong text-white">
              <CheckIcon size={10} />
            </span>
            1. Section Details
          </li>
          <li aria-hidden="true" className="text-fg-3">
            ›
          </li>
          <li aria-current="step" className="inline-flex h-8 items-center rounded-full border border-primary bg-primary-tint px-3 text-[12px] font-medium text-primary">
            2. Final Review
          </li>
          <li aria-hidden="true" className="text-fg-3">
            ›
          </li>
          <li className="inline-flex h-8 items-center rounded-full border border-line px-3 text-[12px] font-medium text-fg-2">3. Publish &amp; Invite</li>
        </ol>
      </div>

      <main className="mx-auto max-w-[880px] space-y-5 pb-10 pt-12">
        <Card className="p-6">
          <h2 className="text-[16px] font-semibold leading-6 text-fg-label">Sections</h2>
          <div className="mt-4 space-y-3">
            {SECTIONS.slice(0, 2).map((sec) => (
              <div key={sec.title} className="rounded-card border border-line p-4">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.6fr] gap-4 text-[12px] leading-4 text-fg-3">
                  <span>Section Name</span>
                  <span>No of Questions</span>
                  <span>Time</span>
                  <span>Type</span>
                  <span>Score</span>
                </div>
                <div className="mt-1.5 grid grid-cols-[2fr_1fr_1fr_1fr_0.6fr] items-center gap-4 text-[14px] leading-5">
                  <span className="truncate text-fg-label" title={sec.title}>
                    {sec.title}
                  </span>
                  <span className="text-fg-3">{sec.questions} Questions</span>
                  <span className="text-fg-3">{sec.minutes} min.</span>
                  <span>
                    <Pill tone={sec.type === 'MCQ' ? 'information' : 'success'}>{sec.type.toUpperCase()}</Pill>
                  </span>
                  <span className="text-fg-3">{sec.score}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="border-b border-line pb-3 text-[16px] font-semibold leading-6 text-fg-label">Assessment Details</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
            {[
              ['Name of Assessment', ASSESSMENT.name],
              ['Tags (Optional)', 'Add Tags'],
              ['Start Date & Time', 'Select Date & Time'],
              ['End Date & Time', 'Select Date & Time'],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-[12px] font-medium leading-4 text-fg-label">{label}</div>
                <div className="mt-1 flex h-9 items-center truncate rounded-ctl border border-line-input px-3 text-[12px] text-fg-3">{value}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="border-b border-line pb-3 text-[16px] font-semibold leading-6 text-fg-label">Advanced Options</h2>
          <div className="mt-5 space-y-5">
            {ADVANCED.map((t) => (
              <Row key={t} title={t} />
            ))}

            <Row title="Internal Admin Options" open={internalOpen} onToggle={() => setInternalOpen(!internalOpen)}>
              <div className="mt-3 space-y-5 rounded-card bg-subtle px-6 py-5">
                {/* Enable Secure Browser: No (default) / Yes → Custom Exit PIN (default) or PIN Rotation (+ refresh rate) */}
                <Row title="Enable Secure Browser" open={sebOpen} onToggle={() => setSebOpen(!sebOpen)}>
                  <div className="mt-2">
                    <p className="text-[14px] leading-5 text-fg-3">Candidates take the exam in Safe Exam Browser and need an Exit PIN to close it.</p>
                    <div ref={radioRow} role="radiogroup" aria-label="Enable Secure Browser" className="relative mt-3 flex items-center gap-8">
                      <span data-mode="off">
                        <Radio name="seb" checked={mode === 'off'} label="No" onChange={() => pick('off')} />
                      </span>
                      <span data-mode="yes">
                        {/* Yes → Custom Exit PIN is selected by default */}
                        <Radio name="seb" checked={mode !== 'off'} label="Yes" onChange={() => mode === 'off' && pick('custom')} />
                      </span>
                    </div>

                    {mode !== 'off' && (
                      <div className="mt-3 w-fit min-w-[420px] max-w-[560px] rounded-xl border border-line-input bg-white p-5" style={{ marginLeft: panelLeft }}>
                        <div role="radiogroup" aria-label="Exit PIN type" className="flex items-center gap-8">
                          <Radio name="seb-type" checked={mode === 'custom'} label="Custom Exit PIN" onChange={() => pick('custom')} />
                          <span className="inline-flex items-center gap-1.5">
                            <Radio name="seb-type" checked={mode === 'rotating'} label="PIN Rotation" onChange={() => pick('rotating')} />
                            <InfoTip
                              label="About PIN Rotation"
                              text="Exit PIN changes automatically at your chosen refresh rate, so shared PINs expire quickly."
                            />
                          </span>
                        </div>
                        <div className="mt-4 border-t border-line pt-4">
                        {mode === 'rotating' ? (
                          <>
                            <div id="refresh-label" className="text-[14px] font-semibold leading-5 text-fg-label">
                              PIN Refresh Rate
                            </div>
                            <div role="radiogroup" aria-labelledby="refresh-label" className="mt-3 flex gap-3">
                              {REFRESH_OPTIONS.map((o) => {
                                const sel = s.refreshMs === o.ms;
                                return (
                                  <button
                                    key={o.ms}
                                    type="button"
                                    role="radio"
                                    aria-checked={sel}
                                    onClick={() => actions.setRefreshMs(o.ms)}
                                    className={cx(
                                      'h-9 rounded-full border px-5 text-[14px] font-medium leading-5',
                                      sel ? 'border-primary bg-primary text-white' : 'border-line-input bg-white text-fg-label hover:bg-subtle',
                                    )}
                                  >
                                    {o.label}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="mt-3 max-w-[400px] text-[12px] leading-4 text-fg-3">
                              4-digit code (numbers only). Shorter intervals are more secure but give candidates less time to enter the PIN.
                            </p>
                          </>
                        ) : (
                          <>
                            {/* Fixed PIN: the existing product field, unchanged (a default PIN is set automatically if left blank). */}
                            <label htmlFor={pwId} className="inline-flex items-center gap-1.5 text-[14px] font-medium leading-5 text-fg-label">
                              Exit PIN <InfoIcon size={16} className="text-fg-3" />
                            </label>
                            <input
                              id={pwId}
                              value={draft}
                              maxLength={CUSTOM_MAX}
                              placeholder="Custom Exit PIN (if any)"
                              onChange={(e) => setDraft(e.target.value)}
                              autoComplete="off"
                              spellCheck={false}
                              className="mt-1.5 block h-10 w-[300px] rounded-ctl border border-line-input px-3 text-[14px] leading-5 text-fg shadow-tf-sm placeholder:text-fg-4 focus:border-focus"
                            />
                          </>
                        )}
                        </div>
                      </div>
                    )}
                    {mode !== 'off' && (
                      <p className="mt-3 text-[12px] leading-4 text-fg-3">
                        The Exit PIN shows to the creator, admin and invigilator once the exam starts.
                      </p>
                    )}
                  </div>
                </Row>
                {INTERNAL_AFTER.map((t) => (
                  <Row key={t} title={t} />
                ))}
              </div>
            </Row>
          </div>
        </Card>

        <Card className="flex items-center justify-between p-6">
          <h2 className="text-[16px] font-semibold leading-6 text-fg-label">Properties</h2>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-ctl border border-line-input text-fg-3">
            <ChevronDownIcon size={14} />
          </span>
        </Card>

        <Card className="p-6">
          <h2 className="border-b border-line pb-3 text-[16px] font-semibold leading-6 text-fg-label">Notes</h2>
          <ul className="mt-4 space-y-3 text-[12px] leading-4 text-fg-3">
            <li>
              In cases of potential malpractice, such as window/tab-switching, no face/multiple face detection, or partial face detection during
              camera-proctored sessions, the system issues warnings to the candidate.
            </li>
            <li>
              If a candidate receives two warnings, the current section of the assessment will be terminated. The remaining sections of the
              assessment can still be completed as per the scheduled process.
            </li>
          </ul>
        </Card>

        <div className="flex justify-end">
          <Button onClick={saveAndNext}>Save &amp; Next →</Button>
        </div>
      </main>
    </div>
  );
}
