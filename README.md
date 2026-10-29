# Fsociety PK

A CTF practice platform with community resources, a member workspace, and a dedicated staff portal. The interface uses a green light theme by default, an optional dark theme, and responsive layouts.

## Local development

Use Node.js 20 or newer.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Keep your API configuration in `.env.local`. The backend is maintained in the separate `fsocietypk-backend` repository.

## Production

```bash
npm run build
npm run preview
```

Serve the generated `dist` directory with SPA fallback to `index.html`. The Vercel configuration preserves frontend routing. Deploy the matching backend for live username availability, staff permissions, publication emails, and backend diagnostics; the frontend cannot provide those server endpoints on its own.

## Interface

- Tinted cards, restrained hover motion, clear focus states, and reduced-motion support.
- Compact interactive auth companions with field/pointer gaze, password emotions, and cross-character privacy hands.
- Signup-only username ideas and debounced live availability feedback.
- A local SQL-input prank after submission, with no authentication or admin access.
- A sandboxed fluid background on normal login/signup forms only, with GPU and reduced-motion fallbacks.
- A skippable two-scene public-landing intro, once per tab session.
- Professional loading states and a dedicated 404 with recovery links.
- A staff-only administration workspace with role-specific navigation and server-enforced permissions.

The original organization logo and community links are preserved.

## Team subdomain

The standalone team page previews at `/about.html` and is prepared for
`about.fsocietypk.tech`. Administrators manage team details, members, social links
and CTF certificates at `/admin/team`. Certificate files live in R2; metadata
lives in MongoDB. See [team management and domain setup](docs/TEAM_SITE.md).

## Documentation

- [Design system and current visual direction](docs/DESIGN.md)
- [Auth API, loading, and fluid integration](docs/AUTH_UI.md)
- [Admin permissions, emails, EC2 diagnostics, and deployment](docs/ADMIN_PORTAL.md)
- [Product notes](docs/PRODUCT.md)
- [Browser verification](tests/README.md)

The fluid adaptation retains its [upstream MIT license](public/auth-fluid/LICENSE). Regenerate it with `python3 scripts/prepare-auth-fluid.py /path/to/WebGL-Fluid-Simulation` when the supplied upstream repo is available.

## Verification

The production build includes TypeScript checks. Browser suites use intercepted API fixtures; they do not create production accounts or send real emails. Tests cover auth/OTP, availability races and failures, real WebGL pixels and cleanup, responsive layouts, accessibility, staff workflows, challenge progress, and prank timing.
