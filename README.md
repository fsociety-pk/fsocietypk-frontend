# FsocietyPK — Signal / Redesign

A dark, Mr. Robot inspired redesign of the existing FsocietyPK frontend.

## Run locally

Use Node.js 20 or newer.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Keep your existing API values in `.env.local`. The original API service methods, routes, cookie authentication, flag submission, and admin features are retained. The backend is a separate service and is not included in this archive.

## Production

```bash
npm run build
npm run preview
```

The `dist` folder is the production build. Serve it through a web server with SPA fallback to `index.html`. The included Vercel configuration preserves the original deployment routing.

## Design changes

- New charcoal, cream, and red design system across shared app styles.
- Rebuilt responsive navigation with account menu and mobile drawer.
- New homepage with an animated signal map, terminal illustration, scrolling discipline strip, and scroll reveals.
- Rebuilt login and signup screens with proper labels, validation, and password visibility controls.
- New challenge cards, filters, loading states, and flag-sequence progress.
- New podium, standings table, period filters, and operator search.
- Route-level code splitting, self-hosted fonts, and reduced-motion support.
- Original organization logo and community links retained.

The signal map is a decorative training illustration. Challenge and leaderboard data continue to come from the existing backend. No sample operators or challenges are shipped in the app.

## Verification

The TypeScript check and production build pass. Browser checks cover desktop/mobile layouts, navigation, form validation, challenge filtering, and ranking search using temporary mocked API responses. Live account creation, authentication, flag submission, and backend admin actions were not exercised.

Local environment files, Git history, and `node_modules` are not included. Install dependencies with `npm ci`.
