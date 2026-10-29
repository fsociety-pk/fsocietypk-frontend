# Fsociety PK team site and manager

The public page is prepared for https://about.fsocietypk.tech. Dashboard,
desktop/mobile navigation, member sidebar and footer links point there.
The separate Vite entry is `about.html`; preview locally at `/about.html`.
Team details and published certificates can be read without logging in.

## Managing the page

Sign in as an administrator and open **About team manager** in the staff
navigation (`/admin/team`). Other staff roles cannot use this tool.

- **Team details:** introduction, story, disciplines, member profiles, member
  links, social/contact channels. Save to publish changes. Photos use HTTPS URLs;
  real names, photos, biographies, roles and specialties are optional.
- **Certificates:** enter the CTF/event name, date, optional placement, description
  and HTTPS event/scoreboard link. Upload PDF, PNG, JPG or WebP, up to **8 MB**.
  New certificates default to drafts. Enable **Publish on the public team page**
  when ready. Edit to replace a file, update details, or return to draft. Delete
  removes the record and requests deletion of its R2 object.

Changes are read from the API and need no frontend rebuild. Versions prevent
overwriting another administrator's changes; refresh after a conflict. Failed
saves preserve form input. Check the list before retrying an upload whose
response was lost: create requests are not idempotent.

The public archive uses a 3D book/VHS-style certificate shelf. Each certificate
has a dated spine; the selected book turns out to show its cover. Images retain
their full aspect ratio. Browse by clicking spines, dragging, arrow buttons,
Left/Right keys, the certificate picker, or horizontal/Shift-wheel scrolling.
Focus the shelf for Home/End/Enter navigation. Year tabs have a sliding indicator.
Results sort newest first and paginate in groups of twelve.

Open a cover to expand a paper sheet from its position. Image certificates reveal
through an SVG ink mask; PDFs use an embedded reader with an external-open link.
The sheet retains event information, scoreboard/original-file/download actions.
Escape/Close returns to the shelf and restores focus. Modal focus is contained;
mobile detail content scrolls. Reduced motion snaps selection and reveals the
sheet/document immediately. The custom cursor appears only over the shelf on
fine pointers; native page scrolling remains available.

The visual reference is adapted to real administrator-uploaded certificates and
existing Fsociety PK branding. No fictional film artwork/data is used. Newsreader
Latin WOFF2 is self-hosted under SIL OFL; its license is under public/fonts.

No invented people or results are seeded. Empty sections explain that
introductions and the competition log are being prepared. Existing community
channels are editable defaults. The linked [CTFtime profile](https://ctftime.org/team/432687)
lists fsocietypk.tech as its website; planned participation is not a result.

## R2 storage

Use the existing backend R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and
R2_BUCKET. The token needs object read/write/delete permission. Keep the bucket
private. No browser-side storage credentials or public bucket are needed.

The backend streams temporary uploads to R2 under
`team/certificates/<server-generated UUID>.<validated extension>`. Temporary files
are removed at response completion. MongoDB stores event metadata and the R2 key,
filename, MIME type and size; no certificate bytes or base64. The extension and
actual file signature must match; SVG/HTML are rejected.

Public file endpoints recheck publication and redirect to five-minute signed R2
URLs. Images/PDFs use inline disposition; `?download=1` requests an attachment.
Responses never expose object keys. Existing private challenge downloads keep
their authorization and attachment behavior. Unpublishing blocks new public
links; previously issued signed links can work until their five-minute expiry.

Replacement uploads are removed after failed/conflicting database saves. The old
object is removed after a successful replacement. Failed provider cleanup is
logged with its key for operational retry; there is no background cleanup queue.
Monitor these logs if R2 is unavailable.

## API contract

All endpoints use the existing success/statusCode/message/data envelope and
standard error statuses/messages/errors. Paths below are under /api/v1.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | /team | Public profile or defaults before first save |
| GET | /team/certificates | Published list; page, limit (max 24), optional year |
| GET | /team/certificates/:id/file | Published file → signed URL |
| GET / PUT | /admin/team | Administrator profile; PUT includes version |
| GET | /admin/team/certificates | Admin list; status=all/published/draft, page, limit |
| POST | /admin/team/certificates | Multipart data JSON and certificate file |
| PATCH | /admin/team/certificates/:id | Multipart data including version; optional replacement |
| DELETE | /admin/team/certificates/:id?version=0 | Delete matching version and R2 object |
| GET | /admin/team/certificates/:id/file | Admin preview, including drafts |

Certificate data: title, eventDate (YYYY-MM-DD), placement, description, eventUrl,
isPublished. Storage keys cannot be supplied. Zod validates IDs, dates, URLs,
bounds and strict payload fields. List data contains certificates, years and
pagination {page, limit, total, totalPages}. Admin records additionally include
version and isPublished.

The public team router supports credential-free reads from the exact about
subdomain alongside existing allowed origins. Administration retains the
existing session, origin and role controls.

## Deploying the subdomain

1. Deploy the matching backend and frontend. The frontend build produces both
   dist/index.html and dist/about.html.
2. Add **about.fsocietypk.tech to the same frontend Vercel project's domains**.
3. Add the exact DNS record Vercel displays for that project. Do not assume a
   fixed CNAME or IP. Wait for domain verification and HTTPS provisioning.
4. Open https://about.fsocietypk.tech/. Ordered host-specific routes serve
   about.html before Vercel's filesystem lookup can select the platform index.
   The same host's old platform paths, including /dashboard, also serve the team
   document. Assets and the API proxy retain their normal destinations. The
   main hostname continues to serve the platform. Sections use fragments such
   as #ctfs and #people; platform links open the team root in a new tab.
5. Add your members/certificates at /admin/team, publish a certificate and check
   its public preview/open action.

Use an HTTPS VITE_API_URL in production (the existing configuration uses
https://api.fsocietypk.tech), or use the same-origin API proxy. No R2 bucket CORS
change is needed: uploads go through the backend. Other static hosts should map
about.html to the about hostname's root, sharing /assets, /fonts and /brand.
Keep the main domain's SPA fallback on index.html.

Local builds/tests do not modify DNS, deploy production, or create real team
records or R2 objects.

The Connect section animates each admin-managed social link using the Jitter
“White Social Handle” sequence: icon pop, badge expansion, then label reveal.
It plays once on entry, keeps link destinations unchanged and immediately shows
the complete badge for keyboard focus or reduced-motion preferences. SVG brand
marks support the social kinds already available in the manager.

CTF records also accept scoreboard screenshots. Event dates preserve their
known precision: YYYY, YYYY-MM, YYYY-MM-DD, or blank for undated records. Unknown
dates are not added to the year filter. The reviewed nine-image import manifest
and operator script live in the backend repository; see its
`docs/TEAM_CTF_IMPORT.md`. Image bytes remain in R2, never in the frontend bundle.

## Verification

Backend: build, then run `node tests/team.cjs`, `node tests/admin-access.cjs`
and `node tests/browser-session.cjs`. The team checks exercise real schemas,
routers, JWTs, Multer, file inspection, temporary files and controllers; database
and R2 provider operations are stubbed.

Frontend: build with `VITE_API_URL=`, run `node tests/prepare-browser.cjs`, then
run generated browser-fixtures.js, generated browser-team-fixtures.js and
tests/browser-team.js with the connected browser. This checks edits, uploads,
replacement, publication/deletion, failure draft preservation, public rendering,
draft exclusion, year filtering, actual shelf animation, reduced motion and responsive
layouts. The hostname, APIs, certificates and R2 are intercepted fixtures.
It does not verify real MongoDB persistence, R2 credentials, DNS or deployed
HTTPS. Build normally afterward to restore the configured API origin.

For the detailed shelf checks, reset the two generated fixtures and run
tests/browser-certificate-shelf.js. It seeds only local test documents and checks
wraparound, keyboard/drag/wheel, physical transforms, the paper/ink opening,
modal focus/Escape, reduced motion, mobile overflow and single-certificate state.

Run the generated browser-team-routing.js directly with the connected browser
after preparing fixtures to verify the subdomain routing regression. It reads
the actual vercel.json routes and models their ordered filesystem lookup against
the production build, including root/index priority, assets and API destinations.
It clicks real dashboard/public links and intercepts popup requests at browser
context level. The 27 checks cover new tabs, refreshes, legacy platform paths,
CTF/member/social sections, no platform intro or auth calls, and mobile layouts.
This fixture does not substitute for a live Vercel deployment check.

References: [Vite 5 multipage builds](https://v5.vite.dev/guide/build.html#multi-page-app),
[Vercel conditional rewrites](https://vercel.com/docs/project-configuration#rewrites).
