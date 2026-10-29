import type { CSSProperties, SVGProps } from 'react';
import arrowDown from '../assets/icons/arrow-down.svg';
import arrowLeft from '../assets/icons/arrow-left.svg';
import battery from '../assets/icons/battery.svg';
import boldDanger from '../assets/icons/bold-danger.svg';
import bookmark from '../assets/icons/bookmark.svg';
import bulkClock from '../assets/icons/bulk-clock.svg';
import bulkDanger from '../assets/icons/bulk-danger.svg';
import bulkLock from '../assets/icons/bulk-lock.svg';
import bulkTick from '../assets/icons/bulk-tick-circle.svg';
import calendar from '../assets/icons/calendar.svg';
import check from '../assets/icons/check.svg';
import chevronDown from '../assets/icons/chevron-down.svg';
import clock from '../assets/icons/clock.svg';
import close from '../assets/icons/close.svg';
import coin from '../assets/icons/coin.svg';
import copy from '../assets/icons/copy.svg';
import danger from '../assets/icons/danger.svg';
import documentUpload from '../assets/icons/document-upload.svg';
import exportIcon from '../assets/icons/export.svg';
import forward from '../assets/icons/forward.svg';
import infoCircle from '../assets/icons/info-circle.svg';
import key from '../assets/icons/key.svg';
import lock from '../assets/icons/lock.svg';
import logout from '../assets/icons/logout.svg';
import messageQuestion from '../assets/icons/message-question.svg';
import people from '../assets/icons/people.svg';
import setting2 from '../assets/icons/setting-2.svg';
import shieldTick from '../assets/icons/shield-tick.svg';
import solidInfo from '../assets/icons/solid-information-circle.svg';
import tickCircle from '../assets/icons/tick-circle.svg';
import wifi from '../assets/icons/wifi.svg';

type IconProps = { size?: number; className?: string; style?: CSSProperties };

/**
 * TF – Design System icons (Iconsax outline/bulk + Heroicons). The exported SVG asset is used
 * unmodified as a CSS mask so it inherits `currentColor`; bulk icons keep their two-tone opacity.
 */
function make(src: string, name: string) {
  function Icon({ size = 16, className, style }: IconProps) {
    return (
      <span
        aria-hidden="true"
        data-icon={name}
        className={`tf-icon${className ? ` ${className}` : ''}`}
        style={{ width: size, height: size, ['--icon' as string]: `url("${src}")`, ...style }}
      />
    );
  }
  Icon.displayName = `Icon(${name})`;
  return Icon;
}

export const LogoutIcon = make(logout, 'outline/logout');
export const KeyIcon = make(key, 'outline/key');
export const LockIcon = make(lock, 'outline/lock');
export const ClockIcon = make(clock, 'outline/clock');
export const InfoIcon = make(infoCircle, 'outline/info-circle');
export const TickCircleIcon = make(tickCircle, 'outline/tick-circle');
export const DangerIcon = make(danger, 'outline/danger');
export const WifiIcon = make(wifi, 'outline/wifi');
export const BatteryIcon = make(battery, 'outline/battery-full');
export const CopyIcon = make(copy, 'outline/copy');
export const ArrowLeftIcon = make(arrowLeft, 'outline/arrow-left');
export const ExportIcon = make(exportIcon, 'outline/export');
export const ShieldIcon = make(shieldTick, 'outline/shield-tick');
export const PeopleIcon = make(people, 'outline/people');
export const CalendarIcon = make(calendar, 'outline/calendar');
export const HelpIcon = make(messageQuestion, 'outline/message-question');
export const CoinIcon = make(coin, 'outline/coin');
export const UploadIcon = make(documentUpload, 'outline/document-upload');
export const BookmarkIcon = make(bookmark, 'outline/bookmark');
export const ForwardIcon = make(forward, 'outline/forward');
export const SettingIcon = make(setting2, 'outline/setting-2');
export const ArrowDownIcon = make(arrowDown, 'outline/arrow-down');
export const ChevronDownIcon = make(chevronDown, 'outline/arrow-down (chevron)');
export const CloseIcon = make(close, 'Icon/Outline/Close');
export const CheckIcon = make(check, 'Icon/Outline/check');
export const InfoSolidIcon = make(solidInfo, 'Icon/Solid/information-circle');
export const DangerBoldIcon = make(boldDanger, 'vuesax/bold/danger');
export const BulkTickIcon = make(bulkTick, 'vuesax/bulk/tick-circle');
export const BulkDangerIcon = make(bulkDanger, 'vuesax/bulk/danger');
export const BulkLockIcon = make(bulkLock, 'vuesax/bulk/lock');
export const BulkClockIcon = make(bulkClock, 'vuesax/bulk/clock');

/** Loading indicator for Button `loading` (not a DS icon). */
export function SpinnerIcon({ size = 16, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true" {...rest}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
