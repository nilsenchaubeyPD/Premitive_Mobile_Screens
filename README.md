# Topin · SEB Exit PIN prototype

A clickable, front-end-only prototype of the Secure Exam Browser exit flow. Everything is mocked in the browser.

```bash
npm install
npm run dev   # http://localhost:5173
```

- **Every [OPEN] decision** is in `src/config.ts`. This covers the previous-code grace, the post-end grace, attempts, lock time, the pop-up order and mid-exam auto-submit.
- **Server clock:** a single mocked clock in `src/lib/store.ts` drives every PIN, countdown and phase. PIN logic is in `src/lib/pin.ts`.
- **Prototype panel** (bottom-left) lets you jump to any route, set the exam phase, exit type and refresh rate, see the current Exit PIN and Exam PIN, toggle submitted or offline, fast-forward time, simulate a hard shutdown and read the event log.
  - Two extra helpers reproduce edge cases: **End exam in 30s** (edge case 2) and **3s before rotation** (edge case 1).

## Routes

| Area | Routes |
|---|---|
| A · Admin | `/admin/config/rotating`, `/admin/config/custom`, `/admin/config/custom/{empty,length,chars}`, `/admin/publish`, `/admin/view/{yet-to-start,in-progress,completed}` |
| B · Invigilator | `/invigilator/{before,soon,live,grace,closed}`, `/invigilator/live/custom`, `/invigilator` (current state) |
| C · Candidate | `/candidate/{login,instructions,sections,question,sections-progress,feedback}` |
| D · Exit pop-ups | `/candidate/<screen>/exit/{pin,verifying,error,locked,offline,verified,expired}`, `/candidate/closed` |
| E · Reviewer | `/reviewer/report` |

Query toggles work on any route: `?exit=custom|rotating`, `?offline=1|0`, `?submitted=1|0`.

A full page reload resets the mocked state, so navigate with the panel to keep the state.

## Design system

The UI follows **TF – Design System** (Figma `SsE894RCUm67aXGd7bbisC`), and the full flow is laid out in Figma: *SEB-PIN-Rotation → LFD - Claude*.

- **Tokens:** `tailwind.config.js` maps semantic names to TF styles. TF uses Tailwind's palette, type scale and shadows.
- **Icons:** `src/assets/icons/*.svg` are exact exports of the TF Iconsax and Heroicons components. They render through a CSS mask in `src/components/icons.tsx`, so the assets stay unmodified and inherit `currentColor`.
- **Components:** Button, Badges, Toggles, Input Groups, Alerts and the centered Modal mirror the TF components. The PIN cards and boxes mirror the Figma local components `PIN / Exam card`, `PIN / Exit card` and `PIN / Box`.
