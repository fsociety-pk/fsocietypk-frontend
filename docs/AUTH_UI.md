# Username availability and auth presentation

Signup already had username format validation and local username ideas. It now also checks availability after a 450ms pause in typing. Login does not make these requests.

`GET /api/v1/auth/username-availability?username=example_name` returns the normal API envelope with `data: { username: "example_name", available: true }`. The normalized name is trimmed and lowercase. It uses the existing registration rule: 3–30 letters, numbers, underscores, or hyphens. Invalid/non-string input returns 400 before any database query. A fixed equality query against the unique username index returns only availability, without account details. Responses are not cached.

The endpoint permits 60 checks per minute per IP, in addition to the global request limit. These reads do not consume the existing 20-per-15-minute authentication quota. Registration and the unique database index remain authoritative; a live check does not reserve a username.

The signup UI shows Checking, Available, Taken, or Check unavailable. Editing cancels the old request, and late responses cannot overwrite a newer name. Known taken names get an inline error and alternative suggestions. If the checker fails, normal registration remains available. Recognized payloads are not sent to the checker, preserving the existing SQL prank behavior.

Deploy the backend and frontend changes together to enable live checks. An older/unreachable backend shows Check unavailable rather than claiming the name is available.

## Static auth backgrounds

Login, signup and email verification use the page's existing theme background.
The shared auth form no longer mounts `AuthFluidBackground`, so the decorative
iframe, WebGL engine and fluid assets are not loaded on these pages.

## Loading

Shared page/session/data loading uses an animated SVG orbit and relevant status text. The loading indicator has no logo, greetings, terminal text, or fake percentages. Reduced motion displays a static indicator with an accessible busy status.

## Validation

Both TypeScript builds pass. Backend controller tests cover normalization, fixed database filters, scalar validation, available/taken results, minimal output, and no-store responses. The HTTP test exercises the real route and independent check/auth limits with mocked database methods. Browser fixtures exercise availability debounce, stale responses, failures, registration fallback, static auth backgrounds, responsive forms, loading, auth, mascot privacy, and prank behavior without contacting production APIs.


## Password privacy versus strength feedback

`AccessMascot` owns only focus/gaze, privacy hands, greeting and messages. It has
no password-score or verification-score prop. Password entry always supplies an
identity character count of zero. Its expressions stay neutral for every checker
state on both login and signup.

`PasswordStrengthRobot` appears only beside the signup password input, before
email verification. Its only prop is the checker-state enum; no password text or
length enters the component. The existing five requirements, meter, validation
and 72-byte limit remain authoritative. Empty/weak/fair/good/complete/invalid
states change its facial expression and semantic color, with a short finite
reaction and a reduced-motion alternative. The accessible state label provides
a text equivalent for the face. Login retains its usual password field and crew
privacy behavior, without evaluating/displaying signup strength guidance.

Regression checks: `browser-password-robot.js` covers all states, independent
crew expressions, eyes-up/covered privacy, field placement, Unicode byte limits,
normal/reduced motion and both themes at phone/tablet/desktop widths.
`browser-mascot.js` checks all six eyes and connected hands; `browser-auth.js`
checks existing registration, verification and login using intercepted requests.
