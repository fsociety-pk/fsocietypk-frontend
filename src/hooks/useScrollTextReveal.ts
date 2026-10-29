import { useEffect, type RefObject } from 'react';

/** Reveal reading blocks once, without splitting text or updating React on scroll. */
export function useScrollTextReveal(root: RefObject<HTMLElement>, selector = 'h1, h2, h3, p') {
  useEffect(() => {
    const node = root.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!node || preference.matches || typeof IntersectionObserver === 'undefined') return;

    const elements = Array.from(node.querySelectorAll<HTMLElement>(selector));
    const observer = new IntersectionObserver(entries => {
      let index = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        element.style.setProperty('--text-reveal-delay', `${Math.min(index++, 3) * 60}ms`);
        element.dataset.textReveal = 'visible';
        observer.unobserve(element);
      }
    }, { threshold: 0.2, rootMargin: '0px 0px -24px 0px' });

    elements.forEach(element => {
      element.dataset.textReveal = 'pending';
      observer.observe(element);
    });

    const clear = () => {
      observer.disconnect();
      elements.forEach(element => {
        delete element.dataset.textReveal;
        element.style.removeProperty('--text-reveal-delay');
      });
    };
    const onPreferenceChange = () => { if (preference.matches) clear(); };
    preference.addEventListener('change', onPreferenceChange);
    return () => {
      clear();
      preference.removeEventListener('change', onPreferenceChange);
    };
  }, [root, selector]);
}
