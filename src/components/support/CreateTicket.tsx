import { useRef, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { supportService, ticketCategories, type TicketCategory } from '../../services/supportService';
import { useAuthStore } from '../../store/authStore';

export default function CreateTicket({ onCreated }: { onCreated: (id: string) => void }) {
  const client = useQueryClient();
  const userId = useAuthStore(state => state.user?._id);
  const form = useRef<HTMLFormElement>(null);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('technical');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>({});
  const create = useMutation({ mutationFn: () => supportService.create({ subject: subject.trim(), category, message: message.trim() }), onSuccess: ticket => { client.setQueryData(['support-ticket', userId, false, ticket._id], ticket); void client.invalidateQueries({ queryKey: ['support-tickets'] }); onCreated(ticket._id); } });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (create.isPending) return;
    const next = {
      subject: subject.trim().length < 5 ? 'Enter a subject with at least 5 characters.' : undefined,
      message: message.trim().length < 10 ? 'Describe your request in at least 10 characters.' : undefined,
    };
    setErrors(next);
    if (next.subject || next.message) {
      form.current?.querySelector<HTMLElement>(next.subject ? '#support-subject' : '#support-message')?.focus();
      return;
    }
    create.mutate();
  };
  return <form ref={form} id="support-create-form" className="support-create" noValidate onSubmit={submit} aria-busy={create.isPending}>
    <div className="support-section-heading"><span className="eyebrow">Start a conversation</span><h2>How can we help?</h2><p>A bug, a question, or an idea. You’re in the right place.</p></div>
    <label htmlFor="support-category">What’s this about?</label><select id="support-category" className="input" value={category} onChange={event => setCategory(event.target.value as TicketCategory)}>{Object.entries(ticketCategories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
    <label htmlFor="support-subject">Subject</label><input id="support-subject" className="input" placeholder="Give your request a short, clear title" required minLength={5} maxLength={140} value={subject} onChange={event => { setSubject(event.target.value); setErrors(current => ({ ...current, subject: undefined })); }} aria-invalid={!!errors.subject} aria-describedby={errors.subject ? 'support-subject-error' : undefined} />
    {errors.subject && <p id="support-subject-error" className="support-error" role="alert">{errors.subject}</p>}
    <label htmlFor="support-message">Your message</label><textarea id="support-message" className="input" rows={7} placeholder="Tell us what happened, what you expected, and any steps to reproduce the issue." required minLength={10} maxLength={5000} value={message} onChange={event => { setMessage(event.target.value); setErrors(current => ({ ...current, message: undefined })); }} aria-invalid={!!errors.message} aria-describedby={`support-message-hint${errors.message ? ' support-message-error' : ''}`} /><small id="support-message-hint">Please leave out passwords, verification codes, and challenge flags. {message.length.toLocaleString()}/5,000</small>
    {errors.message && <p id="support-message-error" className="support-error" role="alert">{errors.message}</p>}
    {create.isError && <p className="support-error" role="alert">{create.error.message || 'Your ticket could not be sent. Your message is still here; please try again.'}</p>}
    <div className="support-form-footer"><span><ShieldCheck size={16} />Private between you and the admin</span><button type="submit" className="btn-primary" disabled={create.isPending}>{create.isPending ? 'Sending ticket…' : 'Send ticket'}<ArrowUpRight size={17} /></button></div>
  </form>;
}
