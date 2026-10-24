import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { 
  Shield, 
  User as UserIcon, 
  Ban, 
  RotateCcw, 
  Search, 
  Trophy,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const ManageUsers: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => adminService.getUsers(page, 50),
    select: (res) => res.data,
  });

  const banMutation = useMutation({
    mutationFn: (userId: string) => adminService.toggleBan(userId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success(`User ${res.data.isBanned ? 'banned' : 'unbanned'} successfully`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  });

  const filteredUsers = usersData?.users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
       <div className="h-full flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-2 border-neon-green/20 border-t-neon-green rounded-full animate-spin" />
       </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Users</h1>
          <p className="text-sm text-zinc-400">Manage accounts and review platform activity.</p>
        </div>

        <div className="relative w-full md:w-64">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
           <input 
             type="text" 
             placeholder="Search UID/Alias..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="input pl-10 h-10 text-xs font-mono"
           />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-surface border-b border-surface-border text-text-muted uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 font-medium">Operative</th>
                <th className="px-6 py-4 font-medium">Rank/Role</th>
                <th className="px-6 py-4 font-medium">Points</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={clsx(
                      "hover:bg-surface/30 transition-colors",
                      user.isBanned && "opacity-50"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-surface-border overflow-hidden bg-surface flex items-center justify-center">
                          {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon size={14} className="text-text-muted" />}
                        </div>
                        <div>
                          <p className="font-bold text-text-primary uppercase flex items-center gap-2">
                             {user.username}
                             {user.role === 'admin' && <Shield size={12} className="text-status-error" />}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={clsx(
                         "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                         user.role === 'admin' ? "bg-status-error/10 text-status-error border border-status-error/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                       )}>
                         {user.role}
                       </span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-1.5 font-bold text-white">
                       <Trophy size={12} className="text-neon-green" />
                       {user.score.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                       {user.isBanned ? (
                         <span className="flex items-center gap-1 text-status-error">
                            <AlertTriangle size={12} /> BANNED
                         </span>
                       ) : (
                         <span className="text-status-success">ACTIVE</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-text-muted">
                       {format(new Date(user.createdAt), 'yyyy-MM-dd')}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {user.role !== 'admin' && (
                         <button 
                           onClick={() => banMutation.mutate(user._id)}
                           disabled={banMutation.isPending}
                           className={clsx(
                             "btn px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all",
                             user.isBanned 
                                ? "bg-status-success/10 text-status-success hover:bg-status-success/20 border border-status-success/30" 
                                : "bg-status-error/10 text-status-error hover:bg-status-error/20 border border-status-error/30"
                           )}
                         >
                            {user.isBanned ? <><RotateCcw size={14} className="inline mr-1" /> UNBAN</> : <><Ban size={14} className="inline mr-1" /> BAN</>}
                         </button>
                       )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Placeholder */}
      <div className="flex justify-center gap-2">
         {usersData?.pagination.totalPages && Array.from({ length: usersData.pagination.totalPages }).map((_, i) => (
           <button 
             key={i} 
             onClick={() => setPage(i + 1)}
             className={clsx(
               "w-8 h-8 rounded font-mono text-xs border border-surface-border",
               page === i + 1 ? "bg-neon-green text-background border-neon-green" : "text-text-muted hover:border-text-primary"
             )}
           >
              {i + 1}
           </button>
         ))}
      </div>
    </div>
  );
};

export default ManageUsers;
