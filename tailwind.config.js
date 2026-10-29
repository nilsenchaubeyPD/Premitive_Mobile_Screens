/**
 * TF – Design System tokens (Figma: TF - Design System). Semantic name → TF style in comments.
 * TF's palette is Tailwind's (blue-gray = slate), so default palette classes (e.g. bg-emerald-100)
 * are TF styles too; the names below exist for semantic roles.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        fg: '#0F172A', // Light / blue-gray / 900 — headings, values
        'fg-label': '#334155', // blue-gray / 700 — labels, modal titles
        'fg-2': '#475569', // blue-gray / 600 — secondary text
        'fg-3': '#64748B', // blue-gray / 500 — body, helper, placeholder
        'fg-4': '#94A3B8', // blue-gray / 400 — muted icons
        line: '#E2E8F0', // blue-gray / 200 — card borders, dividers
        'line-input': '#CBD5E1', // blue-gray / 300 — inputs, neutral buttons
        page: '#FFFFFF', // base / white
        subtle: '#F1F5F9', // blue-gray / 100
        'muted-bg': '#F8FAFC', // blue-gray / 50
        primary: '#2563EB', // blue / 600 — Button Primary
        'primary-hover': '#1D4ED8', // blue / 700
        'primary-pressed': '#1E40AF', // blue / 800
        'primary-tint': '#EFF6FF', // blue / 50
        'primary-soft': '#DBEAFE', // blue / 100 — Button Secondary
        link: '#2563EB', // blue / 600
        focus: '#3B82F6', // blue / 500 — focus ring
        danger: '#DC2626', // red / 600
        'danger-hover': '#B91C1C', // red / 700
        'danger-text': '#DC2626', // red / 600 — inline errors
        'danger-border': '#F87171', // red / 400 — input error border
        'danger-tint': '#FEF2F2', // red / 50
        'disabled-bg': '#CBD5E1', // blue-gray / 300 — Button Disabled fill
        'disabled-fg': '#94A3B8', // blue-gray / 400 — Button Disabled text
        success: '#22C55E', // green / 500
        'success-strong': '#16A34A', // green / 600
        'success-tint': '#F0FDF4', // green / 50
        'exit-icon': '#D97706', // amber / 600 — Exit PIN icon
        'exit-tint': '#FFFBEB', // amber / 50
        'exit-accent': '#F59E0B', // amber / 500 — Exit PIN countdown
        'exit-accent-track': '#FEF3C7', // amber / 100
        'timer-teal': '#0E7490', // cyan / 700
        'brand-pink': '#EC4899', // pink / 500
        'tooltip-bg': '#0F172A', // blue-gray / 900
        overlay: 'rgba(100,116,139,0.75)', // blue-gray / 500 @ 75%
        'seb-bar': '#E9E9EC', // SEB native chrome (not Topin UI)
      },
      borderRadius: { card: '8px', ctl: '8px', modal: '8px' },
      boxShadow: {
        'tf-sm': '0 1px 2px rgba(0,0,0,.08)', // Shadow/sm
        'tf-lg': '0 4px 6px -2px rgba(0,0,0,.05), 0 10px 15px -3px rgba(0,0,0,.10)', // Shadow / lg
        'tf-xl': '0 10px 10px -5px rgba(0,0,0,.04), 0 20px 25px -5px rgba(0,0,0,.10)', // Shadow / xl
        'tf-primary': 'inset 0 -1px 0 rgba(0,0,0,.20), 0 1px 0 rgba(0,0,0,.08)', // Shadow/ Primary Button
      },
      letterSpacing: { caps: '0.04em' }, // text-xs/All Caps (4%)
    },
  },
  plugins: [],
};
