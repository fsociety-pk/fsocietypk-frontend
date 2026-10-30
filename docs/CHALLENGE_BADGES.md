# Challenge completion badges

Per-challenge certificate/PDF/LinkedIn controls and the profile's five-challenge
certificate gate are replaced with earned challenge badges. The team's uploaded
competition certificates and certificate shelf are separate and unchanged.

## Art direction and assets

The concept board was generated with the built-in image-generation tool and is
saved at `docs/design-assets/challenge-badges-concept.png`. Runtime assets are
deterministic SVGs in `public/brand/badges/`, rebuilt with
`node scripts/generate-challenge-badges.mjs`. No generated bitmap is cropped or
used as a profile badge. Exact vector geometry, lettering, category symbols and
controlled nickel/enamel material gradients keep the emblems sharp at all sizes.
The source palette/symbols are in `src/data/challengeBadgeDesigns.json`.
The exact built-in generation prompt is preserved in
`docs/design-assets/challenge-badges-prompt.txt`.

The concept prompt requested a premium professional enamel-pin system on a
neutral presentation board: a consistent nickel-edged angular medallion,
restrained category-colored enamel, a clear category symbol, accurate category
lettering and a small completion check. It explicitly excluded neon, glow,
lens flare, fake circuits, mascots and decorative sci-fi detail. Categories:
WEB/cobalt/globe; CRYPTO/amber/key-lock; PWN/vermilion/chip;
REV/amethyst/reversing arrows; FORENSICS/teal/document-magnifier;
OSINT/forest/compass; STEGO/rose/hidden image; NETWORK/azure/linked nodes;
MOBILE/indigo/phone; MISC/slate/faceted diamond. Each mark reads COMPLETED.
Final SVGs follow that direction with exact text and scalable custom paths.

## Earning and profile behavior

The backend profile projection returns `earnedBadges` for every distinct full
challenge completion backed by persisted submissions. It includes the stable
owner/challenge ID, challenge name, category, difficulty, actual awarded points
and recorded completion time. The collection is independent of the recent
20-row solve-history window. Older completions automatically receive badges;
partial progress receives none. Existing private/public profile visibility is
respected, and the strict profile-update schema rejects client-supplied awards.

Own profiles feature a four-badge preview and a searchable/filterable Badges tab.
Public profiles show the same earned collection. Larger collections show 24
badges initially, with Show more. A public badge can be opened through
`/profile/:username?badge=:challengeId`. Private collections offer no public
copy-link action. During paired deployment, older API responses can fall back to
verified server solve history; they never use browser progress/storage.

Details expose the actual owner/date/category/difficulty/points. Download exports
a self-contained SVG with the emblem, challenge name, owner, completion date and
metadata. User-provided text is XML-escaped. The export is a visual achievement,
not a cryptographically signed credential.

## Completion sequence

Only a full completion starts the celebration. The sequence is: a finite confetti
burst and check (0–700ms), an animated increase to the actual points returned by
the solve API (700–1550ms), then at 1750ms:

> Challenge successfully completed
> Your badge has been added to your profile.

The final state shows the earned emblem, points, View badge and My badges.
Details replace this dialog only after the user clicks View badge. Revisiting a
solved challenge does not replay it. Close/Escape cancels timers and restores
focus. Reduced motion skips both confetti/counting and shows the final message
immediately. Decorations are hidden from assistive technology; status text is
announced politely. No audio, looping animation, or extra follow-up popup.

## Validation

`npm run build`, then prepared browser fixtures and `tests/browser-badges.js`.
The backend suite is `npm run build && node tests/challenge-badges.cjs`.
Tests use mocked HTTP/WebSocket/model data and do not award real users badges.
Profile and challenge-progress suites also cover the replacement award controls.

Final validation: both builds passed; 48 badge/celebration browser checks passed,
along with the 32-check challenge-progress suite, community workflows, profile
editing/avatar persistence, badge export and password-change regressions. Ten
standalone assets and downloaded owner/challenge/date metadata passed XML checks.
Reviewed desktop/phone profile galleries and completion dialogs in both themes.
