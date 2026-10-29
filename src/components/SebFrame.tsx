import { ReactNode } from 'react';
import { useApp } from '../lib/store';
import { timeOfDay } from '../lib/format';
import { BatteryIcon, WifiIcon } from './icons';

/**
 * §3.4 SEB window frame (prototype only). This is SEB's own chrome: no Topin UI
 * goes in the bars, and SEB's native power/quit icon is intentionally absent.
 */
export function SebFrame({ children }: { children: ReactNode }) {
  const { now, offline } = useApp();
  return (
    <div className="flex h-screen flex-col bg-white">
      <div className="flex h-9 shrink-0 items-center justify-center bg-seb-bar text-[12px] font-medium text-fg-label select-none">
        Safe Exam Browser 3.7 — Topin.tech
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
      <div className="flex h-10 shrink-0 items-center justify-end gap-4 bg-seb-bar px-5 text-[12px] font-medium text-fg-label select-none">
        <WifiIcon size={16} className={offline ? 'text-danger' : undefined} />
        <BatteryIcon size={18} />
        <span className="tabular">{timeOfDay(now)}</span>
      </div>
    </div>
  );
}
