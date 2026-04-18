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

  // Truncate long names for display
  const displayName = data.userName.length > 30 
    ? data.userName.substring(0, 27) + '...' 
    : data.userName;

  const displayChallenge = data.challengeName.length > 35 
    ? data.challengeName.substring(0, 32) + '...' 
    : data.challengeName;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#0a0a0a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#00FF41;stop-opacity:1"/>
      <stop offset="50%" style="stop-color:#00FF41;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#00DD33;stop-opacity:1"/>
    </linearGradient>
    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#E0E0E0;stop-opacity:1"/>
    </linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00FF41" stroke-width="0.5" stroke-opacity="0.08"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="800" fill="url(#bgGradient)"/>
  <rect width="1200" height="800" fill="url(#grid)"/>

  <!-- Decorative neon border -->
  <rect x="40" y="40" width="1120" height="720" fill="none" stroke="#00FF41" stroke-width="2" filter="url(#glow)" opacity="0.8"/>
  <rect x="50" y="50" width="1100" height="700" fill="none" stroke="#00FF41" stroke-width="0.5" opacity="0.4"/>

  <!-- Corner decorations -->
  <g stroke="#00FF41" stroke-width="3" stroke-linecap="round" filter="url(#glow)">
    <!-- Top left -->
    <path d="M 50 80 L 50 50 L 80 50" fill="none" stroke-opacity="0.9"/>
    <!-- Top right -->
    <path d="M 1150 50 L 1150 80 M 1150 50 L 1120 50" fill="none" stroke-opacity="0.9"/>
    <!-- Bottom left -->
    <path d="M 50 720 L 50 750 L 80 750" fill="none" stroke-opacity="0.9"/>
    <!-- Bottom right -->
    <path d="M 1150 720 L 1150 750 L 1120 750" fill="none" stroke-opacity="0.9"/>
  </g>

  <!-- Decorative vertical lines -->
  <line x1="100" y1="80" x2="100" y2="150" stroke="#00FF41" stroke-width="2" opacity="0.6"/>
  <line x1="1100" y1="80" x2="1100" y2="150" stroke="#00FF41" stroke-width="2" opacity="0.6"/>

  <!-- Top section badge -->
  <rect x="400" y="60" width="400" height="50" fill="none" stroke="#00FF41" stroke-width="1.5" opacity="0.6"/>
  <text x="600" y="92" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#00FF41" letter-spacing="8" text-anchor="middle" filter="url(#glow)">SYSTEM_OPERATIVE_CERT</text>

  <!-- Main title -->
  <text x="600" y="200" font-family="'Arial Black', sans-serif" font-size="78" font-weight="900" fill="url(#textGradient)" text-anchor="middle" letter-spacing="6" filter="url(#strongGlow)">CERTIFICATE</text>
  <text x="600" y="260" font-family="'Courier New', monospace" font-size="24" fill="#00FF41" text-anchor="middle" letter-spacing="8" filter="url(#glow)">OF ACHIEVEMENT</text>

  <!-- Decorative line under title -->
  <line x1="300" y1="290" x2="900" y2="290" stroke="url(#neonGradient)" stroke-width="2" filter="url(#glow)"/>

  <!-- Verification text -->
  <text x="600" y="350" font-family="Arial, sans-serif" font-size="15" fill="#CCCCCC" text-anchor="middle" letter-spacing="3">THIS DOCUMENT CERTIFIES THAT</text>

  <!-- User name - prominently displayed -->
  <rect x="200" y="380" width="800" height="90" fill="#00FF41" fill-opacity="0.05" stroke="#00FF41" stroke-width="1.5" filter="url(#glow)"/>
  <text x="600" y="465" font-family="'Courier New', monospace" font-size="56" font-weight="900" fill="#00FF41" text-anchor="middle" filter="url(#strongGlow)">${displayName.toUpperCase()}</text>

  <!-- Achievement text -->
  <text x="600" y="530" font-family="Arial, sans-serif" font-size="15" fill="#CCCCCC" text-anchor="middle" letter-spacing="2">HAS SUCCESSFULLY COMPLETED</text>

  <!-- Challenge name box -->
  <rect x="150" y="545" width="900" height="60" fill="none" stroke="#00FF41" stroke-width="1.5" opacity="0.7" filter="url(#glow)"/>
  <text x="600" y="585" font-family="'Arial Black', sans-serif" font-size="28" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">[ ${displayChallenge.toUpperCase()} ]</text>

  <!-- Decorative divider -->
  <line x1="250" y1="640" x2="950" y2="640" stroke="#00FF41" stroke-width="1" stroke-dasharray="5,5" opacity="0.5"/>

  <!-- Date and Authority -->
  <g font-family="'Courier New', monospace" font-size="13" text-anchor="middle">
    <!-- Date section -->
    <text x="350" y="680" fill="#00FF41" font-weight="bold" letter-spacing="3">DATE_ISSUED</text>
    <text x="350" y="710" fill="#FFFFFF" font-size="14">${currentDate}</text>
    
    <!-- Authority section -->
    <text x="850" y="680" fill="#00FF41" font-weight="bold" letter-spacing="3">AUTHORITY</text>
    <text x="850" y="710" fill="#FFFFFF" font-size="14">${data.platformName.toUpperCase()}</text>
  </g>

  <!-- Footer -->
  <line x1="100" y1="745" x2="1100" y2="745" stroke="#00FF41" stroke-width="1" opacity="0.4"/>
  <text x="600" y="770" font-family="'Courier New', monospace" font-size="11" fill="#666666" text-anchor="middle" letter-spacing="3">© 2026 FSOCIETY.PK // SECURE_COMMUNICATIONS_NETWORK</text>
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
