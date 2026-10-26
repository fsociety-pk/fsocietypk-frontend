# Fsociety PK

Cybersecurity learning platform for beginning and experienced CTF players. Users create an account, verify email, solve challenges, learn from writeups/resources, submit community content, and track their progress. Admins manage community content and users.

Current frontend brief: a consistent color system throughout public/member/admin pages; light mode with colorful accents by default, optional dark mode; compact login/signup forms and playful characters that respond to typing and password visibility. Preserve the existing product behavior and supplied brand artwork.

Primary outcomes: get into the workspace, find a challenge, and continue learning. Interface modes: workspace/auth Operate; landing Persuade. Responsive and keyboard-accessible forms take priority over decorative content. Allow natural reflow for zoom, validation, and on-screen keyboards.

Latest preference: preserve the original detailed masked-figure logo; use green as the main accent with white/light default. Add no flag imagery. Characters follow the active email/username field, look away during masked password entry, and lift attached hands over their eyes when the password is revealed.

## Dedicated administration and staff operations

The administration portal is separate from the member app. Staff perform platform
work instead of appearing as players. Administrators assign administrator,
manager, moderator, editor, and analyst roles; each role has a fixed permission set
enforced by the backend. Administrators also monitor the EC2/backend host and
email delivery. New published challenges email active members at their registered
addresses; announcements notify and email their selected member/staff audience.
Preserve light/default and dark themes, the original logo, and the shared green
palette. Role changes revoke affected sessions; the primary/current administrator
cannot be demoted through the role editor. Deployment and SMTP configuration are
required before these local changes affect the live environment.

Auth artwork: retain the three clay cartoon companions. Revealed passwords close their eyes and turn their heads away; masked entry looks upward. The fsociety-person replacement and hands-over-eyes gesture were removed at the user’s request. Field/cursor gaze, progress feedback, and a greeting response remain available.

Final reference: use the compact original cartoon group (approximately 100px wide), centered below the speech bubble. The user chose this over both the masked person and larger shaded cartoon treatment.

Latest auth direction: remove torso dots and keep the compact coral/green/lilac crew. Friends cover each other’s eyes with connected arms when the password is revealed. The green friend covers its neighbours; the side friends cover one green eye each. Shared loading uses a logo-free animated indicator with relevant status copy. Unknown URLs have a dedicated 404 page with public/admin recovery links instead of silently redirecting. Loading and 404 do not use greetings.

Latest refinements: differentiated tinted cards with restrained hover motion; an unchanged original logo on a contrasting base in dark mode; signup-only username ideas with no availability promise; score-driven sad/happy cartoon expressions; SQL jokes triggered only after identity-field submission, without cartoons on the prank page. The public landing page has a skippable two-scene black/white introduction once per tab session. Direct account routes and reduced-motion visitors bypass it.

Latest changes: username availability is now checked live on signup, in addition to format validation and suggestions. Old checks are canceled when typing changes, known taken names are flagged, and a checker outage does not block registration. Loading uses a professional animated indicator without a logo. The supplied WebGL fluid repo provides a local, decorative login/signup-only background, with reduced-motion and GPU-unavailable fallbacks. Backend/frontend deployment requirements are documented in AUTH_UI.md.

Light-theme fluid visibility now uses full opacity, stronger saturation, and a less restrictive center mask. Dark-theme rendering keeps its previous values.
