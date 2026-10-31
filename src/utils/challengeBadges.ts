import designs from '../data/challengeBadgeDesigns.json';
import type { UserProfile } from '../services/userService';

export interface EarnedChallengeBadge {
  id: string;
  challengeId: string;
  title: string;
  category: string;
  difficulty: string;
  points: number;
  earnedAt: string | null;
}

const knownCategory = (category: string): category is keyof typeof designs => Object.prototype.hasOwnProperty.call(designs, category);
export const badgeDesign = (category: string) => knownCategory(category) ? designs[category] : designs.misc;
export const badgeAsset = (category: string) => `/brand/badges/${knownCategory(category) ? category : 'misc'}.svg`;
export const BADGE_OWNER_PLATE = 'M30 280h180l8 8v14l-8 8H30l-8-8v-14Z';
export const badgeOwnerFontSize = (username: string) => Math.min(18, 174 / ((username.length + 1) * .62));

export function profileBadges(profile: UserProfile): EarnedChallengeBadge[] {
  if (profile.earnedBadges) return profile.earnedBadges;
  // Compatibility while frontend/backend deployments roll out. These are still
  // verified server completions, never browser storage or local progress.
  const seen = new Set<string>();
  return (profile.solveHistory || []).flatMap(solve => {
    const challenge = solve.challengeId || solve.challenge;
    if (!solve.isCorrect || !challenge?._id || seen.has(challenge._id)) return [];
    seen.add(challenge._id);
    return [{ id: `${profile._id}:${challenge._id}`, challengeId: challenge._id, title: challenge.title,
      category: challenge.category || 'misc', difficulty: challenge.difficulty || '', points: solve.pointsAwarded || 0,
      earnedAt: solve.timestamp || solve.createdAt || null }];
  });
}

const xmlEntities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
const escapeXml = (value: string) => value.replace(/[&<>"']/g, character => xmlEntities[character]);

export async function downloadChallengeBadge(badge: EarnedChallengeBadge, username: string) {
  const response = await fetch(badgeAsset(badge.category));
  if (!response.ok) throw Error('Badge artwork could not be loaded');
  const mark = (await response.text()).replace(/<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    + `<g class="badge-owner-plate"><path d="${BADGE_OWNER_PLATE}" fill="#17222A" stroke="#CEC7B4" stroke-width="1.5"/><text x="120" y="300" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="${badgeOwnerFontSize(username)}" font-weight="600" fill="#EFE9D7">@${escapeXml(username)}</text></g>`;
  const title = badge.title.length > 55 ? badge.title.slice(0, 52) + '…' : badge.title;
  const lines = title.match(/.{1,28}(?:\s|$)|.{1,28}/g)?.map(line => line.trim()).slice(0, 2) || [title];
  const date = badge.earnedAt ? new Date(badge.earnedAt) : null;
  const earned = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date not recorded';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1440" viewBox="0 0 400 480"><title>${escapeXml(badge.title)} — earned by ${escapeXml(username)}</title><metadata>${escapeXml(JSON.stringify({ ...badge, username, issuer: 'Fsociety PK' }))}</metadata><rect width="400" height="480" rx="20" fill="#F7F8FA"/><g transform="translate(92 0) scale(.9)">${mark}</g><g fill="#182436" font-family="Arial,Helvetica,sans-serif" text-anchor="middle"><text x="200" y="326" font-size="19" font-weight="700">${lines.map((line, index) => `<tspan x="200" dy="${index ? 25 : 0}">${escapeXml(line)}</tspan>`).join('')}</text><text x="200" y="394" font-size="14">@${escapeXml(username)}</text><text x="200" y="420" font-size="12" fill="#53647A">${escapeXml(badgeDesign(badge.category).label)}${badge.difficulty ? ` · ${escapeXml(badge.difficulty)}` : ''}</text><text x="200" y="443" font-size="12" fill="#53647A">Completed ${earned}</text><text x="200" y="467" font-size="10" letter-spacing="1.5" fill="#53647A">FSOCIETY PK</text></g></svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${badge.title}-${username}-badge.svg`.replace(/[^a-zA-Z0-9._-]/g, '-');
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
