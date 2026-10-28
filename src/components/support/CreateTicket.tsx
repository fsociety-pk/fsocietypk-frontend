import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { supportService, ticketCategories, type TicketCategory } from '../../services/supportService';

export default function CreateTicket({ onCreated }: { onCreated: (id: string) => void }) {
  const client = useQueryClient();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('technical');
  const [message, setMessage] = useState('');
  const create = useMutation({ mutationFn: () => supportService.create({ subject: subject.trim(), category, message: message.trim() }), onSuccess: ticket => { void client.invalidateQueries({ queryKey: ['support-tickets'] }); onCreated(ticket._id); } });
  return <form className="support-create" onSubmit={event => { event.preventDefault(); create.mutate(); }}>
    <div className="support-section-heading"><span className="eyebrow">Start a conversation</span><h2>How can we help?</h2><p>A bug, a question, or an idea. You’re in the right place.</p></div>
    <label htmlFor="support-category">What’s this about?</label><select id="support-category" className="input" value={category} onChange={event => setCategory(event.target.value as TicketCategory)}>{Object.entries(ticketCategories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
    <label htmlFor="support-subject">Subject</label><input id="support-subject" className="input" placeholder="Give your request a short, clear title" required minLength={5} maxLength={140} value={subject} onChange={event => setSubject(event.target.value)} />
    <label htmlFor="support-message">Your message</label><textarea id="support-message" className="input" rows={7} placeholder="Tell us what happened, what you expected, and any steps to reproduce the issue." required minLength={10} maxLength={5000} value={message} onChange={event => setMessage(event.target.value)} aria-describedby="support-message-hint" /><small id="support-message-hint">Please leave out passwords, verification codes, and challenge flags. {message.length.toLocaleString()}/5,000</small>
    {create.isError && <p className="support-error" role="alert">{create.error.message || 'Your ticket could not be sent. Your message is still here; please try again.'}</p>}
    <div className="support-form-footer"><span><ShieldCheck size={16} />Private between you and the admin</span><button className="btn-primary" disabled={create.isPending || subject.trim().length < 5 || message.trim().length < 10}>{create.isPending ? 'Sending ticket…' : 'Send ticket'}<ArrowUpRight size={17} /></button></div>
  </form>;
}
