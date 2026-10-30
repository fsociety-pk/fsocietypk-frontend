import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supportService, ticketCategories, ticketStatuses, type TicketStatus } from '../../services/supportService';
import { useAuthStore } from '../../store/authStore';
import PageState from '../common/PageState';

export default function TicketConversation({ id, admin, onBack }: { id: string; admin: boolean; onBack: () => void }) {
  const client = useQueryClient();
  const userId = useAuthStore(state => state.user?._id);
  const [message, setMessage] = useState('');
  const query = useQuery({ queryKey: ['support-ticket', userId, admin, id], queryFn: () => supportService.get(admin, id), refetchInterval: 30000 });
  useEffect(() => { setMessage(''); }, [id]);
  const update = useMutation({
    mutationFn: (input: { message?: string; status?: TicketStatus }) => supportService.update(admin, id, input),
    onSuccess: (ticket, input) => { if (input.message || input.status === 'closed') setMessage(''); client.setQueryData(['support-ticket', userId, admin, id], ticket); void client.invalidateQueries({ queryKey: ['support-tickets'] }); toast.success(input.status === 'closed' ? 'Ticket closed' : 'Ticket updated'); },
    onError: (error: Error) => toast.error(error.message || 'Could not update the ticket. Please try again.'),
  });
  if (query.isLoading) return <PageState loading />;
  if (!query.data || query.isError) return <div><button className="btn-ghost" onClick={onBack}><ArrowLeft size={16} />Back to tickets</button><PageState title="Ticket couldn't be loaded" retry={() => query.refetch()} /></div>;
  const ticket = query.data;
  return <section className="support-conversation" aria-label="Ticket conversation">
    <button className="btn-ghost" onClick={onBack}><ArrowLeft size={16} />All tickets</button>
    <header className="support-detail-heading"><div><span className="eyebrow">Ticket #{ticket._id.slice(-8).toUpperCase()} · {ticketCategories[ticket.category]}</span><h2>{ticket.subject}</h2><p>{admin ? `From ${ticket.userId?.username || 'Former member'} · ` : ''}Opened {new Date(ticket.createdAt).toLocaleDateString()}</p></div><div className="support-ticket-actions"><span className={`support-status ${ticket.status}`}>{ticketStatuses[ticket.status]}</span>{!admin && ticket.status !== 'closed' && <button type="button" className="btn-outline" disabled={update.isPending} onClick={() => update.mutate({ status: 'closed' })}><CheckCircle2 size={17} />{update.isPending && update.variables?.status === 'closed' ? 'Closing ticket…' : 'Close ticket'}</button>}</div></header>
    {admin && ticket.status !== 'closed' && <div className="support-status-control"><label htmlFor="ticket-status">Ticket status</label><select id="ticket-status" className="input" value={ticket.status} disabled={update.isPending} onChange={event => update.mutate({ status: event.target.value as TicketStatus })}>{Object.entries(ticketStatuses).filter(([value]) => value !== 'closed').map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>}
    <div className="support-messages">{ticket.messages?.map(item => <article key={item._id} className={`support-message ${item.author}`}><header><strong>{item.author === 'admin' ? 'Fsociety PK · Admin' : admin ? ticket.userId?.username || 'Member' : 'You'}</strong><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time></header><p>{item.body}</p></article>)}</div>
    {ticket.status === 'closed' ? <div className="support-resolved" role="status"><CheckCircle2 size={20} /><div><strong>This ticket is closed.</strong><p>{admin ? 'The member closed this ticket. The conversation is read-only.' : 'Your conversation is saved here. Create a new ticket if you need more help.'}</p></div></div> : ticket.status === 'resolved' ? <div className="support-resolved"><CheckCircle2 size={20} /><div><strong>This ticket is resolved.</strong><p>{admin ? 'Reopen it above to continue the conversation.' : 'Close this ticket if your issue is sorted. If you need more help, create a new ticket and mention this ticket number.'}</p></div></div> : <form onSubmit={event => { event.preventDefault(); if (message.trim() && !update.isPending) update.mutate({ message: message.trim() }); }} className="support-reply"><label htmlFor="support-reply">{admin ? 'Reply to the member' : 'Add a reply'}</label><textarea id="support-reply" className="input" rows={4} maxLength={5000} required disabled={update.isPending} value={message} onChange={event => setMessage(event.target.value)} placeholder="Write your message…" /><div className="support-form-footer"><small>Replies stay in this private conversation.</small><button className="btn-primary" disabled={update.isPending || !message.trim()}><Send size={16} />{update.isPending && update.variables?.message ? 'Sending…' : 'Send reply'}</button></div></form>}
  </section>;
}
