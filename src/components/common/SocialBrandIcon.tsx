import { useId } from 'react';
import { Globe, Mail, Trophy } from 'lucide-react';
import type { TeamProfileData } from '../../data/team';

export type SocialKind = TeamProfileData['socials'][number]['kind'];

/** Brand marks are decorative; the containing link supplies its accessible name. */
export default function SocialBrandIcon({ kind }: { kind: SocialKind }) {
  const gradient = `social-instagram-${useId().replace(/:/g, '')}`;
  const props = { className: 'social-brand-glyph', width: 32, height: 32, 'aria-hidden': true as const, focusable: false as const };
  if (kind === 'instagram') return <svg {...props} viewBox="0 0 24 24" fill="none"><defs><linearGradient id={gradient} x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#ffdc80" /><stop offset=".28" stopColor="#f77737" /><stop offset=".58" stopColor="#e1306c" /><stop offset="1" stopColor="#833ab4" /></linearGradient></defs><rect x="3" y="3" width="18" height="18" rx="5" stroke={`url(#${gradient})`} strokeWidth="2.2" /><circle cx="12" cy="12" r="4.2" stroke={`url(#${gradient})`} strokeWidth="2.2" /><circle cx="17.5" cy="6.7" r="1.2" fill="#c13584" /></svg>;
  if (kind === 'discord') return <svg {...props} viewBox="0 0 127.14 96.36" fill="#5865f2"><path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.1 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.45-51.27-19.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 45.91 53.89 53 48.84 65.69 42.45 65.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 45.91 96.12 53 91.08 65.69 84.69 65.69Z" /></svg>;
  if (kind === 'github') return <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.68.08-.68 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.4-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.16a10.8 10.8 0 0 1 5.62 0c2.15-1.46 3.1-1.16 3.1-1.16.61 1.55.23 2.7.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.33-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z" /></svg>;
  if (kind === 'linkedin') return <svg {...props} viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#0a66c2" /><path fill="#fff" d="M19 19h-3.13v-4.9c0-1.17-.02-2.67-1.63-2.67-1.63 0-1.88 1.27-1.88 2.59V19H9.23V8.88h3v1.39h.04c.42-.8 1.45-1.63 2.97-1.63 3.18 0 3.76 2.09 3.76 4.81V19ZM5.34 7.5a1.82 1.82 0 1 1 0-3.64 1.82 1.82 0 0 1 0 3.64ZM6.9 19H3.77V8.88H6.9V19Z" /></svg>;
  if (kind === 'youtube') return <svg {...props} viewBox="0 0 24 24"><path fill="#f03" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8Z" /><path fill="#fff" d="m9.6 15.6 6.2-3.6-6.2-3.6Z" /></svg>;
  if (kind === 'x') return <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.59-6.64 7.59H.47l8.6-9.84L0 1.15h7.59l5.25 6.94Zm-1.29 19.49h2.04L6.49 3.24H4.3Z" /></svg>;
  if (kind === 'ctftime') return <Trophy {...props} strokeWidth={1.7} />;
  if (kind === 'email') return <Mail {...props} strokeWidth={1.7} />;
  return <Globe {...props} strokeWidth={1.7} />;
}
