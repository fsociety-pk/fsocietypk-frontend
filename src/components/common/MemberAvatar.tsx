export const DEFAULT_MEMBER_AVATAR = '/brand/default-hacker-avatar.webp';

/** Keep the same anonymous identity across profiles and the account menu. */
export default function MemberAvatar({ src, username = 'Member', decorative = false }: {
  src?: string | null; username?: string; decorative?: boolean;
}) {
  return <img
    key={src || DEFAULT_MEMBER_AVATAR}
    src={src || DEFAULT_MEMBER_AVATAR}
    alt={decorative ? '' : src ? `${username}'s profile photo` : `Default hacker avatar for ${username}`}
    width={512}
    height={512}
    draggable={false}
    onError={event => {
      const image = event.currentTarget;
      if (image.getAttribute('src') !== DEFAULT_MEMBER_AVATAR) {
        image.src = DEFAULT_MEMBER_AVATAR;
        image.alt = decorative ? '' : `Default hacker avatar for ${username}`;
      }
    }}
  />;
}
