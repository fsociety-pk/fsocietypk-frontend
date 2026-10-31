import { useId, type CSSProperties } from 'react';
import { BADGE_OWNER_PLATE, badgeAsset, badgeDesign, badgeOwnerFontSize } from '../../utils/challengeBadges';

export default function ChallengeBadgeMark({ category, username, decorative = false, shine = false, shineDelay = 0 }: {
  category: string; username: string; decorative?: boolean; shine?: boolean; shineDelay?: number;
}) {
  const id = useId().replace(/:/g, '');
  return <span className="challenge-badge-mark" role={decorative ? undefined : 'img'} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : `${badgeDesign(category).label} completed badge earned by @${username}`}>
    <img className="challenge-badge-base" src={badgeAsset(category)} width={240} height={280} loading="lazy" draggable={false} alt="" />
    <svg className="challenge-badge-personalization" viewBox="0 0 240 320" aria-hidden="true" focusable="false">
      <g className="badge-owner-plate"><title>@{username}</title><path d={BADGE_OWNER_PLATE} fill="#17222A" stroke="#CEC7B4" strokeWidth="1.5" /><text x="120" y="300" textAnchor="middle" fontFamily="Arial,Helvetica,sans-serif" fontSize={badgeOwnerFontSize(username)} fontWeight="600" fill="#EFE9D7">@{username}</text></g>
      {shine && <><defs><clipPath id={`badge-clip-${id}`}><path d="M120 12 224 64v132l-104 62L16 196V64Z" /><path d="m120 219 23 13v25l-23 14-23-14v-25Z" /><path d={BADGE_OWNER_PLATE} /></clipPath><linearGradient id={`badge-shine-${id}`}><stop stopColor="white" stopOpacity="0" /><stop offset=".4" stopColor="white" stopOpacity=".08" /><stop offset=".5" stopColor="white" stopOpacity=".38" /><stop offset=".6" stopColor="white" stopOpacity=".08" /><stop offset="1" stopColor="white" stopOpacity="0" /></linearGradient></defs><g clipPath={`url(#badge-clip-${id})`}><rect className="challenge-badge-shine" width="76" height="360" y="-20" fill={`url(#badge-shine-${id})`} style={{ '--badge-shine-delay': `${shineDelay}s` } as CSSProperties} /></g></>}
    </svg>
  </span>;
}
