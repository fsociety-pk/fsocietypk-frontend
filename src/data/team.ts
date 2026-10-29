export const TEAM_ABOUT_URL = 'https://about.fsocietypk.tech';
export const PLATFORM_URL = 'https://fsocietypk.tech';

export interface TeamMember {
  id: string;
  handle: string;
  name?: string;
  role?: string;
  bio?: string;
  specialties?: string[];
  image?: string;
  links?: { label: string; url: string }[];
}

export interface TeamProfileData {
  introduction: string;
  story: string[];
  disciplines: string[];
  members: TeamMember[];
  socials: { label: string; detail: string; url: string; kind: 'discord' | 'github' | 'linkedin' | 'email' | 'ctftime' | 'website' | 'instagram' | 'youtube' | 'x' }[];
}

// Defaults before the administrator publishes team details. Real content comes from /team.
export const teamContent: TeamProfileData = {
  introduction: 'A cybersecurity community from Pakistan. We learn through CTFs, share what we discover, and build practical security skills together.',
  story: [
    'Fsociety PK brings together people who want to understand how systems work, where they break, and how to make them stronger.',
    'Our platform is a place to practice challenges, read community writeups, and contribute your own work. This is the home of the team behind it.',
  ],
  disciplines: ['Web security', 'Cryptography', 'Digital forensics', 'Binary exploitation', 'Reverse engineering', 'OSINT'],
  members: [],
  socials: [
    { label: 'Discord', detail: 'Join the conversation', url: 'https://discord.gg/T92aGQn5f', kind: 'discord' },
    { label: 'GitHub', detail: 'Explore our projects', url: 'https://github.com/fsociety-pk', kind: 'github' },
    { label: 'LinkedIn', detail: 'Follow team updates', url: 'https://www.linkedin.com/company/fsociety-pk/', kind: 'linkedin' },
    // This profile identifies fsocietypk.tech as its website. Planned events are not completed results.
    { label: 'CTFtime', detail: 'Our competition profile', url: 'https://ctftime.org/team/432687', kind: 'ctftime' },
    { label: 'Email', detail: 'contact@fsocietypk.tech', url: 'mailto:contact@fsocietypk.tech', kind: 'email' },
  ],
};
