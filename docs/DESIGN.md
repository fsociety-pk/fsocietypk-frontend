# Fsociety PK design system

## Level emblem and editing boundaries, October 31

The profile's level panel now uses an engraved, dimensional nickel-style emblem
containing the real level number. Its inset face, metallic rim and small physical
shadow give it material depth; the arc and percentage show actual progress.
Points needed and the next level's total-points milestone remain explicit.
`memberLevel` centralizes the existing progression: one level per 1,000 points,
starting at level 1. Do not invent rank names, reward unlocks or additional tiers.
Normal motion draws the progress once; reduced motion shows the final value.
The existing theme-aware profile/card materials remain unchanged.

The owner's Edit profile action is in the identity card's upper-right header,
separate from Overview/History/Badges/Settings. It opens the existing `tab=edit`
URL, scrolls/focuses the editing heading, and Back to profile restores focus to
the header action. Public profiles never receive this action. The main portrait
is display-only, including while a photo change is being previewed elsewhere.

Photo management exists only inside Edit profile. Add/Replace select a raster
image, keep the existing 400px square JPEG preparation and 5MB input limit, and
show a local preview. Remove stages the default avatar. Undo and Reset restore
the saved picture. Save changes persists the photo together with other edits;
removal uses the backend-supported empty string. A failed save preserves the
current server picture and pending edit for retry. Image reads are versioned
so stale callbacks cannot overwrite a removed/unmounted preview. Saving waits
until image preparation finishes. No direct header upload/save overlay remains.

Validation: production build, 125 profile checks and 54 badge checks passed with
intercepted APIs. Tests cover add/replace/remove, reload persistence, failure and
retry, undo/reset, default-avatar/menu consistency, private/public boundaries,
header focus restoration, editor layout and save reachability at phone/tablet
sizes in both themes, and level boundaries at 0/999/1,000/2,700 points. Screenshots
reviewed on desktop and phone. These tests do not alter production user records.

## Password privacy and signup helper, October 31

The top login/signup crew handles privacy and messages. Masked password entry
keeps its eyes directed up; revealing the password retains the existing helping
hands. Its mouth/brows do not change with password strength. Identity-field gaze,
greeting, availability messages and verification remain intact. Do not pass the
password's score, checker state, length or contents to this crew.

Signup alone shows a compact robot immediately beside the password input. It
receives only one enum: empty, weak, fair, good, complete or invalid. Its face and
existing semantic colors reflect the same five-rule checker; it never receives
the password itself. Over-72-byte passwords remain invalid even if all five
rules pass. Facial expressions and an accessible label supplement the existing
checklist/status text. A finite 280ms reaction plays only when the state changes;
reduced motion shows the new expression immediately. The helper stays out of
login, OTP and prank screens. The robot is a small vector UI companion, using
shared card/surface/semantic tokens, with no added artwork dependencies or loops.

Validation: production build passed. 62 targeted helper checks, 44 existing crew
privacy/layout checks and 16 auth checks passed with intercepted APIs. Reviewed
normal/reduced motion, desktop and phone light/dark captures. Masked/revealed
password privacy, visibility toggles, OTP/resend/login, the byte limit, natural
form scrolling and reachable submit controls remain functional. The auth fixture
now intercepts absolute production API URLs with CORS/OPTIONS support so this
verification runs on the normal production bundle without live account writes.

## Member dossier refinement, October 31

The profile now has terminal chrome, a larger framed portrait, a circular level
meter and separate elevated statistic cards. Light mode uses a white identity
card, pale mint milestone panel and slate text; dark mode uses raised slate
surfaces. Badges and records use soft elevation and spacing. Missing photos use the custom
masked hacker avatar, also shared by public profiles and the account menu.
Identity reveals settle after entry; reduced motion shows the finished state.
The full current contract and image prompt are in [PROFILE_DESIGN.md](PROFILE_DESIGN.md).

## Member profiles, October 31

Mode: Operate with one expressive identity moment. Identity and content cards
follow the chosen light/dark theme, with emerald accents and soft elevation.
Direction: precise, personal, confident. Preserve Onest, actual member data,
existing badge artwork, shared page themes and all profile/account behavior.

The identity card groups the original photo, username, role, bio and social
links, with a right-hand level-progress area computed from actual points. The
four separate statistic cards keep the API's solve count, points and rank,
and the existing points-based level formula. Metadata remains factual: joined
date, supplied country and public/private state. Do not invent verified status,
security clearances, online indicators, skill ranks, or achievements.

The signature is a brief username decode with a scanner-style portrait frame.
Only decorative ink changes; the heading's accessible label and reserved
character widths remain stable. It plays once on load/username change and on
intentional replay or mouse entry, resolving within 850ms. A keyboard-accessible
replay button is provided. Hidden tabs cancel to the final name. Live reduced
motion shows the real username immediately, including after profile edits.
The avatar scan and level bar finish within 750ms, stat arrivals within 605ms,
and tab changes within 180ms; there are no ambient loops or fake loading states.

Identity colors are scoped in `profile-refresh.css`, inheriting shared
card/ink/muted/brand tokens. Light mode uses white identity/record surfaces and
a pale mint inset; dark mode uses raised slate surfaces. Use a 16px identity
surface, 12px separate statistic cards, 16px record/badge panels and 6–10px
controls. Soft shadows separate content cards without perimeter outlines.
No gradient text, decorative background grids or neon glow. Body
copy uses 14px/1.75; the username scales 32–54px; statistics use 28–30px with
tabular figures. Spacing follows the existing 4px rhythm.

The phone layout stacks identity and level information, then uses a 2×2 stat
card grid with 12px gutters. Long names wrap without clipping. Badge grids fit their actual items and
keep two columns on phones. Tabs scroll within their own band and support
Arrow/Home/End navigation, roving focus and existing URL deep links. Profile
editing, photo previews/saving, password controls, badge details/exports, public
profile privacy and error recovery retain their existing paths.

Earlier profile iteration validation: the production TypeScript/Vite build passed. 58 isolated profile
checks cover username decoding, stable accessible names/widths, replay focus,
contrast, real statistics/level progress, arrow-key tabs, API edits, photo preview
cancellation, public/private errors, long/empty profiles, and live reduced motion
including renaming. Reviewed desktop light/dark and phone captures at
320/390/640/768/1024/1440px. All 48 earned-badge and 71 landing checks also pass;
the latter includes all tilted glyph edges remaining behind the portrait during
settling. The Impeccable mechanical detector reports no findings. No production
accounts, earned data, privacy settings or photos were changed by these tests.

## Earned challenge badges, October 30

Individual challenge achievements use a category-colored nickel/enamel emblem
with a precise custom symbol, engraved category name and completion check.
The ten SVG assets share one physical silhouette and material treatment; they
are generated deterministically from the category design source. Typography and
geometry are exact vectors, with no neon glow, random illustration, or raster
lettering. On profiles, emblems sit on quiet shared-theme surfaces with challenge
title, category, difficulty, earned points and actual date. Category identity is
present in both color and symbol/text. Earned badges replace user certificates;
team competition certificate uploads remain a separate archival feature.

Full completion celebrates once: brief confetti/check, increasing earned points,
then the explicit completion and profile-badge message. Reduced motion shows the
final state immediately. Dialogs retain close/Escape, focus handling and phone
scrolling. Details and exports are user initiated. See `CHALLENGE_BADGES.md` for
the concept provenance, asset generation and earned-data contract.

## Member overview, October 30

Artifact: the member's daily learning dashboard. Direction: clear, focused,
welcoming, practical. Essence: **Progress guides practice.** Preserve the shared
Onest typography, green identity and light/dark surfaces. This supersedes the
oversized welcome/resource card, full-width team banner, separate stat tiles,
and full-width community feed in the earlier overview.

| Decision | Existing token / treatment |
| --- | --- |
| Interface type | `--font-body` (Onest), compact 12/14/16/20/24/32 scale |
| Background, surface, text | `--page`, `--card`, `--ink`, `--muted` |
| Actions, progress | `--brand`, `--on-brand`; no new page palette |
| Separation | `--line` for table rows; shared `--panel-shadow` for panels |
| Spacing, geometry | 4px rhythm, 20–24px panel padding, `--radius-panel` |
| Motion | Shared focus/hover feedback; activity rows stay stable in all modes |

The page opens with a short title and one unified, three-part progress band.
The main column contains resumable challenges, the member's recent completions,
and compact contribution links. The narrower right column contains level
progress and a bounded recent-solves panel showing who solved which challenge.
Only the activity list scrolls internally; the feed never occupies a full-width
row or grows with its item count. The team link is a small secondary link.
At narrower widths the columns stack with personal tasks first. Real API data
drives metrics, progress, history and live activity. Loading, empty and failure
states retain this layout and do not imply zero results on a failed fetch.

Finish review: 9/10 against the design checklist. The daily learning task drives
the hierarchy; shared fonts/tokens and clear controls preserve the product's
identity. Reviewed real renders in both themes and on desktop/phone. The build,
36 overview checks and 28 team-routing checks pass with intercepted API data.
The signature is the compact personal summary with the community ledger confined
to the right column. No decorative charts, new palette, or page-wide activity
feed is added.

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
- Crew motion receives field focus and identity-field character count only, never password contents, length or checker state. Each character derives gaze from the active input’s actual bounding box and approximate caret position, so desktop email and username point in different directions. Focused fields own attention; cursor tracking resumes after blur. Masked password entry keeps the eyes open and directs them upward or away from the form. Revealing the password raises four connected arms: the green friend covers both neighbours’ eyes, and the coral/lilac neighbours each cover one green eye. Each hand matches its owner’s color. Real eye/shoulder bounds determine the SVG endpoints, including after resizing; all six eyes stay rendered behind the hands. Hiding the password retracts the arms. Reduced motion positions the hands immediately. Mouse/pen tracking is batched through requestAnimationFrame; touch and reduced motion disable it. Resize/scroll recalculate field gaze, and listeners/frames clean up on unmount. A greeting button provides a short, staggered head wiggle with a friendly caption; privacy takes priority over greeting motion.
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

Signup alone offers three username ideas derived from the typed username. Ideas are keyboard accessible, selecting one restores input focus, and availability is checked live after a pause and confirmed during registration. The crew suggests the first idea in its bubble and confirms a choice. The crew stays neutral while protecting password privacy. A separate signup robot beside the password input receives only the checker state and owns the worried/smiling strength reactions. Cross-character privacy hands retain priority.

Recognized SQL identity patterns do not trigger live format/payload warnings or reveal the joke. Submission starts the existing four-second fake-admin sequence, with six revised punchlines and no cartoon characters in any prank phase. It remains local and signed out. Passwords are unchanged, and XSS/NoSQL feedback retains its current behavior.

The public landing opens directly, with no splash screen, greeting, interaction lock, or session-storage gate. Its title makes two finite 3D orbits around the masked portrait and settles behind him. Navigation and signup remain usable throughout. Reduced motion shows the settled composition immediately.

The compact mascot reserves its stage below the bubble in normal flow. Long username/password feedback expands the frame instead of overlapping the antenna or faces. Username suggestion captions stay concise.

Latest auth refinement: signup validates username availability through the new public read endpoint after a 450ms pause. The label shows Checking/Available/Taken, aborts obsolete checks, and gives alternative names when taken. Failure is advisory; normal registration remains available. Format/payload validation still gates checks, and login has no availability requests.

Login/signup use their static theme background, including email verification. The shared auth form no longer mounts or loads the WebGL fluid simulation. Mascot privacy and the signup password robot keep their existing behavior. See AUTH_UI.md.

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

The archive supports the owner's real certificates and scoreboard screenshots.
Retain the original image proportions and bytes. Dates display only the supplied
precision (year, month or full date); unknown dates say “Undated”. Do not infer
awards, event dates or final placements from a cropped scoreboard. The nine
supplied images were reviewed in the actual 3D shelf and image detail at desktop
and phone sizes using intercepted file responses; publishing is a separate R2
import through the configured backend.

The shelf starts with every book closed and asks visitors to choose a spine.
The first selection previews a cover; a second cover click opens its detail.
Only one cover face is visible at a time. Switching books closes the previous
cover before opening the next, including during rapid input. Hidden side faces
must not peek between spines. Reduced motion keeps the same selection behavior
with immediate turns; a single-book shelf also starts closed.


## Landing refresh — October 30, 2026

Artifact: public community landing. Positioning: a practical cybersecurity
collective; adjectives: confident, dimensional, legible, welcoming. Signature:
two physical title orbits around the original transparent masked portrait,
settling into the large two-line name behind him. The CSS perspective scene
retains depth sorting between the title and portrait; do not flatten it with
opacity, filters, clipping, or isolation on the scene itself. A separate wrapper
handles hero scroll fade/parallax. Font and portrait decoding precede the finite
6.4-second Web Animations sequence. Background tabs pause it; unmount and live
reduced-motion changes cancel it. Navigation is available immediately.

The portrait retains a separate interactive image branch with three decorative
clipped duplicates. Fine-pointer hover on desktop triggers a short colored
slice glitch and two brief shake cycles, then settles; leaving and returning
replays it. The center of the hero copy passes pointer events through to the
hat. Effects stay inside the image branch to preserve title depth sorting.
Reduced motion hides the slices and leaves the image still.

Landing tokens live in `src/styles/landing-refresh.css`, scoped to `.is-landing`
and `.cinematic-landing`. Light uses a cool green-neutral canvas (97.5% L),
near-white panels (99%), deep green ink (25%), muted green text (45%), forest
green action (44%), and lime (88%) reserved for the team invitation. Dark has
a 19% canvas, 23% panels, 27% elevated green, 94% ink and 80% green actions.
All values use OKLCH. Original Anton display and Onest body type stay self-hosted.
Marketing type uses approximately 1.25 steps (12/14/16/20/24/30/40/52), with a
fluid hero and display headings. Spacing uses a 4px base, 8px panel/control
radii, and defined edges without diffuse card shadows.

Domains form a compact divided index. Four numbered practice entries use quiet
panels and consistent green metadata. The team receives a separate dark
invitation and a tinted navigation badge, both linking to the existing team
subdomain in a new tab. Challenge examples are explicitly examples, with no
invented live status. Signup uses a sliding fill and directional arrow; login
uses a drawn underline. Hover, press, focus and reduced-motion states retain
native link behavior. Lower reading blocks fade/rise at the bottom edge and
fade away at the top edge, reversing when scrolling back. A batched animation
frame updates only transform/opacity variables; focused blocks remain visible.
Content is visible before JavaScript enhancement. The dashboard's existing
once-only reveals remain separate.

Audit: the existing mascot and poster composition are the product-specific
reference. The refresh removes the rainbow marketing accents, floating domain
cards and splash lock. It adds no glow, decorative grids, stock art or invented
metrics. Responsive, motion, contrast and navigation checks are recorded with
the implementation's browser verification.


Validation: production TypeScript/Vite build passed. The landing browser suite
passed 42 checks against the production bundle with intercepted APIs; the team
routing suite passed 28 checks, including actual new-tab clicks and legacy
subdomain paths. Screenshots reviewed in desktop light and phone light/dark,
including intermediate orbit frames with real front/behind occlusion. Layouts
fit 320/390/768/1024/1440px. Keyboard focus, Escape restoration, auth navigation,
reversible fades, and live reduced-motion cancellation passed. Measured primary
copy/action pairs range from 6.8:1 to 15.5:1 in light/dark, exceeding 4.5:1.
Design self-audit: 9/10; defined edges, restrained accents, original artwork,
clear action hierarchy and the physical title orbit distinguish the landing.


### Circular title and navbar correction

The owner rejected the original flat-panel swivel. The title now consists of
16 glyph planes on an elliptical cylinder, each continuously rotating through
720 degrees with the cylinder tangent. Both words occupy opposite arcs of one
ribbon at shoulder height. The ribbon wraps out of the flat title, circles twice,
then opens back into two full-size lines behind the portrait. Depth and tangent
rotation are geometric; rear letters show their reverse as physical lettering
would, recede, and pass behind the transparent figure. There is no mirrored copy
of the person and no whole-heading left/right swivel. All glyph animation layers
are released after settling. Resizing during motion recomputes geometry while
preserving playback time; background visibility and live reduced motion remain
supported. The 6.4-second duration includes wrapping and settling.

The public navbar aligns every link and badge in 44px targets. On desktop, equal
outer grid tracks keep the navigation centered independently of the different
brand/action widths. All controls share the same vertical center. Below 1200px,
use the existing accessible menu before links crowd the actions. Its top edge
matches the appropriate public header height (including the landing's 96/80px).
No auth, team-site routing, or member workspace navigation behavior changes.

Validation: production build, 70 landing checks and 28 team-routing checks passed.
The new checks verify independent glyph motion, two front/back cycles, full
720-degree facing changes, resize continuity, released animation layers, navbar
centering/target clearance at 1200/1280/1440/1600px, and menu placement at
390/641/768/1024/1199px. Reviewed front/side/rear/settling frames and light/dark
phone/desktop screenshots. The circular ribbon is the signature move; there is
no additional ambient motion, invented content, glow, or change to the palette.
