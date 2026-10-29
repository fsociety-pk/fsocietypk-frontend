import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, FileBadge, X } from 'lucide-react';
import { teamService, type PublicTeamCertificate } from '../../services/teamService';
import { useCertificateShelf } from '../../hooks/useCertificateShelf';
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference';
import '../../styles/certificate-shelf.css';

const EASE = 'cubic-bezier(.2,.8,.2,1)';
const SHEET_EASE = 'cubic-bezier(.76,0,.18,1)';
const inks = ['#244d40', '#344b69', '#875442', '#575b3d', '#674151', '#3d6261'];
const inkBlots = [[.3, .37, 0], [.7, .67, 120], [.5, .13, 220], [.18, .84, 300], [.8, .28, 360], [.52, .96, 420], [.46, .52, 180]];
const dateLabel = (date: string) => {
  if (!date) return 'Undated';
  if (date.length === 4) return date;
  const full = date.length === 7 ? `${date}-01` : date;
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${full}T00:00:00Z`));
};
const clipFor = (rect: DOMRect) => `inset(${Math.max(0, rect.top)}px ${Math.max(0, innerWidth - rect.right)}px ${Math.max(0, innerHeight - rect.bottom)}px ${Math.max(0, rect.left)}px round 3px)`;

function CertificateCover({ certificate, load }: { certificate: PublicTeamCertificate; load: boolean }) {
  const [failed, setFailed] = useState(false);
  const image = certificate.certificate.contentType.startsWith('image/');
  return <>
    <span className="certificate-cover-label">Fsociety PK / CTF archive</span>
    <strong className="certificate-cover-title">{certificate.title}</strong>
    <span className="certificate-cover-document">{image && load && !failed ? <img src={teamService.fileUrl(certificate.id)} alt="" draggable={false} onError={() => setFailed(true)} /> : <FileBadge size={42} strokeWidth={1.2} />}</span>
    <span className="certificate-cover-bottom"><span>{certificate.eventDate.slice(0, 4) || 'Undated'}</span><span>{certificate.placement || (image ? 'CTF record' : 'PDF certificate')}</span></span>
  </>;
}

export default function CertificateShelf({ certificates }: { certificates: PublicTeamCertificate[] }) {
  const reduced = useReducedMotionPreference();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const viewport = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const poster = useRef<SVGSVGElement>(null);
  const origin = useRef<DOMRect | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const openedAt = useRef(0);
  const animations = useRef<Animation[]>([]);
  const inkFrame = useRef(0);
  const closing = useRef(false);
  const [active, setActive] = useState({ index: 0, direction: 1 });
  const [selected, setSelected] = useState<PublicTeamCertificate | null>(null);
  const [posterReady, setPosterReady] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const maskId = useId().replace(/:/g, '');
  const filterId = `${maskId}-ink`;
  const onActive = useCallback((index: number, direction: number) => setActive(current => current.index === index ? current : { index, direction }), []);
  const onOpen = useCallback((index: number, rect: DOMRect) => {
    origin.current = rect; opener.current = document.activeElement as HTMLElement;
    closing.current = false; setPosterReady(false); setPosterFailed(false); setSelected(certificates[index]);
  }, [certificates]);
  const controller = useCertificateShelf({ viewport, count: certificates.length, reduced, onActive, onOpen });
  const current = certificates[active.index] || certificates[0];
  const copies = certificates.length > 1 ? [0, 1, 2] : [0];

  useEffect(() => { controller.current?.setLocked(!!selected); });
  useLayoutEffect(() => {
    if (reduced) return;
    const effects = Array.from(caption.current?.querySelectorAll<HTMLElement>('[data-caption-line]') || []).map((line, index) => line.animate([{ transform: `translateY(${active.direction * 105}%)` }, { transform: 'translateY(0)' }], { duration: 650, delay: index * 55, easing: EASE, fill: 'both' }));
    return () => effects.forEach(animation => animation.cancel());
  }, [active, reduced]);

  const closeDetail = useCallback(() => {
    const sheet = dialog.current;
    if (!sheet?.open || closing.current) return;
    closing.current = true; cancelAnimationFrame(inkFrame.current);
    const style = getComputedStyle(sheet);
    const from = { clipPath: style.clipPath, transform: style.transform };
    animations.current.forEach(animation => animation.cancel());
    if (reduced || !origin.current) { sheet.close(); return; }
    const animation = sheet.animate([from, { clipPath: clipFor(origin.current), transform: 'rotate(-4.5deg)' }], { duration: 650, easing: SHEET_EASE, fill: 'both' });
    animations.current = [animation];
    void animation.finished.then(() => sheet.close()).catch(() => undefined);
  }, [reduced]);

  useLayoutEffect(() => {
    const sheet = dialog.current;
    if (!selected || !sheet || !origin.current) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sheet.showModal(); openedAt.current = performance.now();
    const instant = reducedRef.current;
    sheet.style.transformOrigin = `${origin.current.x + origin.current.width / 2}px ${origin.current.y + origin.current.height / 2}px`;
    const opening = sheet.animate([{ clipPath: clipFor(origin.current), transform: 'rotate(-4.5deg)' }, { clipPath: 'inset(0 0 0 0 round 0px)', transform: 'rotate(0deg)' }], { duration: instant ? 1 : 1050, easing: SHEET_EASE, fill: 'both' });
    animations.current = [opening];
    sheet.querySelectorAll<HTMLElement>('[data-detail-line]').forEach((line, index) => {
      animations.current.push(line.animate([{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], { duration: instant ? 1 : 900, delay: instant ? 0 : 620 + index * 75, easing: EASE, fill: 'both' }));
    });
    sheet.querySelector<HTMLButtonElement>('.certificate-detail-close')?.focus({ preventScroll: true });
    return () => {
      cancelAnimationFrame(inkFrame.current); animations.current.forEach(animation => animation.cancel()); animations.current = [];
      if (sheet.open) sheet.close();
      document.body.style.overflow = previousOverflow;
      if (opener.current?.isConnected) opener.current.focus({ preventScroll: true });
    };
  }, [selected]);

  useEffect(() => { if (reduced && selected) animations.current.forEach(animation => { if (animation.playState !== 'idle') animation.finish(); }); }, [reduced, selected]);

  useEffect(() => {
    if (!selected || !posterReady || closing.current) return;
    const circles = Array.from(poster.current?.querySelectorAll<SVGCircleElement>('[data-ink-blot]') || []);
    const start = Math.max(performance.now(), openedAt.current + (reduced ? 0 : 520));
    const reveal = (now: number) => {
      circles.forEach((circle, index) => {
        const p = reduced ? 1 : Math.max(0, Math.min(1, (now - start - inkBlots[index][2]) / 1250));
        circle.setAttribute('r', String((1 - Math.pow(1 - p, 3)) * 1500));
      });
      if (!reduced && now - start < 1700) inkFrame.current = requestAnimationFrame(reveal);
    };
    inkFrame.current = requestAnimationFrame(reveal);
    return () => cancelAnimationFrame(inkFrame.current);
  }, [selected, posterReady, reduced]);

  return <div className="certificate-archive" data-reduced-motion={reduced}>
    <div className="certificate-archive-toolbar"><span>Fsociety PK / Competition archive</span><label className="certificate-picker-label">Select certificate<select aria-label="Select a team certificate" value={active.index} onChange={event => controller.current?.select(Number(event.target.value))}>{certificates.map((certificate, index) => <option key={certificate.id} value={index}>{certificate.title}</option>)}</select></label></div>
    <div ref={viewport} className="certificate-shelf-viewport" tabIndex={0} role="group" aria-roledescription="carousel" aria-label="Team CTF certificate shelf" aria-describedby="certificate-shelf-help">
      <div className="certificate-shelf-stage">
        {copies.flatMap(copy => certificates.map((certificate, index) => {
          const distance = Math.min(Math.abs(index - active.index), certificates.length - Math.abs(index - active.index));
          const virtual = copy * certificates.length + index;
          const accessibleCopy = certificates.length > 1 ? 1 : 0;
          return <button type="button" className="certificate-tape" key={`${copy}-${certificate.id}`} data-copy={copy} data-virtual={virtual} data-certificate-id={certificate.id} tabIndex={-1} aria-hidden={copy !== accessibleCopy} aria-label={`Select ${certificate.title} certificate`} aria-pressed={index === active.index} onClick={() => controller.current?.choose(virtual)} style={{ '--book-ink': inks[index % inks.length] } as CSSProperties}>
            <span className="certificate-book-spine"><span className="certificate-spine-year">{certificate.eventDate.slice(0, 4) || 'Undated'}</span><strong>{certificate.title}</strong><span className="certificate-spine-stamp">Fsociety<span>PK</span></span></span>
            <span className="certificate-book-cover"><CertificateCover certificate={certificate} load={distance <= 1} /></span>
          </button>;
        }))}
      </div>
      <span className="certificate-shelf-rule" aria-hidden="true" />
      <button className="certificate-cover-open-ring" aria-label="Open selected certificate" onClick={() => controller.current?.open()}><ArrowUpRight size={19} /></button>
      <span className="certificate-shelf-cursor" aria-hidden="true"><span className="certificate-cursor-ring" /><span className="certificate-cursor-dot" /><span className="certificate-cursor-label">Open</span></span>
    </div>
    <div className="certificate-archive-caption-row"><button className="certificate-shelf-arrow" aria-label="Previous certificate" disabled={certificates.length < 2} onClick={() => controller.current?.step(-1)}><ArrowLeft size={22} /></button>
      <div className="certificate-archive-caption" ref={caption} aria-live="polite" aria-atomic="true"><div className="certificate-caption-mask"><h3 data-caption-line>{current.title}</h3></div><div className="certificate-caption-mask"><p data-caption-line>{dateLabel(current.eventDate)}{current.placement && ` / ${current.placement}`}</p></div><span className="certificate-archive-count">{String(active.index + 1).padStart(2, '0')} / {String(certificates.length).padStart(2, '0')}</span></div>
      <button className="certificate-shelf-arrow" aria-label="Next certificate" disabled={certificates.length < 2} onClick={() => controller.current?.step(1)}><ArrowRight size={22} /></button>
    </div>
    <div className="certificate-archive-bottom"><p id="certificate-shelf-help">Drag to browse · Arrow keys · Shift + scroll</p><button className="certificate-open-button" onClick={() => controller.current?.open()}>Open certificate <ArrowUpRight size={16} /></button></div>

    {createPortal(<dialog className="certificate-detail" ref={dialog} aria-labelledby="certificate-detail-title" aria-describedby="certificate-detail-description" onCancel={event => { event.preventDefault(); closeDetail(); }} onClose={() => setSelected(null)}>
      <header className="certificate-detail-header"><button type="button" className="certificate-detail-close" onClick={closeDetail}><X size={17} />Close</button><span>Fsociety PK / CTF archive</span></header>
      {selected && <div className="certificate-detail-layout">
        <div className="certificate-detail-copy"><div className="certificate-line-mask"><span data-detail-line className="certificate-detail-date">{dateLabel(selected.eventDate)}</span></div><h2 className="certificate-line-mask" id="certificate-detail-title"><span data-detail-line>{selected.title}</span></h2><div className="certificate-line-mask"><p data-detail-line className="certificate-detail-placement">{selected.placement || 'Competition record'}</p></div><div className="certificate-line-mask"><p data-detail-line id="certificate-detail-description">{selected.description || 'Explore this record from the Fsociety PK CTF archive.'}</p></div><div className="certificate-line-mask"><div data-detail-line className="certificate-detail-actions"><a href={teamService.fileUrl(selected.id)} target="_blank" rel="noopener noreferrer">Open original {selected.certificate.contentType === 'application/pdf' ? 'PDF' : 'certificate'} <ArrowUpRight size={16} /></a>{selected.eventUrl && <a href={selected.eventUrl} target="_blank" rel="noopener noreferrer">Event / scoreboard <ArrowUpRight size={16} /></a>}<a href={teamService.fileUrl(selected.id, false, true)} target="_blank" rel="noopener noreferrer">Download certificate <ArrowUpRight size={16} /></a></div></div></div>
        <div className="certificate-detail-artwork">{selected.certificate.contentType.startsWith('image/') && !posterFailed ? <svg ref={poster} viewBox="0 0 1000 760" role="img" aria-label={`Certificate for ${selected.title}`}>
          <defs><filter id={filterId} filterUnits="userSpaceOnUse" x="-200" y="-200" width="1400" height="1160"><feTurbulence type="fractalNoise" baseFrequency=".011" numOctaves="3" seed="7" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="90" xChannelSelector="R" yChannelSelector="G" /></filter><mask id={maskId} maskUnits="userSpaceOnUse" x="-200" y="-200" width="1400" height="1160"><g filter={reduced ? undefined : `url(#${filterId})`}>{inkBlots.map(([x, y], index) => <circle key={index} data-ink-blot cx={x * 1000} cy={y * 760} r={reduced ? 1500 : 0} fill="white" />)}</g></mask></defs>
          <image href={teamService.fileUrl(selected.id)} width="1000" height="760" preserveAspectRatio="xMidYMid meet" mask={`url(#${maskId})`} onLoad={() => setPosterReady(true)} onError={() => setPosterFailed(true)} />
        </svg> : selected.certificate.contentType === 'application/pdf' ? <div className="certificate-detail-pdf"><iframe src={`${teamService.fileUrl(selected.id)}#view=FitH`} title={`${selected.title} PDF certificate`} /><a href={teamService.fileUrl(selected.id)} target="_blank" rel="noopener noreferrer">Open PDF in a new tab <ArrowUpRight size={16} /></a></div> : <div className="certificate-detail-image-error"><FileBadge size={56} /><p>The preview could not be loaded.</p><a href={teamService.fileUrl(selected.id)} target="_blank" rel="noopener noreferrer">Open original certificate <ArrowUpRight size={16} /></a></div>}</div>
      </div>}
    </dialog>, document.body)}
  </div>;
}
