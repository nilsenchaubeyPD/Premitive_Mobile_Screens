import { ReactNode, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../lib/format';
import { CloseIcon } from './icons';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let opener: HTMLElement | null = null;

/**
 * 440px modal over the overlay backdrop. Focus is trapped inside.
 * `onClose` undefined → Esc and × are disabled (× is shown but inert).
 */
export function Modal({
  icon,
  title,
  body,
  children,
  onClose,
  initialFocusRef,
}: {
  icon: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  children: ReactNode;
  onClose?: () => void;
  initialFocusRef?: React.RefObject<HTMLElement>;
}) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Restore focus to the opener once the last modal closes.
  useEffect(() => {
    const active = document.activeElement as HTMLElement | null;
    if (active && active !== document.body && !active.closest('[role="dialog"]')) opener = active;
    return () => {
      // Opener may be disabled while the modal is open; wait a frame for it to re-enable.
      requestAnimationFrame(() => {
        if (!document.querySelector('[role="dialog"]') && opener?.isConnected) opener.focus();
      });
    };
  }, []);

  useEffect(() => {
    const first = Array.from(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).find((n) => !n.dataset.modalClose);
    const el = initialFocusRef?.current ?? first;
    el?.focus();
    // Only on mount / when the content view changes the caller remounts us.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current?.();
        return;
      }
      if (e.key !== 'Tab' || !ref.current) return;
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!ref.current.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, []);

  // TF Modal · "Centered with wide buttons": 64px bulk icon, title, body, full-width actions.
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-overlay">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex w-[440px] flex-col items-center gap-6 rounded-modal border border-line-input bg-white p-6 text-center shadow-tf-xl"
      >
        <button
          type="button"
          aria-label="Close"
          data-modal-close="true"
          onClick={onClose}
          disabled={!onClose}
          aria-disabled={!onClose}
          className={cx(
            'absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-ctl',
            onClose ? 'text-fg-4 hover:bg-subtle hover:text-fg-2' : 'cursor-not-allowed text-line-input',
          )}
        >
          <CloseIcon size={16} />
        </button>
        <div className="flex w-full flex-col items-center gap-4">
          {icon}
          <div className="flex w-full flex-col items-center gap-2">
            <h2 id={titleId} className="text-[16px] font-medium leading-6 text-fg-label">
              {title}
            </h2>
            {body && <div className="text-[14px] leading-5 text-fg-3">{body}</div>}
          </div>
        </div>
        <div className="w-full">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
