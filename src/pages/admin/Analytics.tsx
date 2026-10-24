import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { 
  Users, 
  Flag, 
  CheckCircle2, 
  BarChart4, 
  PieChart as PieIcon,
  TrendingUp,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#32d17b', '#00a5c8', '#e45b73', '#d99822', '#9c6ade', '#536fc0'];

const Analytics: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminService.getAnalytics(),
    select: (res) => res.data
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-neon-green/20 border-t-neon-green rounded-full animate-spin" />
        <p className="font-mono text-neon-green animate-pulse uppercase tracking-widest text-xs">Decrypting Analytics Stream...</p>
      </div>
    );
  }

  const overviewCards = [
    { title: 'Total Operatives', value: analytics?.overview.totalUsers, icon: Users, color: 'text-blue-500' },
    { title: 'Active Missions', value: analytics?.overview.totalChallenges, icon: Flag, color: 'text-neon-green' },
    { title: 'Confirmed Solves', value: analytics?.overview.totalSolves, icon: CheckCircle2, color: 'text-status-error' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Platform analytics</h1>
        <p className="text-sm text-zinc-400">Platform performance and user activity.</p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {overviewCards.map((card) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background-card border border-surface-border rounded-xl p-6 relative overflow-hidden group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-surface border border-surface-border group-hover:border-neon-green/50 transition-all">
                <card.icon size={24} className={card.color} />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest">{card.title}</p>
                <p className="text-3xl font-black text-white italic">{card.value?.toLocaleString()}</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <card.icon size={64} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration & Solve Trends */}
        <div className="card p-8 bg-background-card border-surface-border h-[400px]">
          <h3 className="font-display font-bold text-white uppercase flex items-center gap-3 mb-8">
            <TrendingUp size={18} className="text-neon-green" />
            Growth & Activity (30D)
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={analytics?.submissionTrend.map((t) => ({
                ...t,
                users: analytics.userGrowth.find(ug => ug.date === t.date)?.count || 0
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280" 
                fontSize={10} 
                tickMargin={10}
                tickFormatter={(val) => val.split('-').slice(1).join('/')}
              />
              <YAxis stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121914', border: '1px solid #29352d', borderRadius: '8px', fontSize: '12px', fontFamily: 'sans-serif' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }} />
              <Line type="monotone" dataKey="solves" name="SOLVES" stroke="#32d17b" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="users" name="NEW USERS" stroke="#00a5c8" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Solved Missions */}
        <div className="card p-8 bg-background-card border-surface-border h-[400px]">
          <h3 className="font-display font-bold text-white uppercase flex items-center gap-3 mb-8">
            <BarChart4 size={18} className="text-neon-green" />
            Mission Criticality (Top Solves)
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={analytics?.topChallenges} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
              <XAxis type="number" stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis dataKey="title" type="category" stroke="#fff" fontSize={10} width={100} />
              <Tooltip 
                cursor={{ fill: '#ffffff10' }}
                contentStyle={{ backgroundColor: '#121914', border: '1px solid #29352d', borderRadius: '8px', fontSize: '12px', fontFamily: 'sans-serif' }}
              />
              <Bar dataKey="solveCount" name="Solves" fill="#32d17b" radius={[0, 4, 4, 0]}>
                {analytics?.topChallenges.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="card p-8 bg-background-card border-surface-border h-[400px]">
          <h3 className="font-display font-bold text-white uppercase flex items-center gap-3 mb-8">
            <PieIcon size={18} className="text-neon-green" />
            Sector Distribution
          </h3>
          <div className="flex items-center h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.categoryStats}
                  cx="50%"
                  cy="40%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="category"
                  label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                >
                  {analytics?.categoryStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121914', border: '1px solid #29352d', borderRadius: '8px', fontSize: '12px', fontFamily: 'sans-serif' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Consumption KPI */}
        <div className="card p-8 flex flex-col items-center justify-center text-center space-y-6">
           <div className="w-20 h-20 rounded-full border-2 border-neon-green/30 border-t-neon-green flex items-center justify-center animate-pulse">
              <Zap size={32} className="text-neon-green" />
           </div>
           <div>
              <h3 className="text-4xl font-black italic text-white tracking-widest">{analytics?.overview.totalSolves}</h3>
              <p className="font-mono text-xs text-text-muted uppercase tracking-widest mt-1">Global flag captures</p>
           </div>
           <div className="w-full h-px bg-surface-border" />
           <div className="grid grid-cols-2 w-full gap-4">
              <div className="text-center">
                 <p className="text-xs font-bold text-white uppercase">{(analytics?.overview.totalSolves || 0 / (analytics?.overview.totalUsers || 1)).toFixed(1)}</p>
                 <p className="text-[10px] font-mono text-text-muted uppercase">Solves per Operative</p>
              </div>
              <div className="text-center">
                 <p className="text-xs font-bold text-white uppercase">{analytics?.overview.totalChallenges}</p>
                 <p className="text-[10px] font-mono text-text-muted uppercase">Deployed Missions</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
