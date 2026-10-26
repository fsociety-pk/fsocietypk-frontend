import { useEffect, useRef } from 'react';

// The middle friend covers its neighbours; each neighbour covers one middle eye.
const reaches = [
  { owner: 'green', shoulder: 'left', target: 'coral', eyes: 'both', color: '#8bcbaa' },
  { owner: 'green', shoulder: 'right', target: 'lilac', eyes: 'both', color: '#8bcbaa' },
  { owner: 'coral', shoulder: 'right', target: 'green', eyes: 'left', color: '#ffb59f' },
  { owner: 'lilac', shoulder: 'left', target: 'green', eyes: 'right', color: '#c3ace3' },
] as const;

export default function CompanionPrivacyArms({ covered }: { covered: boolean }) {
  const svg = useRef<SVGSVGElement>(null);
  const progress = useRef(0);
  useEffect(() => {
    const element = svg.current;
    const stage = element?.parentElement;
    if (!element || !stage) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const draw = (amount: number) => {
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const center = (node: Element) => {
        const rect = node.getBoundingClientRect();
        return { x: (rect.left + rect.width / 2 - bounds.left) * 330 / bounds.width, y: (rect.top + rect.height / 2 - bounds.top) * 222 / bounds.height };
      };
      element.style.opacity = amount > .001 ? '1' : '0';
      element.dataset.progress = String(amount);
      reaches.forEach((reach, index) => {
        const shoulder = stage.querySelector(`.companion-${reach.owner} .companion-side.${reach.shoulder}`);
        const eyes = stage.querySelectorAll(`.companion-${reach.target} .companion-eye${reach.eyes === 'both' ? '' : `.${reach.eyes}`}`);
        const group = element.children[index];
        if (!shoulder || !eyes.length || !group) return;
        const start = center(shoulder);
        const first = center(eyes[0]);
        const last = center(eyes[eyes.length - 1]);
        const target = { x: (first.x + last.x) / 2, y: (first.y + last.y) / 2 };
        const end = { x: start.x + (target.x - start.x) * amount, y: start.y + 12 + (target.y - start.y - 12) * amount };
        const elbowX = (start.x + end.x) / 2 + (reach.shoulder === 'left' ? -12 : 12);
        const path = `M${start.x},${start.y} Q${elbowX},${start.y + 18} ${end.x},${end.y}`;
        group.querySelectorAll('.crew-arm').forEach(arm => arm.setAttribute('d', path));
        const angle = Math.atan2(last.y - first.y, last.x - first.x) * 180 / Math.PI;
        const handWidth = reach.eyes === 'both' ? Math.hypot(last.x - first.x, last.y - first.y) + 36 : 37;
        const size = .35 + .65 * amount;
        group.querySelector('.crew-palm')?.setAttribute('transform', `translate(${end.x} ${end.y}) rotate(${angle}) scale(${handWidth / 44 * size} ${size})`);
      });
    };
    const started = performance.now();
    const from = progress.current;
    const destination = covered ? 1 : 0;
    const tick = (time: number) => {
      const elapsed = motion.matches ? 1 : Math.min(1, (time - started) / 420);
      progress.current = from + (destination - from) * (1 - Math.pow(1 - elapsed, 3));
      draw(progress.current);
      if (elapsed < 1) frame = window.requestAnimationFrame(tick);
    };
    const resize = () => draw(progress.current);
    const motionChange = () => {
      window.cancelAnimationFrame(frame);
      progress.current = destination;
      draw(destination);
    };
    tick(started);
    window.addEventListener('resize', resize);
    motion.addEventListener('change', motionChange);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      motion.removeEventListener('change', motionChange);
    };
  }, [covered]);
  return <svg ref={svg} className="crew-privacy-arms" viewBox="0 0 330 222" focusable="false" aria-hidden="true">
    {reaches.map(reach => <g key={`${reach.owner}-${reach.shoulder}`} className="crew-reach" data-owner={reach.owner} data-target={reach.target} data-eyes={reach.eyes} fill={reach.color}>
      <path className="crew-arm crew-arm-outline" /><path className="crew-arm crew-arm-color" stroke={reach.color} />
      <g className="crew-palm"><path className="crew-hand" d="M-22-8Q-22-15-15-15H15Q23-15 23-9Q23-5 18-5Q25-5 25 1Q25 6 18 6Q23 7 22 12Q21 17 14 17H-7Q-15 22-20 15L-25 8Q-29 2-24-1L-19 3V-8Z" /><path className="crew-fingers" d="M8-5H18M8 6H18M-19 3L-12 9" /></g>
    </g>)}
  </svg>;
}
