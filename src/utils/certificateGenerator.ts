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

export const generateCertificateSVG = (data: CertificateData): string => {
  const currentDate = new Date(data.completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#050505;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0a1a10;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#00FF41;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#00A32A;stop-opacity:1"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00FF41" stroke-width="0.5" stroke-opacity="0.1"/>
    </pattern>
  </defs>

  <rect width="1200" height="800" fill="url(#bgGradient)"/>
  <rect width="1200" height="800" fill="url(#grid)"/>

  <path d="M 40 40 L 1160 40 L 1160 760 L 40 760 Z" fill="none" stroke="#00FF41" stroke-width="1" stroke-opacity="0.3"/>
  <path d="M 30 60 L 30 30 L 60 30" fill="none" stroke="#00FF41" stroke-width="4" filter="url(#glow)"/>
  <path d="M 1170 60 L 1170 30 L 1140 30" fill="none" stroke="#00FF41" stroke-width="4" filter="url(#glow)"/>
  <path d="M 30 740 L 30 770 L 60 770" fill="none" stroke="#00FF41" stroke-width="4" filter="url(#glow)"/>
  <path d="M 1170 740 L 1170 770 L 1140 770" fill="none" stroke="#00FF41" stroke-width="4" filter="url(#glow)"/>

  <rect x="50" y="50" width="4" height="60" fill="#00FF41" opacity="0.6"/>
  <rect x="60" y="50" width="4" height="20" fill="#00FF41" opacity="0.8"/>

  <text x="600" y="140" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="#00FF41" letter-spacing="12" text-anchor="middle">SYSTEM_OPERATIVE_CERTIFICATION</text>
  
  <text x="600" y="240" font-family="'Arial Black', sans-serif" font-size="75" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="6">CERTIFICATE</text>
  <text x="600" y="295" font-family="'Courier New', monospace" font-size="24" fill="#00FF41" text-anchor="middle" letter-spacing="8">OF ACHIEVEMENT</text>

  <rect x="400" y="340" width="400" height="1" fill="url(#neonGradient)"/>

  <text x="600" y="415" font-family="Arial, sans-serif" font-size="16" fill="#888888" text-anchor="middle" letter-spacing="3">THIS DOCUMENT VERIFIES THAT</text>
  
  <text x="600" y="500" font-family="'Courier New', monospace" font-size="52" font-weight="900" fill="url(#neonGradient)" text-anchor="middle" filter="url(#glow)">${data.userName.toUpperCase()}</text>

  <text x="600" y="575" font-family="Arial, sans-serif" font-size="16" fill="#888888" text-anchor="middle" letter-spacing="2">HAS SUCCESSFULLY CLEARANCE LEVEL ON</text>
  <text x="600" y="625" font-family="'Arial Black', sans-serif" font-size="28" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">[ ${data.challengeName.toUpperCase()} ]</text>
  
  <path d="M 300 700 L 500 700 M 700 700 L 900 700" stroke="#00FF41" stroke-width="1" stroke-opacity="0.4"/>
  <text x="400" y="690" font-family="'Courier New', monospace" font-size="14" fill="#00FF41" text-anchor="middle">DATE</text>
  <text x="400" y="725" font-family="'Courier New', monospace" font-size="14" fill="#888888" text-anchor="middle">${currentDate}</text>
  
  <text x="800" y="690" font-family="'Courier New', monospace" font-size="14" fill="#00FF41" text-anchor="middle">AUTHORITY</text>
  <text x="800" y="725" font-family="'Courier New', monospace" font-size="14" fill="#888888" text-anchor="middle">${data.platformName.toUpperCase()}</text>
  
  <text x="600" y="770" font-family="'Courier New', monospace" font-size="10" fill="#333333" text-anchor="middle" letter-spacing="4">VERIFICATION_HASH: ${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(16).toUpperCase()}</text>
</svg>`;
};

/**
 * Download certificate as PNG
 */
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
  return `🎖️ Excited to announce that I've successfully completed "${data.challengeName}" on ${data.platformName}! 

Completed ${data.totalChallenges} challenge(s) as part of my cybersecurity training journey. This experience has strengthened my skills in security assessment and problem-solving.

${data.platformName} is a great platform for hands-on learning. Highly recommend it for anyone looking to develop their cybersecurity expertise!

#Cybersecurity #HackingChallenge #InfoSec #${data.platformName} #LearningJourney`;
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
