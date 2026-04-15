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
  <!-- Background with gradient -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(10,10,15);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(20,30,50);stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(255,215,0);stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:rgb(200,150,0);stop-opacity:0.8" />
    </linearGradient>

    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Main background -->
  <rect width="1200" height="800" fill="url(#bgGradient)"/>

  <!-- Decorative border -->
  <rect x="30" y="30" width="1140" height="740" fill="none" stroke="url(#goldGradient)" stroke-width="3"/>
  <rect x="40" y="40" width="1120" height="720" fill="none" stroke="url(#goldGradient)" stroke-width="1" opacity="0.5"/>

  <!-- Corner decorations -->
  <circle cx="50" cy="50" r="15" fill="url(#goldGradient)" filter="url(#glow)"/>
  <circle cx="1150" cy="50" r="15" fill="url(#goldGradient)" filter="url(#glow)"/>
  <circle cx="50" cy="750" r="15" fill="url(#goldGradient)" filter="url(#glow)"/>
  <circle cx="1150" cy="750" r="15" fill="url(#goldGradient)" filter="url(#glow)"/>

  <!-- Decorative lines -->
  <line x1="100" y1="100" x2="300" y2="100" stroke="url(#goldGradient)" stroke-width="2"/>
  <line x1="900" y1="100" x2="1100" y2="100" stroke="url(#goldGradient)" stroke-width="2"/>

  <!-- Platform Logo/Badge -->
  <text x="600" y="80" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="url(#goldGradient)" letter-spacing="3">${data.platformName}</text>
  
  <!-- Certificate of Achievement text -->
  <text x="600" y="160" font-family="Georgia, serif" font-size="48" font-weight="bold" text-anchor="middle" fill="url(#goldGradient)" letter-spacing="2">CERTIFICATE</text>
  <text x="600" y="215" font-family="Georgia, serif" font-size="36" text-anchor="middle" fill="rgb(150,150,150)">OF ACHIEVEMENT</text>

  <!-- Main content -->
  <text x="600" y="290" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="rgb(180,180,180)">This is proudly presented to</text>
  
  <!-- User name (large and prominent) -->
  <text x="600" y="370" font-family="Georgia, serif" font-size="52" font-weight="bold" text-anchor="middle" fill="url(#goldGradient)" letter-spacing="1">${data.userName.toUpperCase()}</text>

  <!-- Achievement description -->
  <text x="600" y="440" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="rgb(200,200,200)">For successfully completing</text>
  <text x="600" y="475" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="url(#goldGradient)">${data.challengeName}</text>
  <text x="600" y="520" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="rgb(180,180,180)">on ${data.platformName}</text>

  <!-- Statistics -->
  <text x="600" y="590" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="rgb(150,150,150)">Challenges Completed: ${data.totalChallenges}</text>

  <!-- Completion date -->
  <text x="600" y="650" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="rgb(150,150,150)">Completed on ${currentDate}</text>

  <!-- Signature line -->
  <line x1="350" y1="700" x2="550" y2="700" stroke="url(#goldGradient)" stroke-width="2"/>
  <text x="450" y="730" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="rgb(150,150,150)">The ${data.platformName} Community</text>

  <!-- Verification -->
  <text x="1050" y="730" font-family="Arial, sans-serif" font-size="12" text-anchor="end" fill="rgb(100,100,100)">Verified Certificate</text>
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
