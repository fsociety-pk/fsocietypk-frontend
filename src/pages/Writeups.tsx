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
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: writeupsData, isLoading } = useQuery({
    queryKey: ['writeups', challengeId, page],
    queryFn: () => {
      if (challengeId) {
        return writeupService.getWriteupsForChallenge(challengeId, page, limit);
      } else {
        return writeupService.getUserWriteups(page, limit);
      }
    },
    select: (res) => res.data,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black font-mono">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-neon-green/20 border-t-neon-green rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neon-green text-xs uppercase tracking-widest animate-pulse">LOADING_WRITEUPS...</p>
        </div>
      </div>
    );
  }

  const writeups = writeupsData?.writeups || [];
  const pagination = writeupsData?.pagination;
  const totalPages = pagination?.pages || 1;

  return (
    <div className="min-h-screen bg-black p-4 text-white sm:p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-500 hover:text-neon-green transition-colors mb-6 uppercase tracking-widest text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            &gt; BACK
          </button>

          <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">
            <span className="text-neon-green">WRITEUPS</span>
          </h1>
          <p className="text-zinc-400 text-sm">
            {challengeId ? 'Community Solutions & Approaches' : 'Your Submitted Writeups'}
          </p>
        </motion.div>

        {/* Writeups Grid */}
        {writeups.length > 0 ? (
          <div className="space-y-4 mb-8">
            {writeups.map((writeup, idx) => (
              <motion.div
                key={writeup._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group rounded-lg border border-zinc-800 bg-zinc-950 p-6 transition-colors hover:border-neon-green/40"
              >
                {/* Title and Challenge */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-neon-green transition-colors">
                    {writeup.title}
                  </h3>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">
                    Challenge: {writeup.challengeId.title} • {writeup.challengeId.category}
                  </p>
                </div>

                {/* Content Preview */}
                <p className="text-sm text-zinc-400 mb-4 line-clamp-3">
                  {writeup.content}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-neon-green" />
                    {writeup.userId.username}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-neon-green" />
                    {format(new Date(writeup.createdAt), 'MMM dd, yyyy')}
                  </div>
                  {writeup.status === 'pending' && (
                    <div className="flex items-center gap-1.5 text-yellow-400">
                      <Clock className="w-3 h-3" />
                      Pending Approval
                    </div>
                  )}
                  {writeup.status === 'rejected' && (
                    <div className="flex items-center gap-1.5 text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      Rejected
                    </div>
                  )}
                </div>

                {/* Read More Button */}
                <button
                  onClick={() => navigate(`/writeups/${writeup._id}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-widest text-neon-green hover:bg-neon-green hover:text-black transition-all group/btn"
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
            <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm uppercase tracking-widest">
              {challengeId ? 'No approved writeups yet for this challenge' : 'No writeups submitted yet'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold uppercase disabled:opacity-50 hover:border-neon-green/30 transition-all"
            >
              Previous
            </button>
            <span className="text-xs text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-neon-green text-black rounded-lg text-xs font-bold uppercase disabled:opacity-50 hover:brightness-110 transition-all"
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
