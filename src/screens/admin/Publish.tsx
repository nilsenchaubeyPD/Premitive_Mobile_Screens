import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ASSESSMENT, REFRESH_OPTIONS } from '../../config';
import { AdminHeader } from '../../components/Headers';
import { CheckIcon, CopyIcon, LogoutIcon, UploadIcon } from '../../components/icons';
import { Button, Card, IconBubble, Switch } from '../../components/ui';
import { cx } from '../../lib/format';
import { useApp } from '../../lib/store';
import { AdminTitleBand, CardHead } from './Shared';

const STEPS = ['Details', 'Sections', 'Settings', 'Publish & Invite'];

export function LinkField({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex h-11 items-center gap-2 rounded-ctl bg-subtle pl-3.5 pr-1.5">
      <span className="min-w-0 flex-1 truncate text-[14px] text-fg-2">{url}</span>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(url).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[14px] font-semibold text-link hover:bg-white"
      >
        {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

/** A3 · Publish & Invite */
export default function Publish() {
  const s = useApp();
  const navigate = useNavigate();
  const [priv, setPriv] = useState(true);
  const rate = REFRESH_OPTIONS.find((o) => o.ms === s.refreshMs)?.label ?? `${s.refreshMs / 1000} sec`;

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />
      <AdminTitleBand>
        {/* TF Steps · Circles with text (horizontal) */}
        <ol className="mt-6 flex items-center gap-3" aria-label="Steps">
          {STEPS.map((st, i) => {
            const active = i === STEPS.length - 1;
            return (
              <li key={st} className="flex items-center gap-3">
                <span className="flex items-center gap-2">
                  <span
                    className={cx(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-medium',
                      active ? 'bg-primary text-white' : 'border border-primary bg-white text-primary',
                    )}
                  >
                    {active ? i + 1 : <CheckIcon size={14} />}
                  </span>
                  <span
                    className={cx('text-[14px] leading-5', active ? 'font-semibold text-fg' : 'font-medium text-fg-2')}
                    aria-current={active ? 'step' : undefined}
                  >
                    {st}
                  </span>
                </span>
                {i < STEPS.length - 1 && <span className="h-px w-10 bg-line-input" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>
      </AdminTitleBand>

      <main className="mx-auto max-w-[880px] space-y-5 py-8">
        <Card className="space-y-4 p-7">
          <CardHead title="Preview" desc="Check the assessment as candidates will see it before you invite them." />
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <LinkField url={ASSESSMENT.url} />
            </div>
            <Button variant="neutral" size="lg">
              Preview Assessment
            </Button>
          </div>
        </Card>

        {/* New: Exit PIN info card, above Private Assessment (hidden when Secure Browser = No) */}
        {s.sebEnabled && (
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <IconBubble tone="exit">
              <LogoutIcon size={20} />
            </IconBubble>
            <div className="min-w-0 flex-1">
              <h2 className="text-[16px] font-semibold leading-6 text-fg">
                SEB Exit PIN · {s.exitType === 'rotating' ? `PIN Rotation, refreshes every ${rate}` : 'Fixed PIN'}
              </h2>
              <p className="text-[14px] leading-5 text-fg-3">The PIN appears here and on the invigilator page once the exam starts.</p>
            </div>
            <Button variant="neutral" onClick={() => navigate('/invigilator')}>
              Open invigilator view
            </Button>
          </div>
        </Card>
        )}

        <Card className="p-7">
          <CardHead
            title="Private Assessment"
            desc="Only candidates you invite can take this assessment."
            right={<Switch checked={priv} onChange={setPriv} label="Private Assessment" />}
          />
        </Card>

        <Card className="space-y-4 p-7">
          <CardHead title="Upload & Invite" desc="Upload a CSV with candidate names and emails." />
          <button
            type="button"
            className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line-input bg-muted-bg text-[14px] text-fg-3 hover:bg-subtle"
          >
            <UploadIcon size={24} className="text-fg-4" />
            <span>
              <span className="text-link">Click to upload</span> or drag and drop a .csv file
            </span>
          </button>
          <div className="flex items-center justify-between">
            <a href="#" onClick={(e) => e.preventDefault()} className="text-[14px] font-semibold text-link hover:underline">
              Download sample CSV
            </a>
            <Button disabled>Send Invites</Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
