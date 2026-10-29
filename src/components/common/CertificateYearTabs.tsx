import { useLayoutEffect, useRef } from 'react';

export default function CertificateYearTabs({ years, value, onChange }: { years: number[]; value: string; onChange: (year: string) => void }) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    const measure = () => {
      const active = node.querySelector<HTMLButtonElement>('[aria-pressed=true]');
      if (!active) return;
      node.style.setProperty('--year-tab-x', `${active.offsetLeft}px`);
      node.style.setProperty('--year-tab-width', `${active.offsetWidth}px`);
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(node);
    return () => observer?.disconnect();
  }, [value, years]);
  return <nav className="certificate-year-tabs" aria-label="Competition years"><div ref={root}><span className="certificate-year-indicator" aria-hidden="true" /><button aria-label="Show all certificates" aria-pressed={value === 'all'} onClick={() => onChange('all')}>All years</button>{years.map(year => <button key={year} aria-label={`Show certificates from ${year}`} aria-pressed={value === String(year)} onClick={() => onChange(String(year))}>{year}</button>)}</div></nav>;
}
