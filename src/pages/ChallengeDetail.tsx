import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Terminal, FileDown, HelpCircle, Trophy, Send, CheckCircle2, Loader2, Lock, Unlock } from 'lucide-react';
import { challengeService } from '../services/challenge.service';
import { useAuthStore } from '../store/authStore';

import { IChallenge } from '../types';
import { toast } from 'react-hot-toast';

type FlagFeedback = {
  type: 'success' | 'error';
  message: string;
};

const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<(IChallenge & { isSolved: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [unlockingHintId, setUnlockingHintId] = useState<string | null>(null);
  const [unlockedHintIds, setUnlockedHintIds] = useState<string[]>([]);
  const [currentFlagStep, setCurrentFlagStep] = useState(1);
  const [completedFlagSteps, setCompletedFlagSteps] = useState<number[]>([]);
  const [flagValues, setFlagValues] = useState<string[]>([]);
  const [flagFeedback, setFlagFeedback] = useState<FlagFeedback | null>(null);

  const getProgressStorageKey = (challengeId: string) => {
    const userScope = user?._id ?? 'anonymous';
    return `flag-progress:v3:${userScope}:${challengeId}`;
  };

  const saveFlagProgress = (challengeId: string, steps: number[]) => {
    const uniqueSorted = [...new Set(steps)].sort((a, b) => a - b);
    localStorage.setItem(getProgressStorageKey(challengeId), JSON.stringify(uniqueSorted));
  };

  const readFlagProgress = (challengeId: string, totalSteps: number): number[] => {
    const raw = localStorage.getItem(getProgressStorageKey(challengeId));
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return [...new Set(parsed)]
        .map((n) => Number(n))
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= totalSteps)
        .sort((a, b) => a - b);
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;

      setLoading(true);
      setChallenge(null);
      setCompletedFlagSteps([]);
      setCurrentFlagStep(1);
      setFlagValues([]);

      try {
        const response = await challengeService.getChallengeById(id);
        const challengeData = response.data;
        const totalSteps = challengeData.flags?.length || (challengeData.flag ? 1 : 1);
        const savedProgress = readFlagProgress(id, totalSteps);

        setChallenge(challengeData);
        setFlagValues(Array.from({ length: totalSteps }, () => ''));
        setFlagFeedback(null);

        if (totalSteps > 1) {
          setCompletedFlagSteps(savedProgress);
          setCurrentFlagStep(Math.min(totalSteps, savedProgress.length + 1));
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
        toast.error(error.message || 'Error fetching mission data');
        navigate('/challenges');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);

  const handleUnlockHint = async (hintId: string) => {
    setUnlockingHintId(hintId);
    setUnlockedHintIds((prev) => (prev.includes(hintId) ? prev : [...prev, hintId]));
    setUnlockingHintId(null);
  };

  const totalFlagSteps = challenge
    ? (challenge.flags?.length || (challenge.flag ? 1 : 1))
    : 1;

  const userCompletedSteps = totalFlagSteps > 1
    ? completedFlagSteps.length
    : (challenge?.isSolved ? 1 : 0);

  const isChallengeSolvedUI = totalFlagSteps > 1
    ? completedFlagSteps.length >= totalFlagSteps
    : Boolean(challenge?.isSolved || completedFlagSteps.length >= 1);

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
        saveFlagProgress(id, updatedSteps);

        const isFinalStep = totalFlagSteps === 1 || result.completed === true || (!result.partial && step >= totalFlagSteps);

        if (isFinalStep) {
          setFlagFeedback({
            type: 'success',
            message: `ACCESS_GRANTED :: FLAG_${step}_VERIFIED :: MISSION_COMPLETE`,
          });
          toast.success(`ACCESS GRANTED: ${result.points ?? 0} PTS AWARDED`);
          const allDone = Array.from({ length: totalFlagSteps }, (_, index) => index + 1);
          setCompletedFlagSteps(allDone);
          saveFlagProgress(id, allDone);
          setChallenge(prev => prev ? { ...prev, isSolved: true } : null);
        } else {
          const nextStep = result.nextSequence ?? (step + 1);
          setFlagFeedback({
            type: 'success',
            message: `ACCESS_GRANTED :: FLAG_${step}_VERIFIED :: FLAG_${nextStep}_UNLOCKED`,
          });
          setCurrentFlagStep(nextStep);
          toast.success(`FLAG ${step} VERIFIED. FLAG ${nextStep} UNLOCKED`);
        }
      } else {
        const nextExpected = result.nextSequence ?? step;
        if (nextExpected !== currentFlagStep) {
          setCurrentFlagStep(nextExpected);
        }
        setFlagFeedback({
          type: 'error',
          message: `ACCESS_DENIED :: INVALID_FLAG_${nextExpected} :: RETRY_REQUIRED`,
        });
        toast.error(response.message || 'INVALID FLAG: ACCESS DENIED');
      }
    } catch (error: any) {
      setFlagFeedback({
        type: 'error',
        message: 'TRANSMISSION_ERROR :: FLAG_VALIDATION_CHANNEL_INTERRUPTED',
      });
      toast.error(error.message || 'Communication error during submission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black font-mono">
        <Loader2 className="w-12 h-12 text-neon-green animate-spin" />
      </div>
    );
  }

  if (!challenge) return null;

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* ── Navigation ────────────────────────────────────────────── */}
        <button
          onClick={() => navigate('/challenges')}
          className="flex items-center gap-2 text-zinc-500 hover:text-neon-green transition-colors mb-8 uppercase tracking-widest text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          &gt; ABORT_MISSION
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main Content ────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-0.5 text-[10px] border border-neon-green/30 text-neon-green uppercase rounded`}>
                  {challenge.category}
                </span>
                <span className="text-zinc-600 text-[10px] uppercase">
                  MISSION_ID: #{challenge._id.slice(-6)}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-4 tracking-tight">
                {challenge.title}
              </h1>
              
              <div className="prose prose-invert max-w-none text-zinc-400 leading-relaxed mb-6">
                {challenge.description}
              </div>

              {/* Files */}
              {(challenge.files.length > 0 || challenge.attachments.length > 0) && (
                <div className="space-y-3 pt-6 border-t border-zinc-800">
                  <h3 className="text-sm font-bold text-zinc-500 uppercase flex items-center gap-2">
                    <FileDown className="w-4 h-4" /> ATTACHED_ASSETS
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {challenge.files.map((file, i) => (
                      <a
                        key={i}
                        href={file.url}
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-neon-green transition-all text-xs"
                      >
                        <FileDown className="w-4 h-4 text-neon-green" />
                        {file.filename}
                      </a>
                    ))}
                    {challenge.attachments.map((attachment, i) => (
                      <a
                        key={`attachment-${i}`}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-neon-green transition-all text-xs"
                      >
                        <FileDown className="w-4 h-4 text-neon-green" />
                        <span className="break-all">{attachment}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Flag Submission */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`p-1 mb-8 rounded-xl bg-gradient-to-br transition-all ${
                isChallengeSolvedUI ? 'from-neon-green/20 to-transparent p-0' : 'from-neon-green/10 to-transparent'
              }`}
            >
              <div className={`p-6 bg-zinc-900/90 backdrop-blur rounded-xl border border-zinc-800 ${
                isChallengeSolvedUI ? 'border-neon-green/40' : ''
              }`}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-neon-green" />
                  {`FLAG_SUBMISSION (${Math.min(currentFlagStep, totalFlagSteps)}/${totalFlagSteps})`}
                </h3>
                
                {isChallengeSolvedUI ? (
                  <div className="flex items-center gap-3 text-neon-green bg-neon-green/5 p-4 rounded-lg border border-neon-green/20">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <div>
                      <p className="font-bold">MISSION ACCOMPLISHED</p>
                      <p className="text-xs text-neon-green/70">YOU HAVE ALREADY DEPLOYED THE CORRECT FLAG</p>
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
                              ? 'border-neon-green/40 bg-neon-green/5'
                              : isActive
                                ? 'border-neon-green/30 bg-zinc-900/40'
                                : 'border-zinc-800 bg-zinc-900/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs uppercase tracking-widest text-zinc-400">Flag {step}</span>
                            <span className={`text-[10px] uppercase tracking-widest ${
                              isCompleted ? 'text-neon-green' : isActive ? 'text-yellow-400' : 'text-zinc-600'
                            }`}>
                              {isCompleted ? 'Verified' : isActive ? 'Active' : 'Locked'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="fsociety{your_flag_here}"
                              value={flagValues[index] || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                setFlagValues((prev) => prev.map((item, i) => (i === index ? value : item)));
                              }}
                              disabled={submitting || isLocked || isCompleted}
                              className="flex-grow bg-black border border-zinc-800 rounded-lg px-4 py-2.5 outline-none focus:border-neon-green transition-all text-sm disabled:opacity-60"
                            />
                            <button
                              type="button"
                              onClick={() => handleSubmitFlag(step)}
                              disabled={submitting || isLocked || isCompleted || !(flagValues[index] || '').trim()}
                              className="bg-neon-green text-black px-4 rounded-lg font-bold hover:bg-neon-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs"
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
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-2 rounded-lg border px-4 py-3 text-xs tracking-wider uppercase font-mono ${
                          flagFeedback.type === 'success'
                            ? 'border-neon-green/40 bg-neon-green/10 text-neon-green'
                            : 'border-red-500/40 bg-red-500/10 text-red-400'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold">
                            {flagFeedback.type === 'success' ? '[ VALID_FLAG_SIGNAL ]' : '[ INVALID_FLAG_SIGNAL ]'}
                          </span>
                          <span className={flagFeedback.type === 'success' ? 'text-neon-green/70' : 'text-red-300/80'}>
                            {flagFeedback.type === 'success' ? 'OK' : 'DENIED'}
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
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-6"
            >
              <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-4">
                <span className="text-zinc-500 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" /> MISSION_VALUE</span>
                <span className="font-bold text-neon-green">{challenge.points} PTS</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-4 gap-4">
                <span className="text-zinc-500 flex items-center gap-2 shrink-0"><CheckCircle2 className="w-4 h-4" /> YOUR_PROGRESS</span>
                <span className="font-bold tracking-widest flex items-center gap-1.5 text-right whitespace-nowrap">
                  <span className="text-base">{userCompletedSteps}/{totalFlagSteps}</span>
                  <span>COMPLETED</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 flex items-center gap-2"><HelpCircle className="w-4 h-4" /> DIFFICULTY</span>
                <span className={`font-bold uppercase tracking-wider ${
                   challenge.difficulty === 'easy' ? 'text-neon-green' : 
                   challenge.difficulty === 'medium' ? 'text-yellow-500' :
                   challenge.difficulty === 'hard' ? 'text-red-500' : 'text-purple-500'
                }`}>
                  {challenge.difficulty}
                </span>
              </div>
            </motion.div>

            {/* Hints Section */}
            {challenge.hints.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-bold text-zinc-500 uppercase flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> INTELLIGENCE_HINTS
                </h3>
                {challenge.hints.map((hint, i) => (
                  <div key={hint._id} className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg text-xs leading-relaxed text-zinc-400 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-zinc-500 uppercase tracking-widest text-[10px]">Hint {i + 1}</span>
                      {unlockedHintIds.includes(hint._id) ? (
                        <span className="inline-flex items-center gap-1 text-neon-green text-[10px] uppercase tracking-widest">
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
                          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-neon-green hover:border-neon-green/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] uppercase tracking-widest transition-colors"
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
                      <p className="text-zinc-600">Unlock this hint to reveal its content.</p>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetail;
