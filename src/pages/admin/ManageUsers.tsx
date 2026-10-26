import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, RotateCcw, Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import PageState from '../../components/common/PageState';

export default function ManageUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const client = useQueryClient();
  useEffect(() => { const timer = window.setTimeout(() => { setQuery(search); setPage(1); }, 250); return () => window.clearTimeout(timer); }, [search]);
  const members = useQuery({ queryKey: ['admin-users', page, query, status], queryFn: () => adminService.getUsers(page, 25, query, status), select: response => response.data });
  const ban = useMutation({ mutationFn: adminService.toggleBan, onSuccess: response => { void client.invalidateQueries({ queryKey: ['admin-users'] }); void client.invalidateQueries({ queryKey: ['admin-stats'] }); toast.success(response.data.isBanned ? 'Member access suspended.' : 'Member access restored.'); }, onError: (error: any) => toast.error(error.response?.data?.message || 'Could not update member access.') });
  const total = members.data?.pagination.total ?? 0;
  return <div><div className="admin-page-heading"><div><h1>Members</h1><p>Manage community accounts. Administrator accounts are kept separate.</p></div><span className="admin-status-pill"><Users size={13} />{total.toLocaleString()} members</span></div>
    <div className="admin-toolbar"><div className="relative w-full sm:w-auto"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" /><input className="input pl-10" type="search" aria-label="Search members by username or email" placeholder="Search username or email" value={search} maxLength={80} onChange={event => setSearch(event.target.value)} /></div><label htmlFor="member-status">Access</label><select className="input" id="member-status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="all">All members</option><option value="active">Active</option><option value="banned">Suspended</option></select></div>
    {members.isLoading ? <PageState loading /> : members.isError ? <PageState title="Members could not be loaded" retry={() => members.refetch()} /> : !members.data?.users.length ? <div className="admin-panel admin-empty"><strong>No matching members.</strong>Try another username, email, or access filter.</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th scope="col">Member</th><th scope="col">Joined</th><th scope="col">Access</th><th scope="col">Actions</th></tr></thead><tbody>{members.data.users.map(member => <tr key={member._id}><td><strong>{member.username}</strong><small>{member.email || 'Community member'}</small></td><td>{new Date(member.createdAt).toLocaleDateString()}</td><td><span className={member.isBanned ? 'text-status-error' : 'text-status-success'}>{member.isBanned ? 'Suspended' : 'Active'}</span></td><td><button className="btn-outline" disabled={ban.isPending} onClick={() => { if (member.isBanned || window.confirm(`Suspend access for ${member.username}? They will be unable to use their account until access is restored.`)) ban.mutate(member._id); }}>{member.isBanned ? <RotateCcw size={14} /> : <Ban size={14} />}{member.isBanned ? 'Restore access' : 'Suspend'}</button></td></tr>)}</tbody></table></div>}
    <div className="admin-pagination"><span>{total ? `${(page - 1) * 25 + 1}–${Math.min(page * 25, total)} of ${total} members` : 'No members to show'}</span><div><button className="btn-outline" disabled={page <= 1 || members.isFetching} onClick={() => setPage(page - 1)}>Previous</button><button className="btn-outline" disabled={!members.data || page >= members.data.pagination.totalPages || members.isFetching} onClick={() => setPage(page + 1)}>Next</button></div></div>
  </div>;
}
