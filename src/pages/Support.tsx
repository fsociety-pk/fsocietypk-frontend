import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Headphones, MessageSquare, Plus, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supportService, ticketStatuses, ticketCategories } from '../services/supportService';
import CreateTicket from '../components/support/CreateTicket';
import TicketConversation from '../components/support/TicketConversation';
import PageState from '../components/common/PageState';
import '../styles/support.css';

export default function Support({ admin = false }: { admin?: boolean }) {
  const userId = useAuthStore(state => state.user?._id);
  const [params, setParams] = useSearchParams();
  const selected = params.get('ticket');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [created, setCreated] = useState(false);
  const query = useQuery({ queryKey: ['support-tickets', userId, admin, status, page], queryFn: () => supportService.list(admin, status, page), refetchInterval: 30000 });
  const select = (id: string) => { setParams({ ticket: id }); };
  const back = () => { setParams({}); setCreated(false); };
  return <div className="support-page">
    <div className="page-heading"><div><span className="eyebrow">{admin ? 'Community care' : 'We’re here to help'}</span><h1>{admin ? 'Support inbox' : 'Let’s sort it out.'}</h1><p>{admin ? 'Read requests, help your members, and keep every conversation in one place.' : 'Contact the admin, report an issue, or share what’s on your mind.'}</p></div>{!admin && <button className="btn-primary" onClick={() => { back(); requestAnimationFrame(() => document.getElementById("support-subject")?.focus()); }}><Plus size={17} />New ticket</button>}</div>
    {created && <div className="support-success" role="status"><CheckCircle2 size={20} /><div><strong>Your ticket is with the admin.</strong><p>You can follow the conversation and read replies here.</p></div></div>}
    {selected ? <TicketConversation key={selected} id={selected} admin={admin} onBack={back} /> : <>
      {!admin && <div className="support-intro"><div className="support-intro-copy"><Headphones size={28} /><h2>A direct line to the admin.</h2><p>Every request gets its own space. Describe the issue, keep the details together, and pick up the conversation whenever you need.</p><span><MessageSquare size={16} />Real conversations. All in one place.</span></div><CreateTicket onCreated={id => { select(id); setCreated(true); }} /></div>}
      {<section className="support-history"><div className="support-history-heading"><div><span className="eyebrow">{admin ? 'Incoming requests' : 'Your conversations'}</span><h2>{admin ? 'Member tickets' : 'My tickets'}</h2></div><label className="support-filter">Show<select className="input" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} aria-label="Filter tickets by status"><option value="all">All tickets</option>{Object.entries(ticketStatuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></div>
      {query.isLoading ? <PageState loading /> : query.isError ? <PageState title="Tickets couldn't be loaded" retry={() => query.refetch()} /> : !query.data?.data.length ? <div className="support-empty"><MessageSquare size={28} /><h3>{status === 'all' ? admin ? 'Your inbox is clear' : 'Your conversations start here' : 'No tickets with this status'}</h3><p>{admin ? 'New member requests will appear here.' : 'Send a ticket above whenever you need a hand.'}</p></div> : <div className="support-ticket-list">{query.data.data.map(ticket => <button key={ticket._id} className="support-ticket-row" onClick={() => select(ticket._id)}><span className="support-ticket-icon"><MessageSquare size={19} /></span><span className="support-ticket-summary"><strong>{ticket.subject}</strong><small>#{ticket._id.slice(-8).toUpperCase()} · {ticketCategories[ticket.category]}{admin ? ` · ${ticket.userId?.username || 'Former member'}` : ''}</small></span><span className={`support-status ${ticket.status}`}>{ticketStatuses[ticket.status]}</span><time dateTime={ticket.updatedAt}>{new Date(ticket.updatedAt).toLocaleDateString()}</time><ChevronRight size={17} /></button>)}</div>}
      {query.data && query.data.meta.totalPages > 1 && <div className="support-pagination"><button className="btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {query.data.meta.totalPages}</span><button className="btn-outline" disabled={page >= query.data.meta.totalPages} onClick={() => setPage(page + 1)}>Next<ArrowUpRight size={15} /></button></div>}
      </section>}
    </>}
  </div>;
}
