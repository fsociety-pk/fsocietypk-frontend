import CyberLoader from '../components/common/CyberLoader';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Terminal, FileDown, HelpCircle, Trophy, Send, CheckCircle2, Loader2, Lock, Unlock, Users, Linkedin } from 'lucide-react';
import { challengeService } from '../services/challenge.service';
import { useAuthStore } from '../store/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import FlagProgress from '../components/common/FlagProgress';
import WriteupSubmissionModal from '../components/common/WriteupSubmissionModal';
import CertificateModal from '../components/common/CertificateModal';
import { CertificateData } from '../utils/certificateGenerator';

import { writeupService } from '../services/writeup.service';
import { useWriteupUpdates } from '../hooks/useWriteupUpdates';
import { IChallenge } from '../types';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../services/apiConfig';

type FlagFeedback = {
  type: 'success' | 'error';
  message: string;
};

const incorrectFlagMessages = [
  "Lol! That flag’s an impostor. Try again.",
  "The flag is in another castle. Back to the clues!",
  "Plot twist: that wasn’t the flag. Give it another shot!",
  "Nice try, detective. This clue needs another look!",
  "The flag says ‘new phone, who dis?’ Try again!",
  "No flag, just character development. You’ve got this!",
];

const ChallengeDetail: React.FC = () => {
  useWriteupUpdates();
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [challenge, setChallenge] = useState<(IChallenge & { isSolved: boolean; completedAt?: string | null }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [unlockingHintId, setUnlockingHintId] = useState<string | null>(null);
  const [unlockedHintIds, setUnlockedHintIds] = useState<string[]>([]);
  const [currentFlagStep, setCurrentFlagStep] = useState(1);
  const [completedFlagSteps, setCompletedFlagSteps] = useState<number[]>([]);
  const [flagValues, setFlagValues] = useState<string[]>([]);
  const [flagFeedback, setFlagFeedback] = useState<FlagFeedback | null>(null);
  const incorrectAttempts = useRef(0);
  const [showWriteupModal, setShowWriteupModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);

  const { data: writeups } = useQuery({
    queryKey: ['challenge-writeups', id],
    queryFn: () => writeupService.getWriteupsForChallenge(id!, 1, 1),
    enabled: !!id,
    refetchInterval: 30000,
    select: res => res.data,
  });
  const { data: recentSolvers } = useQuery({
    queryKey: ['challenge-solvers', id],
    queryFn: () => challengeService.getRecentSolvers(id!),
    enabled: !!id,
    select: (res) => res.data,
  });

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;

      setLoading(true);
      setChallenge(null);
      setCertificateData(null);
      setShowCertificateModal(false);
      setCompletedFlagSteps([]);
      setCurrentFlagStep(1);
      setFlagValues([]);
      incorrectAttempts.current = 0;

      try {
        const response = await challengeService.getChallengeById(id);
        const challengeData = response.data;
        const totalSteps = challengeData.totalFlags ?? 1;
        const savedProgress = challengeData.isSolved
          ? Array.from({ length: totalSteps }, (_, index) => index + 1)
          : challengeData.completedSequences ?? [];

        setChallenge(challengeData);
        setFlagValues(Array.from({ length: totalSteps }, () => ''));
        setFlagFeedback(null);

        if (totalSteps > 1) {
          setCompletedFlagSteps(savedProgress);
          setCurrentFlagStep(Array.from({ length: totalSteps }, (_, index) => index + 1)
            .find(step => !savedProgress.includes(step)) ?? totalSteps);
        } else {
          if (challengeData.isSolved) {
            setCompletedFlagSteps([1]);
            setCurrentFlagStep(1);
          } else {
            setCompletedFlagSteps([]);
            setCurrentFlagStep(1);
          }
        }
      } catch (error: any) {
        toast.error(error.message || 'Could not load the challenge.');
        navigate('/challenges');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate, user?._id]);

  const handleUnlockHint = async (hintId: string) => {
    setUnlockingHintId(hintId);
    setUnlockedHintIds((prev) => (prev.includes(hintId) ? prev : [...prev, hintId]));
    setUnlockingHintId(null);
  };

  const totalFlagSteps = challenge?.totalFlags ?? 1;

  const userCompletedSteps = totalFlagSteps > 1
    ? completedFlagSteps.length
    : (challenge?.isSolved ? 1 : 0);

  const isChallengeSolvedUI = Boolean(challenge?.isSolved);

  const handleSubmitFlag = async (step: number) => {
    if (!id) return;
    if (step !== currentFlagStep || isChallengeSolvedUI) return;

    const enteredFlag = (flagValues[step - 1] || '').trim();
    if (!enteredFlag) return;

    setSubmitting(true);
    try {
      const response = await challengeService.submitFlag(id, enteredFlag);
      const result = response.data;

      if (result.correct) {
        const updatedSteps = completedFlagSteps.includes(step)
          ? completedFlagSteps
          : [...completedFlagSteps, step];

        setCompletedFlagSteps(updatedSteps);
        setFlagValues((prev) => prev.map((value, index) => (index === step - 1 ? value.trim() : value)));
        for (const queryKey of [['challenges'], ['profile'], ['publicProfile'], ['leaderboard'], ['challenge-solvers', id]]) {
          void queryClient.invalidateQueries({ queryKey });
        }

        const isFinalStep = totalFlagSteps === 1 || result.completed === true || (!result.partial && step >= totalFlagSteps);

        if (isFinalStep) {
          setFlagFeedback({
            type: 'success',
            message: `Flag ${step} verified. Challenge completed.`,
          });
          const allDone = Array.from({ length: totalFlagSteps }, (_, index) => index + 1);
          setCompletedFlagSteps(allDone);
          setChallenge(prev => prev ? { ...prev, isSolved: true, completedAt: result.completedAt } : null);

          // Create certificate data
          const certData: CertificateData = {
            userName: user?.username || 'Member',
            challengeName: challenge?.title || 'Unknown Challenge',
            completionDate: result.completedAt ? new Date(result.completedAt) : null,
            totalChallenges: new Set([...(user?.solvedChallenges || []), id]).size,
            platformName: 'FSOCIETY.PK',
            platformURL: window.location.href,
          };
          setCertificateData(certData);

          // Show one completion dialog; writeup submission remains user initiated.
          setShowCertificateModal(true);
        } else {
          const nextStep = result.nextSequence ?? (step + 1);
          setFlagFeedback({
            type: 'success',
            message: `Flag ${step} verified. Flag ${nextStep} unlocked.`,
          });
          setCurrentFlagStep(nextStep);
          toast.success(`Correct flag. +${result.points ?? 0} points. Flag ${nextStep} is now open.`, {
            style: { border: '1px solid rgb(var(--success))', padding: '16px', color: 'rgb(var(--success))', background: 'var(--page-color)' },
            iconTheme: { primary: 'rgb(var(--success))', secondary: 'var(--page-color)' },
          });
        }
      } else {
        const nextExpected = result.nextSequence ?? step;
        const message = incorrectFlagMessages[incorrectAttempts.current % incorrectFlagMessages.length];
        incorrectAttempts.current += 1;
        if (nextExpected !== currentFlagStep) {
          setCurrentFlagStep(nextExpected);
        }
        setFlagFeedback({
          type: 'error',
          message: `Flag ${nextExpected} is incorrect. ${message}`,
        });
        toast.error(message, {
          id: 'incorrect-flag',
          style: { border: '1px solid rgb(var(--error))', padding: '16px', color: 'rgb(var(--error))', background: 'var(--page-color)' },
          iconTheme: { primary: 'rgb(var(--error))', secondary: 'var(--page-color)' },
        });
      }
    } catch (error: any) {
      setFlagFeedback({
        type: 'error',
        message: 'We could not check your flag. Please try again.',
      });
      toast.error(error.message || 'Could not submit the flag. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CyberLoader title="Loading challenge" description="Getting the challenge and your progress ready." />;

  if (!challenge) return null;

  return (
    <div className="page-wrap challenge-detail">
      <WriteupSubmissionModal
        isOpen={showWriteupModal}
        onClose={() => setShowWriteupModal(false)}
        challengeId={id || ''}
        challengeTitle={challenge?.title || ''}
      />
      <CertificateModal
        data={certificateData || {
          userName: user?.username || 'Member',
          challengeName: challenge?.title || 'Unknown Challenge',
          completionDate: challenge.completedAt ? new Date(challenge.completedAt) : null,
          totalChallenges: 1,
          platformName: 'FSOCIETY.PK',
          platformURL: window.location.href,
        }}
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
      />
      <div className="challenge-detail-content">
        <div className="challenge-detail-actions">
          <button onClick={() => navigate('/challenges')} className="btn-ghost challenge-back"><ArrowLeft size={16} />Back to challenges</button>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-outline" to={`/writeups/challenge/${id}`}>Writeups{writeups?.pagination?.total ? ` (${writeups.pagination.total})` : ''}</Link>
            {isChallengeSolvedUI && <button className="btn-outline" onClick={() => setShowWriteupModal(true)}>Share your solution</button>}
          </div>
        </div>

        <div className="challenge-detail-grid">
          {/* ── Main Content ────────────────────────────────────────── */}
          <div className="challenge-detail-main">
            <motion.div
              initial={false}
              animate={{ opacity: 1, x: 0 }}
             className="challenge-brief surface-panel">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-0.5 text-xs border border-brand/30 text-brand uppercase rounded`}>
                  {challenge.category}
                </span>
                <span className="text-text-muted text-xs uppercase">
                  Challenge ID: #{challenge._id.slice(-6)}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                {challenge.title}
              </h1>

              <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed mb-6">
                {challenge.description}
              </div>

              {challenge.challengeUrl && /^https?:\/\//i.test(challenge.challengeUrl) && (
                <div className="challenge-destination">
                  <h2 className="text-sm font-bold mb-2">Challenge website</h2>
                  <p className="break-all text-sm text-text-secondary mb-4">{challenge.challengeUrl}</p>
                  <a className="btn-primary" href={challenge.challengeUrl} target="_blank" rel="noopener noreferrer">
                    Open challenge <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </div>
              )}

              {/* Files */}
              {(challenge.files.length > 0 || challenge.attachments.length > 0) && (
                <div className="space-y-3 pt-6 border-t border-surface-border">
                  <h3 className="text-sm font-bold text-text-muted uppercase flex items-center gap-2">
                    <FileDown className="w-4 h-4" /> Challenge files
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {challenge.files.map((file, i) => (
                      <a
                        key={i}
                        href={file.url}
                        className="flex items-center gap-2 px-3 py-2 bg-background-elevated border border-surface-border rounded-lg hover:border-brand transition-all text-xs"
                      >
                        <FileDown className="w-4 h-4 text-brand" />
                        {file.filename}
                      </a>
                    ))}
                    {challenge.attachments.map((attachment, i) => {
                      const isLegacyUrl = typeof attachment === 'string';
                      const href = isLegacyUrl
                        ? attachment
                        : `${API_BASE_URL}/challenges/${challenge._id}/attachments/${attachment._id}/download`;

                      return (
                        <a
                          key={`attachment-${i}`}
                          href={href}
                          target={isLegacyUrl ? '_blank' : undefined}
                          rel={isLegacyUrl ? 'noopener noreferrer' : undefined}
                          className="flex items-center gap-2 rounded-lg border border-surface-border bg-background-elevated px-3 py-2 text-xs transition-all hover:border-brand"
                        >
                          <FileDown className="h-4 w-4 shrink-0 text-brand" />
                          <span className="break-all">
                            {isLegacyUrl ? attachment : attachment.originalName}
                          </span>
                          {!isLegacyUrl && <span className="shrink-0 text-brand">Download</span>}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Flag Submission */}
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="challenge-flag-section"
            >
              <div className={`surface-panel challenge-flag-panel ${
                isChallengeSolvedUI ? 'border-brand/40' : ''
              }`}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-brand" />
                  {`Submit a flag (${Math.min(currentFlagStep, totalFlagSteps)}/${totalFlagSteps})`}
                </h3>

                {totalFlagSteps > 1 && <FlagProgress completed={userCompletedSteps} total={totalFlagSteps} />}

                {isChallengeSolvedUI ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 text-brand bg-brand/5 p-4 rounded-lg border border-brand/20">
                      <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Challenge completed</p>
                        <p className="text-xs text-brand/70">You have solved all flags in this challenge.</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setShowCertificateModal(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand/10 border border-brand/40 text-brand hover:bg-brand/20 rounded-lg transition-colors text-xs font-bold uppercase tracking-widest"
                      >
                        <Trophy className="w-4 h-4" />
                        View Certificate
                      </button>
                      <button
                        onClick={() => {
                          setShowCertificateModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/40 text-status-info hover:bg-blue-600/20 rounded-lg transition-colors text-xs font-bold uppercase tracking-widest"
                      >
                        <Linkedin className="w-4 h-4" />
                        Share LinkedIn
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from({ length: totalFlagSteps }, (_, index) => {
                      const step = index + 1;
                      const isCompleted = completedFlagSteps.includes(step);
                      const isActive = step === currentFlagStep;
                      const isLocked = !isCompleted && !isActive;

                      return (
                        <div
                          key={`flag-input-${step}`}
                          className={`p-3 rounded-lg border ${
                            isCompleted
                              ? 'border-brand/40 bg-brand/5'
                              : isActive
                                ? 'border-brand/30 bg-background-elevated/40'
                                : 'border-surface-border bg-background-elevated/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs uppercase tracking-widest text-text-secondary">Flag {step}</span>
                            <span className={`text-xs uppercase tracking-widest ${
                              isCompleted ? 'text-brand' : isActive ? 'text-status-warning' : 'text-text-muted'
                            }`}>
                              {isCompleted ? 'Verified' : isActive ? 'Active' : 'Locked'}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                              type="text"
                              placeholder="fsociety{your_flag_here}"
                              value={flagValues[index] || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                setFlagValues((prev) => prev.map((item, i) => (i === index ? value : item)));
                              }}
                              disabled={submitting || isLocked || isCompleted}
                              className="min-w-0 flex-1 bg-background border border-surface-border rounded-lg px-4 py-2.5 outline-none focus:border-brand transition-all text-sm disabled:opacity-60"
                            />
                            <button
                              type="button"
                              onClick={() => handleSubmitFlag(step)}
                              disabled={submitting || isLocked || isCompleted || !(flagValues[index] || '').trim()}
                              className="min-h-11 shrink-0 bg-brand text-on-brand px-4 rounded-lg font-bold hover:bg-brand/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs"
                            >
                              {submitting && isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              {isCompleted ? 'DONE' : isLocked ? 'LOCKED' : 'SUBMIT'}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {flagFeedback && (
                      <motion.div
                        key={`${flagFeedback.type}-${flagFeedback.message}`}
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-2 rounded-lg border px-4 py-3 text-sm font-sans ${
                          flagFeedback.type === 'success'
                            ? 'border-brand/40 bg-brand/10 text-brand'
                            : 'border-status-error/40 bg-status-error/10 text-status-error'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold">
                            {flagFeedback.type === 'success' ? 'Correct flag' : 'Try again'}
                          </span>
                          <span className={flagFeedback.type === 'success' ? 'text-brand/70' : 'text-status-error/80'}>
                            {flagFeedback.type === 'success' ? 'OK' : 'Keep going'}
                          </span>
                        </div>
                        <p className="mt-1 break-words">{flagFeedback.message}</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* ── Sidebar Stats ────────────────────────────────────────── */}
          <div className="challenge-detail-aside">
            <motion.div
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="surface-panel challenge-summary space-y-6"
            >
              <div className="flex justify-between items-center text-sm border-b border-surface-border pb-4">
                <span className="text-text-muted flex items-center gap-2"><Trophy className="w-4 h-4 text-status-warning" /> Challenge points</span>
                <span className="font-bold text-brand">{challenge.points} PTS</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-surface-border pb-4 gap-4">
                <span className="text-text-muted flex items-center gap-2 shrink-0"><CheckCircle2 className="w-4 h-4" /> Your progress</span>
                <span className="font-bold tracking-widest flex items-center gap-1.5 text-right flex-wrap justify-end">
                  <span className="text-base">{userCompletedSteps}/{totalFlagSteps}</span>
                  <span>{isChallengeSolvedUI ? 'COMPLETED' : 'FLAGS SOLVED'}</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted flex items-center gap-2"><HelpCircle className="w-4 h-4" /> DIFFICULTY</span>
                <span className={`font-bold uppercase tracking-wider ${
                   challenge.difficulty === 'easy' ? 'text-brand' :
                   challenge.difficulty === 'medium' ? 'text-status-warning' :
                   challenge.difficulty === 'hard' ? 'text-status-error' : 'text-status-info'
                }`}>
                  {challenge.difficulty}
                </span>
              </div>
            </motion.div>

            {/* Hints Section */}
            {challenge.hints.length > 0 && (
              <motion.div
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-bold text-text-muted uppercase flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> Hints
                </h3>
                {challenge.hints.map((hint, i) => (
                  <div key={hint._id} className="challenge-hint p-4 bg-background-elevated/30 border border-surface-border rounded-lg text-xs leading-relaxed text-text-secondary space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-muted uppercase tracking-widest text-xs">Hint {i + 1}</span>
                      {unlockedHintIds.includes(hint._id) ? (
                        <span className="inline-flex items-center gap-1 text-brand text-xs uppercase tracking-widest">
                          <Unlock className="w-3 h-3" /> UNLOCKED
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUnlockHint(hint._id)}
                          disabled={
                            unlockingHintId === hint._id ||
                            (i > 0 && !unlockedHintIds.includes(challenge.hints[i - 1]._id))
                          }
                          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-surface-border text-text-secondary hover:text-brand hover:border-brand/50 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest transition-colors"
                        >
                          {unlockingHintId === hint._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                          {unlockingHintId === hint._id ? 'Unlocking' : 'Unlock'}
                        </button>
                      )}
                    </div>

                    {unlockedHintIds.includes(hint._id) ? (
                      <p>{hint.content}</p>
                    ) : (
                      <p className="text-text-muted">Unlock this hint to reveal its content.</p>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Recent Solvers Section */}
            <motion.div
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="surface-panel challenge-solvers space-y-4"
            >
              <h3 className="text-sm font-bold text-text-muted uppercase flex items-center gap-2">
                <Users className="w-4 h-4" /> Recent solves
              </h3>
              <div className="space-y-3">
                {recentSolvers && recentSolvers.length > 0 ? (
                  recentSolvers.map((solver: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-background/30 border border-surface-border/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-brand/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {solver.avatar ? (
                            <img src={solver.avatar} alt={solver.username} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-brand/50">{solver.username[0].toUpperCase()}</span>
                          )}
                        </div>
                        <span className="text-xs text-text-secondary font-bold truncate">{solver.username}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-brand font-sans">{solver.score} PTS</p>
                        <p className="text-xs text-text-muted uppercase font-sans">
                          {new Date(solver.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-text-muted font-sans ">No solves yet.</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetail;
