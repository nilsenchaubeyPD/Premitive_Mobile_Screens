import { ClipboardEvent, KeyboardEvent, forwardRef, useImperativeHandle, useRef } from 'react';
import { EXIT_PIN_LENGTH } from '../../config';
import { cx } from '../../lib/format';
import { isAllowedExitChar } from '../../lib/pin';

export interface PinInputsHandle {
  focus: (i?: number) => void;
}

/** D2: EXIT_PIN_LENGTH (4) single-digit inputs, 46×56; non-digits are ignored. */
export const PinInputs = forwardRef<
  PinInputsHandle,
  {
    chars: string[];
    onChange: (chars: string[]) => void;
    onSubmit: () => void;
    disabled: boolean;
    error: boolean;
  }
>(function PinInputs({ chars, onChange, onSubmit, disabled, error }, ref) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (i: number) => {
    const el = inputs.current[Math.max(0, Math.min(EXIT_PIN_LENGTH - 1, i))];
    el?.focus();
    el?.select();
  };
  useImperativeHandle(ref, () => ({
    focus: (i?: number) => focus(i ?? Math.min(chars.findIndex((c) => !c) === -1 ? EXIT_PIN_LENGTH - 1 : chars.findIndex((c) => !c), EXIT_PIN_LENGTH - 1)),
  }));

  const setAt = (i: number, c: string) => {
    const next = [...chars];
    next[i] = c;
    onChange(next);
  };

  /** Fill from index `start` with allowed characters from `text`. */
  const fill = (start: number, text: string) => {
    const valid = text.toUpperCase().split('').filter(isAllowedExitChar);
    if (!valid.length) return;
    const from = valid.length >= EXIT_PIN_LENGTH ? 0 : start;
    const next = [...chars];
    valid.slice(0, EXIT_PIN_LENGTH - from).forEach((c, k) => (next[from + k] = c));
    onChange(next);
    focus(Math.min(from + valid.length, EXIT_PIN_LENGTH - 1));
  };

  const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return; // let paste / shortcuts through
    switch (e.key) {
      case 'Backspace':
        e.preventDefault();
        if (chars[i]) setAt(i, '');
        else if (i > 0) {
          setAt(i - 1, '');
          focus(i - 1);
        }
        return;
      case 'Delete':
        e.preventDefault();
        setAt(i, '');
        return;
      case 'ArrowLeft':
        e.preventDefault();
        focus(i - 1);
        return;
      case 'ArrowRight':
        e.preventDefault();
        focus(i + 1);
        return;
      case 'Home':
        e.preventDefault();
        focus(0);
        return;
      case 'End':
        e.preventDefault();
        focus(EXIT_PIN_LENGTH - 1);
        return;
      case 'Enter':
        e.preventDefault();
        onSubmit();
        return;
      case 'Tab':
        return;
    }
    if (e.key.length === 1) {
      e.preventDefault();
      if (!isAllowedExitChar(e.key)) return; // others ignored
      setAt(i, e.key.toUpperCase());
      if (i < EXIT_PIN_LENGTH - 1) focus(i + 1);
    }
  };

  const onPaste = (i: number) => (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    fill(i, e.clipboardData.getData('text'));
  };

  return (
    <div className="flex items-center justify-center gap-2" role="group" aria-label="Exit PIN">
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          value={c}
          // Fallback for input methods that bypass keydown (e.g. autofill).
          onChange={(e) => fill(i, e.target.value.replace(c, ''))}
          onKeyDown={onKeyDown(i)}
          onPaste={onPaste(i)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          aria-label={`Character ${i + 1} of ${EXIT_PIN_LENGTH}`}
          aria-invalid={error || undefined}
          autoComplete="off"
          spellCheck={false}
          inputMode="numeric"
          className={cx(
            // Figma "PIN / Box" · Size=Input (46×56, 20px bold): Empty / Filled / Focus / Error / Disabled
            'h-14 w-[46px] rounded-ctl text-center focus-visible:outline-none text-[20px] font-bold uppercase text-fg caret-primary transition-colors focus:border-2 focus:border-focus',
            error ? 'border-2 border-danger-border focus:border-danger-border' : 'border border-line-input',
            disabled ? 'border-line bg-muted-bg text-fg-4' : 'bg-white',
          )}
        />
      ))}
    </div>
  );
});
