/**
 * Certificate Generator Utility
 * Generates a beautiful SVG-based certificate that can be downloaded or shared
 */

export interface CertificateData {
  userName: string;
  challengeName: string;
  completionDate: Date | null;
  totalChallenges: number;
  platformName: string;
  platformURL: string;
}

const escapeXML = (value: string): string => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[character]!));

const wrapText = (value: string, length: number): string[] => {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > length && line) { lines.push(line); line = ''; }
    // Break exceptionally long unspaced titles as well.
    let remaining = word;
    while (remaining.length > length) { if (line) { lines.push(line); line = ''; } lines.push(remaining.slice(0, length)); remaining = remaining.slice(length); }
    line = (line + ' ' + remaining).trim();
  }
  if (line) lines.push(line);
  return lines;
};

export const generateCertificateSVG = (data: CertificateData): string => {
  const name = escapeXML(data.userName);
  const nameSize = Math.min(66, 920 / Math.max(data.userName.length * .62, 1));
  const wrappedTitle = wrapText(data.challengeName, 64);
  const titleLines = wrappedTitle.slice(0, 3);
  if (wrappedTitle.length > 3) titleLines[2] = titleLines[2].slice(0, 61) + '…';
  const titleSize = titleLines.length > 2 ? 22 : 28;
  const dateValue = data.completionDate ? new Date(data.completionDate) : new Date(NaN);
  const date = Number.isNaN(dateValue.getTime()) ? 'Date unavailable' : dateValue.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const seal = Array.from({ length: 48 }, (_, index) => {
    const angle = index * Math.PI / 24 - Math.PI / 2;
    const radius = index % 2 ? 65 : 73;
    return `${1160 + Math.cos(angle) * radius},${765 + Math.sin(angle) * radius}`;
  }).join(' ');
  let domain = data.platformName;
  try { domain = new URL(data.platformURL).hostname; } catch { /* The issuer label is a safe fallback. */ }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="990" viewBox="0 0 1400 990" role="img" aria-label="Certificate of achievement for ${name}">
    <rect width="1400" height="990" fill="#F6F8FA"/>
    <path d="M0 0h32v990H0z" fill="#0A382A"/>
    <rect x="55" y="35" width="1310" height="920" fill="none" stroke="#BCC3CC"/>
    <path d="M55 155V35h150M1215 955h150V835" fill="none" stroke="#EAAA00" stroke-width="5"/>
    <path d="M1235 35h130v130z" fill="#0A382A"/>
    <path d="M1270 35h95v95z" fill="#EAAA00"/>
    <text x="112" y="121" font-family="Arial,sans-serif" font-size="27" font-weight="700" letter-spacing="3" fill="#0A382A">${escapeXML(data.platformName.toUpperCase())}</text>
    <text x="112" y="150" font-family="Arial,sans-serif" font-size="11" letter-spacing="3" fill="#405C4E">LEARN. PRACTICE. SHARE.</text>
    <text x="1260" y="147" text-anchor="end" font-family="Arial,sans-serif" font-size="11" letter-spacing="2" fill="#405C4E">CYBERSECURITY / CTF</text>
    <path d="M112 186h1176" stroke="#BCC3CC"/>
    <text x="700" y="273" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" letter-spacing="5" fill="#405C4E">RECOGNITION OF ACCOMPLISHMENT</text>
    <text x="700" y="355" text-anchor="middle" font-family="Georgia,serif" font-size="66" fill="#0A382A">Certificate of Achievement</text>
    <path d="M660 391h80" stroke="#EAAA00" stroke-width="3"/>
    <text x="700" y="442" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" fill="#405C4E">This certificate is proudly presented to</text>
    <text x="700" y="530" text-anchor="middle" font-family="Georgia,serif" font-size="${nameSize}" font-weight="700" fill="#0A382A">${name}</text>
    <path d="M310 555h780" stroke="#BCC3CC"/>
    <text x="700" y="605" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" fill="#405C4E">for successfully completing</text>
    ${titleLines.map((line, i) => `<text x="700" y="${650 + i * 32}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${titleSize}" font-weight="600" fill="#0A382A">${escapeXML(line)}</text>`).join('')}
    <text x="700" y="${Math.max(710, 680 + (titleLines.length - 1) * 32)}" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#405C4E">Demonstrating practical problem-solving skills through cybersecurity challenges.</text>
    <text x="112" y="796" font-family="Georgia,serif" font-size="24" fill="#0A382A">${escapeXML(date)}</text>
    <path d="M112 817h265" stroke="#0A382A"/>
    <text x="112" y="843" font-family="Arial,sans-serif" font-size="10" letter-spacing="2" fill="#405C4E">COMPLETION DATE</text>
    <text x="505" y="796" font-family="Georgia,serif" font-size="24" fill="#0A382A">${escapeXML(data.platformName)}</text>
    <path d="M505 817h265" stroke="#0A382A"/>
    <text x="505" y="843" font-family="Arial,sans-serif" font-size="10" letter-spacing="2" fill="#405C4E">CYBERSECURITY LEARNING COMMUNITY</text>
    <polygon points="${seal}" fill="#EAAA00"/>
    <circle cx="1160" cy="765" r="55" fill="#0A382A"/>
    <circle cx="1160" cy="765" r="49" fill="none" stroke="#EAAA00" stroke-width="1"/>
    <path d="M1140 759l14 14 26-30" fill="none" stroke="#EAAA00" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="1160" y="796" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" letter-spacing="1.5" fill="#DDE3E8">ACHIEVEMENT</text>
    <path d="M112 884h1176" stroke="#BCC3CC"/>
    <text x="112" y="916" font-family="Arial,sans-serif" font-size="11" letter-spacing="1" fill="#405C4E">CHALLENGE COMPLETION · ${escapeXML(data.platformName.toUpperCase())}</text>
    <text x="1288" y="916" text-anchor="end" font-family="Arial,sans-serif" font-size="13" fill="#0A382A">${escapeXML(domain)}</text>
  </svg>`;
};

export const downloadCertificateAsImage = async (svgString: string, fileName: string): Promise<void> => {
  const canvas = document.createElement('canvas');
  canvas.width = 2800;
  canvas.height = 1980;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create the certificate image.');
  const image = new Image();
  const source = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml' }));
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve(); image.onerror = () => reject(new Error('Could not render the certificate.')); image.src = source;
    });
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Could not export the certificate.')), 'image/png'));
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `${fileName.replace(/[^a-zA-Z0-9_-]/g, '-')}.png`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } finally { URL.revokeObjectURL(source); }
};

/** Browser print produces a vector PDF without rasterizing the certificate. */
export const printCertificate = (svg: string): void => {
  const previousFocus = document.activeElement as HTMLElement | null;
  const restoreFocus = () => previousFocus?.focus({ preventScroll: true });
  const frame = document.createElement('iframe');
  frame.title = 'Print achievement certificate';
  frame.style.cssText = 'position:fixed;width:1px;height:1px;left:-9999px;border:0';
  frame.onload = () => {
    frame.contentWindow?.addEventListener('afterprint', restoreFocus, { once: true });
    frame.contentWindow?.focus();
    try { frame.contentWindow?.print(); }
    finally { restoreFocus(); }
  };
  // Leave 1mm for browser print rounding so the SVG cannot create a blank page.
  frame.srcdoc = `<!doctype html><html><head><title>Fsociety PK Certificate</title><style>@page{size:A4 landscape;margin:0}*{box-sizing:border-box}body{margin:0}svg{display:block;width:297mm;height:209mm;break-inside:avoid}html{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body>${svg}</body></html>`;
  document.body.appendChild(frame);
  setTimeout(() => frame.remove(), 60000);
};

/**
 * Generate LinkedIn share description
 */
export const generateLinkedInDescription = (data: CertificateData): string => {
  return `I completed "${data.challengeName}" on Fsociety PK.

I learned by solving security challenges and working through each step.

${data.platformURL}

#Cybersecurity #CTF #FsocietyPK`;
};

/**
 * Share to LinkedIn with pre-filled description
 */
export const shareToLinkedIn = (description: string): void => {
  const linkedInURL = new URL('https://www.linkedin.com/sharing/share-offsite/');
  linkedInURL.searchParams.append('url', window.location.href);

  // LinkedIn will use Open Graph tags from the page for title/description
  // We can also open with a comment to suggest what to post
  const encodedDesc = encodeURIComponent(description);
  const shareUrl = `https://www.linkedin.com/feed/?sharingUrl=${encodedDesc}`;

  window.open(shareUrl, '_blank', 'noopener,noreferrer');
};
