import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowUpRight, Trophy, Users } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import ThemeToggle from '../components/common/ThemeToggle';
import { PLATFORM_URL, teamContent } from '../data/team';
import { useScrollTextReveal } from '../hooks/useScrollTextReveal';
import { teamService } from '../services/teamService';
import CertificateShelf from '../components/common/CertificateShelf';
import CertificateYearTabs from '../components/common/CertificateYearTabs';
import AnimatedSocialLink from '../components/common/AnimatedSocialLink';
import '../styles/about-team.css';

export default function AboutTeam() {
  const root = useRef<HTMLDivElement>(null);
  useScrollTextReveal(root, '.team-story h2, .team-section-heading h2, .team-connect h2');
  const [year, setYear] = useState('all');
  const [page, setPage] = useState(1);
  const knownYears = useRef<number[]>([]);
  const profileQuery = useQuery({ queryKey: ['public-team-profile'], queryFn: teamService.getProfile });
  const profile = profileQuery.data || teamContent;
  const certificatesQuery = useQuery({ queryKey: ['public-team-certificates', page, year], queryFn: () => teamService.listCertificates(page, year === 'all' ? '' : year) });
  const certificates = certificatesQuery.data?.certificates || [];
  if (certificatesQuery.data) knownYears.current = certificatesQuery.data.years;
  const years = knownYears.current;
  const pagination = certificatesQuery.data?.pagination;

  return <div className="team-site" ref={root}>
    <a className="skip-link" href="#team-main">Skip to content</a>
    <header className="team-header">
      <a className="team-brand" href={PLATFORM_URL} aria-label="Fsociety PK platform"><BrandLogo /><span>Fsociety <b>PK</b></span></a>
      <nav className="team-navigation" aria-label="Team page">
        <a href="#story">Our story</a><a href="#ctfs">CTF history</a><a href="#people">The team</a><a href="#connect">Connect</a>
      </nav>
      <div className="team-header-actions"><ThemeToggle /><a className="team-platform-link" href={PLATFORM_URL}>The platform <ArrowUpRight size={16} /></a></div>
    </header>

    <main id="team-main" tabIndex={-1}>
      <section className="team-hero" aria-labelledby="team-title">
        <div className="team-hero-copy">
          <span className="team-location">From Pakistan. Open to the curious.</span>
          <h1 id="team-title">Behind<br />the flags.</h1>
          <p className="team-hero-intro">{profile.introduction}</p>
          <div className="team-hero-actions"><a className="btn-primary" href="#people">Meet Fsociety PK <ArrowRight size={17} /></a><a className="team-text-link" href="#ctfs">Our CTF journey <ArrowUpRight size={16} /></a></div>
        </div>
        <figure className="team-identity"><BrandLogo /><figcaption>Fsociety PK<span>Learn. Practice. Share.</span></figcaption></figure>
      </section>

      <section id="story" className="team-story team-section" aria-labelledby="story-heading">
        <h2 id="story-heading">Curiosity brought<br />us together.</h2>
        <div>{profile.story.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{profileQuery.isError && <p className="team-fetch-error" role="alert">Team updates could not be loaded. <button onClick={() => profileQuery.refetch()}>Try again</button></p>}</div>
        <ul className="team-disciplines" aria-label="Security disciplines">{profile.disciplines.map(discipline => <li key={discipline}>{discipline}</li>)}</ul>
      </section>

      <section id="ctfs" className="team-section" aria-labelledby="ctfs-heading">
        <div className="team-section-heading"><div><h2 id="ctfs-heading">CTFs we’ve played.</h2><p>Our competition journey, one certificate at a time.</p></div><a className="team-text-link" href="https://ctftime.org/team/432687" target="_blank" rel="noopener noreferrer">Find us on CTFtime <ArrowUpRight size={16} /></a></div>
        {!!years.length && <CertificateYearTabs years={years} value={year} onChange={value => { setYear(value); setPage(1); }} />}
        {certificatesQuery.isLoading ? <div className="team-certificate-loading" role="status">Loading team certificates…</div> : certificatesQuery.isError ? <div className="team-unpublished" role="alert"><div><h3>Certificates could not be loaded.</h3><p>Please try again in a moment.</p><button className="btn-outline" onClick={() => certificatesQuery.refetch()}>Try again</button></div></div> : certificates.length ? <>
          <CertificateShelf key={`${page}-${year}`} certificates={certificates} />
          {pagination && pagination.totalPages > 1 && <nav className="team-pagination" aria-label="Certificate pages"><button className="btn-outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pagination.totalPages}</span><button className="btn-outline" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</button></nav>}
        </> : <div className="team-unpublished"><Trophy size={28} aria-hidden="true" /><div><h3>{year === 'all' ? 'Our competition log is on its way.' : 'No certificates for this year yet.'}</h3><p>Visit our CTFtime profile for more about the team’s competition journey.</p></div></div>}
      </section>

      <section id="people" className="team-section" aria-labelledby="people-heading">
        <div className="team-section-heading"><div><h2 id="people-heading">The people behind it.</h2><p>Meet the team building, learning, and solving together.</p></div></div>
        {profileQuery.isLoading ? <p role="status">Loading team members…</p> : profile.members.length ? <div className="team-members">{profile.members.map(member => <article key={member.id} className="team-member">
          <div className="team-member-identity">{member.image ? <img src={member.image} alt="" loading="lazy" width="72" height="72" /> : <span className="team-member-initial" aria-hidden="true">{member.handle[0]?.toUpperCase()}</span>}<div><h3>{member.name || member.handle}</h3>{member.name && <span>@{member.handle}</span>}{member.role && <p>{member.role}</p>}</div></div>
          {member.bio && <p>{member.bio}</p>}{!!member.specialties?.length && <ul className="team-specialties" aria-label={`${member.handle}'s specialties`}>{member.specialties.map(specialty => <li key={specialty}>{specialty}</li>)}</ul>}
          {!!member.links?.length && <div className="team-member-links">{member.links.map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`${member.handle} on ${link.label}`}>{link.label}<ArrowUpRight size={14} /></a>)}</div>}
        </article>)}</div> : <div className="team-unpublished"><Users size={28} aria-hidden="true" /><div><h3>Member introductions are coming soon.</h3><p>Until then, meet the community and say hello on Discord.</p><a className="team-text-link" href="https://discord.gg/T92aGQn5f" target="_blank" rel="noopener noreferrer">Join the conversation <ArrowUpRight size={16} /></a></div></div>}
      </section>

      <section id="connect" className="team-connect team-section" aria-labelledby="connect-heading">
        <div><h2 id="connect-heading">Keep in touch.</h2><p>Talk CTFs, explore our projects, or get in touch with the team.</p></div>
        <div className="team-socials">{profile.socials.map((social, index) => <AnimatedSocialLink key={social.url} social={social} index={index} />)}</div>
      </section>
    </main>

    <footer className="team-footer"><a href={PLATFORM_URL}>Fsociety PK <ArrowUpRight size={15} /></a><span>Made for the curious. © {new Date().getFullYear()} Fsociety PK.</span><a href="#team-title">Back to top ↑</a></footer>
  </div>;
}
