import PageHeading from "../../components/common/PageHeading";
import PageState from '../../components/common/PageState';
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
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['rgb(var(--info))', 'rgb(var(--violet))', 'rgb(var(--success))', 'rgb(var(--coral))', 'rgb(var(--warning))', 'rgb(var(--error))'];

const Analytics: React.FC = () => {
  const { data: analytics, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminService.getAnalytics(),
    select: (res) => res.data
  });

  if (isError) return <PageState title="This page could not be loaded" retry={() => refetch()} />;

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand/20 border-t-neon-green rounded-full animate-spin" />
        <p className="font-sans text-brand  uppercase tracking-widest text-xs">Loading analytics…</p>
      </div>
    );
  }

  const overviewCards = [
    { title: 'Community members', value: analytics?.overview.totalUsers, icon: Users, color: 'text-status-info' },
    { title: 'Published challenges', value: analytics?.overview.totalChallenges, icon: Flag, color: 'text-brand' },
    { title: 'Confirmed Solves', value: analytics?.overview.totalSolves, icon: CheckCircle2, color: 'text-status-error' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <PageHeading eyebrow="Admin workspace" title="Platform analytics" description="See new members, challenge solves, and community activity." />
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {overviewCards.map((card) => (
          <motion.div
            key={card.title}
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background-card border border-surface-border rounded-xl p-6 relative overflow-hidden group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-surface border border-surface-border group-hover:border-brand/50 transition-all">
                <card.icon size={24} className={card.color} />
              </div>
              <div>
                <p className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">{card.title}</p>
                <p className="text-3xl font-semibold text-text-primary ">{card.value?.toLocaleString()}</p>
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
          <h3 className="font-sans font-bold text-text-primary uppercase flex items-center gap-3 mb-8">
            <TrendingUp size={18} className="text-brand" />
            Growth & Activity (30D)
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={analytics?.submissionTrend.map((t) => ({
                ...t,
                users: analytics.userGrowth.find(ug => ug.date === t.date)?.count || 0
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="rgb(var(--muted))"
                fontSize={10}
                tickMargin={10}
                tickFormatter={(val) => val.split('-').slice(1).join('/')}
              />
              <YAxis stroke="rgb(var(--muted))" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip
                position={{ x: 8, y: 0 }}
                wrapperStyle={{ maxWidth: 'calc(100% - 16px)', whiteSpace: 'normal' }}
                contentStyle={{ backgroundColor: 'rgb(var(--card))', color: 'rgb(var(--ink))', border: '1px solid rgb(var(--line))', borderRadius: '10px', fontSize: '12px' }}
                itemStyle={{ color: 'rgb(var(--ink))' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }} />
              <Line isAnimationActive={false} type="monotone" dataKey="solves" name="Solves" stroke="rgb(var(--brand))" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              <Line isAnimationActive={false} type="monotone" dataKey="users" name="New members" stroke="rgb(var(--info))" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Solved Missions */}
        <div className="card p-8 bg-background-card border-surface-border h-[400px]">
          <h3 className="font-sans font-bold text-text-primary uppercase flex items-center gap-3 mb-8">
            <BarChart4 size={18} className="text-brand" />
            Most solved challenges
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={analytics?.topChallenges} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" horizontal={false} />
              <XAxis type="number" stroke="rgb(var(--muted))" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis dataKey="title" type="category" stroke="rgb(var(--muted))" fontSize={10} width={100} />
              <Tooltip
                position={{ x: 8, y: 0 }}
                wrapperStyle={{ maxWidth: 'calc(100% - 16px)', whiteSpace: 'normal' }}
                cursor={{ fill: '#ffffff10' }}
                contentStyle={{ backgroundColor: 'rgb(var(--card))', color: 'rgb(var(--ink))', border: '1px solid rgb(var(--line))', borderRadius: '10px', fontSize: '12px' }}
              />
              <Bar isAnimationActive={false} dataKey="solveCount" name="Solves" fill="rgb(var(--brand))" radius={[0, 4, 4, 0]}>
                {analytics?.topChallenges.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="card p-8 bg-background-card border-surface-border h-[400px]">
          <h3 className="font-sans font-bold text-text-primary uppercase flex items-center gap-3 mb-8">
            <PieIcon size={18} className="text-brand" />
            Solves by category
          </h3>
          <div className="flex items-center h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  isAnimationActive={false}
                  data={analytics?.categoryStats}
                  cx="50%"
                  cy="40%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="category"
                  label={false}
                >
                  {analytics?.categoryStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                position={{ x: 8, y: 0 }}
                wrapperStyle={{ maxWidth: 'calc(100% - 16px)', whiteSpace: 'normal' }}
                  contentStyle={{ backgroundColor: 'rgb(var(--card))', color: 'rgb(var(--ink))', border: '1px solid rgb(var(--line))', borderRadius: '10px', fontSize: '12px' }}
                />
              <Legend formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <section className="card p-8 h-[400px]">
          <h3 className="font-sans font-bold text-text-primary flex items-center gap-3 mb-6"><Flag size={18} className="text-brand" />Solves by difficulty</h3>
          {!analytics?.difficultyStats.length ? <p className="text-sm text-text-muted">Completed solves will appear here.</p> : <div className="space-y-6">{analytics.difficultyStats.map(item => {
            const total = analytics.difficultyStats.reduce((sum, row) => sum + row.count, 0);
            return <div key={item.difficulty}><div className="flex items-center justify-between text-sm mb-2"><span className="capitalize">{item.difficulty}</span><strong className="font-semibold">{item.count.toLocaleString()}</strong></div><progress className="admin-difficulty-progress" value={item.count} max={total || 1} aria-label={`${item.difficulty} completed solves`} /></div>;
          })}</div>}
        </section>
      </div>
    </div>
  );
};

export default Analytics;
