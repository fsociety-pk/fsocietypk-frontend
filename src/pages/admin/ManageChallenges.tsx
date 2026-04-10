import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  ExternalLink, 
  Calendar,
  User as UserIcon,
  Tag,
  AlertCircle,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

const ManageChallenges: React.FC = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = React.useState<string>('');
  const { user } = useAuthStore();

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['admin-challenges', filter],
    queryFn: () => adminService.getChallenges(filter),
    select: (res) => res.data,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      adminService.updateChallengeStatus(id, status, reason),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success(`Mission status set to ${res.data.status}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Update failed');
    },
  });

  const handleReject = (id: string) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason === null) return; // Cancelled
    statusMutation.mutate({ id, status: 'rejected', reason: reason || 'Does not meet platform standards' });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteChallenge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Mission purged from system');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Purge failed');
    }
  });

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
          <h1 className="text-3xl font-black italic tracking-tighter text-glow uppercase">MISSION_CONTROL</h1>
          <p className="text-text-muted font-mono text-sm uppercase">Oversee and moderate challenge deployment.</p>
        </div>

        <div className="flex bg-surface p-1 rounded-lg border border-surface-border">
          {['', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={clsx(
                "px-4 py-1.5 rounded text-[10px] font-mono font-bold uppercase transition-all",
                filter === s 
                  ? "bg-neon-green text-background shadow-neon-sm" 
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {s || 'ALL'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {challenges?.map((mission) => (
            (() => {
              const authorObj = typeof mission.author === 'string' ? null : (mission.author as any);
              const createdByObj = typeof mission.createdBy === 'string' ? null : (mission.createdBy as any);
              const authorId =
                authorObj?._id ||
                createdByObj?._id ||
                (typeof mission.author === 'string' ? mission.author : undefined) ||
                (typeof mission.createdBy === 'string' ? mission.createdBy : undefined);
              const isOwnSubmission = Boolean(user?._id && authorId && user._id === authorId);

              return (
            <motion.div
              key={mission._id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background-card border border-surface-border rounded-xl p-6 group hover:border-neon-green/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
                <div className={clsx(
                  "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border",
                  mission.status === 'approved' ? "bg-status-success/10 border-status-success/20 text-status-success" :
                  mission.status === 'pending' ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
                  "bg-status-error/10 border-status-error/20 text-status-error"
                )}>
                  {mission.status === 'approved' ? <CheckCircle size={20} /> : 
                   mission.status === 'pending' ? <Clock size={20} /> : <XCircle size={20} />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-text-primary group-hover:text-neon-green transition-colors">
                      {mission.title}
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-surface border border-surface-border text-text-muted">
                      {mission.difficulty}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-text-muted">
                    <span className="flex items-center gap-1.5"><Tag size={12} /> {mission.category}</span>
                    <span className="flex items-center gap-1.5"><UserIcon size={12} /> {typeof mission.author === 'string' ? 'System' : (mission.author as any)?.username}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {format(new Date(mission.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-surface-border">
                {mission.status !== 'approved' && (
                  <button 
                    onClick={() => statusMutation.mutate({ id: mission._id, status: 'approved' })}
                    disabled={statusMutation.isPending || isOwnSubmission}
                    className="btn bg-status-success/10 text-status-success hover:bg-status-success/20 border-status-success/30 px-4 py-2 text-[10px] font-black flex items-center gap-2"
                    title={isOwnSubmission ? 'You cannot approve your own submission' : 'Approve'}
                  >
                    <CheckCircle size={14} /> APPROVE
                  </button>
                )}
                {mission.status === 'pending' && (
                  <button 
                    onClick={() => handleReject(mission._id)}
                    disabled={statusMutation.isPending || isOwnSubmission}
                    className="btn bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/30 px-4 py-2 text-[10px] font-black flex items-center gap-2"
                    title={isOwnSubmission ? 'You cannot reject your own submission' : 'Reject'}
                  >
                    <XCircle size={14} /> REJECT
                  </button>
                )}
                {isOwnSubmission && mission.status === 'pending' && (
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 border border-zinc-700 rounded px-2 py-1">
                    Awaiting another admin
                  </span>
                )}
                <button 
                  onClick={() => deleteMutation.mutate(mission._id)}
                  disabled={deleteMutation.isPending}
                  className="btn bg-status-error/10 text-status-error hover:bg-status-error/20 border-status-error/30 p-2 rounded-lg"
                  title="DELETE MISSION"
                >
                  <Trash2 size={16} />
                </button>
                <a 
                  href={`/challenges/${mission._id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-text-muted hover:text-white transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>
              );
            })()
          ))}
        </AnimatePresence>

        {challenges?.length === 0 && (
          <div className="p-20 text-center border-2 border-dashed border-surface-border rounded-2xl">
             <AlertCircle size={40} className="mx-auto text-text-muted mb-4 opacity-20" />
             <p className="text-text-muted font-mono text-sm uppercase">Sector Clear: No missions found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageChallenges;
