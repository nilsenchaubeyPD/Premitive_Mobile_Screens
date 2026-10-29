# Topin — Candidate Pre-assessment Flow · Build Spec

> Hand this file to Cursor together with the prototype file `flow-v3.html`.
> Prototype location: `prototype/flow-v3.html` (next to this file). Full path on the designer's Mac:
> `/Users/nxtwave/Topin Claude Code/SEB Exit PIN/topin-preassessment/prototype/flow-v3.html`
> It is a single self-contained HTML file — open it in Chrome to click through every state (use the "Prototype controls" button bottom-left).
> **Source of truth:** the prototype for look + behaviour, this file for intent, rules, copy and real-world implementation.
> **Visual design reference (latest):** Figma `LxWpOuSDUib430QPY7MnIo` → "Section 7" (node `141:12923`, file "Pre-Assessment Journey"). The prototype matches it. "Section 3" (`80:3973`) and the Page 2 sections are superseded.
>
> **Section 7 changes on top of §0:** Before you begin, Consent, Review and Code of Conduct use a two-column layout (desk illustration left, 720px content right, 40px page padding) and list items as white row cards (radius 8, padding 16, shadow `0 1px 1.5px rgba(0,0,0,.1), 0 1px 1px rgba(0,0,0,.06)`, 20px blue icon, title over description). New **Multiple Monitors** check on Before you begin ("Use one screen, Disconnect extra monitors." · badge "One Screen") and on Review ("No extra screen detected"). Consent and Code of Conduct put a checkbox + "I Agree and Continue" in the footer (button disabled until ticked). Footers on these screens have no Back. Details / Camera / Mic / Screen are a centred 560px column. Camera: "Okay, Got it" → "Check your camera" + **Capture** → "Is your face, background is clear and easy to visible?" **No, Retake / Yes, Verify** → Retake (disabled) + **Verifying...**. Mic: "Check your microphone" → mic icon + "Speak out loud" + sentence + **Start Recording** → outlined **Stop Recording...05** countdown → "What we heard:" + Play → **Test Again / Continue**. Review: title row with green "N of N Checks Passed" pill.
>
> **Flow logic from the repo `nilsenchaubeyPD/pre-assessment` (ported into the prototype, 27 Oct):**
> - **Assessment types:**
>   - **Proctored:** details → before → consent → camera/mic/screen → review → code of conduct.
>   - **SEB:** Safe Exam Browser gate first. Only the internet and camera checks run; there is no mic or screen step.
>   - **Non-proctored:** details → before (internet only) → code of conduct. Phones are allowed.
>   - Consent "already agreed" skips the Consent step.
>   - **Resume** goes straight to a quick check (camera + screen), then back into the running assessment.
> - **Gate priority:** loading (slow message after 8 s) → server error (E-5003, Try again) → invalid / session expired / closed / submitted → phone or tablet → Mac Safari ("Open in Chrome or Edge") → outdated browser → SEB → early (countdown) / early locked ("Come back at…") / open now → late → resume ("Welcome back… Continue to quick check"). Logging out leads to "Your link session ended".
> - **Code of Conduct is the start.**
>   - Continue starts the session and the overall timer. Hint: "Your [Duration] timer starts when you press Continue."
>   - Continue is locked until the scheduled start: the button reads "Opens at [Time]" and the hint shows "Opens in hh:mm:ss".
>   - While starting, the button shows "Starting…". If starting fails, a fix box offers Try again / Get help.
>   - Continue is blocked when a check is broken.
>   - Starting the session leads to the Sections list. Each section no longer has its own lock or start failure.
> - **Camera:**
>   - Permission flow: waiting → errors (blocked with browser tabs, prompt dismissed, not found, in use, OS blocked). A dark camera passes with a warning note.
>   - First-timers: Capture → 3-2-1 countdown → review → verify.
>   - Returning candidates: "Your face is already set up. Quick check." → Verify.
>   - Face errors: no face, more than one person, covered, too far, too close, too dark, not recognised. After 3 failures, show "Still not working? Get help".
> - **Camera, one step:** Verify runs face enrollment (returning: "Already enrolled") → face verification → camera check as a minimal 3-line checklist under the camera (16px Untitled UI icons: grey ring → spinner → green check-circle, no cards or fills, ~0.9 s each). A face error marks its item red, then returns to Capture / quick check with the error message.
> - **Mic:** blocked / not found errors. Noisy passes with a warning; silent fails. In optional mode, "Skip for now" is shown and Review reads "Skipped".
> - **Screen:** cancelled / tab / window / OS blocked / unsupported each get their own copy. A second screen shows "I've disconnected it".
> - **Consent:** an "I don't agree" text button opens the "You can't take this assessment without monitoring" modal.
> - **Banners:** camera disconnected and screen sharing stopped both have a **Fix it** link that returns to the step. Offline banner. Early banner: "Not the assessment yet. This is only setup. Start unlocks at [Time]."
> - **Session modals** (over the dimmed page, any step): *Signed in elsewhere* — red info icon + "[First name], you’re signed in elsewhere", body "Click ‘Use Here’ to continue on this device. Click ‘Logout’ to go back to the login page.", red countdown "00 : 30" at the bottom-left, **Logout** (text) + **Use Here** (primary) at the right; Use Here closes it; Logout → "Your link session ended" gate; timer reaching 0 → the Session Expired pop-up opens automatically. Both pop-ups share one frame (460px, 16px radius, 48px blue icon circle) and hide the page behind them (no "confirm your identity" card visible). *Session Expired* — "Your session has expired. Please reload the window to continue." + centred **Reload** (restarts the flow). Both are in Prototype controls → Break it now.
> - **Update 28 Oct — removed:** the "Report a problem" side sheet (help drawer + accessibility form) and the "Your link session ended" screen. The header **Report** button and every **Get help** link only hand off to the separate Report-a-problem flow (prototype shows a toast). **Log out** (Details dialog and the signed-in-elsewhere pop-up) hands off to the existing login flow (prototype shows "Logging out… taking you to the login page.").
> - **Help drawer (REMOVED, ignore):**
>   - Shows fixes for the current step (gate / details / before / consent / setup / summary / conduct).
>   - "What's included?" tip.
>   - Accessibility request form: 3 options, a 500-character field, Send → reference number. When offline, it shows an error.
> - **Prototype controls:**
>   - Presets: Happy path, First-timer with problems, Everything fails once, Early link, Phone on proctored, SEB.
>   - "Fail once, then succeed" toggle.
>   - Break-it-now buttons: stop screen, unplug camera, go offline, advance clock.
>   - Plus controls for assessment type, link state, device, candidate, each check's result, consent, mic mode, browser version, early setup, SEB launch and link load.

---

## 0. Design update (Figma node 80:3973) — this OVERRIDES §3 tokens/components below where they conflict

**Palette (Tailwind slate/blue/green):** headings `#334155`, body `#475569`, labels `#64748B`, faint `#94A3B8`, borders `#E2E8F0`, button border `#CBD5E1`, primary `#2563EB`, blue-50 `#EFF6FF`, blue-200 `#BFDBFE`, green-600 `#16A34A`, green-50 `#F0FDF4`, green-500 `#22C55E` (connection icon), red-500 `#EF4444`, red-100 `#FEE2E2`, slate-50 `#F8FAFC`. Inter only.
**Type:** page title 24/32 600 · card title 18/28 600 · row title 14/20 600 · body 14/20 400 · labels 12/16 600 · buttons 14/20 **500**.
**Header (64px, soft shadow `0 1px 1.5px rgba(0,0,0,.1), 0 1px 1px rgba(0,0,0,.06)`, padding 0 40px):** left = **organisation logo** (client's logo, e.g. NVIDIA; 123×22). Right (gap 24): **Report** (alert-octagon icon, opens the help/report drawer) · **connection status** (wifi icon green/amber/red + "Excellent/Slow/Too slow/Offline") · **user menu** "Isaac ⌄" (opens menu with Log out). Details page shows only Report.
**No setup progress bar.**
**Cards:** radius 16, padding 24, gap 24, 1px `#E2E8F0`. Content column 720px. Footer 64px, border-top, buttons aligned to the 720 column (Back left, primary right, both h36).
**Buttons:** primary `#2563EB` + `inset 0 -1px 0 rgba(0,0,0,.2), 0 1px 0 rgba(0,0,0,.08)`; secondary white + 1px `#CBD5E1` + `0 1px 1px rgba(0,0,0,.08)`; radius 8; h36 (footer) / h44 (in-card).
**Rows:** 32px round white icon tile (shadow `0 1px 3px rgba(0,0,0,.1), 0 1px 2px rgba(0,0,0,.06)`) with 16px blue icon · title 160px · description · optional right badge. Gap 20, rows 16 apart, **no dividers**.
**Badges:** pill radius 16, padding 4 10 4 8, 14/500, 12px icon. Success = green-50 bg / green-600 text ("Excellent", "None Found").
**Device steps (Camera, Mic, Screen):** tracker on top (current step = blue-50 pill with 20px blue icon + 16/500 blue label; pending = 38px white circle, 1px `#E2E8F0`; done = solid green circle with white icon; 1px `#E2E8F0` connectors). **Back (160px) + primary (fills) sit INSIDE the card**, h44, gap 24 — not in the footer.

**Copy/behaviour changes from the design:**
- Details: card title "Full-Stack Developer Assessment"; stat tiles on blue-50: "6 · Total Sections", "3 hr 10 min · Assessment duration"; card "Please check the details and confirm your identity" with an identity box (name 16/600, email) and a secondary button **Not you? Log out**. Primary **Confirm and Continue**.
- Before you begin: title **"Hi {first name}, before you begin"** (no subtitle). Two groups: **"What you'll need"** (Internet "At least **5** Mbps." + badge; Browser extensions "Blocked extensions must be turned off." + badge; Camera; Microphone; Screen Sharing; Browser) and **"Get your space ready"** (Room, Apps, Power). Badges only (no speeds here). Internet minimum is now **5 Mbps** (prototype examples: Slow = 6 Mbps, Too slow = 1.2 Mbps).
- Consent: title only; rows Camera / Audio / Screen Sharing / Activity; primary **I Agree and Continue**.
- Camera: Ask → **Allow Camera** (camera icon). First-time: live preview (dashed face guide + red "● Camera on" badge) → **Take Photo** → captured photo (no guide/badge) with **Retake** + **Verify Your Photo** → **Verifying...** (Retake disabled) → passed. Returning users: live → **Verify** → Verifying.... Examples grid: 2×2 tiles (160px tall, radius 12), red ✕ / green ✓ corner badges.
- Microphone: note "Use your laptop's built-in microphone…" first; "Say:" quote box (radius 8); **Record** → **Stop Recording...** (blue, mic icon) with level bars `#BFDBFE` → "What we heard:" box with **Play** + green tick → **Continue**.
- Screen sharing: plain numbered steps + Chrome picker illustration (radius 16); primary **Share Screen**. (No caption under the illustration.)
- Review: title **Everything is set**; green summary strip "6 of 6 checks passed" + check icon (no ring); rows with descriptions; Internet row shows ↓/↑ speeds on the right; Camera "Camera on, Identity confirmed".
- Icons are Untitled UI (`camera-01`, `microphone-01`, `tv-02`, `globe-02`, `shield-tick`, `file-check-02`, `activity`, `wifi`, `sun`, `alert-octagon`, `chevron-down`, `download-01`, `upload-01`, `layers-three-02`, `check`, `x-close`, `play`). SVGs exported from Figma are in `prototype/assets/` (also embedded in the prototype).
- Screens not in the Figma section (Code of conduct, Sections, Section intro, Live, gates, dialogs) keep their structure from this spec but use the tokens above.

---

## 1. What we are building

The screens a candidate sees **after opening their assessment link and before answering the first question**, plus the section list they return to between sections.

Goal: get a nervous candidate from "I opened the link" to "I'm answering question 1" **fast, without confusion, and with every proctoring requirement verified** (internet, extensions, camera + identity, microphone, entire-screen share, consent, code of conduct).

### Who it's for
- **Candidate** (primary): often a student, anxious, on a laptop, Chrome, sometimes poor internet. Needs to know what's coming, how long it takes, what to do when something fails, and that nothing is timed until they press Start.
- **Organisation / proctor** (indirect): needs reliable verification and recorded consent.

### Design principles (agreed with the designer — do not break)
1. **Light theme only.** White background, Inter, single brand blue `#1F5EE6`. Flat, thin-bordered cards. No shadows except dialogs/drawer.
2. **One accent colour.** No multi-coloured icon tiles. Icons are plain blue line icons. Green = passed, red = failed, amber = warning — semantic only.
3. **No hover effects.** None. (Focus rings stay for keyboard users.)
4. **No fake clickable UI.** Every button/link must do something real. No placeholder links.
5. **One-line rows.** Lists are rows: icon · bold title · one-line muted description · optional right-side status. Same pattern everywhere.
6. **Primary action always in the same place:** sticky footer, right. Back on the left. (Exception: none — device steps use the footer too.)
7. **No "Hide" step** for screen sharing.
8. **End assessment is locked until the first section is completed.**
9. Copy says **"assessment"**, never "test"/"exam".
10. Use the **camera** icon (not video-camera) for camera.

---

## 2. Flow and step order

```
[Gate?] → Details → Before you begin → Monitoring and Consent → Camera → Microphone → Screen sharing → Review → Code of conduct → Sections ⇄ Section intro → Live section
```

- `ORDER = ['details','rules','consent','cam','mic','screen','review','coc','sections']`
- Setup progress bar covers the first 8 (everything except `sections`): width = `(index+1)/8`.
- **Phone / MCQ-only assessments** (`mobile` mode): `['details','rules','coc','sections']`, only MCQ sections, no camera/mic/screen, Before you begin shows Internet + "Fullscreen" instead of device rows.
- **Gate screens** replace the flow when the link isn't usable (see §7).
- **Fix-and-return:** from Review (or a "Fix" button), jump to the failing step; after it passes, return to Review (`returnTo='review'`), not the next step.

---

## 3. Global layout

| Element | Spec |
|---|---|
| Page | `#FFFFFF`, Inter, 15px base, line-height 1.55 |
| Header | 64px, sticky top, white, 1px bottom border `#DDE2EC`, padding 0 24px. Left: logo (pink→orange shield + "topin" ink + ".tech" pink→orange gradient text, 20px/600). Right: **Get help** (secondary small button, help icon) and, after consent, a **name chip** (pill `#DDE2EC`, blue avatar circle with initial + first name) |
| Setup progress bar | 3px, sticky at top:64px, track `#DDE2EC`, fill `#1F5EE6`, animates width 0.35s. `role="progressbar"`, `aria-valuetext="Step N of 8"` |
| Banners | Full-width under header, 12px 24px, centred icon + bold 14px text. Red (`#F8E8E8` bg, `#8E2A36` text, `#E0A3A8` bottom border) or amber (`#FFF5C8` / `#6B4A0F` / `#E49A52`) |
| Content column | Centred. **720px** for content screens (Details, Before you begin, Consent, Review, Code of conduct, Sections, Section intro). **500px** for device steps (Camera, Mic, Screen sharing). Top padding 36px, bottom 140px (room for footer) |
| Sticky footer | Fixed bottom, white, 1px top border. Inner max-width 960px, padding 14px 24px, flex: `[Back]` · hint text (flex 1, right-aligned, 14px/600 muted) · `[Primary]`. Enter key triggers the primary when enabled |
| Page heading | h1 32px/600, letter-spacing −0.015em; subtitle 16px muted, ≤ 1 line where possible, 26px below |

### Design tokens

```css
--bg:#FFFFFF; --line:#DDE2EC; --line2:#C9D1E0;
--ink:#1F2A44; --ink2:#2B3A5C; --muted:#5B6579; --faint:#8D96A8;
--blue:#1F5EE6; --blue-s:#F1F6FE; --blue-m:#E6EEFD; --blue-b:#C2DAFF; --blue-t:#1943AA;
--green:#1E8A4F (solid success); --green-s:#E9F5E0;
--red:#8E2A36; --red-s:#F8E8E8; --red-b:#E0A3A8; danger button #C8323A;
--amber-s:#FFF5C8; --amber-b:#E49A52; --amber-t:#6B4A0F;
--dis:#E8ECF3; --dis-t:#98A2B5;   /* disabled button */
radius: card 10, button 8, pill 999, inner boxes 12
```

### Components
- **Button primary:** h44, radius 8, `#1F5EE6`, white 15px/700, padding 0 22px. Disabled: `#E8ECF3` / `#98A2B5`. **Busy:** blue + white spinner + label ("Checking…"). **Success:** solid green `#1E8A4F` + animated check + label, disabled. **Danger:** `#C8323A`.
- **Button secondary:** white, 1px `#C9D1E0`, ink text. Small variant h36, 13.5px.
- **Card:** white, 1px `#DDE2EC`, radius 10, padding 32 (list cards: `8px 28px`).
- **Row (the one list pattern):** `[22px blue line icon] [title 15.5px/700, fixed 200px column] [description 14.5px muted, fills] [optional right status]`, 20px vertical padding, 1px top divider between rows. ≤640px: title stacks over description.
- **Pill:** 12.5px/700, padding 5px 12px. ok = green-s/green, warn = amber-s/amber-t, bad = red-s/red, idle (checking) = blue-s/blue-t with spinner.
- **Fix box:** radius 12, padding 14px 16px, red-s bg + red-b border (or amber for warnings), ink text 14.5px. Permission errors include browser tabs ("Chrome / Edge", "Safari", "Firefox") and numbered steps.
- **Dialog:** 440px, radius 14, scrim `rgba(12,22,56,.45)`, title 18px/700, body 14px, actions right: text-button cancel (`#1A56DB`) + pill primary. Escape closes. Focus the cancel button on open.
- **Toast:** dark ink pill bottom-centre (above footer), 3s.
- **Device tracker** (Camera/Mic/Screen only, replaces the page heading): current step = pill (h48, radius 16, 1.5px `#5B6579` border, icon + label 16px/500); other steps = 46px outlined circles with icon; connectors = 2px lines that stretch. Completed steps & lines turn green `#1E8A4F`.

---

## 4. Screens (copy is final unless marked `[placeholder]`)

### 4.1 Details
- Card 1: **Full-Stack Developer Assessment** (26px/600) + 2 stat tiles: `6 Sections`, `3 hr 10 min Assessment duration` (icon in blue-soft circle).
- Card 2: **Confirm your details** — read-only label/value rows (not inputs): Full name `Isaac Newton`, Email `isaac.newton@topin.tech`. Then "Not you? **Log out**" → dialog "Log out?" / "You can sign in again with the correct account using the same assessment link." [Stay signed in] [Log out] → sign-in page.
- Footer: **Confirm and continue** (no Back). Disabled when offline.
- No greeting, no organisation line, no assessment icon (designer removed them).

### 4.2 Before you begin
- Title **Before you begin** · subtitle **Setup takes about 3 minutes and isn't timed.**
- One list card, rows in this order:
  1. **Internet** — "At least 2 Mbps." Right: status pill + ↓download ↑upload speeds **on one line** (row height must equal other rows).
  2. **Extensions** — "Blocked extensions must be turned off." Right: pill.
  3. Camera — "Stays on for the whole assessment."
  4. Microphone — "Audio is monitored."
  5. Screen sharing — "Share your entire screen. Use one screen only."
  6. Browser — "Google Chrome is recommended." (Edge: "You're using **Microsoft Edge**. Chrome is recommended. If anything fails, open this link in Chrome. **Copy link**")
  7. Group label **YOUR SPACE**, then Room — "Quiet and well lit, so your face is clear." · Apps — "Close other tabs and apps. Turn off notifications." · Power — "Plug in your charger, or fully charge."
- **On load both checks run (~1.5s micro-interaction):** pills show spinner "Checking…", speed numbers count up from 0, then the result pill pops in (scale 0.7→1). Footer disabled with hint "Checking your setup…" until done.
- Internet results: ≥2 Mbps & good → `✓ Excellent`; slow but ≥2 → `Slow` (amber) + "You can continue, but pages may load slowly." + **Check again**; <2 Mbps → `Too slow` (red) + "Improve your connection to continue." + **Check again** + red banner "Your internet is too slow for this assessment. Move closer to your router or switch networks, then check again."; offline → `Offline` + "Reconnect to continue."
- Extensions results: none → `✓ None found`; blocked → `⚠ Turn off 1` + "**Turn off Grammarly.** Open **chrome://extensions** and switch it off, or use an Incognito window. **Check again**".
- Footer: Back · **Continue**. Disabled when offline / too slow / blocked extension, with hints "Reconnect to continue." / "Your internet is too slow." / "Turn off the blocked extension to continue."
- Re-checks re-run the animation. Results are cached per (network, extension) state so going Back doesn't replay it.

### 4.3 Monitoring and Consent
- Title **Monitoring and Consent** · "We record these to keep the assessment fair."
- Rows: Camera — "To confirm it is you, and alone." · Audio — "To detect voices." · Screen — "To see what is open." · Activity — "Tab switches and device details."
- Footer: Back · **I agree and continue** (records consent; name chip appears in header from now on).

### 4.4 Camera (tracker: Camera current)
Card states:
| State | Content | Footer primary |
|---|---|---|
| Ask | "Allow camera access. A box will appear at the top-left of your browser. Choose **Allow while visiting the site**." + 2×2 examples (Too dark ✗, More than one person ✗, Face cut off ✗, Clear and well lit ✓) | `[camera] Allow camera` |
| Live · first time | 4:3 preview with dashed face guide + "● Camera on" tag. "Take your photo. We'll use it to verify you throughout the assessment." | **Take photo** |
| Live · returning | same preview. "Verify it's you. We'll match you to your earlier photo." | **Verify** |
| Verifying | preview | busy "Saving…" / "Verifying…" |
| Passed | preview | success "Looks good" → auto-advance after 1s |
| Too dark (amber) | darkened preview + "It's too dark. Face a light or a window." | Verify again / Take photo again |
| More than one person | "We can see more than one person. Only you should be in view." | same |
| Face cut off / no face | "We can't see your face. Make sure your complete face is visible in the frame and look at the screen." | same |
| Not matched (returning only) | "We couldn't match your face. Try again facing a light. (2 tries left)" — counts down from 3 | Verify again |
| Blocked | "Camera is blocked. Click the icon to the left of the web address, switch Camera to Allow, then reload. Your progress is saved." + browser tabs + steps (Chrome: "Click the camera icon at the right of the address bar." / "Choose Allow, then Done." / "Press Try again.") | Try again |
| In use | "Your camera is being used by another app. Close Zoom, Teams or any other app using it, then try again." | Try again |
| None | "We can't find a camera. Connect one, then try again." | Try again |
- Footer always: Back · primary. No page heading (tracker shows the name).
- Unplugged later → red banner "Your camera was disconnected. Reconnect it, then try again." and Camera fails on Review.

### 4.5 Microphone (tracker: Microphone current)
| State | Content | Primary |
|---|---|---|
| Ask | "Allow microphone access. Choose **Allow while visiting the site**." + note | `[mic] Allow microphone` |
| Ready | Quote box "Say:" / "“I am ready to begin the assessment.”" + note "Use your laptop's built-in microphone. Earphones and headsets aren't allowed." | `[mic] Record` |
| Recording | + animated 9-bar level meter driven by real input level | danger `[stop] Stop recording · 6s` (counts down, auto-stops) |
| Clear | "What we heard" box with transcript + Play/Stop + green tick | **Next** |
| No sound | "Nothing heard" (italic, faint) + "We can't hear you. Check that your built-in microphone is selected, then try again." | Record again |
| Noisy (amber) | partial transcript + Play + "Try again, not able to hear clearly." | Record again |
| Blocked | "Microphone is blocked. Click the icon to the left of the web address, switch Microphone to Allow, then reload." + tabs/steps | Try again |

### 4.6 Screen sharing (tracker: Screen sharing current)
- Steps: "1. Click **Share screen**. 2. In the Chrome box, choose **Entire screen**. 3. Select your screen and click **Share**." + static illustration of Chrome's picker with Entire Screen selected + caption "Example of what your browser shows" (illustration is not interactive — `pointer-events:none`, aria-hidden).
- Primary: **Share screen** → busy "Sharing…" → success "Screen shared" → auto-advance.
- Errors (fix box, primary **Share again**):
  - Cancelled: "You closed the sharing window. Click Share screen and choose Entire screen."
  - Tab: "You shared a Chrome tab. Share again and choose Entire screen."
  - Window: "You shared a window. Share again and choose Entire screen."
  - Mac permission: "Your Mac is blocking screen sharing. Open System Settings → Privacy & Security → Screen Recording, turn on Google Chrome, then reopen Chrome. Your progress is saved."
  - Extra display: "Second screen detected. Disconnect any extra monitor, TV or projector, including wireless or mirrored screens. This updates by itself." Primary busy "Waiting for one screen…" — auto-continues once only one display remains.
- Sharing stopped later → red banner "Sharing stopped. Share your screen again to continue. No penalty." and Screen sharing fails on Review.
- **No "click Hide" step.**

### 4.7 Review
- All passed: **Everything is set** · "All checks passed. You can go to your sections." Failing: **Almost there** · "Fix the items marked below to continue."
- Summary strip: progress ring (n/6) + "**6 of 6 checks passed**" / "Your device is ready." (green) — or red with "N items need your attention."
- One list card, rows: Internet connection (right: speeds) · Consent · Browser extensions · Camera ("Camera on · Identity confirmed") · Microphone ("Microphone working") · Screen sharing ("Entire screen shared"). **No tick on passed rows** (the summary already says it). Failed rows: right side `⚠ Needs attention` pill + **Fix** (goes to that step, returns here).
- Footer: Back · **Continue** (disabled while anything fails; hint becomes link "Go to the first item that needs attention").

### 4.8 Code of conduct
- **Code of conduct** · "Please read and agree before you start your first section."
- Card "Please follow these": No help — "From anyone, in the room or online." · No devices — "Phones, smartwatches, earphones or notes." · Stay in the assessment — "Do not switch tabs or leave the window." · Malpractice — "Ends your assessment and can bar you from future ones."
- Line with info icon: "Camera, screen and audio stay monitored during the assessment." (phone mode: "Tab switches and activity are monitored.")
- Checkbox "I agree to follow the code of conduct." Footer **Agree and continue** disabled until ticked, hint "Tick the box to continue."
- Shown once, before the first section (not repeated per section). Don't duplicate "Your space" items here.

### 4.9 Sections list
- Progress-aware heading (first name):
  - 0 done: "You're ready, Isaac." / "Take it one section at a time. Each timer starts only when you start that section."
  - middle: "Nice pace, Isaac." / "N sections to go. Keep the momentum."
  - last: "Last one, Isaac. Finish strong." / "One section to go. The hard part is behind you."
  - all: "All sections done." / "Great work. You can end the assessment now."
- Timer line: clock icon + "Total time **3:10:00**" (before any start) / "Time left **2:41:10**" (counts down once the first section starts).
- One card, one row per section: status circle (green ✓ done · blue number current · grey 🔒 locked), name, right: "20 questions · 30 min" or **"Submitted"** for done. Current row has blue-soft background. Locked rows are not clickable and have no fake buttons.
- Below: small **End assessment** (outline red) — disabled with note "End assessment unlocks after your first section." until ≥1 section done.
- Footer: Back · **Start {next section name}**. When all done: **End assessment**.
- If a check broke (camera unplugged / sharing stopped / offline): red fix box "**One thing needs attention.** Fix it on the review step before you start. **Go to review**" and Start disabled.

| Section | Questions | Time | Type | Correct | Wrong |
|---|---|---|---|---|---|
| Aptitude | 20 | 30 | Single choice | +1 mark for each correct answer | −0.25 marks for each wrong answer |
| Logical reasoning | 20 | 30 | Single choice | +1 | −0.25 |
| Verbal | 15 | 20 | Single choice | +1 | No negative marking |
| Programming basics | 15 | 20 | Single and multiple choice | +2 | −0.5 |
| Coding 1 | 1 | 45 | Write and run code | Up to +10 marks. Partial marks for test cases passed | No negative marking |
| Coding 2 | 1 | 45 | Write and run code | same | No negative marking |
(Data comes from the API in production.)

### 4.10 Section intro
- Title = section name · subtitle "20 questions · 30 min · Single choice".
- Card "How you score": Correct answer · Wrong answer · Unattempted — "0 marks. No penalty."
- Line: clock icon "Your timer starts when you press Start section. Camera, screen and audio stay monitored."
- Footer: Back (to Sections) · **Start section** → busy "Starting…" → Live.
- States: assessment not open yet → amber banner "This is only setup. Sections unlock at 10:00 AM." + disabled "Opens at 10:00 AM"; start failed → fix box "We couldn't start your section. Your timer has not started. **Try again** **Get help**"; a check broke → "**One thing needs attention.** **Fix it**" + disabled.

### 4.11 Live section (out of scope beyond the shell)
Bordered container: top bar (breadcrumb "Full-Stack Developer Assessment → Aptitude", status chips Camera / Screen shared / Mic in green), body (question + options), bottom bar (clock "29:41 · Time left · auto-submits at zero" + **End section**).
- **End section** → dialog "End Aptitude?" / "You can't return to this section. Unanswered questions get 0 marks." [Keep working] [End section] → back to Sections + toast "Aptitude submitted. Your answers are saved."
- One timer only (no duplicate chip).

### 4.12 End assessment
- Dialog "End assessment?" body: "N sections you haven't started will be submitted with no answers. You can't return." (or "All your sections are submitted. This finishes your assessment.") [Cancel] [End assessment] (red).
- Result screen (gate card): **Assessment submitted** · "N of 6 sections completed. You can close this window."

---

## 5. Help drawer (all screens)
Right drawer 440px, scrim, Escape/scrim/✕ closes, focus returns to Get help.
- "Common fixes for this step" accordions — device steps & Review: Camera not working · Microphone not working · Screen sharing issues · Slow or no internet (each 2–3 numbered steps, see prototype `FIX_ALL`). Other steps: The page will not load · Wrong browser · I need more time to get ready.
- "Contact us": `[Support channel]` + **Copy**; checkbox (on) "Include my device details so support can help faster."

## 6. Global events
- **Offline** anytime → red banner "You're offline. We'll pick up where you left off when you're back."; primary actions blocked with toast "You're offline. Reconnect to continue."; progress persists.
- **Camera unplugged / screen share ended** during setup or on Sections → banner + state reset for that check; Review/Sections block Start until fixed.
- Persist progress server-side so a reload resumes at the same step.

## 7. Gate screens (centred card, 640px, no footer)
| Case | Title | Body | Actions |
|---|---|---|---|
| Early | Your assessment opens today at `[10:00 AM]` | You can get your device ready now. The assessment itself can't start until then. + live countdown tiles (Days/Hours/Minutes/Seconds) | **Get my device ready** (enters setup; sections stay locked) · Add to calendar (.ics) |
| Late | The assessment is already open | You're 12 minutes late. `[Late-start policy]` | **Continue to setup** · Get help |
| Closed | This assessment has closed | The window to take Full-Stack Developer Assessment ended on 21 Oct, 11:59 PM. | Get help |
| Submitted | You've already submitted this assessment | Submitted on 20 Oct, 4:12 PM. It can't be taken again. | Get help |
| Invalid | This link isn't working | It may have expired or been copied incorrectly. Open the link from your latest invitation email, or ask for a new one. | Get help |
| Phone on proctored assessment | Please use a laptop or desktop | This assessment records your camera and entire screen, which phones and tablets can't share. | **Copy assessment link** · Get help |

---

## 8. Real implementation notes (prototype simulates these)

| Check | How to implement | Map to states |
|---|---|---|
| Internet | `navigator.onLine` + `online/offline` events; speed: time a download (~1–2 MB from CDN) and an upload (POST ~0.5 MB). Pass ≥ 2 Mbps; "Slow" amber band e.g. 2–5 Mbps; "Excellent" above | Excellent / Slow / Too slow / Offline |
| Extensions | Browsers don't expose installed extensions. Detect known offenders by DOM/attribute signatures (e.g. Grammarly injects `grammarly-*` elements/attributes), or via your proctoring extension/SEB. Name the extension found | None found / Turn off {name} |
| Browser | UA Client Hints (`navigator.userAgentData.brands`) → Chrome vs Edge vs other | Chrome / Edge note |
| Camera | `getUserMedia({video:true})`. `NotAllowedError`→Blocked, `NotReadableError`→In use, `NotFoundError`/`OverconstrainedError`→None. `track.onended`→Unplugged. On-device face detection (e.g. MediaPipe) for dark (mean luminance), multi (faces>1), cut/no face (bbox outside guide). Photo capture + identity match server-side (returning users have a stored photo; first-timers enrol) | Ask/Live/Verifying/Passed/errors, 3 match tries |
| Microphone | `getUserMedia({audio:true})`; level meter via `AudioContext` + `AnalyserNode`; record 6s with `MediaRecorder` (playback = Play); speech-to-text compare to the phrase. Silent = RMS below threshold; noisy = low confidence / mismatch | Clear / No sound / Noisy / Blocked |
| Screen | `getDisplayMedia({video:{displaySurface:'monitor'}, surfaceSwitching:'exclude', selfBrowserSurface:'exclude'})`. Check `track.getSettings().displaySurface==='monitor'` else Tab/Window error. `NotAllowedError` on cancel → Cancelled. macOS permission failure → Mac message (verify in QA how it surfaces). `track.onended` → Sharing stopped. Extra displays: `window.screen.isExtended` (Window Management API) — poll until false | Shared / Tab / Window / Cancelled / Mac / Extra screen / Stopped |
| Fullscreen (phone) | `element.requestFullscreen()` on Start | — |
| Timers | Server-authoritative. Assessment timer starts with the first section; section timer starts on Start section; auto-submit at zero | — |

---

## 9. Accessibility & keyboard
- Every screen focuses its h1 (or tracker) on load; device steps announce state changes (`role="status"` on fix boxes / results).
- Enter = primary action when enabled (not when focus is on another button/link/select, not when a dialog/drawer is open).
- Dialogs/drawer: focus moved inside, Escape closes, focus restored.
- Progress bar has `role="progressbar"` with step text; timers `role="timer"`.
- Contrast: muted text `#5B6579` on white passes AA; don't go lighter than `#8D96A8` for anything informative.
- Respect `prefers-reduced-motion` (no spinners/count-up/pops — show final state).
- Touch targets ≥ 36px; phone layout: 16px gutters, footer buttons full-width, row titles stack over descriptions.

## 10. Placeholders to replace with real data/policy
`[Organisation]` (removed from UI for now), `[10:00 AM]` open time, `[Late-start policy]`, `[Support channel]`, assessment name/duration/sections, candidate name/email, dates on Closed/Submitted gates.

## 11. Not in this build / future
- Multiple sessions open at once (v2).
- Background/periodic speed test (future).
- The prototype's **"Prototype controls"** panel (bottom-left) is a testing tool only — **do not ship it**. Use it to see every state while building.

## 12. Acceptance checklist
- [ ] Every state in §4–§7 is reachable and matches the prototype.
- [ ] Primary action only in the sticky footer; Back on the left; Enter works.
- [ ] No hover styles anywhere; no dead buttons/links.
- [ ] Rows use the single row pattern; Internet row same height as the others.
- [ ] Extensions is checked on Before you begin (no separate page).
- [ ] Device steps show the tracker instead of a heading; camera icon used.
- [ ] Review shows no ticks on passed rows; Fix returns to Review.
- [ ] Code of conduct appears once, before Sections.
- [ ] End assessment disabled until a section is submitted; End section asks for confirmation.
- [ ] Copy uses "assessment" everywhere.
- [ ] Offline / unplugged / sharing-stopped banners work from any step.
- [ ] Reduced-motion and keyboard-only pass.
