# Fsociety PK design system

## Product and direction
Fsociety PK is a cybersecurity learning community with CTF challenges, writeups, resources, member profiles, rankings, and admin tools. Preserve its content and working authentication, including email verification.

Current brief, 2026-10-25: preserve the original masked-figure logo and use Pakistan-inspired green as the primary accent, without adding flag imagery. Keep the white/light theme as the default and retain coral, lilac, mint, and semantic colors as supporting accents. Login/signup must fit in the initial viewport with the crew above the forms. Eyes follow the actual active field, look away during masked password entry, and let their neighbours cover their eyes when the password is revealed. This supersedes the earlier blue primary and F-monogram directions.

Adjectives: welcoming, curious, clear, playful, capable. Essence: **Curiosity finds company.**

Workspace mode: Operate. Authentication: Operate with playful feedback. Landing: Persuade. Signature: the green, coral, and lilac geometric crew on account access; their expressions respond to form state. The existing masked portrait remains on the landing page. The shared logo preserves the original detailed artwork in `/brand/fsociety-logo-transparent.png`, repeated in the favicon and Apple touch icon. Do not substitute a generic letter or flag symbol for this identity.

## Color tokens
Source: `fsocietypk-frontend/src/styles/design-refresh.css`. Semantic custom properties adapt to the existing Tailwind 3 RGB color functions. OKLCH palette anchors are declared alongside compatibility channel values. Do not add independent page palettes or hardcoded green/yellow overrides.

| Role | Light default | Dark optional |
| --- | --- | --- |
| Page | #F7F9F8 | #101715 |
| Card | #FFFFFF | #19221F |
| Elevated | #EFF5F2 | #1F2B25 |
| Surface | #EBF3EF | #24302A |
| Border | #CCDAD2 | #394C41 |
| Text | #1D2B24 | #EDF3F0 |
| Secondary text | #4F6458 | #AEC1B6 |
| Primary action | #08784F | #78D7B2 |
| On primary | #FFFFFF | #102D23 |
| Success / mint | #147C60 | #69D6B1 |
| Warning / amber | #95600B | #F7BD76 |
| Error / rose | #B83350 | #FF9BA9 |
| Information / blue | #166E6B | #84D2D0 |
| Lilac | #7650B8 | #C0A6FF |
| Coral | #B64E33 | #FFAC96 |

Green identifies actions. Mint, amber, and rose communicate status with labels/icons. Challenge categories have named icons and distinct blue, lilac, mint, rose, coral, and amber treatments; difficulty has separate badges. Color is always accompanied by text or an icon. Light mode uses darker accent inks for legibility; dark mode uses lighter, less saturated inks. Large illustration shapes intentionally use softer green/coral/lilac with dark facial features.

## Typography and geometry
Self-hosted Onest for interface/body and Anton for the existing landing wordmark. Body 16px; compact UI 12–14px; form inputs 16px on mobile. Scale approximately 1.2: 12/14/16/20/24/28/34/42. No viewport-based root shrinking. Spacing base 4px: 4/8/12/16/20/24/32/48/64. Controls radius 8px; cards 12px; large story panel 16px. Borders establish separation; no colored glow or stacked card shadows.

## Layout and behavior
- Auth uses a dedicated compact header and a centered form with the crew directly above login/signup on every screen size. Signup groups email and username in one row on desktop and stacks them on mobile. No public navigation or footer competes with form space. At short heights the password requirements remain visible while redundant helper text is removed. Natural scrolling remains available for validation errors, increased text size, and open software keyboards; do not crop or lock the page.
- The auth crew uses a soft clay treatment: rounded material shading, eye catchlights, small noses, eyebrows, and cheeks within the existing green/coral/lilac palette. Stage scale is .3 at every breakpoint, with a compact 104px minimum frame that grows for wrapped feedback and the speech bubble centered above the crew, matching the user’s final reference. Preserve normal scrolling when the larger artwork, validation messages, zoom, or keyboard need extra room.
- Character motion receives field focus and character count only, never password contents. Each character derives gaze from the active input’s actual bounding box and approximate caret position, so desktop email and username point in different directions. Focused fields own attention; cursor tracking resumes after blur. Masked password entry keeps the eyes open and directs them upward or away from the form. Revealing the password raises four connected arms: the green friend covers both neighbours’ eyes, and the coral/lilac neighbours each cover one green eye. Each hand matches its owner’s color. Real eye/shoulder bounds determine the SVG endpoints, including after resizing; all six eyes stay rendered behind the hands. Hiding the password retracts the arms. Reduced motion positions the hands immediately. Mouse/pen tracking is batched through requestAnimationFrame; touch and reduced motion disable it. Resize/scroll recalculate field gaze, and listeners/frames clean up on unmount. A greeting button provides a short, staggered head wiggle with a friendly caption; privacy takes priority over greeting motion.
- Dashboard has a concise welcome, visibly separate resource area, compact loading feedback, and independently colored stat icons/numbers.
- Challenge cards show category icons, readable descriptions, difficulty labels, solve counts, points, and explicit solved state. Search and category/difficulty filtering preserve existing behavior.
- Incorrect flag submissions rotate through six lighthearted, encouraging messages, starting with “Lol! That flag’s an impostor. Try again.” Inline feedback states which flag failed and preserves the entry and earned progress. A single replacement toast avoids stacking failed-attempt notices. Network/server failures retain plain retry instructions. Inline feedback uses sentence case and a polite status announcement.
- Submitting a recognized SQL pattern in a login/signup identity field starts a local prank page: “Logging in as admin…” immediately, a fake admin welcome after 1.4 seconds, and “Lol! Did you think that worked?” after 4 seconds. Six punchlines rotate across retries. No authentication request, account mutation, admin route, or admin permission is involved. The reveal explicitly says the visitor is still signed out and offers a CTF link. A return button works in every phase, preserves the form, and focuses/selects the offending identity field. Timers clean up on unmount. Passwords never trigger this sequence; XSS/NoSQL feedback and pending-email verification keep their existing flows. The page uses the shared theme, a compact fake account card, and an icon on reveal, without cartoon characters; reduced motion disables the spinner.
- Sidebar has colored domain icons, a clear selected link, a scrollable navigation region, and a persistent sign-out footer. Mobile drawer keeps keyboard focus containment and Escape behavior.
- Header profile access uses a compact member badge with a green framed, softly squared portrait, bold username, a quieter “My profile” label, and an inset navigation arrow. Use existing surface, brand, ink, and muted tokens with a 14px outer radius. At 640px and below, retain the 48px portrait target and accessible account name. Hover and current-profile states strengthen the border; keyboard focus has an explicit ring. Only the arrow moves on hover, with reduced motion respected.
- Both themes apply to public, member, and admin surfaces; the toggle persists the explicit choice and synchronizes tabs. With no preference, use light.
- All fields retain labels, autocomplete, inline validation, keyboard focus, OTP paste, resend cooldown, and pending verification recovery.
- The password checker colors its filled segments, status message, and met requirements together: neutral when empty, rose for 1–2 checks, amber for 3, teal for 4, and green for all 5. Over-72-byte entries always use the error color. Use the existing error/warning/info/success theme tokens; keep the checklist icons and explanatory text so color is supplementary.

## Verification
Browser review covers login, signup, dashboard, challenge list, mobile navigation, theme switching/persistence, category filtering/search, and auth interactions. API fixtures are used for authenticated browser checks; no test accounts or production records are created. Final viewport and flow results are recorded in `CURRENT_STATUS.md`.

Audit: the screenshot references were used as the incumbent anti-reference. Neutral surfaces now separate structure from accent meaning. No gradient text, ambient glow, decorative grids, or scroll-locked forms. The requested character interaction is the expressive element; operational pages keep familiar controls and readable data. Existing landing composition and product content are preserved while its accent colors use shared theme tokens.

2026-10-25 follow-up: user requested a matching logo, characters above both forms, cursor-following eyes, and the tab title “Fsociety PK | CTF Platform”. These replace the previous auth story panel and detailed raster logo.

Latest correction: restored original masked-figure logo, green primary accent, neutral white default, per-field gaze, masked-entry privacy, and connected shoulder/elbow/hand animation. The rejected monogram assets were removed.

Latest validation and character refinement: live username/email format feedback, a five-rule password checklist with playful progress copy and a 72-byte limit, and a visible speech bubble. Use “Enter your username,” never “Choose your handle” or a real-name label. XSS/NoSQL patterns retain inline feedback in identity fields; SQL-looking identity input stays quiet until submission starts the local prank; typed server schemas remain the acceptance boundary. Passwords remain opaque, unchanged secrets and are not subjected to payload denylists. The speech bubble fits inside the existing character area, moving beside the crew on short mobile screens to preserve initial no-scroll layouts.

2026-10-26 profile badge refinement: preserved the welcoming, clear workspace direction and Onest typography. The framed member portrait is the local signature; colors come entirely from the shared green palette. Production build passed. Browser checks with mocked API data verified uploaded portraits, initial fallback, long-username truncation, keyboard focus and profile navigation, current-page styling, both themes, reduced motion, and 44px-plus targets without page overflow at 320/390/640/768/1440px. Screenshot review confirmed the badge fits the header in light, dark, and compact mobile layouts. Component audit passed: no added glow, ambient animation, or invented member status.

2026-10-26 playful recovery and larger crew: wrong-flag feedback now rotates without losing progress or input. The existing challenge browser suite passed 32 checks with mock API data, including failed retries and subsequent correct submissions. Auth browser review verified field-specific gaze, masked-password privacy, hands over every character’s eyes, greeting, dark mode, and reduced motion. Login/signup remain horizontally contained with reachable submit controls at 320×568, 375×667, 390×844, 768×1024, 1440×768, and 1440×900. Screenshots reviewed in light/dark and desktop/mobile. Mechanical design audit reported only the pre-existing challenge-card top border outside this refinement.

2026-10-26 SQL prank: production build passed. The auth regression suite passed 16 checks spanning the prank, signup, email verification, and normal login. The dedicated prank suite checks the four-second timing, all six punchlines, early exit, preserved form values and focus, unchanged password handling, existing XSS/NoSQL feedback, absence of authentication/admin requests, and light/dark layouts at 320/390/768/1440px. Timed announcements use a polite live region and keep keyboard focus on the visitor’s selected control. Desktop and mobile screenshots reviewed; mechanical audit found only the existing challenge-card border outside this change.

## Administration — 2026-10-26

Mode: Operate. Adjectives: composed, clear, capable, accountable. The staff app is a
separate `/admin` layout, not a tab inside the player workspace. Its signature is
a deep green navigation rail paired with a quiet, light operational canvas and a
review queue that puts decisions ahead of decoration. The original masked logo,
Onest type, green action color, and shared semantic tokens remain authoritative.
No player rank, personal submissions, or player profile control appears here.

The navigation rail uses existing `--aubergine`, `--ice`, and green palette tokens.
Surfaces use shared card/page/line/ink/muted values. Content padding is 36px desktop,
24–28px tablet, 18px phone; panels use 12px radii, controls 8px. There is no added
ambient glow, decorative gradient, or entrance choreography. Numeric metrics use
tabular figures. A four-part metric strip precedes the review queue and solve
activity. Pending challenge rows and a compact tool directory complete the
first task path. Charts render immediately; long tooltips wrap within their chart.

Navigation and data tools follow each role's permissions. Admins have all tools;
managers handle operations; moderators review contributions/manage members;
editors create/publish challenges and manage projects; analysts read overview and
analytics. The server checks permissions independently. Role assignment and
backend status are administrator-only. All staff have notifications, security,
and sign-out. Staff accounts are excluded from player rankings and profiles.

Mobile navigation is a native modal dialog with Escape/focus restoration. Tables
scroll within their own containers; pages remain horizontally contained at
320/390/768/1440px. Explicit loading, retry, empty, restricted-access, and stale
status states keep unknown data separate from zero. Both themes use the same
semantic palette and structure. Existing auth characters and playful recovery
remain on authentication screens, outside the operational admin flows.

Backend status is measured from the running API host: process/host uptime and
memory, CPU cores/load, filesystem capacity, database ping, SMTP configuration,
and persisted email delivery counts. It makes no claim to monitor AWS billing or
instance controls. Email actions report queued/provider-accepted state accurately;
failed recipient queueing produces visible feedback and can be retried. Full
role, delivery, and EC2 deployment details are in `ADMIN_PORTAL.md`.

Validation: frontend production build and backend TypeScript build passed. Admin
browser suite passed 43 checks using intercepted APIs, including all 12 routes at
four viewport widths, editing/publishing/moderation, staff assignment, restricted
roles, direct admin login, session-ending password changes, themes, and mobile
focus restoration. Backend suites use real routers/JWTs/controllers with database
stubs and a fake SMTP transport to check authorization, role/session protections,
hash privacy, progress preservation, registered-address audiences, queue retries,
deduplication, recovery, and partial system-status failure. This validates local
code, not the deployed EC2 instance or inbox delivery.

2026-10-26 final auth direction: the user chose the original green/coral/lilac cartoon crew over the fsociety person. Keep the clay shading, antenna, expressive eyes, and typing feedback. Password reveal uses closed eyelids and a look-away tilt, with no hand overlays. Reduced motion applies state changes immediately. The organization logo remains unchanged.

Final visual reference: compact matte peach, green robot, and mint companions, approximately 100px wide as a group. The speech bubble remains above them at every breakpoint. Keep the antenna, small side nubs, original silhouette proportions, and simple friendly faces. Do not enlarge the artwork or substitute a hooded person.

Latest refinement: remove the middle character’s torso dots (they looked like extra eyes). The third character is lilac (#c3ace3), including its hand. The compact size remains. Shared loading now uses a clean animated orbit and relevant status, without a logo, greetings, terminal text, or fake percentages. Reduced motion stops decorative animation. Unknown routes show a standalone 404 with the actual pathname, original logo, theme toggle, resources link, and role-aware workspace recovery. No greetings on loading/404.

## Latest card, auth, and entrance refinements

Cards use tinted green, violet, coral, and category surfaces against the lighter page, with a single material edge and restrained shadow. Dark cards use elevated green surfaces. Interactive cards lift 4px on hover; reduced motion removes the transform. Admin panels share the surface tokens. The original detailed logo is unchanged, with a light contrasting base on dark backgrounds so the black lettering stays legible.

Signup alone offers three username ideas derived from the typed username. Ideas are keyboard accessible, selecting one restores input focus, and availability is checked live after a pause and confirmed during registration. The crew suggests the first idea in its bubble and confirms a choice. Only password score/state reaches the character: weak passwords show a frown and concerned brows; strong passwords show wide smiles and brighter cheeks. Cross-character privacy hands retain priority.

Recognized SQL identity patterns do not trigger live format/payload warnings or reveal the joke. Submission starts the existing four-second fake-admin sequence, with six revised punchlines and no cartoon characters in any prank phase. It remains local and signed out. Passwords are unchanged, and XSS/NoSQL feedback retains its current behavior.

The first public landing visit in a tab session shows a black, full-screen cinematic entrance: white bold “Hello Friends”, followed by “Welcome to the Fsociety PK”. It finishes after 3.6 seconds and supports Skip/Escape. It does not play on direct auth/admin/404 pages or under reduced motion. Background controls are inert during the intro; timers, scrolling, and interaction restore on completion or unmount. Existing loading/404 screens keep relevant copy without greetings.

The compact mascot reserves its stage below the bubble in normal flow. Long username/password feedback expands the frame instead of overlapping the antenna or faces. Username suggestion captions stay concise.

Latest auth refinement: signup validates username availability through the new public read endpoint after a 450ms pause. The label shows Checking/Available/Taken, aborts obsolete checks, and gives alternative names when taken. Failure is advisory; normal registration remains available. Format/payload validation still gates checks, and login has no availability requests.

Login/signup alone mount the supplied WebGL fluid simulation as an isolated decorative background, with green/lilac/teal colors and a quiet center for legibility. It uses local MIT-licensed assets, capped resolution/frame rate, and no demo controls or analytics. Only pointer coordinates and visibility state enter the frame. Reduced motion removes it; GPU loss falls back to a static surface. Other pages and the prank do not use the effect. Loading is a professional animated orbit with no logo. See AUTH_UI.md for the API and deployment contract.

Light-theme fluid visibility now uses full opacity, stronger saturation, and a less restrictive center mask. Dark-theme rendering keeps its previous values.

## Team site and motion, October 29

The standalone `about.html` entry serves `about.fsocietypk.tech`, retaining the
original masked logo and shared themes. The dashboard links to it. Administrators
edit the introduction, roster, social links and CTF certificates at `/admin/team`.
Certificate files live in private R2 storage; MongoDB holds metadata. Never
invent members, competition results or awards for empty sections.

The certificate archive follows the owner's physical book/VHS reference: CSS 3D
spines turn into full covers, masked captions follow selection, and the detail
sheet grows from the cover with an ink reveal. Native scrolling, keyboard and
touch navigation remain available. The animation loop pauses offscreen and
cleans up on navigation. Reduced motion immediately reveals the document.

Social links follow the owner's Jitter “White Social Handle” reference: a rounded
icon badge pops in, expands horizontally, and moves the brand mark left as its
label enters. Entrances stagger once on scroll without changing link geometry.
Inline brand SVGs support all nine existing social kinds. Keyboard focus reveals
the complete badge immediately; live reduced-motion changes cancel animation.
Dashboard section headings also reveal once as they enter the viewport.

Validation: production build, 28 certificate shelf checks, 33 team manager checks
and 18 social badge checks passed with intercepted APIs/storage. Desktop light,
phone dark and intermediate animation frames were reviewed. Social checks cover
320/390/768/1280px layouts, links, focus, live reduced motion, resize during entry
and hover. These checks do not establish a production deployment or real R2
uploads. See [team site setup](TEAM_SITE.md) for deployment configuration.

Subdomain routing correction: every platform link to the team opens a new tab.
Vercel must select the team root/index before its filesystem phase, and its team
host fallback must serve the team document for old platform paths. Keep static
assets and the API proxy available. The team entry never mounts the platform
router, cinematic intro, session check or account navigation. The dedicated
routing regression covers this boundary with real clicked links and popup tabs.
