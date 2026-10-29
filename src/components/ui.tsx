import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cx } from '../lib/format';
import { DangerBoldIcon, InfoSolidIcon, SpinnerIcon } from './icons';

/** TF Button: Type = Primary / Neutral / Secondary (+ danger fill override, link). Size = Small 32 / Medium 36 / Large 44. */
type Variant = 'primary' | 'neutral' | 'secondary' | 'danger' | 'link';
type Size = 'sm' | 'md' | 'lg';

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean }
>(function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...rest }, ref) {
  const sizes: Record<Size, string> = {
    sm: 'h-8 px-3 rounded-md',
    md: 'h-9 px-4 rounded-ctl',
    lg: 'h-11 px-6 rounded-ctl',
  };
  const v: Record<Variant, string> = {
    primary:
      'bg-primary text-white shadow-tf-primary hover:bg-primary-hover active:bg-primary-pressed disabled:bg-disabled-bg disabled:text-disabled-fg disabled:shadow-none',
    neutral:
      'bg-white text-fg-label border border-line-input shadow-tf-sm hover:bg-subtle active:bg-line disabled:bg-muted-bg disabled:border-line disabled:text-disabled-bg disabled:shadow-none',
    secondary: 'bg-primary-soft text-primary hover:bg-[#BFDBFE] active:bg-[#93C5FD] disabled:bg-disabled-bg disabled:text-disabled-fg',
    danger:
      'bg-danger text-white shadow-tf-primary hover:bg-danger-hover disabled:bg-disabled-bg disabled:text-disabled-fg disabled:shadow-none',
    link: 'text-link hover:underline disabled:text-fg-4',
  };
  return (
    <button
      ref={ref}
      className={cx(
        'inline-flex items-center justify-center gap-2 text-[14px] font-medium leading-5 transition-colors select-none disabled:cursor-not-allowed',
        variant !== 'link' && sizes[size],
        v[variant],
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <SpinnerIcon size={16} className="animate-spin" />}
      {children}
    </button>
  );
});

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('rounded-card border border-line bg-white', className)}>{children}</div>;
}

/** TF Badges · Status=Circular, Size=Large, Type=Withoutdot. */
type BadgeTone = 'neutral' | 'information' | 'success' | 'warning' | 'critical';
export function Pill({ tone, children, className }: { tone: BadgeTone; children: ReactNode; className?: string }) {
  const t: Record<BadgeTone, string> = {
    neutral: 'bg-slate-100 text-slate-800',
    information: 'bg-blue-100 text-blue-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  };
  return (
    <span className={cx('inline-flex h-6 items-center whitespace-nowrap rounded-full px-3 text-[12px] font-medium leading-4', t[tone], className)}>
      {children}
    </span>
  );
}

/** TF Alerts (single line): info = blue-50 + Heroicons solid info; warning = amber-50 + vuesax bold danger. */
export function InfoStrip({ tone = 'info', children, className }: { tone?: 'info' | 'warning'; children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'flex items-start gap-2 rounded-card px-4 py-3 text-[14px] font-medium leading-5 shadow-tf-sm',
        tone === 'info' ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800',
        className,
      )}
    >
      {tone === 'info' ? <InfoSolidIcon size={20} className="shrink-0 text-blue-500" /> : <DangerBoldIcon size={20} className="shrink-0 text-amber-500" />}
      <span>{children}</span>
    </div>
  );
}

export function IconBubble({
  tone,
  size = 44,
  children,
}: {
  tone: 'primary' | 'exit' | 'danger' | 'success' | 'neutral';
  size?: number;
  children: ReactNode;
}) {
  const t = {
    primary: 'bg-primary-tint text-primary',
    exit: 'bg-exit-tint text-exit-icon',
    danger: 'bg-danger-tint text-danger',
    success: 'bg-success-tint text-success',
    neutral: 'bg-subtle text-fg-4',
  }[tone];
  return (
    <span className={cx('inline-flex shrink-0 items-center justify-center rounded-full', t)} style={{ width: size, height: size }}>
      {children}
    </span>
  );
}

/** TF Toggles · Type=Simple (48×24). */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative h-6 w-12 shrink-0 rounded-full transition-colors', checked ? 'bg-primary hover:bg-primary-hover' : 'bg-line hover:bg-line-input')}
    >
      <span
        className={cx('absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow-tf-sm transition-transform', checked ? 'translate-x-[26px]' : 'translate-x-0.5')}
      />
    </button>
  );
}

/** TF text-xs/All Caps - Semibold. */
export function CapsLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('text-[12px] font-semibold uppercase leading-4 tracking-caps text-fg-3', className)}>{children}</div>;
}
