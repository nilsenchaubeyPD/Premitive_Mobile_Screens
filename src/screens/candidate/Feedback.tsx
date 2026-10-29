import { BulkTickIcon } from '../../components/icons';
import { Button } from '../../components/ui';

/** C6 · Feedback page (after submission). */
export function Feedback({ onExit, exitDisabled }: { onExit: () => void; exitDisabled: boolean }) {
  return (
    <div className="flex min-h-full items-center justify-center px-8 py-12">
      <div className="flex w-[520px] flex-col items-center text-center">
        <BulkTickIcon size={64} className="text-success" />
        <h1 className="mt-4 text-[24px] font-bold leading-8 text-fg">Thank you for your feedback</h1>
        <p className="mt-4 text-[16px] leading-6 text-fg-3">
          Your assessment is submitted. To close the Secure Browser, ask your invigilator for the Exit PIN.
        </p>
        <Button size="lg" className="mt-8" onClick={onExit} disabled={exitDisabled}>
          Exit Secure Browser
        </Button>
      </div>
    </div>
  );
}
