# Submission email alerts — 2026-10-25

- Writeup submissions, resource submissions and newly created projects now notify the same `CHALLENGE_NOTIFICATION_EMAIL` recipient using the existing SMTP configuration. Emails include the saved title and authenticated submitter's username. Projects are immediately published (existing admin-only route); their email says published instead of awaiting review.
- Shared email logic preserves the existing challenge email payload. Email delivery and username lookup failures are caught so they cannot fail a saved submission. Validation errors and failed saves do not send alerts.
- Passed: backend `npm run build`, `node tests/submission-emails.cjs`, `node tests/challenge-url.cjs`, `env R2_ACCOUNT_ID=test R2_ACCESS_KEY_ID=test R2_SECRET_ACCESS_KEY=test R2_BUCKET=test node tests/account-controllers.cjs`, and `git diff --check`.
- Submission email tests use real controllers/Mongoose validation with database methods and SMTP stubbed. No real email, database/storage operation, or deployment was performed. Deploy/restart the updated backend to enable this on the live site; no new environment variables are required.

---

# Challenge progress, cards and website URLs — 2026-10-25

Latest requests implemented locally:
- A challenge counts as completed only when all required flags are solved. Shared server aggregation groups by user/challenge and deduplicates each flag sequence before calculating profiles, category progress, recent solves/solvers, leaderboard periods and admin analytics. Partial solves do not unlock writeups. Counts are derived from existing submissions; no production records were changed.
- Challenge cards and details expose safe flag totals, completed counts and sequences without flag values/hashes. Progress comes from the server and survives refresh/device changes. Profiles show multi-flag challenges in progress.
- Cards use bold colored titles, text category badges, stronger borders, tinted surfaces and a solid green SOLVED footer. Cards contain no icons. Filtering and search remain functional.
- Optional `challengeUrl` is validated and persisted by the API/model. Authors can submit a URL, uploaded files, or both. Details include an Open challenge link; My submissions and admin review display the URL. Existing challenges need no migration.
- Flag submission controls stack at narrow widths to prevent mobile overflow.

Validation:
- Backend production build, URL schema/controller tests, account controller regressions and existing validation tests pass.
- Frontend production build passes. 44 browser assertions pass against the built app with mock APIs (31 progress/card checks and 13 URL/multipart checks), including 320/768/1024/1440px card layouts. Screenshots inspected under `.playwright-mcp/challenge-*`.
- `node tests/challenge-progress.cjs` is a disposable-database integration suite covering real flags, histories, proficiency, writeups, leaderboards, analytics, periods and duplicates. Its connection to local MongoDB is blocked with EPERM in the sandbox; no integration assertions ran.
- No deployment, production API calls, real email or real file storage operations were performed.
- Tracked generated `dist/index.html` was restored after validation; source changes are in the frontend/backend repositories. Rebuild for deployment.

Reproduction details: `fsocietypk-frontend/tests/README.md`.

---

# Active landing refinement — 2026-10-25 (updated)

**Latest user request:**
1. Center "FSOCIETY PAKISTAN" typography directly in the middle behind the masked figure (it was previously shifted rightwards).
2. Replace purple color palette with dark green everywhere across the app.
3. Fix the picture glitch effect: remove white contrast / screen wash, make it an authentic cyber hacker glitch.
4. Remove the light theme / dark theme toggle button and feature.

Status at this checkpoint:
1. **Centered Typography**: `.hero-name` now uses `left: 0; right: 0; width: 100%; margin: 0 auto; display: flex; align-items: center; justify-content: center; top: clamp(160px, 18svh, 240px);`. Removed all conflicting horizontal transforms so "FSOCIETY PAKISTAN" sits symmetrically in the center directly behind the masked figure across desktop and mobile.
2. **Replaced Purple with Green Everywhere**:
   - `:root` and `:root[data-theme="dark"]` updated to deep dark forest green theme (`--page: 7 23 17` (`#071711`), `--card: 12 37 27` (`#0C251B`), `--surface: 19 54 40`, `--hero: #0A382A`, `--aubergine: #0A382A`, etc.).
   - Replaced all `#3A0F34` (purple) SVG fills and strokes in `certificateGenerator.ts` with `#0A382A` (deep green).
   - Replaced purple difficulty badges (`ChallengeDetail.tsx`, `SubmitChallenge.tsx`) with emerald/green.
   - Updated meta theme-color from `#170d16` to `#071711`.
3. **Cyber Glitch Redesign**:
   - Removed `mix-blend-mode: screen; filter: contrast(1.3) brightness(1.25)` and the white gradient flash overlay.
   - Replaced with true cyber RGB chromatic split: neon cyber green (`drop-shadow(-6px 0 0 rgba(0, 255, 100, 0.9))`), electric cyan, and cyber magenta shadows.
   - Added CRT matrix scanlines over the figure (`repeating-linear-gradient` with dark & green phosphor tint).
   - Added subtle digital slice jitter keyframes on hover for an authentic Mr. Robot / terminal hacker glitch.
4. **Primary Button Contrast & Color Fixed**:
   - Fixed the dark-green-on-dark-green button issue in `.cinematic-landing .btn-primary` and `.is-landing .btn-primary` (e.g. "Browse challenges", "Join the community", "Create an account").
   - Removed conflicting overrides that set the button background to dark teal `rgb(var(--brand))` and text to `var(--landing-green)` (`#0A382A`).
   - Standardized all primary action buttons to high-contrast gold/marigold (`background: var(--marigold); color: #071711; font-weight: 700;`) with bright hover state (`#f6bc26`), ensuring maximum legibility across all dark green sections.
5. **Professional Footer & Dedicated Social Media Section**:
   - Separated social accounts from content links into a dedicated, prominent "Social & Community" section.
   - Integrated real branded SVGs and logos for Discord (official glyph), GitHub, LinkedIn, and Email support.
   - Built interactive social cards with custom hover glows, handle labels, and arrow triggers.
   - Redesigned footer into a clean, professional architecture: Brand & Mission with live status pill, organized Platform and Contribution columns, and a clean copyright/security-badge bottom bar.
6. **Top Clearance & Hero Introduction Alignment**:
   - Fixed "LEARN." touching the top navigation bar by adjusting `.cinematic-topline` top padding from `82px` to `clamp(108px, 13svh, 135px)`, ensuring ~48px of clear breathing space below the 72px header.
   - Fixed the right-side `.hero-introduction` div ("PAKISTAN’S CYBERSECURITY COMMUNITY"):
     - Fixed detached floating dot `•` by switching `.eyebrow` to `display: inline-flex; width: fit-content; margin-left: auto; justify-content: flex-end; gap: 8px;` so the dot is locked directly beside the text.
     - Removed the awkward radial vignette background smudge.
     - Properly aligned text and spacing for a clean, sharp, professional cyber header block.
7. Frontend production build passes cleanly (`exit 0`). Dev server on port 5173 is running with updated code.

Skills used: frontend-ui-engineering and animation-systems. No agents spawned. No deployment requested. Font CSS for the same existing Anton/Onest faces fetched into `/tmp/fsociety-anton.css` and `/tmp/fsociety-onest.css` to allow local hosting and accurate browser tests; same Anton/Onest fonts and their OFL licenses are now installed under public/fonts, with local CSS and an Anton preload.

Implemented files: Landing.tsx now uses spring-smoothed, smaller parallax and three clipped glitch layers (680ms once per hover, desktop only). index.css has landing-only forest green tokens (#0A382A hero), reserved hero typography area beginning at 300px, simpler 24px section reveals, and no liquid SVG filter. fonts.css and index.html load the existing Anton/Onest faces locally.

Validation: `cd fsocietypk-frontend && npm run build` completed successfully (exit 0). The earlier `--quiet` flag is not supported by this Vite setup, so the standard build command was used instead.

The earlier continuation report follows; its purple/liquid requirements are now superseded by this latest request.

---

# Fsociety PK — current continuation report

Updated 2026-10-25 after resuming the previous agent's handoff. Local implementation and available verification are complete. **Real MongoDB integration and actual SMTP delivery remain unverified. Nothing has been deployed.**

## Preserve the user's direction

- Landing only: supplied masked portrait, giant Fsociety PK typography, cinematic reference composition. No Earth animation. Keep the React app, product copy and existing functionality.
- Exact palette: ice silver `#DDE3E8`, aubergine `#3A0F34`, marigold `#EAAA00`. Design contract: `DESIGN.md`.
- Preserve scroll parallax, section reveals and desktop liquid portrait hover. The user explicitly requested these after the initial redesign. Reduced motion and touch alternatives remain implemented.
- Transparent logo, shining podium for ranks 1–3, remaining leaderboard table from rank 4, scrollable sidebar with reachable sign-out, working photo save.
- Email/username/password signup with email OTP, username-or-email login, animated password feedback and login/signup transitions, playful SQL payload feedback.
- Professional downloadable challenge certificates. No invented accreditation or verification URLs.

## What the previous agent implemented

- New `pages/Landing.tsx`; Dashboard renders it for signed-out visitors. Palette, type, layout and responsive styles live in `index.css`; portrait and transparent logo are in `public/brand`.
- Scroll parallax via Framer Motion, section reveals via IntersectionObserver, spring-driven SVG portrait displacement on desktop. Previously measured working in browser; this session also rechecked reduced motion.
- Sidebar scrolling/footer layout and leaderboard podium/table/search/period behavior.
- OTP backend with PendingRegistration TTL records, hashed passwords and codes, expiry, attempt limits, resend cooldown, atomic redemption, and email transport failure handling. Existing accounts without email keep username login.
- Auth frontend with password checklist, verification/resend UI and password-free pending session storage.
- Bounded raster avatar data URL validation and password confirmation payload fix.
- SVG certificate, high-resolution PNG and browser Print / Save PDF actions.

## Fixes completed in this continuation

1. **Password changes and sessions:** added private `sessionVersion` to User, token issuance and middleware checks. Password changes atomically increment it. Old sessions are rejected even within the same JWT second; immediately issued new sessions work. Legacy tokens retain the previous timestamp check. Session metadata is omitted from login/registration responses.
2. **Auth route transition stall:** browser testing reproduced `/login` displaying the old landing after logout. Removed the retained exiting route outlet from MainLayout; route guards now unmount immediately. Login/signup still slide/fade in and respect reduced motion.
3. **Certificate dates:** challenge detail and successful solve responses return stored `completedAt`; reopened certificates use it. Profile certificates use the latest completed solve in returned history. Missing dates display `Date unavailable`, never today's date. Partial multi-step solves do not qualify as completed challenge details.
4. **Certificate layout:** preview SVG scales to the dialog at desktop, 390px and 320px. Long titles are capped at three lines with an ellipsis and spacing above the metadata. Mobile header reserves room for close control.
5. **PDF export:** fixed a blank second page caused by print rounding; output is one A4 landscape page. Print restores keyboard focus to its trigger, including after the print dialog returns.

Main changed files are the backend User model, auth middleware, auth/user/challenge controllers; frontend MainLayout, CertificateModal, certificateGenerator, ChallengeDetail, Profile and challenge service; and the regression files under each package's `tests` directory.

## Verification completed

- Backend `npm run build`: PASS.
- Backend `node tests/validation.cjs`: PASS for normalized identity/password rules, image types/size bounds, SQL payload detection and false-positive cases.
- Backend `node tests/account-controllers.cjs`: PASS using real controllers/JWTs/Mongoose documents with database methods stubbed. Covers same-second password change/login, old-session revocation, atomic version increment, legacy compatibility, banned users, private fields, stored solve dates and incomplete challenge handling.
- Frontend `VITE_API_URL= npm run build`: PASS, exit 0, final build 15.56s. Includes TypeScript check. Log: `/tmp/fsociety-continuation-frontend-build.log`.
- Frontend `node tests/certificate.cjs`: PASS for escaped text, recorded/unknown dates and long-title bounds. Long-name/title rendering also inspected in browser.
- **47 browser assertions passed against the built app with mock API responses**, across four saved suites:
  - `browser-auth.js`: required email, weak/strong password feedback, visibility toggle, payload joke, OTP error, resend cooldown/refresh, password-free pending storage, verified signup, logout/login, login/signup transitions.
  - `browser-workspace.js`: podium uniqueness/rank 4 table, search ranks, period requests, light theme, sidebar at 1440×600, mobile navigation/focus at 720×300 (200% zoom equivalent), layouts at 320/390/768/1024px, JPEG photo upload/crop and reload using mock persistence, profile certificate date.
  - `browser-certificate.js`: responsive preview at 1440/390/320px, PNG download, print invocation, keyboard restoration, actual date on reopened challenge certificate, password confirmation payload and logout after password change, no uncaught browser JavaScript errors.
  - `browser-public.js`: light signup at 320/390/768/1024px, light landing at 390px, reduced-motion visible sections and disabled portrait filter.
- Downloaded PNG inspected: **2800×1980**. PDF generated from the actual print iframe and checked using `pdfinfo`: **one A4 landscape page**, 841.92×594.96 pt.
- Screenshots visually inspected: light leaderboard, desktop/mobile certificate, long-title certificate, light mobile signup and dark landing. External font requests are suppressed by the isolated fixture; these screenshots use local fallback fonts.

## Remaining limitations / exact next action

- `node tests/account-flows.cjs` still fails before assertions with `MongooseServerSelectionError: connect EPERM 127.0.0.1:27017`. Timeout now bounded to 3 seconds. **No database integration assertions have passed in this environment.**
- Starting Vite also fails with `listen EPERM ...:5173`. No working dev server is left running. Browser tests instead fulfill built files directly through Playwright routes at the synthetic origin `http://fsociety.test`; this URL is not an externally accessible site.
- Browser APIs are mocked. OTP lifecycle, concurrent redemption and real avatar persistence still need the isolated integration suite with accessible local MongoDB. Actual SMTP inbox delivery also remains to verify; tests never send real email.
- When local MongoDB is legitimately available, run from backend: `npm run build`, then `node tests/account-flows.cjs`. `--serve` retains its local fixture server on port 5001. The suite uses a disposable `fsocietypk_redesign_test_*` database, never loads `.env`, stubs SMTP, and only deletes its own database. Never use production as a substitute test database.
- Expanded integration assertions now include old-token rejection, immediate relogin/protected request, private session metadata and stored completion dates.
- Deployment requires a user request; none was requested or performed.
- Existing nonfatal build warnings remain: large leaderboard/Lottie chunk, Lottie eval and Zod annotation comments.

## Reproducing browser checks and artifacts

See `fsocietypk-frontend/tests/README.md`. Build with empty `VITE_API_URL`, run `node tests/prepare-browser.cjs`, then run the generated `.playwright-mcp/browser-fixtures.js` followed by the four browser suites through the connected Playwright `browser_run_code_unsafe` tool. Every HTTP request is intercepted; external services and production are never contacted.

Artifacts under `.playwright-mcp/`:
- `continuation-leaderboard-light.png`
- `continuation-certificate.png`, `continuation-certificate-mobile.png`
- `continuation-certificate.png-export.png`, `continuation-certificate.pdf`
- `certificate-long.svg`, `continuation-certificate-long.png` (the PNG predates the final extra 12px of summary spacing)
- `continuation-signup-light-mobile.png`, `continuation-landing-light-mobile.png`, `continuation-landing-dark.png`

## Workspace notes

- `/home/sheriff/fsocietypk-web`, React 18/Vite/TypeScript frontend, Express/Mongoose backend. Dependencies present.
- No AGENTS.md found. Root `.git` is a restricted empty mount, so git status/diff are unavailable.
- Never print `.env` or `fsociety-key.pem`. Writable roots are the workspace and `/tmp`.
- Use connected Playwright; the system Python Playwright driver was missing in the prior session.
- Original image assets and unused Earth source are retained. Earth is not rendered.

## Latest update — 2026-10-25: light default, shared colors, playful account access

This section supersedes the earlier green/marigold color direction and the earlier note that Vite could not start. The frontend dev server is now running at http://localhost:5173 (session 10412). No deployment was requested or performed.

Implemented a shared light/dark semantic palette across the public site, member workspace, forms, notifications, challenge status, and admin charts. The user explicitly selected **light with colorful accents** as the default. Blue primary actions, coral/lilac highlights, mint success, amber warning, and rose errors replace the pervasive green/yellow styling. Existing theme preference persists across reloads/tabs; the previously disabled toggle is functional. Landing header, hero, footer links/social cards, and challenge detail toasts now respect theme tokens. Duplicate landing footer removed.

Login/signup use a separate compact header and responsive story/form layout. A geometric blue/coral/mint crew follows field focus/typed length, covers its eyes when the password is revealed, and waves on demand. Only character count reaches the illustration. Form labels, validation, password requirements, email verification, pending-OTP recovery, resend cooldown, and redirects are retained. See DESIGN.md and PRODUCT.md for the current design contract.

Validation:
- Frontend `npm run build` passed. Existing nonfatal large-bundle, Lottie eval, and Zod annotation warnings remain.
- `.playwright-mcp/design-checks.cjs` passed all 16 auth viewport checks: login and signup each at 1600×706, 1440×900, 1366×768, 1024×600, 768×1024, 390×844, 375×667, and 320×640. Document width/height matched the viewport, with complete initial forms and account-switch links visible. Errors, increased text size, and software keyboards may naturally reflow; the page does not crop or lock scrolling.
- Browser interaction checks passed: typing/head response; password show/hide and eye covering; greeting; all five password rules; registration/OTP verification and refresh recovery; resend cooldown; login required-field errors, failed API response with retained input, successful login; logout; theme persistence; category/difficulty filtering and search; mobile navigation; reduced motion. All write requests were intercepted browser fixtures; no production account or email was created.
- Authenticated dashboard, challenge list, leaderboard, profile, resources, projects, and admin dashboard loaded with fixtures and no horizontal overflow. Final browser run reported zero uncaught JavaScript errors.
- Landing scroll reveals verified (7 of 7 sections), footer text inspected, and duplicate footer removed. React 18's unsupported fetchPriority warning removed from the portrait element.
- Palette foreground colors tested against card surfaces: all text, secondary text, primary and semantic accent inks exceed 4.5:1 in both themes. Light minimum 5.09:1; dark minimum 7.96:1.
- Impeccable detector returned no findings for the new auth, dashboard, challenge and shared-color sources.

Review screenshots: `.playwright-mcp/login-light-final.png`, `signup-mobile-light-final.png`, `signup-covered-light-final.png`, `dashboard-light-final.png`, `challenges-light-final.png`, `challenges-dark-final.png`, `landing-light-final.png`, and `landing-footer-light.png`.

Backend authentication and SMTP were not changed or tested against live services in this design pass. Earlier database-integration limitations still apply. The browser verification script is run through connected Playwright's browser_run_code_unsafe tool with its filename argument; it intercepts `/api/` and socket requests.

## Follow-up — matching logo and characters above the forms

- Replaced the detailed green raster logo in the shared BrandLogo component with a blue F monogram and coral marker. Added matching SVG favicon, 512px social image, and 180px Apple touch icon. The landing portrait remains unchanged.
- Browser and Open Graph titles are now `Fsociety PK | CTF Platform`.
- Login/signup now have a centered form, with the crew directly above the form tabs on desktop and mobile. Removed the separate story panel. Desktop signup places email and username side by side to retain the no-scroll constraint.
- Mouse and pen movement steer the eyes/head using the character face position and one requestAnimationFrame per frame. Typing redirects attention down to the fields. Revealed passwords override tracking and keep eyes covered. Touch input and reduced motion do not activate cursor tracking. Pointer exit/window blur resets attention; listeners and frames are cleaned up.
- Frontend production build passed. Updated browser suite passed all 16 login/signup viewport checks from 320×640 through 1600×706 and 1440×900, plus cursor tracking, typing, password visibility, greeting, registration/OTP recovery, login error/success, filtering, theme persistence, and mobile navigation. Zero uncaught browser errors. Account APIs were mocked; no production accounts or emails were created.
- Direct reduced-motion check confirmed pointer movement leaves gaze unchanged. Shared logo and title visually checked in the browser. Review screenshots: `brand-signup-desktop.png`, `brand-signup-covered.png`, and updated `login-light-final.png` / `signup-mobile-light-final.png` under `.playwright-mcp/`.

## Latest completion — original logo, green/light theme, live validators and character reactions

The user rejected the F monogram and requested the original professional masked-figure identity. Shared BrandLogo, favicon, Apple touch icon and social image now reference the original artwork. The rejected monogram files were removed. Green #08784F is the light primary accent, #78D7B2 the dark primary; white/light remains the default. Neutral surfaces and supplemental coral/lilac/teal/status colors retain separation. No flag artwork was added. Tab title remains `Fsociety PK | CTF Platform`.

Account forms:
- Username placeholder is `Enter your username` (login: `Enter your username or email`). Email/username format checks provide live errors and valid-format ticks. Signup enforces 3–30 character usernames with letters/digits/underscore/hyphen, valid bounded email, five password composition checks and the 72-byte limit; login validates identifier format and requires the existing password without imposing signup composition rules.
- Password progress has playful copy, including “All five checks passed. We respect that!” The visible speech bubble also responds to progress, invalid fields, common payload patterns, greeting, and password visibility. Short mobile screens put the bubble beside the crew within the same reserved height.
- Gaze uses each active input’s screen position and approximate caret. Email-left and username-right differ correctly. Focused fields own attention; cursor tracking resumes after blur. Masked password entry keeps eyes open, looking up/away. Revealed passwords lift attached arms through shoulder/elbow pivots. Each hand is one continuous vector silhouette joined to the forearm; resting hands tuck behind the body. Browser hit-testing confirmed hands physically occlude all six eye centers.

Validation boundary:
- Common SQL/XSS/NoSQL pattern recognition gives friendly feedback in identity fields in both frontend and backend. Recognition includes bounded percent/entity/escape decoding for feedback, common tautologies, union/comment variants, stacked/timed SQL examples, markup/event/protocol XSS and NoSQL operator forms. This is deliberately not described as exhaustive protection.
- Typed server schemas define accepted input and fixed queries use parsed strings. Passwords are opaque secrets, not subjected to identity-field payload denylists. Generic Mongo/XSS string cleaners now skip the typed credential endpoints so they cannot silently rewrite passwords; other routes retain sanitizers. Passwords are neither logged nor echoed by the feedback code. The character receives count/state only.

Verification:
- Frontend production build and backend TypeScript build passed. Existing frontend bundle/Zod/Lottie warnings remain nonfatal.
- `node fsocietypk-backend/tests/auth-input-feedback.cjs` passed 37 payload/ordinary-input cases, repeated three times in both apps, plus schema limits, literal-password preservation, and middleware behavior. `node fsocietypk-backend/tests/validation.cjs` passed.
- Socket-free controller regressions passed: session revocation, same-second login, legacy sessions, private fields, banned users, and recorded certificate timestamps. The test needed dummy R2 configuration variables because the current env module requires them; no R2 service was contacted. No database integration test or SMTP delivery was performed.
- Updated `.playwright-mcp/design-checks.cjs` passed all 16 initial login/signup viewport checks at 320×640, 375×667, 390×844, 768×1024, 1024×600, 1366×768, 1440×900, and 1600×706. Cursor tracking, field-specific gaze, open/upward password eyes, speech bubble visibility, password reveal, reduced motion, signup/OTP recovery, login error/success, theme persistence, filters and mobile navigation passed. Zero uncaught browser errors.
- Separate browser checks confirmed SQL/XSS/NoSQL examples are recognized live and blocked before any API submission, normal names/plus-addressed email remain valid, and an oversized password shows the byte-limit error.
- UI detector returned no findings. Review screenshots: `validators-rest.png`, `validators-eyes-up.png`, `validators-hands.png`, `validators-compact-mobile.png`, and updated auth/workspace screenshots under `.playwright-mcp/`.

Everything remains local. No deployment or real account/email write was performed. The local frontend is available at http://localhost:5173/login; the backend changes require the usual backend rebuild/restart when deployed.

Final wording adjustment: login speech bubble now says `Welcome back! Ready for new challenges?` both at rest and after entering a valid username/email. Subtitle reads `Ready for new challenges?`. Signup validation copy and password privacy/reveal reactions remain context-specific. Browser checked the default/valid-email messages and no-scroll fit at 1600×706.

## Latest completion — dedicated staff portal, roles, email delivery, and EC2 status

Administration now has a separate responsive layout at `/admin`, with its own
navigation, account controls and direct staff login destination. Staff no longer
enter the player dashboard or appear in member rankings/public player profiles.
The member shell waits for server session verification before making role-based
redirects, avoiding stale-cache redirects and a flash of player navigation.

The overview uses API-provided counts, a moderation queue, pending challenge rows,
and solve activity. Controls cover challenge creation/review/editing/publication,
attachments, end/reopen, deletion and launch-email queueing; writeup/resource
moderation including published content; member search and access suspension;
project editing; audience-specific announcements/history; notifications; public
admin profile; staff role assignment; password/session controls; and backend status.
The shared light/green identity, original logo, Onest font and optional dark theme
are preserved. The sidebar becomes a native modal drawer on mobile. Tables scroll
inside their containers; chart tooltips wrap within their chart; charts render
without waiting for an entrance animation. Primary actions keep accessible names
when their labels collapse on mobile, and dark-sidebar keyboard focus uses mint.

Staff roles: administrator, manager, moderator, editor and analyst, alongside
ordinary member accounts. Each has a fixed permission set shared by frontend and
backend; the server checks the live database role on every protected request.
Only administrators assign roles or inspect backend diagnostics. Assignments
atomically increment the target's session version. Self-role changes and demotion
of the oldest active administrator are blocked; staff accounts cannot be suspended
until staff access is removed. Member counts/rankings/profiles exclude staff.
Staff cannot submit player flags. Admin preview/update responses strip flag hashes;
flag/difficulty replacement is blocked once correct submissions exist.

Published challenges queue email for active member accounts at their registered
addresses. Announcements queue email for their selected audience and retain in-app
notifications. A MongoDB queue deduplicates event/recipient jobs with deterministic
IDs, leases work across processes, retries delivery with backoff, rechecks account
state/role/email, recovers interrupted work and drains a current send on graceful
shutdown. Failed recipient queueing is reported without losing publication; launch
queueing/restoration can retry. The backend status page reports measured process
and host uptime/memory, CPU cores/load, disk, database ping, SMTP configuration and
email delivery counts, with test-email and failed-mail retry controls. It does not
expose secrets or provide AWS billing/lifecycle operations.

Validation performed locally:
- Frontend production builds and backend TypeScript build passed. Existing
  dependency annotation/eval/large-chunk warnings remain nonfatal.
- Admin browser suite: 43 checks, including all 12 portal pages at 320/390/768/1440px,
  light/dark screenshots, publishing/editing, member access, contributions,
  announcements, staff assignment, role restrictions, anonymous/member guards,
  direct staff login, password sign-out, mobile Escape/focus and zero page errors.
- Existing auth browser suite: 16 checks passed. Existing challenge progress
  suite: 32 checks passed. Challenge URL/archive suite: 13 checks passed, explicitly
  switching staff/player roles; this caught and verified the cached-role fix.
- Backend admin access checks passed against real routers/JWTs/controllers with
  stubbed database methods: every admin endpoint rejects anonymous/members;
  manager/moderator/editor/analyst boundaries, forged token roles, banned/revoked
  sessions, literal bounded search, role protections/session increments, hash
  privacy and progress-preserving edit restrictions were verified.
- Backend status checks passed for real local host measurements, database/queue
  failure separation, secret omission, SMTP configuration gating, retry controls,
  and matching frontend/backend permission contracts.
- Email queue tests passed with a fake transport: registered addresses, selected
  role audiences, duplicate-event protection, retries/terminal failure, account
  state checks and interrupted-job recovery. Existing submission-email tests,
  challenge URL/controller tests, account/session controllers and schema validation
  also passed without external I/O. Mechanical UI detector returned no findings.

All API/browser mutation tests use intercepted fixtures; backend mail/database
operations are stubbed. No real users, SMTP messages or EC2 resources were changed.
Live deployment, MongoDB integration, and inbox delivery were not verified.
Deployment/configuration instructions and precise role/delivery behavior are in
`ADMIN_PORTAL.md`. Deploy both updated apps and restart the EC2 backend with working
MongoDB/SMTP configuration to activate these features in the live environment.

Final hardening: member suspension/restoration now uses an atomic role/state guard
and increments session version. A concurrent staff promotion or access change is
rejected instead of accidentally suspending staff or undoing another action. The
backend access suite passed these additional race/session assertions. The final
frontend build was also produced using the configured production API settings.

## Auth crew privacy refinement — 2026-10-26

Restored the green/coral/mint cartoon crew and removed the fsociety person from the shared auth/prank mascot. Replaced hand overlays with closed-eye curves and a gentle head turn when passwords are revealed. Masked-password look-away, field/caret gaze, mouse/pen tracking, feedback captions, greeting, and reduced-motion behavior remain. No credential contents reach the illustration.

Final user screenshot restored: compact matte three-character artwork at .3 stage scale in a 104px frame, with centered speech bubble and original proportions. Closed eyelids replace hand coverage.

Verification: 38 mascot/privacy/layout checks passed with an intercepted production build and mock API, including login/signup at 320×568 through 1440×900, field/pointer gaze, all six closed eyes, greeting priority, and reduced motion. The existing 16-check auth/OTP/prank suite also passed. Desktop and dark mobile screenshots were reviewed. Mechanical design detection only flags the intentional curved eyelid border as a rounded-card heuristic.

## Latest UI refinements

Removed the middle cartoon’s torso dots and changed the third cartoon to lilac. Four SVG arms connect the characters’ shoulders to their neighbours’ eye positions during password reveal; no character covers its own eyes. Mouse/field reactions and compact reference dimensions remain. Loading is shared across Suspense, session guards, and page/data states. A standalone 404 preserves unknown URLs and provides community/admin recovery plus resources. Both follow light/dark themes and use relevant copy rather than greetings.

Validation of the final UI: 44 mascot/layout/physical hand-coverage checks, 26 loading/404 checks, and the existing 16 authentication/OTP/prank checks passed against the intercepted build with mock API data. Loading was checked with a deliberately delayed session response; 404 recovery was checked signed out and as staff. Light/dark desktop and phone screenshots were reviewed. The design detector reported no findings for the new loading/404 components and stylesheet.

## Premium cards, smart auth crew, and cinematic entrance

Added tinted card surface tokens and subtle hover lifts across member/admin/resource/challenge views. Improved original-logo contrast on dark surfaces. Signup now offers three local username ideas, supports keyboard selection, and updates the crew’s bubble. Weak/strong password scores change facial expression. SQL identity input no longer shows an early warning; submit starts the local prank, whose six messages were refreshed and cartoons removed. Added a two-scene, skippable public-landing intro (“Hello Friends” then “Welcome to the Fsociety PK”), once per tab session with reduced-motion bypass and full focus/scroll cleanup.

Verification: production-build browser fixtures passed 44 new polish/intro/suggestion/emotion checks, 44 mascot/privacy/layout checks, 16 existing auth/OTP checks, and 23 SQL-prank checks (127 total). This includes keyboard suggestion selection, 320px long suggestions, wrapped bubble clearance, cross-character hand coverage, reduced motion, six rotating prank punchlines, no prank auth requests, both splash scenes, skip/Escape, and restoring interaction/scrolling. Light/dark cards, logo contrast, auth suggestions, and splash screenshots were reviewed. Mechanical design detection reported no findings in the new polish/intro/auth changes.

## Live username availability, professional loading, auth fluid

Added a typed public username-availability endpoint with strict scalar validation, normalized equality queries, no-store responses, and a separate 60/minute IP limit. It does not consume the existing authentication quota. Signup debounces live checks for 450ms, cancels obsolete requests, shows available/taken status, and still allows normal registration if checking fails. Login and recognized payloads do not perform checks.

Replaced logo/terminal loading with a clean animated SVG orbit and relevant text. Adapted the user-supplied WebGL-Fluid-Simulation into local MIT-licensed assets and mounted it only on normal login/signup forms. The sandboxed effect receives pointer coordinates/visibility only, cannot capture input, caps GPU work, and cleans up on navigation. Reduced motion removes the frame; GPU loss retains a static backdrop and usable forms. The original repo is unchanged; scripts/prepare-auth-fluid.py regenerates the adaptation. See AUTH_UI.md.

Validation: 32 new availability/real-WebGL checks, 27 loading/404 checks, 44 existing product-polish checks, 44 mascot/privacy/layout checks, 16 auth/OTP checks, and 23 prank checks passed (186 browser checks). The backend controller and real HTTP route/quota suites passed with mocked database methods. Light/dark auth/loading screenshots were reviewed, including actual WebGL pixel output and GPU-context-loss fallback. Mechanical design detection reported no findings in the new loading and fluid styles. Backend and frontend must deploy together for the new live endpoint.

Light-theme fluid visibility now uses full opacity, stronger saturation, and a less restrictive center mask. Dark-theme rendering keeps its previous values.


## October 30 — direct landing and 3D title orbit

Removed the full-screen cinematic greeting and its inert/scroll lock code.
Landing now opens directly. A finite 5.2-second, two-orbit CSS perspective title
passes in front of and behind the original masked figure, then settles into its
existing backdrop position. The animation waits for the title font and portrait,
pauses in background tabs, cancels on unmount and live reduced motion, and never
blocks navigation. Reduced motion immediately shows the settled composition.

Added a green-neutral landing palette in both themes, a compact category index,
rebalanced practice cards, an explicit example challenge panel, and a dedicated
team invitation. Public/member/mobile team links have a distinct tinted badge;
the team destination remains the separate subdomain in a safe new tab. Login
uses a drawn underline, signup a sliding fill and arrow; all retain focus and
reduced-motion behavior. Lower reading blocks fade at viewport edges and return
when scrolling back, with focus revealing the complete block.

Validation: production build passed (existing Zod annotation/Lottie/chunk warnings
remain). 42 landing and 28 team-routing browser checks passed with intercepted
APIs; no production data was created. Reviewed desktop/mobile screenshots,
intermediate 3D frames, and both themes. No horizontal overflow at
320/390/768/1024/1440px. Copy/action contrast checks pass in both themes
(minimum measured 6.8:1).


## October 30 follow-up — circular ribbon and header alignment

Replaced the rejected whole-title swivel with 16 independently oriented letter
planes on one circular ribbon. Words occupy opposite arcs, make two full orbits,
and unfurl into the original two-line heading behind the person. The 6.4-second
sequence includes wrapping/settling and preserves its timeline during resize.
Finished glyph animations are cancelled to release compositing layers. Reduced
motion still shows the final title immediately.

Fixed the navbar's actual alignment problem: plain links and the taller team
badge now share 44px centered targets. A desktop grid centers the navigation
between equal outer tracks. The existing menu takes over below 1200px, and its
position matches the header at phone/tablet widths.

Production build passed with the existing dependency warnings. 70 landing and
28 team-routing checks passed against the built bundle with intercepted APIs.
The revised tests check complete 720-degree glyph rotations, depth cycles,
resize continuity, navbar center/alignment/clearance, and menu placement. Normal
and reduced motion, keyboard/auth navigation and safe team popups still pass.
Reviewed circular-animation frames and final layouts in both themes, including
the owner's 1600px desktop size and 390px phone. No production records changed.
