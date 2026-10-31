# Member dossier

The profile presents identity, earned achievements and the next level in that
order. Direction: confident, intriguing, precise, welcoming. Essence: **emerald
member dossier**. The owner's screenshot and existing Fsociety masked identity
are the references. The prior flat green banner needed more character.

The signature is a framed portrait beside a `whoami` reveal, with real progress.
A compact terminal bar identifies the community. A circular milestone meter and
separate elevated statistic cards establish hierarchy; underlined tabs lead to records
and controls. Avoid invented ranks, fake online status, random code feeds and
flashing backgrounds.

## Visual contract

Use existing Onest for names, records and controls, with local system monospace
only for terminal chrome. Type steps: 11, 12, 14, 20, 28, 52px; names adapt down
to 32px. Follow the shared 4px spacing scale. Shared 16px panel radius, 6/12px
internal controls/framing. Content cards use soft elevation without perimeter
outlines. Keep real boundaries on inputs and the portrait's corner framing.

Profile tokens in `src/styles/profile-refresh.css`:

| Role | Light | Dark |
| --- | --- | --- |
| Identity / records | White shared card | Slate shared card |
| Level inset | `oklch(96% .018 164)` | Shared elevated slate with 6% brand tint |
| Terminal chrome | `oklch(98% .005 245)` | Shared elevated slate |
| Main / supporting text | Shared ink / muted | Shared ink / muted |
| Accent | Shared deep emerald | Shared mint |
| Statistic surfaces | Card + 3.5% semantic tint | Card + 3.5% semantic tint |

The entire profile follows the selected theme. White cards stand above the pale
slate canvas in light mode; raised slate cards sit above the deep canvas in dark
mode. Statistics are separated by 16px gaps, reduced to 12px on phones. Badges
and reading panels share soft elevation instead of outline-only separation.
Below 900px the milestone moves beneath identity; below 600px
stats form two columns; below 400px portrait and milestone become compact. Long names wrap
without losing their accessible names. Tabs scroll within their own row.

## Motion and behavior

Portrait, identity and milestone enter over 500ms with 70ms offsets. The existing
850ms username decode can be replayed with its accessible button; decoding ink
is clipped to avoid overlapping narrow character slots. A portrait scan follows
the reveal. The ring draws once to the actual score's fraction of 1,000; the
linear meter exposes the same value accessibly. Stats enter over 440ms with a
short stagger. These sequences settle with no idle loop. Previously requested
badge shines remain independent.

Reduced motion disables entrances, scan and ring drawing and resolves names
immediately. Keep keyboard tabs, focus, permissions and upload save/cancel.

## Default avatar and provenance

`MemberAvatar.tsx` prefers uploaded images, then uses
`public/brand/default-hacker-avatar.webp` for missing or failed images. Own and
public profiles and the account-menu thumbnail share that fallback. No default
is written to anyone's account. The built-in imagegen tool generated the artwork;
the delivered asset is a 512px WebP. Final prompt:

> Use case: stylized-concept. Asset type: default profile avatar for Fsociety PK, a cybersecurity challenge community. Create a premium square portrait of a mysterious anonymous hacker: a charcoal hood, a simple angular pale porcelain mask with narrow dark eye slits, face partly in shadow, an emerald green rim light at one side and soft neutral light from the front. Head and shoulders centered, head occupies most of frame, recognisable at 40 pixels. Style: crafted editorial 3D clay and matte ceramic, sophisticated restrained material texture, bold silhouette, realistic folds in heavy cloth. Mood: quietly confident, inviting and intriguing, hacker identity. Solid very dark forest background, no environment. Palette: charcoal hood, warm ivory mask, muted emerald highlights. No text, no typography, no logo, no code, no circuitry, no neon glow, no busy detail, no weapons, no computer. One character, front facing, square crop with comfortable headroom. This is the finished standalone avatar artwork, not a UI mockup.

## Verification

Production build plus `tests/browser-profile-refresh.js` with intercepted browser
fixtures: saved photos, upload/cancel, editing, badge controls, actual statistics,
ring animation, light/dark layouts, long names, default/broken-image recovery,
privacy, API failures and live reduced motion. No writes to real accounts.

October 31 review: build/type checks, 64 profile checks and 54 badge checks
passed with mock APIs. Reviewed desktop light and phone dark previews. The
dossier composition, custom portrait, Onest/monospace pairing and emerald
materials match the brief. Final visual audit: 8/10; no unintended page overflow,
obscured content, fake activity, neon haze or stacked shadow/outline materials.
Small decorative portrait captions are omitted on phones; biography stays 14px.
The ring uses a small SVG stroke reveal; other new motion uses transform/opacity.

Theme/elevation refinement: build passed and 70 profile checks passed. The added
checks confirm the white/slate identity surfaces, different page/level materials,
separate metric spacing, and elevated cards without perimeter outlines in both
themes. Desktop and phone screenshots reviewed in light and dark mode.
