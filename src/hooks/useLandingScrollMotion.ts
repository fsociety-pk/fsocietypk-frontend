import { useEffect, type RefObject } from 'react';

/** Reversible viewport fades. One batched read/write pass per scroll frame;
 * no React renders, and focus always reveals the complete reading block. */
export function useLandingScrollMotion(root: RefObject<HTMLElement>) {
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const blocks = Array.from(node.querySelectorAll<HTMLElement>('[data-landing-reveal]'));
    let frame = 0;
    const clear = () => blocks.forEach(block => {
      block.style.removeProperty('--reveal-opacity');
      block.style.removeProperty('--reveal-y');
    });
    const paint = () => {
      frame = 0;
      if (preference.matches) { clear(); return; }
      const height = window.innerHeight;
      const measurements = blocks.map(block => ({
        block,
        rect: block.getBoundingClientRect(),
        shift: parseFloat(block.style.getPropertyValue('--reveal-y')) || 0,
        focused: block.contains(document.activeElement) || !!block.closest('a:focus,button:focus'),
      }));
      measurements.forEach(({ block, rect, shift, focused }) => {
        // Remain fully readable through the center of the viewport. Fade only
        // while entering at the bottom or leaving above the top edge.
        const enter = Math.max(0, Math.min(1, (height - (rect.top - shift)) / Math.min(height * .22, 170)));
        const leave = Math.max(0, Math.min(1, (rect.bottom - shift) / Math.min(height * .16, 110)));
        block.style.setProperty('--reveal-opacity', String(focused ? 1 : Math.min(enter, leave)));
        block.style.setProperty('--reveal-y', `${focused ? 0 : (1 - enter) * 22 - (1 - leave) * 10}px`);
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    node.addEventListener('focusin', schedule);
    node.addEventListener('focusout', schedule);
    preference.addEventListener('change', schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(node);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      node.removeEventListener('focusin', schedule);
      node.removeEventListener('focusout', schedule);
      preference.removeEventListener('change', schedule);
      resize.disconnect();
      clear();
    };
  }, [root]);
}
