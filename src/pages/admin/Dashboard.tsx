import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Flag, 
  Clock, 
  Activity,
  Zap,
  Target
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { clsx } from 'clsx';

const StatCard = ({ title, value, icon: Icon, trend, color }: { title: string, value: string | number, icon: any, trend?: string, color: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-background-card border border-surface-border rounded-xl p-6 relative overflow-hidden group"
  >
    <div className={clsx("absolute top-0 right-0 p-4 opacity-5 transition-transform duration-500 group-hover:scale-110", color.replace('bg-', 'text-'))}>
      <Icon size={80} />
    </div>
    
    <div className="flex items-center gap-4 mb-4">
      <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center bg-opacity-10", color)}>
        <Icon size={20} className={color.replace('bg-', 'text-')} />
      </div>
      <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-widest">{title}</span>
    </div>

    <div className="flex items-end justify-between">
      <h3 className="text-3xl font-black text-white italic">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
      {trend && (
        <span className="text-[10px] font-mono text-neon-green bg-neon-green/10 px-2 py-1 rounded">
          {trend}
        </span>
      )}
    </div>
  </motion.div>
);

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(),
    select: (res) => res.data,
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-neon-green/20 border-t-neon-green rounded-full animate-spin" />
        <p className="font-mono text-neon-green animate-pulse uppercase tracking-widest text-xs">Accessing Kernel Stats...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">System overview</h1>
        <p className="text-sm text-zinc-400">Platform activity and moderation status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Operatives" value={stats?.totalUsers || 0} icon={Users} color="bg-blue-500" trend="+12% weekly" />
        <StatCard title="Active Missions" value={stats?.totalChallenges || 0} icon={Flag} color="bg-neon-green" />
        <StatCard title="Pending Review" value={stats?.pendingChallenges || 0} icon={Clock} color="bg-orange-500" trend={`${stats?.pendingChallenges || 0} awaiting`} />
        <StatCard title="Global Capture" value={stats?.totalSubmissions || 0} icon={Zap} color="bg-status-error" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resource Distribution */}
        <div className="lg:col-span-2 card p-8 space-y-6">
           <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-white uppercase flex items-center gap-3">
                 <Activity size={18} className="text-neon-green" />
                 Sector Distribution
              </h3>
              <div className="text-[10px] font-mono text-text-muted uppercase">Kernel_Version 1.0.4</div>
           </div>
           
           <div className="space-y-6">
              {[
                { label: 'Web Exploitation', val: 75, color: 'bg-blue-500' },
                { label: 'Reverse Engineering', val: 45, color: 'bg-purple-500' },
                { label: 'Cryptography', val: 90, color: 'bg-neon-green' },
                { label: 'Binary Pwn', val: 30, color: 'bg-red-500' },
              ].map((bar) => (
                <div key={bar.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-mono uppercase">
                    <span className="text-text-primary">{bar.label}</span>
                    <span className="text-text-muted">{bar.val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.val}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={clsx("h-full shadow-neon-sm", bar.color)}
                    />
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* System Health */}
        <div className="card p-8 bg-neon-green/5 border-neon-green/20">
           <h3 className="font-display font-bold text-neon-green uppercase flex items-center gap-3 mb-6">
              <Target size={18} />
              IO_STATUS
           </h3>
           <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-black border border-surface-border rounded-lg">
                 <span className="text-xs font-mono text-text-muted uppercase">Database_State</span>
                 <span className="text-xs font-mono text-neon-green font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-black border border-surface-border rounded-lg">
                 <span className="text-xs font-mono text-text-muted uppercase">Kernel_Latency</span>
                 <span className="text-xs font-mono text-neon-green font-bold">14ms</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-black border border-surface-border rounded-lg">
                 <span className="text-xs font-mono text-text-muted uppercase">Security_Seal</span>
                 <span className="text-xs font-mono text-neon-green font-bold">LOCKED</span>
              </div>
              
              <div className="pt-4 mt-4 border-t border-neon-green/20">
                 <p className="text-[10px] text-text-secondary leading-relaxed font-mono italic">
                    All administrative actions are logged and audited. Any unauthorized access will trigger immediate session termination.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
