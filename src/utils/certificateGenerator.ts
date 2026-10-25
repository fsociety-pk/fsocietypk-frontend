/**
 * Certificate Generator Utility
 * Generates a beautiful SVG-based certificate that can be downloaded or shared
 */

export interface CertificateData {
  userName: string;
  challengeName: string;
  completionDate: Date;
  totalChallenges: number;
  platformName: string;
  platformURL: string;
}

const escapeXML = (value: string): string => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[character]!));

export const generateCertificateSVG = (data: CertificateData): string => {
  const name = escapeXML(data.userName.length > 30 ? data.userName.slice(0, 27) + '…' : data.userName);
  const challenge = escapeXML(data.challengeName.length > 55 ? data.challengeName.slice(0, 52) + '…' : data.challengeName);
  const date = escapeXML(new Date(data.completionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
    <rect width="1200" height="800" fill="#ffffff"/>
    <rect x="28" y="28" width="1144" height="744" rx="12" fill="none" stroke="#DDE3E8" stroke-width="2"/>
    <path d="M28 28h1144v16H28z" fill="#132338"/>
    <circle cx="1080" cy="120" r="32" fill="#5df0a8"/>
    <path d="M1066 122l10 10 19-24" fill="none" stroke="#132338" stroke-width="5"/>
    <text x="88" y="132" fill="#132338" font-family="Arial,sans-serif" font-size="28" font-weight="700">fsociety PK</text>
    <text x="88" y="222" fill="#58677d" font-family="Arial,sans-serif" font-size="14" letter-spacing="4">LEARN. PRACTICE. SHARE.</text>
    <text x="88" y="307" fill="#132338" font-family="Georgia,serif" font-size="58">Certificate of achievement</text>
    <text x="88" y="375" fill="#58677d" font-family="Arial,sans-serif" font-size="20">Presented to</text>
    <text x="88" y="453" fill="#132338" font-family="Arial,sans-serif" font-size="48" font-weight="700">${name}</text>
    <path d="M88 482h160" stroke="#5df0a8" stroke-width="6"/>
    <text x="88" y="543" fill="#58677d" font-family="Arial,sans-serif" font-size="20">For completing</text>
    <text x="88" y="586" fill="#132338" font-family="Arial,sans-serif" font-size="25">${challenge}</text>
    <path d="M88 642h1024" stroke="#DDE3E8"/>
    <text x="88" y="700" fill="#58677d" font-family="Arial,sans-serif" font-size="16">${date}</text>
    <text x="1112" y="700" fill="#132338" font-family="Arial,sans-serif" font-size="16" text-anchor="end">fsocietypk.tech</text>
  </svg>`;
};

export const downloadCertificateAsImage = async (
  svgString: string,
  fileName: string
): Promise<void> => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Failed to get canvas context');

  // Create an image from SVG
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);

  await new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(undefined);
    };
    img.onerror = reject;
    img.src = url;
  });

  // Download as PNG
  canvas.toBlob((blob) => {
    if (!blob) throw new Error('Failed to create blob');

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  });
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
