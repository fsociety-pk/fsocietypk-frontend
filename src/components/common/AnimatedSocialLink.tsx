import { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { TeamProfileData } from '../../data/team';
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference';
import SocialBrandIcon from './SocialBrandIcon';
import '../../styles/animated-social-link.css';

type SocialLink = TeamProfileData['socials'][number];
const EASE = 'cubic-bezier(.16,1,.3,1)';

/** The Jitter badge choreography, applied without changing the link's hit area. */
export default function AnimatedSocialLink({ social, index }: { social: SocialLink; index: number }) {
  const root = useRef<HTMLAnchorElement>(null);
  const played = useRef(false);
  const reveal = useRef<(() => void) | null>(null);
  const finish = useRef<(() => void) | null>(null);
  const reduced = useReducedMotionPreference();

  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    if (reduced || played.current || typeof node.animate !== 'function') {
      if (reduced) played.current = true;
      return;
    }
    const shell = node.querySelector<HTMLElement>('.social-pill-surface')!;
    const icon = node.querySelector<HTMLElement>('.social-handle-icon')!;
    const text = node.querySelector<HTMLElement>('.social-handle-copy')!;
    const arrow = node.querySelector<HTMLElement>('.social-handle-arrow')!;
    let animations: Animation[] = [];
    let disposed = false;
    let observer: IntersectionObserver | undefined;
    const complete = () => {
      played.current = true; observer?.disconnect();
      animations.forEach(animation => animation.cancel()); animations = [];
      node.dataset.socialMotion = 'complete';
    };
    const play = () => {
      if (played.current || disposed) return;
      played.current = true; observer?.disconnect();
      const width = node.clientWidth;
      const inset = Math.max(0, (width - node.clientHeight) / 2);
      const offset = Math.max(0, width / 2 - icon.offsetLeft - icon.offsetWidth / 2);
      const delay = Math.min(index, 5) * 100;
      const collapsed = `inset(0 ${inset}px 0 ${inset}px round 24px)`;
      node.dataset.socialMotion = 'playing';
      animations = [
        shell.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.025)', offset: .78 }, { transform: 'scale(1)' }], { duration: 320, delay, easing: EASE, fill: 'both' }),
        shell.animate([{ clipPath: collapsed }, { clipPath: 'inset(0 0px 0 0px round 24px)' }], { duration: 600, delay: delay + 280, easing: EASE, fill: 'both' }),
        icon.animate([{ transform: `translateX(${offset}px) scale(0)` }, { transform: `translateX(${offset}px) scale(1)` }], { duration: 300, delay: delay + 80, easing: EASE, fill: 'both' }),
        icon.animate([{ translate: '0px 0px' }, { translate: `${-offset}px 0px` }], { duration: 600, delay: delay + 280, easing: EASE, fill: 'both' }),
        text.animate([{ opacity: 0, transform: 'translateX(16px)', clipPath: 'inset(0 100% 0 0)' }, { opacity: 1, transform: 'translateX(0)', clipPath: 'inset(0 0% 0 0)' }], { duration: 500, delay: delay + 380, easing: EASE, fill: 'both' }),
        arrow.animate([{ opacity: 0, transform: 'translateX(-6px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 250, delay: delay + 600, easing: EASE, fill: 'both' }),
      ];
      void Promise.all(animations.map(animation => animation.finished)).then(() => { if (!disposed) complete(); }).catch(() => undefined);
    };
    reveal.current = play; finish.current = complete;
    node.dataset.socialMotion = 'pending';
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) play(); }, { threshold: .35, rootMargin: '0px 0px -12px 0px' });
      observer.observe(node);
    } else complete();
    let previousWidth = node.clientWidth;
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
      const width = node.clientWidth;
      if (node.dataset.socialMotion === 'playing' && Math.abs(width - previousWidth) > 1) complete();
      previousWidth = width;
    });
    resize?.observe(node);
    return () => {
      disposed = true; observer?.disconnect(); resize?.disconnect(); animations.forEach(animation => animation.cancel());
      reveal.current = null; finish.current = null; delete node.dataset.socialMotion;
    };
  }, [social.url, index, reduced]);

  return <a ref={root} className="social-handle" data-social-kind={social.kind} href={social.url} aria-label={`${social.label} ${social.detail}`.trim()} {...(social.url.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })} onPointerEnter={() => reveal.current?.()} onFocus={() => finish.current?.()}>
    <span className="social-pill-surface" aria-hidden="true" />
    <span className="social-handle-icon"><SocialBrandIcon kind={social.kind} /></span>
    <span className="social-handle-copy"><strong>{social.label}</strong>{social.detail && <span>{social.detail}</span>}</span>
    <ArrowUpRight className="social-handle-arrow" size={18} aria-hidden="true" />
  </a>;
}
