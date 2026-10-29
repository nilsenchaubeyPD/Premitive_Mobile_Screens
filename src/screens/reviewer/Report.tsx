import { ASSESSMENT } from '../../config';
import { AdminHeader } from '../../components/Headers';
import { ShieldIcon } from '../../components/icons';
import { Card, IconBubble, Pill } from '../../components/ui';

const ROWS = [
  { pattern: 'Improper Exit', phase: 'Before submission', severity: 'High', tone: 'critical' as const },
  { pattern: 'Improper Exit', phase: 'After submission', severity: 'Low', tone: 'warning' as const },
];

/** E1 · Anti-Cheating Report → Secure Browser Violation card */
export default function Report() {
  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />
      <main className="mx-auto max-w-[1040px] py-8">
        <h1 className="text-[24px] font-bold leading-8 text-fg">Anti-Cheating Report</h1>
        <p className="clamp-2 mt-1 text-[14px] leading-5 text-fg-3" title={ASSESSMENT.name}>
          {ASSESSMENT.candidate} · {ASSESSMENT.name}
        </p>

        <Card className="mt-6 overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-3">
              <IconBubble tone="danger" size={40}>
                <ShieldIcon size={18} />
              </IconBubble>
              <h2 className="text-[18px] font-semibold leading-7 text-fg">Secure Browser Violation</h2>
            </div>
            <Pill tone="critical">{ROWS.length} flags</Pill>
          </div>
          <table className="w-full border-t border-line text-left">
            <thead className="bg-muted-bg">
              <tr className="text-[12px] font-semibold uppercase leading-4 tracking-caps text-fg-3">
                <th scope="col" className="w-[380px] px-6 py-3">
                  Pattern
                </th>
                <th scope="col" className="w-[380px] px-6 py-3">
                  Phase
                </th>
                <th scope="col" className="px-6 py-3">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={i} className="border-t border-line text-[14px] leading-5">
                  <td className="px-6 py-4 font-medium text-fg">{r.pattern}</td>
                  <td className="px-6 py-4 text-fg-2">{r.phase}</td>
                  <td className="px-6 py-4">
                    <Pill tone={r.tone}>{r.severity}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-line bg-muted-bg px-6 py-3.5 text-[14px] leading-5 text-fg-2">
            SEB closed without an Exit PIN. Flag only, no penalty applied. Also in results CSV as{' '}
            <code className="font-sans font-semibold text-fg">Improper_Exit</code>.
          </p>
        </Card>
      </main>
    </div>
  );
}
