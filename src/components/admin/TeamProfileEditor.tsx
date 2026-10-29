import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { teamService, type AdminTeamProfile } from '../../services/teamService';
import type { TeamMember } from '../../data/team';

export function TeamField({ id, label, value, onChange, multiline = false, required = false, type = 'text', maxLength = 2000 }: { id: string; label: string; value: string; onChange: (value: string) => void; multiline?: boolean; required?: boolean; type?: string; maxLength?: number }) {
  const props = { id, className: 'input', value, required, maxLength, onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value) };
  return <div className="admin-field"><label htmlFor={id}>{label}</label>{multiline ? <textarea {...props} rows={4} /> : <input {...props} type={type} />}</div>;
}
export const teamError = (error: unknown, fallback: string) => {
  const response = (error as { response?: { data?: { message?: string; errors?: { message?: string }[] } } }).response?.data;
  return response?.errors?.[0]?.message || response?.message || fallback;
};
const memberId = () => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export default function TeamProfileEditor({ initial }: { initial: AdminTeamProfile }) {
  const [profile, setProfile] = useState(initial);
  const [story, setStory] = useState(initial.story.join('\n\n'));
  const [disciplines, setDisciplines] = useState(initial.disciplines.join(', '));
  const [error, setError] = useState('');
  const client = useQueryClient();
  const save = useMutation({ mutationFn: teamService.saveProfile, onSuccess: data => { client.setQueryData(['admin-team-profile'], data); toast.success('Team page updated.'); }, onError: error => setError(teamError(error, 'Team details could not be saved. Your changes are still here.')) });
  const updateMember = (index: number, update: Partial<TeamMember>) => setProfile(current => ({ ...current, members: current.members.map((member, i) => i === index ? { ...member, ...update } : member) }));
  const submit = (event: FormEvent) => { event.preventDefault(); setError(''); save.mutate({ ...profile, members: profile.members.map(member => ({ ...member, specialties: member.specialties?.map(text => text.trim()).filter(Boolean) || [] })), story: story.split(/\n\s*\n/).map(text => text.trim()).filter(Boolean), disciplines: disciplines.split(',').map(text => text.trim()).filter(Boolean) }); };

  return <form onSubmit={submit} className="team-manager-form">
    {error && <p className="admin-inline-error" role="alert">{error}</p>}
    <fieldset disabled={save.isPending}>
      <section className="admin-form-panel"><h2>Team introduction</h2><p className="admin-help">These details appear on your public team page.</p>
        <TeamField id="team-introduction" label="Introduction" value={profile.introduction} onChange={introduction => setProfile({ ...profile, introduction })} required multiline maxLength={1000} />
        <TeamField id="team-story" label="Our story (separate paragraphs with a blank line)" value={story} onChange={setStory} required multiline maxLength={36000} />
        <TeamField id="team-disciplines" label="Security disciplines, comma separated" value={disciplines} onChange={setDisciplines} maxLength={1600} />
      </section>

      <section className="admin-form-panel"><div className="team-manager-section-heading"><div><h2>Team members</h2><p className="admin-help">Add the names or handles you want to share publicly.</p></div><button className="btn-outline" type="button" disabled={profile.members.length >= 100} onClick={() => setProfile({ ...profile, members: [...profile.members, { id: memberId(), handle: '', name: '', role: '', bio: '', image: '', specialties: [], links: [] }] })}><Plus size={16} />Add member</button></div>
        {!profile.members.length && <p className="admin-help">No member profiles yet.</p>}
        {profile.members.map((member, index) => <div className="team-manager-member" key={member.id}>
          <div className="team-manager-section-heading"><h3>{member.handle || `Member ${index + 1}`}</h3><button type="button" className="btn-ghost" aria-label={`Remove member ${index + 1}`} onClick={() => setProfile({ ...profile, members: profile.members.filter((_, i) => i !== index) })}><Trash2 size={16} />Remove</button></div>
          <div className="team-manager-fields">{(['handle', 'name', 'role', 'image'] as const).map(field => <TeamField key={field} id={`member-${member.id}-${field}`} label={{ handle: 'Handle', name: 'Display name (optional)', role: 'Role (optional)', image: 'Photo URL (HTTPS, optional)' }[field]} value={member[field] || ''} onChange={value => updateMember(index, { [field]: value })} type={field === 'image' ? 'url' : 'text'} required={field === 'handle'} maxLength={field === 'image' ? 2048 : field === 'handle' ? 60 : field === 'role' ? 120 : 100} />)}</div>
          <TeamField id={`member-${member.id}-bio`} label="Biography (optional)" value={member.bio || ''} onChange={bio => updateMember(index, { bio })} multiline />
          <TeamField id={`member-${member.id}-specialties`} label="Specialties, comma separated" value={member.specialties?.join(', ') || ''} onChange={value => updateMember(index, { specialties: value.split(',').map(item => item.trimStart()) })} maxLength={960} />
          {(member.links || []).map((link, linkIndex) => <div className="team-manager-link" key={linkIndex}>
            <TeamField id={`member-${member.id}-link-${linkIndex}-label`} label="Link label" value={link.label} required maxLength={60} onChange={label => updateMember(index, { links: member.links!.map((item, i) => i === linkIndex ? { ...item, label } : item) })} />
            <TeamField id={`member-${member.id}-link-${linkIndex}-url`} label="Link URL" value={link.url} type="url" required maxLength={2048} onChange={url => updateMember(index, { links: member.links!.map((item, i) => i === linkIndex ? { ...item, url } : item) })} />
            <button type="button" className="icon-button" aria-label={`Remove ${member.handle || 'member'} link ${linkIndex + 1}`} onClick={() => updateMember(index, { links: member.links!.filter((_, i) => i !== linkIndex) })}><Trash2 size={16} /></button>
          </div>)}
          <button type="button" className="btn-ghost" disabled={(member.links?.length || 0) >= 8} onClick={() => updateMember(index, { links: [...(member.links || []), { label: '', url: '' }] })}><Plus size={15} />Add member link</button>
        </div>)}
      </section>

      <section className="admin-form-panel"><div className="team-manager-section-heading"><div><h2>Social &amp; contact links</h2><p className="admin-help">Choose which channels appear in the public directory.</p></div><button className="btn-outline" type="button" disabled={profile.socials.length >= 20} onClick={() => setProfile({ ...profile, socials: [...profile.socials, { label: '', detail: '', url: '', kind: 'website' }] })}><Plus size={16} />Add social link</button></div>
        {profile.socials.map((social, index) => <div className="team-manager-social" key={index}>
          <div className="team-manager-fields">{(['label', 'detail', 'url'] as const).map(field => <TeamField key={field} id={`social-${index}-${field}`} label={{ label: 'Platform name', detail: 'Description (optional)', url: 'URL (HTTPS or mailto)' }[field]} value={social[field]} required={field !== 'detail'} maxLength={field === 'url' ? 2048 : field === 'label' ? 60 : 150} onChange={value => setProfile({ ...profile, socials: profile.socials.map((item, i) => i === index ? { ...item, [field]: value } : item) })} />)}
            <div className="admin-field"><label htmlFor={`social-${index}-icon`}>Platform icon</label><select className="input" id={`social-${index}-icon`} value={social.kind} onChange={event => setProfile({ ...profile, socials: profile.socials.map((item, i) => i === index ? { ...item, kind: event.target.value as typeof social.kind } : item) })}>{['discord', 'github', 'linkedin', 'email', 'ctftime', 'website', 'instagram', 'youtube', 'x'].map(kind => <option key={kind} value={kind}>{kind === 'ctftime' ? 'CTFtime' : kind === 'x' ? 'X / Twitter' : kind[0].toUpperCase() + kind.slice(1)}</option>)}</select></div>
          </div><button type="button" className="btn-ghost" aria-label={`Remove social link ${index + 1}`} onClick={() => setProfile({ ...profile, socials: profile.socials.filter((_, i) => i !== index) })}><Trash2 size={16} />Remove link</button>
        </div>)}
      </section>
      <button className="btn-primary" type="submit"><Save size={16} />{save.isPending ? 'Saving team details…' : 'Save team details'}</button>
    </fieldset>
  </form>;
}
