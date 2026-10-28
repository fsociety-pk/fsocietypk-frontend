import { useWriteupUpdates } from '../hooks/useWriteupUpdates';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeading from "../components/common/PageHeading";
import PageState from '../components/common/PageState';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, User, ArrowLeft, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { writeupService } from '../services/writeup.service';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Writeups: React.FC = () => {
  const { challengeId } = useParams<{ challengeId?: string }>();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const mine = params.get('view') === 'mine';
  useWriteupUpdates();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: writeupsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['writeups', challengeId, mine, page],
    queryFn: () => {
      if (challengeId) {
        return writeupService.getWriteupsForChallenge(challengeId, page, limit);
      } else {
        return mine ? writeupService.getUserWriteups(page, limit) : writeupService.getApprovedWriteups(page, limit);
      }
    },
    select: (res) => res.data,
    refetchInterval: 30000,
  });

  if (isLoading) return <PageState loading title="Loading writeups" description={mine ? 'Gathering your solutions and review updates.' : 'Gathering solutions from the community.'} />;

  if (isError) return <PageState title="Writeups could not be loaded" retry={() => refetch()} />;

  const writeups = writeupsData?.writeups || [];
  const pagination = writeupsData?.pagination;
  const totalPages = pagination?.pages || 1;

  return (
    <div className="page-wrap">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-muted hover:text-brand transition-colors mb-6 uppercase tracking-widest text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <PageHeading eyebrow="Learn from each solve" title={challengeId ? "Challenge writeups" : mine ? "My writeups" : "Community writeups"} description={challengeId ? "Read approved solutions and meet the members behind them." : mine ? "Your solutions and their review status." : "Solutions shared by the community, reviewed and approved by our team."} />
        </motion.div>

        {!challengeId && <div className="tabs-line mb-6" role="tablist" aria-label="Writeup library">
          <button role="tab" aria-selected={!mine} onClick={() => { setParams({}); setPage(1); }}>Community writeups</button>
          <button role="tab" aria-selected={mine} onClick={() => { setParams({ view: 'mine' }); setPage(1); }}>My submissions</button>
        </div>}
        {challengeId && <Link className="btn-outline mb-6" to={`/challenges/${challengeId}`}>View challenge</Link>}
        {/* Writeups Grid */}
        {writeups.length > 0 ? (
          <div className="space-y-4 mb-8">
            {writeups.map((writeup, idx) => (
              <motion.div
                key={writeup._id}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="surface-panel bg-background-card border border-surface-border rounded-xl p-6 hover:border-brand/30 transition-all group"
              >
                {/* Title and Challenge */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-brand transition-colors">
                    {writeup.title}
                  </h3>
                  <p className="text-xs text-text-muted uppercase tracking-widest">
                    Challenge: {writeup.challengeId?.title || 'Archived challenge'} • {writeup.challengeId?.category || 'Community'}
                  </p>
                </div>

                {/* Content Preview */}
                <p className="text-sm text-text-secondary mb-4 line-clamp-3">
                  {writeup.content}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-xs text-text-muted mb-4">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-brand" />
                    {writeup.userId?.username ? <Link className="hover:text-brand underline underline-offset-4" to={`/profile/${encodeURIComponent(writeup.userId.username)}`}>@{writeup.userId.username}</Link> : 'Former member'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-brand" />
                    {format(new Date(writeup.createdAt), 'MMM dd, yyyy')}
                  </div>
                  {writeup.status === 'pending' && (
                    <div className="flex items-center gap-1.5 text-status-warning">
                      <Clock className="w-3 h-3" />
                      Pending Approval
                    </div>
                  )}
                  {writeup.status === 'rejected' && (
                    <div className="flex items-center gap-1.5 text-status-error">
                      <AlertCircle className="w-3 h-3" />
                      Rejected
                    </div>
                  )}
                </div>

                {/* Read More Button */}
                <button
                  onClick={() => navigate(`/writeups/${writeup._id}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-background-elevated border border-surface-border rounded-lg text-xs font-bold uppercase tracking-widest text-brand hover:bg-brand hover:text-on-brand transition-all group/btn"
                >
                  <BookOpen className="w-3 h-3" />
                  Read Full Writeup
                  <MessageSquare className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted text-sm uppercase tracking-widest">
              {challengeId ? 'No approved writeups yet for this challenge' : mine ? 'No writeups submitted yet' : 'Approved community solutions will appear here'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-background-elevated border border-surface-border rounded-lg text-xs font-bold uppercase disabled:opacity-50 hover:border-brand/30 transition-all"
            >
              Previous
            </button>
            <span className="text-xs text-text-muted">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-brand text-on-brand rounded-lg text-xs font-bold uppercase disabled:opacity-50 hover:brightness-110 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Writeups;
