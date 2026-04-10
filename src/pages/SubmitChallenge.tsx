import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
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

// ── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ['web', 'crypto', 'forensics', 'misc', 'pwn', 'rev'] as const;
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
  easy: 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10',
  medium: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10',
  hard: 'text-red-400 border-red-400/40 bg-red-400/10',
  insane: 'text-purple-400 border-purple-400/40 bg-purple-400/10',
};

// ── Component ─────────────────────────────────────────────────────────────────
const SubmitChallenge: React.FC = () => {
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

  const setMulFlag = (i: number, field: 'sequence' | 'value', val: string | number) => {
    const flags = [...form.flags];
    flags[i] = { ...flags[i], [field]: field === 'sequence' ? Number(val) : val };
    setForm((prev) => ({ ...prev, flags }));
  };

  const addFlag = () => {
    const nextSeq = Math.max(...form.flags.map(f => f.sequence), 0) + 1;
    setForm((prev) => ({ ...prev, flags: [...prev.flags, { sequence: nextSeq, value: '' }] }));
  };

  const removeFlag = (i: number) => {
    setForm((prev) => ({ ...prev, flags: prev.flags.filter((_, idx) => idx !== i) }));
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
      const validFlags = form.flags.filter(f => f.value.trim());
      if (validFlags.length === 0) {
        newErrors.flag = 'At least one flag is required';
      } else {
        const invalidFlag = validFlags.find(f => !FLAG_REGEX.test(f.value.trim()));
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
        payload.flags = form.flags
          .filter(f => f.value.trim())
          .map(f => ({ sequence: f.sequence, value: f.value.trim() }));
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
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center border border-neon-green/30 rounded-2xl p-10 bg-zinc-900/50 backdrop-blur"
        >
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-neon-green" />
          </div>

          <h2 className="text-2xl font-bold text-neon-green mb-2 tracking-widest uppercase">
            {submitted.status === 'approved' ? 'MISSION DEPLOYED' : 'SUBMISSION QUEUED'}
          </h2>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            {submitted.status === 'approved'
              ? (
                <>
                  Your challenge <span className="text-white font-bold">"{submitted.title}"</span> is approved and now visible to players.
                </>
              )
              : (
                <>
                  Your challenge <span className="text-white font-bold">"{submitted.title}"</span> has been submitted and is awaiting admin review.
                </>
              )}
          </p>

          {/* Status Badge */}
          <div className={`flex items-center justify-center gap-3 p-4 rounded-xl mb-6 ${
            submitted.status === 'approved'
              ? 'bg-emerald-500/10 border border-emerald-500/30'
              : 'bg-orange-500/10 border border-orange-500/30'
          }`}>
            <Clock className={`w-5 h-5 ${submitted.status === 'approved' ? 'text-emerald-400' : 'text-orange-400'}`} />
            <span className={`text-sm font-bold tracking-widest uppercase ${
              submitted.status === 'approved' ? 'text-emerald-300' : 'text-orange-300'
            }`}>
              {submitted.status === 'approved' ? 'APPROVED & PUBLISHED' : 'PENDING APPROVAL'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Points</p>
              <p className="text-xl font-bold text-yellow-400">{submitted.points}</p>
            </div>
            <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Status</p>
              <p className={`text-xl font-bold ${submitted.status === 'approved' ? 'text-emerald-400' : 'text-orange-400'}`}>
                {submitted.status === 'approved' ? 'Approved' : 'Pending'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setSubmitted(null)}
              className="w-full py-3 px-6 bg-neon-green text-black font-bold rounded-lg hover:bg-neon-green/90 transition-colors uppercase tracking-widest text-sm"
            >
              Submit Another
            </button>
            <a
              href="/dashboard"
              className="w-full py-3 px-6 border border-zinc-700 text-zinc-400 font-bold rounded-lg hover:border-neon-green/50 hover:text-white transition-all uppercase tracking-widest text-sm text-center"
            >
              View Missions
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main Form ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white font-mono p-4 md:p-8">
      {/* Background scanline pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,65,0.5)_2px,rgba(0,255,65,0.5)_4px)]" />

      <div className="max-w-3xl mx-auto">
        {/* ── Header ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neon-green tracking-widest uppercase">
                Submit Challenge
              </h1>
              <p className="text-zinc-500 text-xs mt-0.5">&gt; Craft your mission for FsocietyPK operators</p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mt-6">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-300 leading-relaxed">
              <p className="font-bold mb-1 uppercase tracking-widest">Review Process</p>
              <p>Your challenge will be queued for admin review. Once approved, it will appear in the public missions list and players can solve it.</p>
            </div>
          </div>
        </motion.div>

        {/* ── Form ────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Global error */}
          <AnimatePresence>
            {errors.form && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
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
                    <option key={c} value={c}>{c.toUpperCase()}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
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
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>
                {/* Points preview */}
                {form.difficulty && (
                  <motion.div
                    initial={{ opacity: 0 }}
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
            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 mb-4">
              <button
                type="button"
                onClick={toggleMultiFlag}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                  form.isMultiFlag
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                }`}
              >
                {form.isMultiFlag ? 'MULTI-FLAG MODE' : 'SINGLE FLAG MODE'}
              </button>
              <span className="text-[10px] text-zinc-500">
                {form.isMultiFlag ? 'Story-based challenge with multiple sequential flags' : 'Single flag for standard challenges'}
              </span>
            </div>

            {/* Single Flag Input */}
            {!form.isMultiFlag && (
              <div className="relative">
                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
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
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-end gap-3"
                  >
                    <div className="flex-shrink-0">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">
                        Sequence
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={flag.sequence}
                        onChange={(e) => setMulFlag(i, 'sequence', e.target.value)}
                        className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-sm focus:border-neon-green outline-none transition-all text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">
                        Flag #{i + 1}
                      </label>
                      <input
                        type="text"
                        value={flag.value}
                        onChange={(e) => setMulFlag(i, 'value', e.target.value)}
                        placeholder="fsociety{...}"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-neon-green outline-none transition-all text-white placeholder-zinc-600"
                      />
                    </div>
                    {form.flags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFlag(i)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-neon-green/30 text-neon-green text-xs font-bold uppercase tracking-widest hover:border-neon-green/60 transition-all"
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5 text-emerald-400 text-xs mt-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {form.flags.filter(f => f.value.trim()).length} valid flag(s)
                </motion.p>
              )
            ) : (
              form.flag && !errors.flag && FLAG_REGEX.test(form.flag.trim()) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5 text-emerald-400 text-xs mt-2"
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
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-zinc-500 font-bold">{i + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => setHint(i, e.target.value)}
                    placeholder={`Hint ${i + 1}...`}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-neon-green outline-none transition-all text-white placeholder-zinc-600"
                  />
                  {form.hints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHint(i)}
                      className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
              <button
                type="button"
                onClick={addHint}
                className="flex items-center gap-2 text-xs text-neon-green hover:text-neon-green/70 transition-colors py-1"
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
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <LinkIcon className="w-4 h-4 text-zinc-600 shrink-0" />
                  <input
                    type="url"
                    value={att}
                    onChange={(e) => setAttachment(i, e.target.value)}
                    placeholder="https://example.com/challenge-file.zip"
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-neon-green outline-none transition-all text-white placeholder-zinc-600"
                  />
                  {form.attachments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
              <button
                type="button"
                onClick={addAttachment}
                className="flex items-center gap-2 text-xs text-neon-green hover:text-neon-green/70 transition-colors py-1"
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
            className="w-full py-4 bg-neon-green text-black font-bold rounded-xl hover:bg-neon-green/90 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(0,255,65,0.2)]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                SUBMITTING...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                SUBMIT FOR REVIEW
              </>
            )}
          </motion.button>

          <p className="text-center text-zinc-600 text-xs">
            Your challenge will be reviewed by admin before appearing in the public mission list.
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
      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
        {label}
        {required && <span className="text-neon-green ml-1">*</span>}
      </label>
      {hint && <p className="text-[10px] text-zinc-600 mt-0.5">{hint}</p>}
    </div>
    {children}
  </div>
);

const FieldError: React.FC<{ msg: string }> = ({ msg }) => (
  <motion.p
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-1.5 text-red-400 text-xs mt-1"
  >
    <AlertTriangle className="w-3.5 h-3.5" />
    {msg}
  </motion.p>
);

const inputClass = (hasError: boolean) =>
  `w-full bg-zinc-900 border ${
    hasError ? 'border-red-500/60' : 'border-zinc-800'
  } rounded-lg px-4 py-2.5 text-sm focus:border-neon-green outline-none transition-all text-white placeholder-zinc-600`;

export default SubmitChallenge;
