import { LogoutIcon } from '../../components/icons';

/** D7 · Exit complete (prototype only). */
export default function Closed() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-fg text-center text-white">
      <LogoutIcon size={32} className="text-fg-4" />
      <h1 className="text-[24px] font-bold leading-8">Secure Browser closed</h1>
      <p className="text-[14px] leading-5 text-fg-4">Prototype placeholder · event logged: exit_completed</p>
    </div>
  );
}
