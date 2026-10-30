# Local regression checks

## Earned challenge badges and completion celebration

After building and preparing fixtures, run generated `browser-fixtures.js` then
`tests/browser-badges.js`. It covers all ten SVG category assets, collection
search/filter, actual owner/date/points, exports, public deep links, profile
visibility, account-edit retention, partial/full challenge completion, the
celebration → points → completion-message sequence, reduced motion, early close,
focus restoration, older awards and 320–1600px layouts. Screenshots are saved to
`/tmp/challenge-badges-*` and `/tmp/challenge-completion-*`.

The backend `tests/challenge-badges.cjs` verifies server completion-derived awards,
history beyond 20 rows, category coverage, exact points/dates, ownership,
visibility and rejection of client-minted awards with model doubles.
`browser-badge-export.js` replaces the old per-challenge certificate export suite.
Team competition certificates and their shelf retain their existing tests.

## Member overview

Build, run `node tests/prepare-browser.cjs`, then load the generated
`browser-fixtures.js` and `tests/browser-overview.js` with connected Playwright.
The suite intercepts both HTTP and WebSockets. It checks actual profile metrics,
unfinished challenge links, personal solve history, level progress, the compact
right-hand activity box, keyboard scrolling, live arrivals, 320–1600px layouts,
light/dark themes, loading/empty/error states, retry and reduced motion.
Screenshots are saved as `/tmp/overview-redesign-*.png`.

## Notifications and support

After building and running `node tests/prepare-browser.cjs`, load the generated
`browser-fixtures.js`, then `tests/browser-notifications.js` using connected
Playwright. Reset fixtures before running `tests/browser-support.js`.

Notification checks cover instant read/unread/delete with delayed responses,
failure rollback, correct filters and badge count, incoming Socket.IO events,
deduplication, arrivals during bulk read/clear, reduced motion, member/staff
headers, account isolation, fetch-error recovery and responsive layouts. APIs
and WebSockets are intercepted; no live messages or accounts are changed.
Support checks include explicit validation feedback, New ticket focus, preserved
drafts after failures, creation, member/admin replies and resolve/reopen.
The backend `tests/notifications.cjs` tests routes/session checks and private
room delivery with model and transport doubles; `tests/support.cjs` covers
ticket ownership and persisted email retry behavior.

## Team site and R2 certificate manager

See [team manager, API/storage and deployment notes](../docs/TEAM_SITE.md).
Build and prepare the browser files, then run generated `browser-fixtures.js`,
generated `browser-team-fixtures.js` and `tests/browser-team.js`. The fixture
host, team/member data, certificates and storage responses are intercepted.
Screenshots are written to `/tmp/team-*.png`. No real awards are published.
Reset the generated fixtures and run `tests/browser-certificate-shelf.js` for the
3D shelf, wraparound, drag/wheel/keyboard, paper/ink reveal, focus/Escape and mobile
checks. Its screenshots are under `/tmp/certificate-shelf-*.png`.
The backend `tests/team.cjs` covers auth, Zod, real multipart/file inspection,
temporary-file cleanup, R2 upload/replace/rollback contracts and draft protection
using stubbed database/provider methods.

## Browser sessions

After building the backend, run `node fsocietypk-backend/tests/browser-session.cjs`
from the workspace. This checks real Express cookie headers for login and email
verification, JWT expiry, authenticated requests and logout using stubbed DB methods.
After preparing browser fixtures, run `tests/browser-session.js` in a fresh browser
context. It checks stale storage, login, authenticated reload, session rejection,
corrupted legacy data and blocked storage with mock API responses.

Login cookies have no `Expires` or `Max-Age`; browser session restore may still
restore them. JWT expiry remains the server-side upper limit. Existing persistent
cookies are replaced on the next login, so sign out and back in after deployment
when verifying this change.

The browser suites exercise the production frontend with **mock API responses**.
They do not verify MongoDB persistence, SMTP delivery or real authentication.
Every HTTP request is intercepted; external font requests are suppressed and the
local fallback fonts are used. Do not point these fixtures at production.

## SQL prank checks

After building and preparing fixtures, run the generated `browser-fixtures.js`,
then `tests/browser-sql-prank.js` with the connected Playwright tool. This suite
uses a controlled browser clock to check the four-second reveal, rotating jokes,
early exit and focus restoration, light/dark mobile layouts, unchanged XSS/NoSQL
feedback, and the absence of auth/admin requests. It also checks that a SQL-like
password still goes unchanged through normal login. The updated `browser-auth.js`
covers the prank followed by ordinary signup, email verification, and login.

## Legacy certificate utility check (outside the member flow)

```sh
node tests/certificate.cjs
```

Checks escaping, recorded and unknown dates, and long-title layout bounds.
Writes a long-title SVG and test module under the workspace `.playwright-mcp`.

## Browser checks with connected Playwright

From the frontend directory:

```sh
VITE_API_URL= npm run build
node tests/prepare-browser.cjs
```

Use `browser_run_code_unsafe` with `filename`, in this order:

1. `<workspace>/.playwright-mcp/browser-fixtures.js`
2. `<workspace>/fsocietypk-frontend/tests/browser-auth.js`
3. `<workspace>/fsocietypk-frontend/tests/browser-workspace.js`
4. `<workspace>/fsocietypk-frontend/tests/browser-badge-export.js`
5. `<workspace>/fsocietypk-frontend/tests/browser-public.js`

The fixture setup serves built files through Playwright route fulfillment at the
synthetic origin `http://fsociety.test`; it opens no listening socket. Its API
data lives only in the test process. Restart setup to reset the fixture.
Run in a fresh browser tab/context or clear that origin's local/session storage
if a previous test stopped with a pending registration.

Screenshots are saved under `.playwright-mcp/continuation-*`. The badge export
suite downloads a standalone SVG to `/tmp/continuation-badge-export.svg` and
checks the existing account/password flow. Per-challenge print/PDF controls have
been retired; the separate team competition certificate shelf retains its own
coverage.

## Backend checks

From the backend directory:

```sh
npm run build
node tests/validation.cjs
node tests/account-controllers.cjs
node tests/account-flows.cjs
```

`account-controllers.cjs` uses real JWTs/controllers and Mongoose documents with
stubbed database methods. `account-flows.cjs` needs accessible local MongoDB at
127.0.0.1:27017. It creates and deletes only its uniquely named disposable DB,
does not load `.env`, and stubs email. In the current sandbox it fails with EPERM
before any integration assertions execute. Real inbox delivery is a separate
verification task.

## Challenge counts, cards and website links

After building and preparing the browser fixtures, run the generated
`browser-fixtures.js`, then `tests/browser-challenge-progress.js` and
`tests/browser-challenge-url.js` with the connected Playwright tool. The suites
provide their own mock API/auth data. They check five-flag progress, refresh,
completion, distinct solve history, cards without icons, filtering, responsive
layouts, URL validation, links on details/submissions/admin review, and multipart
submissions with a URL, a file, or both. Screenshots are saved in
`<workspace>/.playwright-mcp/challenge-*`.

From the backend directory, after `npm run build`:

```sh
node tests/challenge-url.cjs
node tests/challenge-progress.cjs
```

The URL checks use real schemas/controllers with a stubbed create operation.
The progress suite requires accessible local MongoDB and creates/deletes only
its uniquely named `fsocietypk_flag_progress_test_*` database. It covers actual
flag submissions, full completion, profiles, writeup eligibility, all leaderboard
periods, analytics, old steps and duplicate successful submissions. No production
database, SMTP or file storage is used. The sandbox may block localhost with
`EPERM`; in that case no database assertions have run.

## Dedicated administration, roles, email queue and backend status

Build and prepare the browser files, then run these in order with connected
Playwright:

1. `<workspace>/.playwright-mcp/browser-fixtures.js`
2. `tests/browser-admin-fixtures.js`
3. `tests/browser-admin.js`

The admin suite covers 43 checks and captures desktop/light/dark/mobile screenshots
under `/tmp/admin-*`. All API responses, role changes, broadcasts, password changes,
and EC2 metrics are fixtures; no actual accounts, mail, or infrastructure are changed.
For member regression suites, reset the generated fixtures first. Their default
account is now a member; staff no longer use player pages. The challenge URL suite
explicitly switches roles between publishing and player views.

Backend checks (from the workspace):

```sh
npm --prefix fsocietypk-backend run build
node fsocietypk-backend/tests/admin-access.cjs
node fsocietypk-backend/tests/admin-system.cjs
node fsocietypk-backend/tests/platform-emails.cjs
node fsocietypk-backend/tests/submission-emails.cjs
node fsocietypk-backend/tests/challenge-url.cjs
```

These use actual middleware/controllers and stub database/provider methods; SMTP
transport in email checks is fake. The system check reads local host metrics and
stubs MongoDB availability. Operational setup is documented in `ADMIN_PORTAL.md`.

## Community publication, live solves and earned badges

After building and running `node tests/prepare-browser.cjs`, run the generated
`browser-fixtures.js`, then `tests/browser-community.js` with connected Playwright.
This uses intercepted build files, mocked HTTP APIs, and a simulated Socket.IO
handshake. It verifies approval events publishing attributed guides, separate own
submissions, challenge writeup links/counts, live solve broadcasts and the 30-second
refresh fallback, light/dark cards, animated rankings, reduced motion, compact
badge controls through 320×568, SVG export, focus restoration, and explicit
staff flag reveal/hide. No production API or WebSocket connection is used.
Screenshots are saved under `<workspace>/.playwright-mcp/community-*`.

`tests/browser-challenge-progress.js` retains its 32 checks for partial and full
solves, filtering, refresh persistence, progress counts, distinct profile history,
and responsive cards. Its visual assertions now follow neutral cards with colored
category labels and independent challenge/writeup links.

From the backend directory, after building, run `node tests/community-updates.cjs`.
It uses real routers, JWT verification, controllers, encryption, and an isolated
MongoDB database. Checks cover pending/rejected visibility, author attribution,
approval/revocation events, availability counts, completion timestamp ordering,
partial-solve exclusion, role-protected flags, and verified recovery of older
hash-only flags without changing progress or scores.

## Shared animated loading states

`tests/browser-system-states.js` holds session and page requests open to inspect
the actual loading UI. It measures animation changes over time, checks reduced
motion, verifies light/dark layouts through 320×568 and landscape 844×390, and
confirms the challenge list, challenge detail, and writeup library use the same
loader without hiding workspace navigation. Releasing each request must remove
the loader. The suite also retains the route-recovery checks. All API and
WebSocket traffic is intercepted.

## Shared visual system (October 29)

Build with `VITE_API_URL= npm run build`, then run `node tests/prepare-browser.cjs`.
Load the generated browser fixture through the connected browser, then run:

- `tests/browser-redesign.js`: 16 member routes, both themes, 320/768/1440px,
  real pointer tilt/reset and reduced motion. Uses illustrative intercepted API data.
- Reload the base fixture, then `tests/browser-admin-fixtures.js` and
  `tests/browser-admin.js`: existing staff workflows, role restrictions,
  responsive routes, mobile focus and session behavior.
- Reload the base fixture, then `tests/browser-auth.js`: existing signup,
  OTP, validation, password visibility and login flows.
- `tests/browser-public-redesign.js`: signed-out landing, login, signup and
  unknown-route screens, both themes and three viewport widths.
- `tests/browser-support.js`: private ticket creation, preserved error draft,
  member/admin replies, resolve/reopen and mobile layouts.

The redesign suite saves reviewed screenshots under `/tmp/redesign-*.png`.
Build normally after testing to restore the deployment's configured API origin.

## Team subdomain routing regression

After a normal production build and `node tests/prepare-browser.cjs`, run the
generated `.playwright-mcp/browser-team-routing.js` directly with connected
Playwright. It loads the actual ordered Vercel configuration against build files
and models filesystem index selection. Context interception covers new popup
tabs, so a real dashboard/public link click must show the standalone team site
and preserve the original tab. Includes root/index priority, refresh/deep paths,
asset/API routing, no platform intro/auth, and 320/390px layouts. APIs are mocked;
verify the deployed hostname separately after pushing.
