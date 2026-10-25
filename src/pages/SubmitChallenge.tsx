import PageHeading from "../components/common/PageHeading";
import { CHALLENGE_CATEGORIES, CATEGORY_LABELS } from '../utils/categories';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Link as LinkIcon,
  Loader2,
  ChevronDown,
  Flag,
  Info,
  Clock,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { challengeService } from '../services/challenge.service';
import { useAuthStore } from '../store/authStore';

// ── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = CHALLENGE_CATEGORIES;
const DIFFICULTIES = ['easy', 'medium', 'hard', 'insane'] as const;
const POINTS_MAP: Record<string, number> = {
  easy: 50,
  medium: 100,
  hard: 200,
  insane: 250,
};
const FLAG_REGEX = /^fsociety\{.+\}$/i;

type Category = (typeof CATEGORIES)[number];
type Difficulty = (typeof DIFFICULTIES)[number];

interface FormState {
  title: string;
  description: string;
  category: Category | '';
  difficulty: Difficulty | '';
  flag: string;  // Legacy: single flag
  flags: Array<{ sequence: number; value: string }>;  // New: multiple flags
  isMultiFlag: boolean;  // Toggle between single/multiple flags
  hints: string[];
  attachments: string[];
}

type SubmissionStatus = 'pending' | 'approved' | 'rejected';

const INITIAL_FORM: FormState = {
  title: '',
  description: '',
  category: '',
  difficulty: '',
  flag: '',
  flags: [{ sequence: 1, value: '' }],
  isMultiFlag: false,
  hints: [''],
  attachments: [''],
};

// ── Difficulty badge colors ───────────────────────────────────────────────────
const difficultyColors: Record<string, string> = {
  easy: 'text-status-success border-emerald-400/40 bg-emerald-400/10',
  medium: 'text-status-warning border-yellow-400/40 bg-yellow-400/10',
  hard: 'text-status-error border-red-400/40 bg-red-400/10',
  insane: 'text-purple-400 border-purple-400/40 bg-purple-400/10',
};

// ── Component ─────────────────────────────────────────────────────────────────
const SubmitChallenge: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'form', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: string; title: string; points: number; status: SubmissionStatus } | null>(null);

  // ── Field helpers ───────────────────────────────────────────────────────────
  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setHint = (i: number, val: string) => {
    const hints = [...form.hints];
    hints[i] = val;
    setForm((prev) => ({ ...prev, hints }));
  };

  const addHint = () => setForm((prev) => ({ ...prev, hints: [...prev.hints, ''] }));

  const removeHint = (i: number) => {
    setForm((prev) => ({ ...prev, hints: prev.hints.filter((_, idx) => idx !== i) }));
  };

  const setAttachment = (i: number, val: string) => {
    const attachments = [...form.attachments];
    attachments[i] = val;
    setForm((prev) => ({ ...prev, attachments }));
  };

  const addAttachment = () => setForm((prev) => ({ ...prev, attachments: [...prev.attachments, ''] }));

  const removeAttachment = (i: number) => {
    setForm((prev) => ({ ...prev, attachments: prev.attachments.filter((_, idx) => idx !== i) }));
  };

  // ── Flag helpers ───────────────────────────────────────────────────────────
  const setFlag = (value: string) => {
    setForm((prev) => ({ ...prev, flag: value }));
    setErrors((prev) => ({ ...prev, flag: undefined }));
  };

  const setMulFlag = (i: number, val: string) => {
    const flags = [...form.flags];
    flags[i] = { ...flags[i], sequence: i + 1, value: val };
    setForm((prev) => ({ ...prev, flags }));
  };

  const addFlag = () => {
    setForm((prev) => ({
      ...prev,
      flags: [...prev.flags, { sequence: prev.flags.length + 1, value: '' }],
    }));
  };

  const removeFlag = (i: number) => {
    setForm((prev) => {
      const nextFlags = prev.flags
        .filter((_, idx) => idx !== i)
        .map((f, idx) => ({ ...f, sequence: idx + 1 }));

      return {
        ...prev,
        flags: nextFlags.length > 0 ? nextFlags : [{ sequence: 1, value: '' }],
      };
    });
  };

  const toggleMultiFlag = () => {
    setForm((prev) => ({ ...prev, isMultiFlag: !prev.isMultiFlag }));
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.category) newErrors.category = 'Select a category';
    if (!form.difficulty) newErrors.difficulty = 'Select a difficulty';

    if (form.isMultiFlag) {
      // Validate multiple flags
      const normalizedFlags = form.flags.map((f, index) => ({
        sequence: index + 1,
        value: f.value.trim(),
      }));

      if (normalizedFlags.length === 0) {
        newErrors.flag = 'At least one flag is required';
      } else {
        const emptyFlag = normalizedFlags.find((f) => !f.value);
        if (emptyFlag) {
          newErrors.flag = `Flag ${emptyFlag.sequence} is empty. Fill it or remove it.`;
        }

        const invalidFlag = normalizedFlags.find((f) => f.value && !FLAG_REGEX.test(f.value));
        if (invalidFlag) {
          newErrors.flag = `Flag must follow format: fsociety{...} (Sequence ${invalidFlag.sequence})`;
        }
      }
    } else {
      // Validate single flag
      if (!form.flag.trim()) {
        newErrors.flag = 'Flag is required';
      } else if (!FLAG_REGEX.test(form.flag.trim())) {
        newErrors.flag = 'Flag must follow format: fsociety{...}';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Fix validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        difficulty: form.difficulty,
        hints: form.hints.filter((h) => h.trim()),
        attachments: form.attachments.filter((a) => a.trim()),
      };

      // Add flag(s) based on mode
      if (form.isMultiFlag) {
        payload.flags = form.flags.map((f, index) => ({
          sequence: index + 1,
          value: f.value.trim(),
        }));
      } else {
        payload.flag = form.flag.trim();
      }

      const res = await challengeService.createChallenge(payload);
      const status = (res.data.status === 'approved' || res.data.status === 'rejected')
        ? res.data.status
        : 'pending';
      setSubmitted({ id: res.data._id, title: res.data.title, points: res.data.points, status });
      setForm(INITIAL_FORM);
      if (status === 'approved') {
        toast.success('Challenge submitted and published successfully!');
      } else {
        toast.success('Challenge submitted for review!');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Submission failed';
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success State ───────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans">
        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center border border-brand/30 rounded-2xl p-10 bg-background-elevated/50 backdrop-blur"
        >
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-brand" />
          </div>

          <h2 className="text-2xl font-bold text-brand mb-2 tracking-widest uppercase">
            {submitted.status === 'approved' ? 'Challenge published' : 'Challenge submitted'}
          </h2>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            {submitted.status === 'approved'
              ? (
                <>
                  Your challenge <span className="text-text-primary font-bold">"{submitted.title}"</span> is approved and now visible to players.
                </>
              )
              : (
                <>
                  Your challenge <span className="text-text-primary font-bold">"{submitted.title}"</span> has been submitted and is awaiting admin review.
                </>
              )}
          </p>

          {/* Status Badge */}
          <div className={`flex items-center justify-center gap-3 p-4 rounded-xl mb-6 ${
            submitted.status === 'approved'
              ? 'bg-emerald-500/10 border border-emerald-500/30'
              : 'bg-orange-500/10 border border-orange-500/30'
          }`}>
            <Clock className={`w-5 h-5 ${submitted.status === 'approved' ? 'text-status-success' : 'text-status-warning'}`} />
            <span className={`text-sm font-bold tracking-widest uppercase ${
              submitted.status === 'approved' ? 'text-status-success' : 'text-status-warning'
            }`}>
              {submitted.status === 'approved' ? 'Approved and published' : 'Waiting for review'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="p-2 sm:p-3 bg-background-elevated rounded-lg border border-surface-border">
              <p className="text-xs sm:text-xs text-text-muted uppercase tracking-widest mb-1">Points</p>
              <p className="text-lg sm:text-xl font-bold text-status-warning">{submitted.points}</p>
            </div>
            <div className="p-2 sm:p-3 bg-background-elevated rounded-lg border border-surface-border">
              <p className="text-xs sm:text-xs text-text-muted uppercase tracking-widest mb-1">Status</p>
              <p className={`text-lg sm:text-xl font-bold ${submitted.status === 'approved' ? 'text-status-success' : 'text-status-warning'}`}>
                {submitted.status === 'approved' ? 'Approved' : 'Pending'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setSubmitted(null)}
              className="w-full py-3 px-6 bg-brand text-on-brand font-bold rounded-lg hover:bg-brand/90 transition-colors uppercase tracking-widest text-sm"
            >
              Submit Another
            </button>
            <a
              href="/challenges"
              className="w-full py-3 px-6 border border-surface-border text-text-secondary font-bold rounded-lg hover:border-brand/50 hover:text-text-primary transition-all uppercase tracking-widest text-sm text-center"
            >
              View challenges
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main Form ───────────────────────────────────────────────────────────────
  return (
    <div className="form-page">
      {/* Background scanline pattern */}


      <div className="max-w-3xl mx-auto">
        {/* ── Header ──────────────────────────────────────────────── */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <PageHeading eyebrow="Share with the community" title="Create a challenge" description="Write the task, add a flag, and send it for review." />

          {/* Info Banner */}
          <div className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mt-6">
            <Info className="w-5 h-5 text-status-info shrink-0 mt-0.5" />
            <div className="text-xs text-status-info leading-relaxed">
              <p className="font-bold mb-1 uppercase tracking-widest">Review Process</p>
              <p>
                {isAdmin
                  ? 'After you submit, you can check the challenge status in My submissions.'
                  : 'An admin will check your challenge. Once approved, it will be available for everyone to solve.'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Form ────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Global error */}
          <AnimatePresence>
            {errors.form && (
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-status-error text-sm"
              >
                <AlertTriangle className="w-5 h-5 shrink-0" />
                {errors.form}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Title ──────────────────────────────────────────── */}
          <FormSection label="Challenge Title" required>
            <input
              id="challenge-title"
              type="text"
              value={form.title}
              onChange={set('title')}
              placeholder="e.g. SQL Injection Basics"
              className={inputClass(!!errors.title)}
              maxLength={80}
            />
            {errors.title && <FieldError msg={errors.title} />}
          </FormSection>

          {/* ── Description ───────────────────────────────────── */}
          <FormSection label="Description" required>
            <textarea
              id="challenge-description"
              value={form.description}
              onChange={set('description')}
              placeholder="Describe the challenge scenario, context, and what the player needs to do..."
              rows={5}
              className={`${inputClass(!!errors.description)} resize-none`}
            />
            {errors.description && <FieldError msg={errors.description} />}
          </FormSection>

          {/* ── Category + Difficulty ──────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <FormSection label="Category" required>
              <div className="relative">
                <select
                  id="challenge-category"
                  value={form.category}
                  onChange={set('category')}
                  className={`${inputClass(!!errors.category)} appearance-none pr-10`}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
              {errors.category && <FieldError msg={errors.category} />}
            </FormSection>

            {/* Difficulty */}
            <FormSection label="Difficulty" required>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <select
                    id="challenge-difficulty"
                    value={form.difficulty}
                    onChange={set('difficulty')}
                    className={`${inputClass(!!errors.difficulty)} appearance-none pr-10`}
                  >
                    <option value="">Select Difficulty</option>
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>{d.toUpperCase()}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
                {/* Points preview */}
                {form.difficulty && (
                  <motion.div
                    initial={false}
                    animate={{ opacity: 1 }}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold w-fit ${difficultyColors[form.difficulty]}`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {form.difficulty.toUpperCase()} &mdash; {POINTS_MAP[form.difficulty]} PTS
                  </motion.div>
                )}
              </div>
              {errors.difficulty && <FieldError msg={errors.difficulty} />}
            </FormSection>
          </div>

          {/* ── Flag ────────────────────────────────────────────── */}
          <FormSection label="Flag(s)" required hint='Must follow format: fsociety{your_flag_here}'>
            {/* Toggle for single vs multiple flags */}
            <div className="flex items-center gap-3 p-3 bg-background-elevated/50 rounded-lg border border-surface-border mb-4">
              <button
                type="button"
                onClick={toggleMultiFlag}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                  form.isMultiFlag
                    ? 'bg-emerald-500/20 text-status-success border border-emerald-500/30'
                    : 'bg-brand/20 text-brand border border-brand/30'
                }`}
              >
                {form.isMultiFlag ? 'Multiple flags' : 'Single flag'}
              </button>
              <span className="text-xs text-text-muted">
                {form.isMultiFlag ? 'Story-based challenge with multiple sequential flags' : 'Single flag for standard challenges'}
              </span>
            </div>

            {/* Single Flag Input */}
            {!form.isMultiFlag && (
              <div className="relative">
                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="challenge-flag"
                  type="text"
                  value={form.flag}
                  onChange={(e) => setFlag(e.target.value)}
                  placeholder="fsociety{your_flag_here}"
                  className={`${inputClass(!!errors.flag)} pl-10`}
                />
              </div>
            )}

            {/* Multiple Flags Input */}
            {form.isMultiFlag && (
              <div className="space-y-3">
                {form.flags.map((flag, i) => (
                  <motion.div
                    key={i}
                    initial={false}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-end gap-3"
                  >
                    <div className="flex-shrink-0">
                      <label className="text-xs text-text-muted uppercase tracking-widest font-bold block mb-1">
                        Sequence
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={i + 1}
                        readOnly
                        className="w-16 bg-background-elevated border border-surface-border rounded-lg px-2 py-2 text-sm outline-none text-text-secondary"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-text-muted uppercase tracking-widest font-bold block mb-1">
                        Flag #{i + 1}
                      </label>
                      <input
                        type="text"
                        value={flag.value}
                        onChange={(e) => setMulFlag(i, e.target.value)}
                        placeholder="fsociety{...}"
                        className="w-full bg-background-elevated border border-surface-border rounded-lg px-3 py-2 text-sm focus:border-brand outline-none transition-all text-text-primary placeholder-zinc-600"
                      />
                    </div>
                    {form.flags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFlag(i)}
                        className="p-2 text-status-error hover:bg-red-500/10 rounded-lg transition-all"
                        title="Remove flag"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
                <button
                  type="button"
                  onClick={addFlag}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-brand/30 text-brand text-xs font-bold uppercase tracking-widest hover:border-brand/60 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Flag
                </button>
              </div>
            )}

            {/* Flag validation feedback */}
            {form.isMultiFlag ? (
              form.flags.some(f => f.value && FLAG_REGEX.test(f.value.trim())) && !errors.flag && (
                <motion.p
                  initial={false}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5 text-status-success text-xs mt-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {form.flags.filter(f => f.value.trim()).length} valid flag(s)
                </motion.p>
              )
            ) : (
              form.flag && !errors.flag && FLAG_REGEX.test(form.flag.trim()) && (
                <motion.p
                  initial={false}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5 text-status-success text-xs mt-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid flag format
                </motion.p>
              )
            )}

            {errors.flag && <FieldError msg={errors.flag} />}
          </FormSection>

          {/* ── Hints ───────────────────────────────────────────── */}
          <FormSection label="Hints" hint="Optional — provide hints to help players (can add multiple)">
            <div className="space-y-3">
              {form.hints.map((hint, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded bg-surface border border-surface-border flex items-center justify-center shrink-0">
                    <span className="text-xs text-text-muted font-bold">{i + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => setHint(i, e.target.value)}
                    placeholder={`Hint ${i + 1}...`}
                    className="flex-1 bg-background-elevated border border-surface-border rounded-lg px-3 py-2 text-sm focus:border-brand outline-none transition-all text-text-primary placeholder-zinc-600"
                  />
                  {form.hints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHint(i)}
                      className="p-2 text-text-muted hover:text-status-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
              <button
                type="button"
                onClick={addHint}
                className="flex items-center gap-2 text-xs text-brand hover:text-brand/70 transition-colors py-1"
              >
                <Plus className="w-4 h-4" />
                Add Hint
              </button>
            </div>
          </FormSection>

          {/* ── Attachments ─────────────────────────────────────── */}
          <FormSection label="Attachments" hint="Optional — paste URLs to challenge files or resources">
            <div className="space-y-3">
              {form.attachments.map((att, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <LinkIcon className="w-4 h-4 text-text-muted shrink-0" />
                  <input
                    type="url"
                    value={att}
                    onChange={(e) => setAttachment(i, e.target.value)}
                    placeholder="https://example.com/challenge-file.zip"
                    className="flex-1 bg-background-elevated border border-surface-border rounded-lg px-3 py-2 text-sm focus:border-brand outline-none transition-all text-text-primary placeholder-zinc-600"
                  />
                  {form.attachments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="p-2 text-text-muted hover:text-status-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
              <button
                type="button"
                onClick={addAttachment}
                className="flex items-center gap-2 text-xs text-brand hover:text-brand/70 transition-colors py-1"
              >
                <Plus className="w-4 h-4" />
                Add Attachment
              </button>
            </div>
          </FormSection>

          {/* ── Submit Button ────────────────────────────────────── */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
            className="w-full py-4 bg-brand text-on-brand font-bold rounded-xl hover:bg-brand/90 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                SUBMITTING...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {isAdmin ? 'Publish challenge' : 'Submit for review'}
              </>
            )}
          </motion.button>

          <p className="text-center text-text-muted text-xs">
            {isAdmin
              ? 'Check the result after submitting to see whether it is published or waiting for review.'
              : 'An admin will check your challenge before it appears in the challenge list.'}
          </p>
        </form>
      </div>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const FormSection: React.FC<{
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, required, hint, children }) => (
  <div className="space-y-2">
    <div>
      <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">
        {label}
        {required && <span className="text-brand ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-text-muted mt-0.5">{hint}</p>}
    </div>
    {children}
  </div>
);

const FieldError: React.FC<{ msg: string }> = ({ msg }) => (
  <motion.p
    initial={false}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-1.5 text-status-error text-xs mt-1"
  >
    <AlertTriangle className="w-3.5 h-3.5" />
    {msg}
  </motion.p>
);

const inputClass = (hasError: boolean) =>
  `w-full bg-background-elevated border ${
    hasError ? 'border-red-500/60' : 'border-surface-border'
  } rounded-lg px-4 py-2.5 text-sm focus:border-brand outline-none transition-all text-text-primary placeholder-zinc-600`;

export default SubmitChallenge;
