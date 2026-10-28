import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const surfaces = '.challenge-card,.action-card,.project-card,.resource-card,.podium-card,.admin-stat,.admin-tool,.discipline-card';

/** Shared progressive enhancement: no React renders on pointer movement.
 * Only browsing cards tilt; forms, text, tables and task panels remain stable. */
export function useSurfaceMotion() {
  const { pathname } = useLocation();
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    let active: HTMLElement | null = null;
    let rect: DOMRect | null = null;
    let frame = 0;
    let scanFrame = 0;
    const seen = new WeakSet<Element>();
    const decorated = new Set<HTMLElement>();
    const reset = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      active?.removeAttribute('data-surface-active');
      active?.style.removeProperty('--surface-rx');
      active?.style.removeProperty('--surface-ry');
      active = null;
      rect = null;
    };
    const intersection = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(entries => {
      let index = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        intersection?.unobserve(entry.target);
        if (preference.matches) continue;
        const target = entry.target as HTMLElement;
        target.style.setProperty('--surface-delay', `${Math.min(index++, 4) * 45}ms`);
        target.classList.add('surface-arrived');
      }
    }, { threshold: .08 }) : null;
    const scan = () => {
      scanFrame = 0;
      document.querySelectorAll<HTMLElement>(surfaces).forEach(element => {
        if (seen.has(element) || !element.closest('main')) return;
        seen.add(element);
        decorated.add(element);
        element.setAttribute('data-surface-motion', '');
        intersection?.observe(element);
      });
    };
    const scheduleScan = () => { if (!scanFrame) scanFrame = requestAnimationFrame(scan); };
    const mutation = new MutationObserver(scheduleScan);
    mutation.observe(document.body, { childList: true, subtree: true });
    scan();
    const move = (event: PointerEvent) => {
      if (preference.matches || !finePointer.matches || event.pointerType === 'touch') return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-surface-motion]') : null;
      if (target !== active) {
        reset();
        if (!target) return;
        active = target;
        rect = target.getBoundingClientRect();
        target.classList.remove('surface-arrived');
        target.setAttribute('data-surface-active', '');
      }
      if (!active || !rect) return;
      const element = active;
      const x = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
      const y = Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5));
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        element.style.setProperty('--surface-rx', `${-y * 5}deg`);
        element.style.setProperty('--surface-ry', `${x * 5}deg`);
        frame = 0;
      });
    };
    const finishArrival = (event: AnimationEvent) => {
      if (event.animationName === 'surface-arrival' && event.target instanceof Element) event.target.classList.remove('surface-arrived');
    };
    document.addEventListener('animationend', finishArrival);
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    window.addEventListener('scroll', reset, { passive: true, capture: true });
    window.addEventListener('resize', reset, { passive: true });
    preference.addEventListener('change', reset);
    return () => {
      reset();
      if (scanFrame) cancelAnimationFrame(scanFrame);
      mutation.disconnect();
      intersection?.disconnect();
      document.removeEventListener('animationend', finishArrival);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
      window.removeEventListener('scroll', reset, true);
      window.removeEventListener('resize', reset);
      preference.removeEventListener('change', reset);
      decorated.forEach(element => {
        element.removeAttribute('data-surface-motion');
        element.classList.remove('surface-arrived');
        element.style.removeProperty('--surface-delay');
      });
    };
  }, [pathname]);
}
