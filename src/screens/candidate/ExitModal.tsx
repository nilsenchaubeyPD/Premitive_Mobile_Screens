import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CUSTOM_MAX,
  CUSTOM_MIN,
  EXIT_PIN_LENGTH,
  MID_EXAM_EXIT_AUTO_SUBMIT,
  VERIFY_DELAY_MS,
} from '../../config';
import { BulkClockIcon, BulkLockIcon, BulkTickIcon, WifiIcon } from '../../components/icons';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/ui';
import { clock, cx, secs } from '../../lib/format';
import { exitInfo, phaseOf, verifyExit } from '../../lib/pin';
import { actions, getState, useApp } from '../../lib/store';
import { PinInputs, PinInputsHandle } from './PinInputs';

export type Popup = 'pin' | 'verifying' | 'error' | 'locked' | 'offline' | 'verified' | 'expired';
export const POPUPS: Popup[] = ['pin', 'verifying', 'error', 'locked', 'offline', 'verified', 'expired'];
const PIN_FAMILY: Popup[] = ['pin', 'verifying', 'error', 'locked', 'offline'];

export const POPUP_LABEL: Record<Popup, string> = {
  pin: 'D2 · Enter Exit PIN',
  verifying: 'D2 · Verifying',
  error: 'D3 · Wrong / expired',
  locked: 'D3 · Locked',
  offline: 'D6 · Offline',
  verified: 'D4 · Verified',
  expired: 'D5 · Link expired',
};

/**
 * One exit flow everywhere: every Exit button (login, exam, feedback) opens the same Enter Exit PIN
 * pop-up. No extra "Exit before submitting?" step.
 */
export function ExitModal({ popup, go }: { popup: Popup; go: (p: Popup | null) => void }) {
  if (PIN_FAMILY.includes(popup)) {
    return (
      <PinStep
        key="pin"
        popup={popup}
        go={go}
        onVerified={() => {
          actions.issueToken();
          go('verified');
        }}
      />
    );
  }

  if (popup === 'verified') return <VerifiedStep key="verified" go={go} />;

  // D5 · Link expired
  return (
    <Modal
      key="expired"
      icon={<BulkClockIcon size={64} className="text-exit-icon" />}
      title="Exit link expired"
      body="For security, the link works for 60 seconds. Enter the current PIN again to exit."
      onClose={() => go(null)}
    >
      <Button className="w-full" size="lg" onClick={() => go('pin')}>
        Enter PIN again
      </Button>
    </Modal>
  );
}

/* ---------------- D2 / D3 / D6 ---------------- */

function PinStep({ popup, go, onVerified }: { popup: Popup; go: (p: Popup | null) => void; onVerified: () => void }) {
  const s = useApp();
  const custom = s.exitType === 'custom';
  const pinRef = useRef<PinInputsHandle>(null);
  const textRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number>();

  // Prefill when a state is opened directly by route.
  const [chars, setChars] = useState<string[]>(() => {
    const st = getState();
    const valid = exitInfo(st.now, st.refreshMs).code;
    if (popup === 'verifying' || popup === 'offline') return valid.split('');
    if (popup === 'error') return (valid === '1593' ? '1594' : '1593').split('');
    return Array(EXIT_PIN_LENGTH).fill('');
  });
  const [text, setText] = useState(() => {
    const st = getState();
    if (popup === 'verifying' || popup === 'offline') return st.customPassword;
    if (popup === 'error') return 'WRONGPASS';
    return '';
  });

  const locked = s.lockUntil > s.now;
  const verifying = popup === 'verifying';
  const value = custom ? text : chars.join('');
  const complete = custom ? text.length >= CUSTOM_MIN && text.length <= CUSTOM_MAX : chars.every(Boolean);

  // Direct-route entry: make the store match the requested state.
  useEffect(() => {
    const st = getState();
    if (popup === 'locked' && !(st.lockUntil > st.now)) actions.forceLock();
    if (popup === 'offline') actions.setOffline(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock always wins; when it lapses, return to a clean D2.
  const wasLocked = useRef(false);
  useEffect(() => {
    if (locked) wasLocked.current = true;
    if (locked && popup !== 'locked') go('locked');
    if (!locked && popup === 'locked' && wasLocked.current) {
      wasLocked.current = false;
      setChars(Array(EXIT_PIN_LENGTH).fill(''));
      setText('');
      go('pin');
    }
  }, [locked, popup, go]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Refocus the input after state changes that re-enable it.
  useEffect(() => {
    if (popup === 'pin') (custom ? textRef.current?.focus() : pinRef.current?.focus());
  }, [popup, custom]);

  const clearMessage = () => {
    if (popup === 'error' || popup === 'offline') go('pin');
  };

  const submit = () => {
    if (!complete || locked || verifying) return;
    if (getState().offline) {
      go('offline');
      return;
    }
    go('verifying');
    timer.current = window.setTimeout(() => {
      const st = getState();
      const res = verifyExit(value, st);
      const phase = phaseOf(st);
      if (res.ok) {
        actions.log('exit_pin_attempt', { result: 'success', phase, mode: st.exitType });
        onVerified();
        return;
      }
      const nowLocked = actions.failAttempt();
      actions.log('exit_pin_attempt', {
        result: 'fail',
        reason: nowLocked ? 'locked' : res.reason,
        code_status: res.reason,
        attempts: getState().attempts,
        phase,
      });
      go(nowLocked ? 'locked' : 'error');
    }, VERIFY_DELAY_MS);
  };

  const error = popup === 'error';
  const disabled = verifying || locked;

  let message: React.ReactNode = null;
  if (error)
    message = custom
      ? 'Incorrect or expired PIN. Please ask your invigilator for the current PIN.'
      : 'Incorrect or expired PIN. Please ask your invigilator for the current PIN.';
  if (popup === 'offline')
    message = (
      <span className="inline-flex items-start gap-1.5">
        <WifiIcon size={16} className="mt-0.5 shrink-0" />
        You're offline. Reconnect to verify the Exit PIN.
      </span>
    );
  if (locked) message = `Too many attempts. Try again in ${secs(s.lockUntil - s.now)} sec.`;

  return (
    <Modal
      icon={<BulkLockIcon size={64} className="text-exit-icon" />}
      title="Enter Exit PIN"
      body={custom ? 'Ask your invigilator for the Exit PIN.' : 'Ask your invigilator for the current exit PIN.'}
      onClose={() => go(null)}
    >
      <form
        className="text-left"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {custom ? (
          <input
            ref={textRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, CUSTOM_MAX));
              clearMessage();
            }}
            disabled={disabled}
            aria-label="Exit PIN"
            aria-invalid={error || undefined}
            autoComplete="off"
            spellCheck={false}
            maxLength={CUSTOM_MAX}
            placeholder={`${CUSTOM_MIN}–${CUSTOM_MAX} characters`}
            className={cx(
              // TF Input Groups · text input, scaled up for the Fixed PIN (6–9 letters or numbers)
              'h-11 w-full rounded-ctl bg-white px-3.5 text-[16px] font-medium tracking-[1px] text-fg shadow-tf-sm placeholder:text-[14px] placeholder:font-normal placeholder:tracking-normal placeholder:text-fg-3 focus:border-focus',
              error ? 'border border-danger-border' : 'border border-line-input',
              disabled && 'bg-muted-bg text-fg-4',
            )}
          />
        ) : (
          <PinInputs
            ref={pinRef}
            chars={chars}
            onChange={(c) => {
              setChars(c);
              clearMessage();
            }}
            onSubmit={submit}
            disabled={disabled}
            error={error}
          />
        )}
        <div className="min-h-[32px] pt-3">
          {message && (
            <p
              role="alert"
              className={cx('text-[14px] font-medium leading-5 tabular text-danger-text', custom ? 'text-left' : 'text-center')}
            >
              {message}
            </p>
          )}
        </div>
        <Button type="submit" className="mt-3 w-full" disabled={!complete || locked} loading={verifying}>
          {verifying ? 'Verifying…' : 'Submit'}
        </Button>
      </form>
    </Modal>
  );
}

/* ---------------- D4 ---------------- */

function VerifiedStep({ go }: { go: (p: Popup | null) => void }) {
  const s = useApp();
  const navigate = useNavigate();
  const clicked = useRef(false);
  const token = s.token;
  const msLeft = token ? token.expiresAt - s.now : 0;

  // Direct-route entry: issue a token if there isn't a live one.
  useEffect(() => {
    const st = getState();
    if (!st.token || st.token.used || st.now >= st.token.expiresAt) actions.issueToken();
  }, []);

  useEffect(() => {
    if (token && !token.used && msLeft <= 0) {
      actions.log('exit_token_expired', { token: token.id });
      actions.discardToken();
      go('expired');
    }
  }, [token, msLeft, go]);

  const exitNow = () => {
    // Token is single-use: a second click is ignored.
    if (clicked.current) return;
    clicked.current = true;
    const st = getState();
    if (!actions.consumeToken()) {
      clicked.current = false;
      return;
    }
    actions.log('exit_completed', {
      token: st.token?.id,
      submitted: st.submitted,
      phase: phaseOf(st),
    });
    if (MID_EXAM_EXIT_AUTO_SUBMIT && !st.submitted) actions.setSubmitted(true);
    navigate('/candidate/closed', { replace: true });
  };

  return (
    <Modal
      icon={<BulkTickIcon size={64} className="text-success" />}
      title="Verified"
      body="You can now close the Secure Browser."
      // Esc and × disabled so the token isn't silently dropped.
    >
      <Button size="lg" className="w-full" onClick={exitNow} disabled={!token || token.used}>
        Exit now
      </Button>
      <p className="mt-3 text-center text-[14px] font-medium text-fg-2 tabular" aria-live="off">
        This link expires in {clock(msLeft)}
      </p>
      <div className="mt-2 text-center">
        <button
          type="button"
          className="text-[14px] font-semibold text-link hover:underline"
          onClick={() => {
            actions.discardToken();
            go(null);
          }}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
