import { useEffect, useRef, type RefObject } from 'react';

export interface CertificateShelfController {
  step: (direction: number) => void;
  select: (index: number) => void;
  choose: (virtual: number) => void;
  open: () => void;
  setLocked: (locked: boolean) => void;
}
const mod = (value: number, length: number) => ((value % length) + length) % length;
const smoothstep = (value: number) => value * value * (3 - 2 * value);

/** One demand-driven frame loop; React updates only when the selected certificate changes. */
export function useCertificateShelf({ viewport, count, reduced, onActive, onOpen }: {
  viewport: RefObject<HTMLDivElement>; count: number; reduced: boolean;
  onActive: (index: number, direction: number) => void; onOpen: (index: number, cover: DOMRect) => void;
}) {
  const controller = useRef<CertificateShelfController | null>(null);
  const resumeIndex = useRef(0);
  const callbacks = useRef({ onActive, onOpen });
  callbacks.current = { onActive, onOpen };
  useEffect(() => {
    const element = viewport.current;
    if (!element || !count) return;
    const node: HTMLDivElement = element;
    const tapes = Array.from(node.querySelectorAll<HTMLElement>('.certificate-tape'));
    const cursor = node.querySelector<HTMLElement>('.certificate-shelf-cursor');
    const ring = node.querySelector<HTMLButtonElement>('.certificate-cover-open-ring');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const copies = count > 1 ? 3 : 1;
    const period = count * copies;
    let active = Math.min(resumeIndex.current, count - 1);
    let s = (count > 1 ? count : 0) + active, target = s, previous = 0;
    let frame = 0, wheelTimer: ReturnType<typeof setTimeout> | undefined;
    let box = node.getBoundingClientRect(), height = 300, spine = 50, depth = 160, gap = 9;
    let measureNeeded = true, visible = true, locked = false;
    let pointerX = box.width / 2, pointerY = box.height / 2, cursorX = pointerX, cursorY = pointerY;
    let tiltX = 0, tiltY = 0, hovered = -1, inside = false;
    let down: { x: number; y: number; target: number; pointer: number } | null = null;
    let dragging = false, suppressClickUntil = 0;
    const lifts = tapes.map(() => 0);
    const relative = (index: number) => mod(index - s + period / 2, period) - period / 2;
    const wake = () => { if (!frame && visible && !document.hidden && !locked) frame = requestAnimationFrame(tick); };
    const measure = () => {
      box = node.getBoundingClientRect();
      // Derive from the actual stage layout. Hidden probes can report transient
      // sizes during theme/layout changes and leave the 3D faces out of scale.
      height = Math.max(180, node.clientHeight - (matchMedia('(max-width: 767px)').matches ? 120 : 140));
      spine = height * 142 / 840; depth = height * 474 / 900; gap = height * .03;
      node.style.setProperty('--book-height-px', `${height}px`);
      node.style.setProperty('--book-spine', `${spine}px`);
      node.style.setProperty('--book-depth', `${depth}px`);
      measureNeeded = false;
    };
    const updateTarget = (value: number) => { if (locked || count < 2) return; target = value; wake(); };
    const open = () => {
      if (locked || dragging) return;
      target = Math.round(s);
      const nearest = tapes.reduce((best, element) => Math.abs(relative(Number(element.dataset.virtual))) < Math.abs(relative(Number(best.dataset.virtual))) ? element : best, tapes[0]);
      const rect = nearest.querySelector<HTMLElement>('.certificate-book-cover')!.getBoundingClientRect();
      callbacks.current.onOpen(mod(Math.round(s), count), rect);
    };
    const step = (direction: number) => updateTarget(Math.round(target) + direction);
    const select = (index: number) => {
      const current = mod(Math.round(target), count);
      const delta = mod(index - current + count / 2, count) - count / 2;
      updateTarget(Math.round(target) + delta);
    };
    const choose = (virtual: number) => {
      if (performance.now() < suppressClickUntil || locked) return;
      const r = relative(virtual);
      if (Math.abs(r) < .5) open(); else updateTarget(Math.round(s + r));
    };
    function tick(now: number) {
      frame = 0;
      if (locked || !visible || document.hidden) return;
      if (measureNeeded) measure();
      const dt = Math.min(previous ? (now - previous) / 1000 : 1 / 60, .05); previous = now;
      const old = s;
      s = reduced ? Math.round(target) : s + (target - s) * (1 - Math.exp(-(dragging ? 18 : 5.2) * dt));
      if (Math.abs(target - s) < .0001) s = target;
      if (Math.abs(s) > count * 4) { const shift = Math.trunc(s / count) * count; s -= shift; target -= shift; }
      const nextActive = mod(Math.round(s), count);
      if (nextActive !== active) { active = nextActive; resumeIndex.current = active; callbacks.current.onActive(active, Math.sign(s - old) || 1); }
      const onCover = inside && !dragging && Math.abs(target - s) < .3 && Math.abs(pointerX - box.width / 2) < depth * .55 && Math.abs(pointerY - box.height / 2) < height * .55;
      const tx = !reduced && inside && fine.matches ? onCover ? -(pointerY - box.height / 2) / (height / 2) * 6 : 0 : 0;
      const ty = !reduced && inside && fine.matches ? onCover ? (pointerX - box.width / 2) / (depth * .55) * 9 : (pointerX - box.width / 2) / box.width * 5 : 0;
      const tiltEase = reduced ? 1 : 1 - Math.exp(-7 * dt);
      tiltX += (tx - tiltX) * tiltEase; tiltY += (ty - tiltY) * tiltEase;
      let moving = Math.abs(target - s) > .0001 || Math.abs(tx - tiltX) + Math.abs(ty - tiltY) > .02;
      tapes.forEach((element, index) => {
        const r = relative(Number(element.dataset.virtual));
        const b = Math.abs(r) < 1 ? (r + Math.sin(Math.PI * r) / Math.PI) / 2 : Math.sign(r) * .5;
        const x = r * (spine + gap) + (depth - spine + gap * 1.6) * b;
        const culled = Math.abs(x) > box.width / 2 + depth * 1.5;
        element.style.visibility = culled ? 'hidden' : 'visible';
        if (culled) { element.dataset.active = 'false'; return; }
        const openness = smoothstep(Math.max(0, 1 - Math.abs(r)));
        const liftTarget = !reduced && fine.matches && hovered === Number(element.dataset.virtual) && Math.abs(r) > .5 ? 1 : 0;
        lifts[index] += (liftTarget - lifts[index]) * (reduced ? 1 : 1 - Math.exp(-12 * dt));
        moving ||= Math.abs(liftTarget - lifts[index]) > .001;
        element.style.transform = `translate3d(${x}px,${-openness * height * .025 - lifts[index] * height * .045}px,${openness * height * .2}px) rotateZ(${-4.5 * openness}deg) rotateX(${tiltX * openness}deg) rotateY(${-90 * openness + tiltY * openness}deg)`;
        element.style.zIndex = String(Math.round(100 - Math.abs(r) * 4));
        element.style.setProperty('--spine-shade', String(openness * .55));
        element.style.setProperty('--cover-shade', String((1 - openness) * .5));
        element.dataset.active = String(Math.abs(r) < .5);
      });
      if (cursor) {
        const ease = reduced ? 1 : 1 - Math.exp(-16 * dt);
        cursorX += (pointerX - cursorX) * ease; cursorY += (pointerY - cursorY) * ease;
        moving ||= inside && Math.abs(cursorX - pointerX) + Math.abs(cursorY - pointerY) > .2;
        cursor.style.transform = `translate3d(${cursorX}px,${cursorY}px,0)`;
        cursor.dataset.mode = onCover ? 'open' : hovered >= 0 ? 'spine' : 'default';
        cursor.style.visibility = inside && fine.matches && !reduced ? 'visible' : 'hidden';
      }
      node.dataset.dragging = String(dragging);
      node.dataset.settled = String(Math.abs(target - s) < .001);
      if (ring) ring.disabled = Math.abs(target - s) >= .001;
      if (moving) wake();
    }
    const pointerMove = (event: PointerEvent) => {
      if (measureNeeded) measure();
      pointerX = event.clientX - box.left; pointerY = event.clientY - box.top;
      hovered = event.target instanceof Element ? Number(event.target.closest<HTMLElement>('.certificate-tape')?.dataset.virtual ?? -1) : -1;
      if (down && !locked && count > 1) {
        const dx = event.clientX - down.x, dy = event.clientY - down.y;
        if (!dragging && Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy)) { dragging = true; node.setPointerCapture(event.pointerId); }
        if (dragging) { event.preventDefault(); target = down.target - dx / (spine + gap); wake(); }
      }
      wake();
    };
    const enter = (event: PointerEvent) => { inside = true; measureNeeded = true; pointerMove(event); };
    const leave = () => { inside = false; hovered = -1; wake(); };
    const pointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || locked) return;
      down = { x: event.clientX, y: event.clientY, target, pointer: event.pointerId };
    };
    const pointerUp = () => {
      if (dragging) { target = Math.round(target); suppressClickUntil = performance.now() + 350; }
      if (down && node.hasPointerCapture(down.pointer)) node.releasePointerCapture(down.pointer);
      down = null; dragging = false; wake();
    };
    const wheel = (event: WheelEvent) => {
      if (locked || count < 2 || !(Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey || document.activeElement === node)) return;
      event.preventDefault();
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      target = reduced ? Math.round(target) + Math.sign(delta) : target + Math.max(-180, Math.min(180, delta)) / (spine + gap) * .5;
      clearTimeout(wheelTimer); wheelTimer = setTimeout(() => { target = Math.round(target); wake(); }, 160);
      wake();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.target !== node || locked) return;
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(event.key)) event.preventDefault();
      if (event.key === 'ArrowLeft') step(-1); else if (event.key === 'ArrowRight') step(1);
      else if (event.key === 'Home') select(0); else if (event.key === 'End') select(count - 1); else if (event.key === 'Enter') open();
    };
    const resize = () => { measureNeeded = true; wake(); };
    const visibilityChange = () => { previous = 0; wake(); };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    observer?.observe(node);
    const intersection = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => { visible = entries[0].isIntersecting; previous = 0; if (visible) wake(); }, { rootMargin: '150px' });
    intersection?.observe(node);
    node.addEventListener('pointerenter', enter); node.addEventListener('pointerleave', leave);
    node.addEventListener('pointermove', pointerMove); node.addEventListener('pointerdown', pointerDown);
    node.addEventListener('pointerup', pointerUp); node.addEventListener('pointercancel', pointerUp);
    node.addEventListener('wheel', wheel, { passive: false }); node.addEventListener('keydown', keyboard);
    window.addEventListener('resize', resize); window.addEventListener('scroll', resize, { passive: true, capture: true });
    document.addEventListener('visibilitychange', visibilityChange);
    node.dataset.enhanced = 'true';
    controller.current = { step, select, choose, open, setLocked(value) { locked = value; node.dataset.locked = String(value); if (value && frame) { cancelAnimationFrame(frame); frame = 0; } else wake(); } };
    callbacks.current.onActive(active, 1); wake();
    return () => {
      controller.current = null; cancelAnimationFrame(frame); clearTimeout(wheelTimer);
      observer?.disconnect(); intersection?.disconnect();
      node.removeEventListener('pointerenter', enter); node.removeEventListener('pointerleave', leave);
      node.removeEventListener('pointermove', pointerMove); node.removeEventListener('pointerdown', pointerDown);
      node.removeEventListener('pointerup', pointerUp); node.removeEventListener('pointercancel', pointerUp);
      node.removeEventListener('wheel', wheel); node.removeEventListener('keydown', keyboard);
      window.removeEventListener('resize', resize); window.removeEventListener('scroll', resize, true);
      document.removeEventListener('visibilitychange', visibilityChange);
      delete node.dataset.enhanced;
    };
  }, [viewport, count, reduced]);
  return controller;
}
