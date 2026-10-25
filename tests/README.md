# Local regression checks

The browser suites exercise the production frontend with **mock API responses**.
They do not verify MongoDB persistence, SMTP delivery or real authentication.
Every HTTP request is intercepted; external font requests are suppressed and the
local fallback fonts are used. Do not point these fixtures at production.

## Pure certificate check

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
4. `<workspace>/fsocietypk-frontend/tests/browser-certificate.js`
5. `<workspace>/fsocietypk-frontend/tests/browser-public.js`

The fixture setup serves built files through Playwright route fulfillment at the
synthetic origin `http://fsociety.test`; it opens no listening socket. Its API
data lives only in the test process. Restart setup to reset the fixture.
Run in a fresh browser tab/context or clear that origin's local/session storage
if a previous test stopped with a pending registration.

Screenshots, the downloaded PNG and a PDF produced from the actual print iframe
are saved under `.playwright-mcp/continuation-*`. The test replaces `window.print`
only to detect invocation without an OS print dialog; it renders the same HTML
to PDF using Chromium. Check the resulting PDF with `pdfinfo` (one A4 landscape
page) and the PNG with an image reader (2800×1980).

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
