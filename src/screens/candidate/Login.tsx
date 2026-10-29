import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockIcon } from '../../components/icons';
import { Button, IconBubble } from '../../components/ui';
import { cx } from '../../lib/format';
import { examPinInfo, phaseOf } from '../../lib/pin';
import { getState, useApp } from '../../lib/store';

/** C1 · Login PIN (existing card) + exit link. C1b: helper while the Exit PIN isn't visible yet. */
export function Login({ onExit, exitDisabled }: { onExit: () => void; exitDisabled: boolean }) {
  const s = useApp();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const phase = phaseOf(s);
  const exitPinNotYetVisible = phase === 'before' || phase === 'soon';

  const login = () => {
    if (pin.length !== 4) return;
    if (pin === examPinInfo(getState().now).pin) navigate('/candidate/instructions');
    else setError(true);
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-muted-bg px-4 py-12">
      <div className="flex w-[420px] flex-col items-center rounded-card border border-line bg-white p-8 text-center">
        <IconBubble tone="neutral" size={48}>
          <LockIcon size={20} className="text-fg-3" />
        </IconBubble>
        <h1 className="mt-4 text-[20px] font-bold leading-7 text-fg">Enter Login PIN</h1>
        <p className="text-[14px] leading-5 text-fg-3">Please enter your Login PIN to access the assessment</p>
        <form
          className="mt-6 w-full space-y-5 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            login();
          }}
        >
          {/* TF Input Groups · With Label */}
          <div>
            <label htmlFor="login-pin" className="text-[14px] font-medium leading-5 text-fg-label">
              Login PIN
            </label>
            <input
              id="login-pin"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                setError(false);
              }}
              inputMode="numeric"
              autoComplete="off"
              placeholder="Enter 4-digit PIN"
              aria-invalid={error || undefined}
              aria-describedby={error ? 'login-pin-error' : undefined}
              className={cx(
                'mt-1 h-[38px] w-full rounded-ctl border px-3 text-[14px] leading-5 tracking-[2px] text-fg shadow-tf-sm placeholder:tracking-normal placeholder:text-fg-3 focus:border-focus',
                error ? 'border-danger-border' : 'border-line-input',
              )}
            />
            {error && (
              <p id="login-pin-error" role="alert" className="mt-1 text-[12px] leading-4 text-danger-text">
                Incorrect Login PIN. Ask your invigilator for the current PIN.
              </p>
            )}
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={pin.length !== 4}>
            Login
          </Button>
        </form>

        <div className="my-6 h-px w-full bg-line" />
        <p className="text-[14px] leading-5 text-fg-2">
          Wrong exam or need to leave?{' '}
          <button
            type="button"
            onClick={onExit}
            disabled={exitDisabled}
            className="font-semibold text-link hover:underline disabled:cursor-default disabled:no-underline"
          >
            Exit Secure Browser
          </button>
        </p>
        {exitPinNotYetVisible && (
          <p className="mt-2 text-[14px] leading-5 text-fg-3">Ask your invigilator; the Exit PIN becomes available when the exam starts.</p>
        )}
      </div>
    </div>
  );
}
