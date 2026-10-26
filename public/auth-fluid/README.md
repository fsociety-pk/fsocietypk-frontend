# Auth fluid background

Adapted from the user-supplied `WebGL-Fluid-Simulation/script.js`, by Pavel Dobryakov (MIT; see LICENSE). The source repository is unchanged. Regenerate the local adaptation with `python3 scripts/prepare-auth-fluid.py` from the frontend repository root (pass an upstream source directory as the first argument if needed).

The local copy keeps the fluid solver/shaders and removes the demo GUI, analytics, promotions, screenshots, image fetches, and keyboard/touch handlers. Rendering is limited to 30fps with capped pixel ratio, lower simulation resolutions, and no bloom/sunrays. A sandboxed frame receives only normalized pointer coordinates and visibility state. No credentials or form values reach it. Removing the frame disposes its document and GPU context. Unsupported WebGL uses a quiet static backdrop; reduced motion does not mount the frame.

Upstream source SHA-256: `291d86de38ea23b8fb63d1879afeea77e9a4556900bbd67e13bc1d5ea007ce4e`
