from pathlib import Path
import re, hashlib, sys
ROOT = Path(__file__).resolve().parents[1]
UPSTREAM = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT.parent / 'WebGL-Fluid-Simulation'
source=(UPSTREAM / 'script.js').read_text()
license=(UPSTREAM / 'LICENSE').read_text()
s=source[:source.index("'use strict';")]+"\n'use strict';\n(() => { try {\n"+source[source.index('// Simulation section'):]
s=s.replace("const canvas = document.getElementsByTagName('canvas')[0];", "const canvas = document.getElementById('fluid-canvas');\nlet stopped = false, frameId = 0, lastFrame = 0, lastAmbient = 0, frameCount = 0;")
s=s[:s.index('function startGUI ()')]+s[s.index('function isMobile ()'):]
s=s[:s.index('function captureScreenshot ()')]+s[s.index('class Material'):]
s=s.replace('startGUI();','')
s=re.sub(r"^\s*ga\([^\n]*\);\n",'\n',s,flags=re.M)
s=s.replace("    const isWebGL2 = !!gl;", "    const isWebGL2 = !!gl;")
s=s.replace("    let halfFloat;", "    if (!gl) throw new Error('WebGL unavailable');\n    let halfFloat;")
s=s.replace("    gl.clearColor(0.0, 0.0, 0.0, 1.0);", "    if (!isWebGL2 && !halfFloat) throw new Error('Half-float textures unavailable');\n    gl.clearColor(0.0, 0.0, 0.0, 0.0);")
s=s.replace("    return {\n        gl,", "    if (!formatRGBA || !formatRG || !formatR) throw new Error('Render textures unavailable');\n    return {\n        gl,")
for old,new in [('SIM_RESOLUTION: 128','SIM_RESOLUTION: 64'),('DYE_RESOLUTION: 1024','DYE_RESOLUTION: 512'),('PRESSURE_ITERATIONS: 20','PRESSURE_ITERATIONS: 10'),('CURL: 30','CURL: 18'),('SPLAT_FORCE: 6000','SPLAT_FORCE: 2300'),('SHADING: true','SHADING: false'),('COLORFUL: true','COLORFUL: false'),('TRANSPARENT: false','TRANSPARENT: true'),('BLOOM: true','BLOOM: false'),('SUNRAYS: true','SUNRAYS: false')]:
 assert old in s,old;s=s.replace(old,new)
s=s.replace('config.DYE_RESOLUTION = 512;', 'config.DYE_RESOLUTION = 256;')
s=s.replace("let ditheringTexture = createTextureAsync('LDR_LLL1_0.png');", 'let ditheringTexture = createSolidTexture();')
s=s.replace('function createTextureAsync (url)', 'function createSolidTexture ()')
s=re.sub(r'    let image = new Image\(\);[\s\S]*?    image.src = url;\n', '', s)
s=s.replace('multipleSplats(parseInt(Math.random() * 20) + 5);', 'multipleSplats(6);')
old='''    const dt = calcDeltaTime();
    if (resizeCanvas())'''
new='''    if (stopped) return;
    frameId = requestAnimationFrame(update);
    const now = performance.now();
    if (document.hidden || config.PAUSED || now - lastFrame < 1000 / 30) return;
    lastFrame = now;
    const dt = calcDeltaTime();
    if (now - lastAmbient > 6000) {
        const left = Math.random() > .5;
        splat(left ? .08 : .92, .2 + Math.random() * .6, left ? 100 : -100, 60, generateColor());
        lastAmbient = now;
    }
    if (resizeCanvas())'''
assert old in s;s=s.replace(old,new).replace('    requestAnimationFrame(update);\n','')
s=s.replace('    render(null);\n}', '    render(null);\n    document.body.dataset.frames = String(++frameCount);\n}')
s=s.replace('''    if (target == null && config.TRANSPARENT)
        drawCheckerboard(target);''', '''    if (target == null && config.TRANSPARENT) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }''')
s=s[:s.index("canvas.addEventListener('mousedown'")]+s[s.index('function updatePointerDownData'):]
start=s.index('function generateColor ()');end=s.index('function HSVtoRGB',start)
s=s[:start]+'''function generateColor () {
    const palette = [{ r: .06, g: .16, b: .11 }, { r: .12, g: .08, b: .18 }, { r: .04, g: .13, b: .17 }];
    return { ...palette[Math.floor(Math.random() * palette.length)] };
}

'''+s[end:]
s=s.replace('let pixelRatio = window.devicePixelRatio || 1;', 'let pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);')
s=s.replace('    initBloomFramebuffers();\n    initSunraysFramebuffers();', '    if (config.BLOOM) initBloomFramebuffers();\n    if (config.SUNRAYS) initSunraysFramebuffers();')
# Release transient pressure fields on resize rather than retaining their GPU textures.
s=s.replace('    divergence = createFBO', '''    for (const old of [divergence, curl, pressure?.read, pressure?.write]) {
        if (old) { gl.deleteTexture(old.texture); gl.deleteFramebuffer(old.fbo); }
    }
    divergence = createFBO''')
s=s.replace('    target.write = createFBO(w, h,', '    gl.deleteTexture(target.write.texture); gl.deleteFramebuffer(target.write.fbo);\n    target.write = createFBO(w, h,')
# resizeFBO is a copy operation; its old target is no longer used.
s=s.replace('    return newFBO;', '    gl.deleteTexture(target.texture); gl.deleteFramebuffer(target.fbo);\n    return newFBO;')
s+='''
const channel = 'fsociety-auth-fluid-v1';
const ready = () => parent.postMessage({ channel, ready: true }, '*');
window.addEventListener('message', event => {
    if (event.source !== parent || event.data?.channel !== channel) return;
    const data = event.data;
    if (typeof data.paused === 'boolean') config.PAUSED = data.paused;
    if (data.pointer && Number.isFinite(data.x) && Number.isFinite(data.y) && data.x >= 0 && data.x <= 1 && data.y >= 0 && data.y <= 1) {
        const p = pointers[0];
        if (!p.down) updatePointerDownData(p, -1, data.x * canvas.width, data.y * canvas.height);
        else updatePointerMoveData(p, data.x * canvas.width, data.y * canvas.height);
    }
    if (data.init) ready();
});
canvas.addEventListener('webglcontextlost', () => {
    stopped = true; cancelAnimationFrame(frameId);
    parent.postMessage({ channel, ready: false }, '*');
});
window.addEventListener('pagehide', () => {
    stopped = true; cancelAnimationFrame(frameId);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
}, { once: true });
document.body.dataset.engine = 'webgl';
ready();
} catch {
    document.body.dataset.engine = 'unavailable';
    document.getElementById('fluid-canvas')?.remove();
    parent.postMessage({ channel: 'fsociety-auth-fluid-v1', ready: false }, '*');
} })();
'''
assert 'ga(' not in s and 'window.open' not in s and 'new Image' not in s
assert "addEventListener('keydown'" not in s and 'dat.GUI' not in s
out=ROOT / 'public/auth-fluid';out.mkdir(parents=True,exist_ok=True);out.joinpath('simulation.js').write_text(s);out.joinpath('LICENSE').write_text(license)
out.joinpath('README.md').write_text('''# Auth fluid background

Adapted from the user-supplied `WebGL-Fluid-Simulation/script.js`, by Pavel Dobryakov (MIT; see LICENSE). The source repository is unchanged. Regenerate the local adaptation with `python3 scripts/prepare-auth-fluid.py` from the frontend repository root (pass an upstream source directory as the first argument if needed).

The local copy keeps the fluid solver/shaders and removes the demo GUI, analytics, promotions, screenshots, image fetches, and keyboard/touch handlers. Rendering is limited to 30fps with capped pixel ratio, lower simulation resolutions, and no bloom/sunrays. A sandboxed frame receives only normalized pointer coordinates and visibility state. No credentials or form values reach it. Removing the frame disposes its document and GPU context. Unsupported WebGL uses a quiet static backdrop; reduced motion does not mount the frame.

Upstream source SHA-256: `'''+hashlib.sha256(source.encode()).hexdigest()+'`\n')
