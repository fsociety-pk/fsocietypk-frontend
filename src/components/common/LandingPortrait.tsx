import { useEffect, useRef } from 'react';
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference';

const duration = 6400;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

/** Each glyph sits on the tangent of the same elliptical cylinder. Unlike a
 * swivelling billboard, the letters describe complete circles around the figure. */
export default function LandingPortrait() {
  const scene = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const portrait = useRef<HTMLImageElement>(null);
  const reduced = useReducedMotionPreference();

  useEffect(() => {
    const node = scene.current;
    const heading = title.current;
    const image = portrait.current;
    if (!node || !heading || !image) return;
    let cancelled = false;
    let animations: Animation[] = [];
    let resize: ResizeObserver | undefined;
    let width = 0;
    let height = 0;
    node.dataset.orbit = reduced ? 'reduced' : 'preparing';
    if (reduced) return;

    const settle = () => {
      node.dataset.orbit = 'settled';
      animations.forEach(animation => animation.cancel());
      animations = [];
    };
    const animate = (time = 0, paused = document.hidden) => {
      animations.forEach(animation => animation.cancel());
      width = node.clientWidth;
      height = node.clientHeight;
      const radius = Math.min(width * .29, 380);
      const depth = Math.min(width * .17, 230);
      const glyphs = Array.from(heading.querySelectorAll<HTMLElement>('.hero-orbit-glyph'));
      // Read the untransformed typesetting once; no layout reads per frame.
      const metrics = glyphs.map(glyph => ({
        glyph,
        halfWidth: glyph.offsetWidth / 2,
        x: glyph.offsetLeft + glyph.offsetWidth / 2 - heading.clientWidth / 2,
        y: heading.offsetTop + glyph.parentElement!.offsetTop + glyph.offsetTop + glyph.offsetHeight / 2,
        row: glyph.parentElement === heading.lastElementChild ? 1 : 0,
      }));
      node.dataset.orbit = 'running';
      animations = metrics.map(({ glyph, halfWidth, x, y: restingY, row }) => {
        // The two words occupy opposite arcs of ONE ribbon while circling.
        // On landing, the ribbon opens into the original two separate lines.
        const phase = x / radius * .82 + row * Math.PI;
        const frames: Keyframe[] = Array.from({ length: 161 }, (_, i) => {
          const p = i / 160;
          const wrap = smooth(p / .12) * (1 - smooth((p - .84) / .16));
          const landing = smooth((p - .72) / .12);
          const turn = smooth((p - .06) / .78) * Math.PI * 4;
          const angle = turn + phase * wrap;
          const dx = (Math.sin(angle) * radius - x) * wrap;
          const y = (height * .51 - restingY + Math.cos(angle) * depth * .18) * wrap;
          const scale = 1 - .5 * wrap;
          // The continuous 0→720° tangent rotation is essential. Reducing this
          // to sin(angle) recreates the rejected left/right swivel.
          const yaw = turn * 180 / Math.PI + phase * 180 / Math.PI * wrap;
          // Move the last arc behind the portrait before opening the two lines.
          // Include the tilted glyph's front edge so it cannot cross the image
          // plane while flattening. This offset returns smoothly to zero.
          const frontEdge = Math.abs(Math.sin(yaw * Math.PI / 180)) * halfWidth * scale;
          const z = Math.cos(angle) * depth * wrap - landing * (depth * wrap + frontEdge + wrap);
          return {
            offset: p,
            transform: `translate3d(${dx}px,${y}px,${z}px) rotateY(${yaw}deg) scale(${scale})`,
            opacity: 1 - .3 * wrap * (1 - Math.cos(angle)) / 2,
          };
        });
        const animation = glyph.animate(frames, { duration, easing: 'linear', fill: 'none' });
        animation.currentTime = time;
        if (paused) animation.pause();
        return animation;
      });
      animations[0].onfinish = settle;
    };
    const start = async () => {
      await Promise.allSettled([document.fonts.load('100px Anton'), image.decode()]);
      if (cancelled) return;
      animate();
      resize = new ResizeObserver(() => {
        if (node.dataset.orbit !== 'running' || (width === node.clientWidth && height === node.clientHeight)) return;
        animate(Number(animations[0]?.currentTime || 0), animations[0]?.playState === 'paused');
      });
      resize.observe(node);
    };
    void start();
    const visibility = () => animations.forEach(animation => {
      if (document.hidden) animation.pause();
      else if (animation.playState === 'paused') animation.play();
    });
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancelled = true;
      animations.forEach(animation => animation.cancel());
      resize?.disconnect();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [reduced]);

  return (
    <div className="hero-orbit-scene" ref={scene}>
      <h1 className="hero-name" ref={title} aria-label="Fsociety Pakistan">
        {['FSOCIETY', 'PAKISTAN'].map(word => (
          <span className="hero-name-line" key={word} aria-hidden="true">
            {[...word].map((letter, i) => <span className="hero-orbit-glyph" key={i}>{letter}</span>)}
          </span>
        ))}
      </h1>
      <figure className="hero-portrait">
        <div className="hero-glitch">
          <img ref={portrait} className="portrait-original" src="/brand/masked-portrait.png" alt="Fsociety masked figure in a black top hat and suit" width="941" height="1672" loading="eager" fetchPriority="high" decoding="async" />
          {['top', 'middle', 'bottom'].map(slice => (
            <span key={slice} className={`portrait-glitch-slice glitch-slice-${slice}`} aria-hidden="true">
              <img src="/brand/masked-portrait.png" alt="" width="941" height="1672" decoding="async" />
            </span>
          ))}
        </div>
      </figure>
    </div>
  );
}
