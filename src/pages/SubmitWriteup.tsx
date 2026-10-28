import PageHeading from "../components/common/PageHeading";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { challengeService } from '../services/challenge.service';
import { writeupService } from '../services/writeup.service';

interface FormState {
  challengeId: string;
  title: string;
  content: string;
}

const INITIAL_FORM: FormState = {
  challengeId: '',
  title: '',
  content: '',
};

const SubmitWriteup: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'form', string>>>({});
  const [submitted, setSubmitted] = useState<{ id: string; title: string; status: string } | null>(null);

  // Fetch user's solved challenges
  const { data: challengesData, isLoading: challengesLoading } = useQuery({
    queryKey: ['user-challenges'],
    queryFn: () => challengeService.getChallenges(),
    select: (res) => res.data.filter((c: any) => c.isSolved),
  });

  const submitMutation = useMutation({
    mutationFn: (data: FormState) =>
      writeupService.submitWriteup({
        challengeId: data.challengeId,
        title: data.title,
        content: data.content,
      }),
    onSuccess: (res) => {
      setSubmitted({
        id: res.data._id,
        title: res.data.title,
        status: res.data.status,
      });
      setForm(INITIAL_FORM);
      toast.success('Writeup submitted for review.');
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to submit writeup';
      setErrors({ form: message });
      toast.error(message);
    },
  });

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!form.challengeId) newErrors.challengeId = 'Challenge is required';
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (form.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (form.title.length > 200) newErrors.title = 'Title cannot exceed 200 characters';
    if (!form.content.trim()) newErrors.content = 'Content is required';
    if (form.content.length < 50) newErrors.content = 'Content must be at least 50 characters';
    if (form.content.length > 10000) newErrors.content = 'Content cannot exceed 10000 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    submitMutation.mutate(form);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background font-sans text-text-primary p-4 sm:p-6 md:p-8">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand/5 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.div
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full" />
                <CheckCircle2 className="w-24 h-24 text-brand relative" />
              </div>
            </div>

            <h2 className="text-4xl font-semibold mb-4 uppercase tracking-tight">
              WRITEUP <span className="text-brand">SUBMITTED</span>
            </h2>

            <div className="bg-brand/10 border border-brand/30 rounded-xl p-6 mb-8 text-left">
              <p className="text-sm text-text-secondary mb-4">
                Your writeup has been submitted successfully and is awaiting admin approval.
              </p>

              <div className="space-y-3 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-text-muted">Challenge ID:</span>
                  <span className="text-brand font-bold">{submitted.id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">TITLE:</span>
                  <span className="text-text-primary">{submitted.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">STATUS:</span>
                  <span className="text-status-warning uppercase font-bold">{submitted.status}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSubmitted(null);
                  setForm(INITIAL_FORM);
                }}
                className="flex-1 py-3 bg-brand text-on-brand font-semibold text-sm uppercase rounded-lg hover:brightness-110 transition-all"
              >
                Submit another
              </button>
              <button
                onClick={() => navigate('/writeups')}
                className="flex-1 py-3 bg-background-elevated border border-surface-border text-text-secondary font-semibold text-sm uppercase rounded-lg hover:border-brand/30 transition-all"
              >
                View writeups
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans text-text-primary p-4 sm:p-6 md:p-8">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-muted hover:text-brand transition-colors mb-6 uppercase tracking-widest text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <PageHeading eyebrow="Share what you learned" title="Write a solution" description="Explain how you solved a challenge so others can learn from your steps." />
        </motion.div>

        {/* Form */}
        <motion.form
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="surface-panel bg-background-card border border-surface-border rounded-xl p-8 space-y-6"
        >
          {/* Error Banner */}
          {errors.form && (
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <AlertCircle className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-status-error">{errors.form}</p>
            </motion.div>
          )}

          {/* Challenge Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-text-secondary flex justify-between">
              <span>Select Challenge</span>
              {errors.challengeId && <span className="text-status-error font-bold">{errors.challengeId}</span>}
            </label>
            <select
              value={form.challengeId}
              onChange={set('challengeId')}
              disabled={challengesLoading}
              className={`w-full bg-background border rounded-lg px-4 py-3 text-sm font-sans outline-none transition-colors text-text-primary ${
                errors.challengeId ? 'border-red-500/50' : 'border-surface-border focus:border-brand/50'
              }`}
            >
              <option value="">
                {challengesLoading ? 'Loading challenges...' : 'Choose a challenge you\'ve solved...'}
              </option>
              {challengesData?.map((challenge: any) => (
                <option key={challenge._id} value={challenge._id}>
                  {challenge.title} • {challenge.category} • {challenge.points} pts
                </option>
              ))}
            </select>
            {!challengesLoading && (!challengesData || challengesData.length === 0) && (
              <p className="text-xs text-text-muted ">You haven't solved any challenges yet. Solve challenges to submit writeups.</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-text-secondary flex justify-between">
              <span>Writeup Title</span>
              <span className="text-text-muted">{form.title.length}/200</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              placeholder="e.g., SQL Injection Through Error Messages"
              maxLength={200}
              className={`w-full bg-background border rounded-lg px-4 py-3 text-sm font-sans outline-none transition-colors text-text-primary placeholder-zinc-700 ${
                errors.title ? 'border-red-500/50' : 'border-surface-border focus:border-brand/50'
              }`}
            />
            {errors.title && <p className="text-xs text-status-error">{errors.title}</p>}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-text-secondary flex justify-between">
              <span>Content</span>
              <span className="text-text-muted">{form.content.length}/10000</span>
            </label>
            <textarea
              value={form.content}
              onChange={set('content')}
              placeholder="Explain each step you took. Add commands or code where they help."
              maxLength={10000}
              rows={12}
              className={`w-full bg-background border rounded-lg px-4 py-3 text-sm font-sans outline-none transition-colors text-text-primary placeholder-zinc-700 resize-none ${
                errors.content ? 'border-red-500/50' : 'border-surface-border focus:border-brand/50'
              }`}
            />
            {errors.content && <p className="text-xs text-status-error">{errors.content}</p>}
            <p className="text-xs text-text-muted">Minimum 50 characters • Maximum 10,000 characters</p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-status-info flex-shrink-0 mt-0.5" />
            <div className="text-xs text-status-info space-y-1">
              <p className="font-bold">Before you submit:</p>
              <ul className="list-disc list-inside space-y-0.5 text-status-info/80">
                <li>Explain your reasoning and approach</li>
                <li>Explain what worked and why</li>
                <li>Include useful commands or code</li>
                <li>Help readers learn, not just copy</li>
                <li>Admin review required before publication</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitMutation.isPending || challengesLoading}
              className="flex-1 py-3 bg-brand text-on-brand font-semibold text-sm uppercase rounded-lg hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  SUBMITTING...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit writeup
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(INITIAL_FORM);
                setErrors({});
              }}
              className="flex-1 py-3 bg-background-elevated border border-surface-border text-text-secondary font-semibold text-sm uppercase rounded-lg hover:border-brand/30 transition-all"
            >
              Clear
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default SubmitWriteup;
