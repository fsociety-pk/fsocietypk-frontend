# Fsociety PK frontend redesign — version 3

Based on upstream commit `00521b6`, on branch `redesign/editorial-light-dark`.
This is a local implementation of the redesigned frontend. It has not been pushed or deployed to fsocietypk.tech.

## Run locally

Use Node.js 20 or newer:

```bash
npm install
npm run dev
npm run build
```

The app retains the existing backend services and cookie-based authentication. Configure your own `.env.local` using `VITE_API_URL` (backend origin), `VITE_API_PREFIX` (default `/api/v1`), and `VITE_API_WITH_CREDENTIALS` (default `true`). For same-origin production hosting, leave `VITE_API_URL` empty and configure the `/api` reverse proxy. The Vercel SPA routing is retained. The development proxy uses the repository's existing target unless `VITE_API_URL` is set in the process environment. Environment files are excluded from the delivery ZIP.

## Design and assets

- White is the default, with dark text and emerald actions. The theme button switches to near-black navy `#04060f` and mint `#5df0a8`, and remembers the user's choice.
- The landing page follows the supplied Ascend reference: centered heading, cropped Earth, category strip, six feature cards, a split challenge preview, community strip, final call to action, and footer. The copy is about Fsociety PK and uses plain English.
- Reused the approved static logo and corrected eye-glow GIF from “Retirement Certificate Design” unchanged. Reduced-motion users receive the static logo.
- Preserved the original first-, second-, and third-place Hall of Fame Lottie graphics.
- Removed the previous custom flag and its motion. No new 3D model or mesh was created. The supplied GetLayers Earth model is loaded unchanged with scroll-driven zoom, left/right movement, and rotation; a NASA Apollo 17 photograph appears when WebGL is unavailable or while loading. Source credits are in `public/models/ATTRIBUTION.md`.
- Shared typography, colors, cards, forms, tables, buttons, navigation, and responsive spacing run throughout member and admin pages. Motion includes the requested logo, preserved rank graphics, Earth scroll sequence, and small interaction feedback. Reduced-motion settings keep the Earth static.

- Locally hosted Space Grotesk headings and Manrope body text provide a consistent type system. Font licenses are included in `public/fonts/`. Emerald-to-teal heading accents, lightly shaded cards, and restrained shadows carry across both themes. The Earth renderer supports up to 2× pixel density.
- Replaced slogan-style copy with direct labels and neutral sample usernames in the isolated preview; real account usernames are unchanged.

## Pages covered

Public landing, login, signup, member dashboard, challenges, challenge details, challenge creation, Hall of Fame, member profile, public profile, profile editing/settings/certificates, writeups, writeup reader, writeup submission, personal submissions, resources, projects, notifications, and the admin's public profile.

Admin pages include overview, challenge moderation, community writeup/resource reviews, users, projects, analytics, settings, and admin profile editing.

Added routes for `/submissions`, `/writeups/:id`, `/admin/reviews`, `/about-admin`, and `/admin/profile`. Existing API services remain the source of production data. The landing challenge illustration is clearly labelled “Preview.” No sample accounts or authentication bypass are included in the production package.

## Functional improvements

- Clear status and review feedback for personal submissions.
- Admin review screens use existing approval endpoints. Resource approval is supported; an unsupported resource rejection endpoint was not invented.
- Challenge categories are consistent between browsing and creation.
- Profile editing, visibility, avatar controls, certificate viewing, and password forms remain available.
- Theme-aware analytics with corrected average-solves calculation and chart labels.
- Loading, error, empty, and form-validation states.
- Keyboard focus handling and Escape dismissal for dialogs and mobile navigation.
- Fixed conditional hook ordering on the admin's public profile page, which could previously render a blank screen after loading.
- Escaped dynamic certificate SVG text and simplified certificate/share wording.
- Removed the client-side SQL-keyword joke in flag entry; the backend remains responsible for flag validation.

## Validation and limits

Production build includes TypeScript checking. Earth motion checks cover keyframe stops, mobile travel, bounds, and continuity. Browser checks confirmed that the photo fallback zooms out and moves left/right as the page scrolls. Browser checks cover both themes, desktop layouts, 390 × 844 mobile layouts, mobile drawer open/Escape close, profile tabs, challenge search, empty-writeup validation, and the preserved Hall of Fame graphics. The screenshots are real browser captures of the running components, with isolated sample data marked on screen. The QA fixture is excluded from the production ZIP.

The build emits size warnings for the preserved Hall of Fame animation assets and optional Earth renderer. Both are loaded with their respective pages. WebGL is disabled in the review browser, so the NASA fallback was visually checked; the supplied model's WebGL rendering still needs a check on a supported device.

Live account creation/login, server flag checks, admin mutations, password changes, and notification delivery were not tested end-to-end. Test those against the staging backend before release. The backend must continue to enforce authentication, admin roles, and approval rules.

The delivery ZIP excludes environment secrets, dependencies, build output, Git history, backup files, and the isolated QA fixture. Install dependencies and build locally. The v3 companion screenshot ZIP shows the updated typography, both themes, scroll positions, profile, and mobile layout. The earlier full-page screenshot set documents the broader page redesign.
