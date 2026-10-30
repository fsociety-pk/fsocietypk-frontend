import { badgeAsset, badgeDesign } from '../../utils/challengeBadges';

export default function ChallengeBadgeMark({ category, decorative = false }: { category: string; decorative?: boolean }) {
  return <img className="challenge-badge-mark" src={badgeAsset(category)} width={240} height={280} loading="lazy" draggable={false} alt={decorative ? '' : `${badgeDesign(category).label} challenge completed badge`} />;
}
