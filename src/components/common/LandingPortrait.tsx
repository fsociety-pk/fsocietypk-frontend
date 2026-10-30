import { useEffect, useRef } from 'react';
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference';

/** Both planes share a real perspective scene: the title passes in front of
 * and behind the transparent portrait, then returns to its original position. */
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
    let animation: Animation | undefined;
    node.dataset.orbit = reduced ? 'reduced' : 'preparing';
    if (reduced) return;

    const start = async () => {
      // Do not spend the opening orbit animating an unloaded font or portrait.
      await Promise.allSettled([document.fonts.load('100px Anton'), image.decode()]);
      if (cancelled) return;
      const width = node.clientWidth;
      const radius = Math.min(width * .22, 270);
      const depth = Math.min(width * .14, 180);
      const frames: Keyframe[] = Array.from({ length: 121 }, (_, i) => {
        const progress = i / 120;
        const travel = (1 - Math.cos(progress * Math.PI)) / 2;
        const angle = travel * Math.PI * 4;
        const settle = Math.min(1, (1 - progress) / .12);
        const x = Math.sin(angle) * radius;
        const z = -Math.cos(angle) * depth * settle - 1;
        const yaw = Math.sin(angle) * -62;
        const pitch = Math.sin(angle * 2) * 4;
        return { offset: progress, transform: `translate3d(${x}px, ${Math.sin(angle) * -14}px, ${z}px) rotateY(${yaw}deg) rotateX(${pitch}deg)` };
      });
      node.dataset.orbit = 'running';
      animation = heading.animate(frames, { duration: 5200, fill: 'none', easing: 'linear' });
      animation.onfinish = () => { node.dataset.orbit = 'settled'; };
    };
    void start();
    const visibility = () => {
      if (document.hidden) animation?.pause();
      else if (animation?.playState === 'paused') animation.play();
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancelled = true;
      animation?.cancel();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [reduced]);

  return (
    <div className="hero-orbit-scene" ref={scene}>
      <h1 className="hero-name" ref={title} aria-label="Fsociety Pakistan">
        <span className="hero-name-line" aria-hidden="true">FSOCIETY</span>
        <span className="hero-name-line" aria-hidden="true">PAKISTAN</span>
      </h1>
      <figure className="hero-portrait">
        <img ref={portrait} src="/brand/masked-portrait.png" alt="Fsociety masked figure in a black top hat and suit" width="941" height="1672" loading="eager" fetchPriority="high" decoding="async" />
      </figure>
    </div>
  );
}
