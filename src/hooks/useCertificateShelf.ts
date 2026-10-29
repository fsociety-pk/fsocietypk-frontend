import { useEffect, useRef, type RefObject } from 'react';

export interface CertificateShelfController {
  step: (direction: number) => void;
  select: (index: number) => void;
  choose: (virtual: number) => void;
  open: () => void;
  setLocked: (locked: boolean) => void;
}
const mod = (value: number, length: number) => ((value % length) + length) % length;

/** One demand-driven frame loop; React updates only when the selected certificate changes. */
export function useCertificateShelf({ viewport, count, reduced, onActive, onOpen, onPreview }: {
  viewport: RefObject<HTMLDivElement>; count: number; reduced: boolean;
  onActive: (index: number, direction: number) => void; onOpen: (index: number, cover: DOMRect) => void;
  onPreview: () => void;
}) {
  const controller = useRef<CertificateShelfController | null>(null);
  const resumeIndex = useRef(0);
  const resumePreview = useRef(false);
  const callbacks = useRef({ onActive, onOpen, onPreview });
  callbacks.current = { onActive, onOpen, onPreview };
  useEffect(() => {
    const element = viewport.current;
    if (!element || !count) return;
    const node: HTMLDivElement = element;
    const tapes = Array.from(node.querySelectorAll<HTMLElement>('.certificate-tape'));
    const covers = tapes.map(tape => tape.querySelector<HTMLElement>('.certificate-book-cover')!);
    const cursor = node.querySelector<HTMLElement>('.certificate-shelf-cursor');
    const ring = node.querySelector<HTMLButtonElement>('.certificate-cover-open-ring');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const copies = count > 1 ? 3 : 1;
    const period = count * copies;
    let active = Math.min(resumeIndex.current, count - 1);
    let s = (count > 1 ? count : 0) + active, target = s, previous = 0;
    let previewed = resumePreview.current, pendingOpen = false;
    let previewVirtual: number | null = previewed ? mod(s, period) : null;
    let openAmount = previewed ? 1 : 0;
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
    const engage = () => {
      if (!previewed) { previewed = true; resumePreview.current = true; callbacks.current.onPreview(); }
    };
    const updateTarget = (value: number) => { if (locked) return; engage(); pendingOpen = false; target = value; wake(); };
    const open = () => {
      if (locked || dragging) return;
      if (!previewed) { engage(); wake(); return; }
      // Explicit open actions wait for the selected cover to finish turning.
      target = Math.round(target); pendingOpen = true; wake();
    };
    const step = (direction: number) => updateTarget(Math.round(target) + (count < 2 || (!previewed && direction > 0) ? 0 : direction));
    const select = (index: number) => {
      const current = mod(Math.round(target), count);
      const delta = mod(index - current + count / 2, count) - count / 2;
      updateTarget(Math.round(target) + delta);
    };
    const choose = (virtual: number) => {
      if (performance.now() < suppressClickUntil || locked) return;
      const r = relative(virtual);
      if (previewed && Math.abs(r) < .5) open(); else updateTarget(Math.round(s + r));
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
      const previewTarget = previewed && !dragging && Math.abs(target - s) < .15 ? mod(Math.round(s), period) : null;
      const opening = previewVirtual === previewTarget && previewTarget !== null;
      const desiredOpen = opening ? 1 : 0;
      if (reduced) { previewVirtual = previewTarget; openAmount = previewTarget === null ? 0 : 1; }
      else {
        // Close the outgoing cover fully before assigning the next one.
        openAmount += (desiredOpen - openAmount) * (1 - Math.exp(-(opening ? 12 : 18) * dt));
        if (Math.abs(desiredOpen - openAmount) < .001) openAmount = desiredOpen;
        if (openAmount === 0) previewVirtual = previewTarget;
      }
      const settled = Math.abs(target - s) < .001 && (!previewed || (openAmount === 1 && previewVirtual === previewTarget));
      const onCover = previewed && openAmount > .95 && inside && !dragging && Math.abs(target - s) < .3 && Math.abs(pointerX - box.width / 2) < depth * .55 && Math.abs(pointerY - box.height / 2) < height * .55;
      const tx = !reduced && inside && fine.matches ? onCover ? -(pointerY - box.height / 2) / (height / 2) * 6 : 0 : 0;
      const ty = !reduced && inside && fine.matches ? onCover ? (pointerX - box.width / 2) / (depth * .55) * 9 : (pointerX - box.width / 2) / box.width * 5 : 0;
      const tiltEase = reduced ? 1 : 1 - Math.exp(-7 * dt);
      tiltX += (tx - tiltX) * tiltEase; tiltY += (ty - tiltY) * tiltEase;
      let moving = Math.abs(target - s) > .0001 || Math.abs(tx - tiltX) + Math.abs(ty - tiltY) > .02 || openAmount !== (previewTarget === null ? 0 : 1) || previewVirtual !== previewTarget;
      const previewRelative = previewVirtual === null ? 0 : relative(previewVirtual);
      tapes.forEach((element, index) => {
        const virtual = Number(element.dataset.virtual);
        const r = relative(virtual);
        const distance = r - previewRelative;
        const b = Math.abs(distance) < 1 ? (distance + Math.sin(Math.PI * distance) / Math.PI) / 2 : Math.sign(distance) * .5;
        const x = r * (spine + gap) + (depth - spine + gap * 1.6) * b * openAmount;
        const culled = Math.abs(x) > box.width / 2 + depth * 1.5;
        element.style.visibility = culled ? 'hidden' : 'visible';
        const openness = virtual === previewVirtual ? openAmount : 0;
        // Closed side faces must not peek between neighbouring spines.
        covers[index].style.visibility = !culled && openness > 0 ? 'visible' : 'hidden';
        if (culled) { element.dataset.active = 'false'; return; }
        const liftTarget = !reduced && fine.matches && hovered === virtual && openness === 0 ? 1 : 0;
        lifts[index] += (liftTarget - lifts[index]) * (reduced ? 1 : 1 - Math.exp(-12 * dt));
        moving ||= Math.abs(liftTarget - lifts[index]) > .001;
        element.style.transform = `translate3d(${x}px,${-openness * height * .025 - lifts[index] * height * .045}px,${openness * height * .2}px) rotateZ(${-4.5 * openness}deg) rotateX(${tiltX * openness}deg) rotateY(${-90 * openness + tiltY * openness}deg)`;
        element.style.zIndex = String(Math.round(100 - Math.abs(r) * 4));
        element.style.setProperty('--spine-shade', String(openness * .55));
        element.style.setProperty('--cover-shade', String((1 - openness) * .5));
        element.dataset.active = String(openness > 0);
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
      node.dataset.settled = String(settled);
      node.dataset.previewState = openAmount === 0 ? 'closed' : openAmount === 1 ? 'open' : opening ? 'opening' : 'closing';
      if (ring) ring.disabled = !previewed || !settled;
      if (pendingOpen && settled && previewVirtual !== null && openAmount === 1) {
        pendingOpen = false;
        callbacks.current.onOpen(mod(Math.round(s), count), covers[previewVirtual].getBoundingClientRect());
      }
      if (moving) wake();
    }
    const pointerMove = (event: PointerEvent) => {
      if (measureNeeded) measure();
      pointerX = event.clientX - box.left; pointerY = event.clientY - box.top;
      hovered = event.target instanceof Element ? Number(event.target.closest<HTMLElement>('.certificate-tape')?.dataset.virtual ?? -1) : -1;
      if (down && !locked && count > 1) {
        const dx = event.clientX - down.x, dy = event.clientY - down.y;
        if (!dragging && Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy)) { dragging = true; node.setPointerCapture(event.pointerId); }
        if (dragging) { event.preventDefault(); engage(); pendingOpen = false; target = down.target - dx / (spine + gap); wake(); }
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
      engage(); pendingOpen = false;
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
    const clickCover = (event: MouseEvent) => {
      // Some browsers paint a transformed side face outside the button's hit
      // plane. Handle that visible cover on the stage as well as native clicks.
      if (event.target !== node && event.target !== node.querySelector('.certificate-shelf-stage')) return;
      if (locked || dragging || performance.now() < suppressClickUntil || previewVirtual === null || openAmount < .95) return;
      const rect = covers[previewVirtual].getBoundingClientRect();
      if (event.clientX > rect.left && event.clientX < rect.right && event.clientY > rect.top && event.clientY < rect.bottom) open();
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
    node.addEventListener('click', clickCover);
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
      node.removeEventListener('click', clickCover);
      window.removeEventListener('resize', resize); window.removeEventListener('scroll', resize, true);
      document.removeEventListener('visibilitychange', visibilityChange);
      delete node.dataset.enhanced;
    };
  }, [viewport, count, reduced]);
  return controller;
}
