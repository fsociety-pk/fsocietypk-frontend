import { createPortal } from 'react-dom';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { writeupService } from '../../services/writeup.service';

interface WriteupSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeId: string;
  challengeTitle: string;
}

const WriteupSubmissionModal: React.FC<WriteupSubmissionModalProps> = ({
  isOpen,
  onClose,
  challengeId,
  challengeTitle,
}) => {
  const dialogRef = useDialogFocus(isOpen, onClose);
  const [step, setStep] = useState<'intro' | 'form'>('intro');
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) =>
      writeupService.submitWriteup({
        challengeId,
        title: data.title,
        content: data.content,
      }),
    onSuccess: () => {
      toast.success('Writeup submitted! Awaiting admin approval.');
      reset();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit writeup');
    },
  });

  const onSubmit = (data: any) => {
    if (!data.title.trim() || !data.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    submitMutation.mutate(data);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Share your writeup" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background-card border border-surface-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background border-b border-surface-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-brand" />
                <h2 className="text-lg font-semibold uppercase tracking-wider text-brand">
                  Share Your Writeup
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close writeup"
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {step === 'intro' ? (
                <>
                  {/* Intro Screen */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary">
                      Challenge: {challengeTitle}
                    </h3>

                    <div className="bg-brand/5 border border-brand/20 rounded-lg p-4 space-y-3">
                      <p className="text-sm text-text-secondary leading-relaxed">
                        Help other members by sharing your approach and solution methodology for this challenge.
                      </p>
                      <ul className="text-xs text-text-secondary space-y-2 list-disc list-inside">
                        <li>Explain your approach and reasoning</li>
                        <li>Explain what worked and why used</li>
                        <li>Include code snippets or step-by-step breakdown</li>
                        <li>Your writeup will be reviewed by admins before publication</li>
                      </ul>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-status-info flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-status-info">
                        Only writeups that provide genuine educational value will be approved.
                        Avoid spoiling the entire solution - help others learn!
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('form')}
                      className="flex-1 py-2.5 bg-brand text-on-brand font-bold text-xs uppercase rounded-lg hover:brightness-110 transition-all"
                    >
                      Write Writeup
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 py-2.5 bg-background-elevated border border-surface-border text-text-secondary font-bold text-xs uppercase rounded-lg hover:bg-surface transition-all"
                    >
                      No Thanks
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Form Screen */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-text-secondary uppercase tracking-widest flex justify-between">
                        <span>Writeup Title</span>
                        {errors.title && (
                          <span className="text-status-error flex items-center gap-1">
                            <AlertCircle size={9} /> Required
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., SQL Injection Through Error Messages"
                        maxLength={200}
                        className="w-full bg-background border border-surface-border rounded-lg px-4 py-2.5 text-sm font-sans focus:border-brand/50 outline-none transition-colors text-text-primary placeholder-zinc-700"
                        {...register('title', { required: true, minLength: 5 })}
                      />
                      <p className="text-xs text-text-muted">5-200 characters</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-text-secondary uppercase tracking-widest flex justify-between">
                        <span>Content</span>
                        {errors.content && (
                          <span className="text-status-error flex items-center gap-1">
                            <AlertCircle size={9} /> Required
                          </span>
                        )}
                      </label>
                      <textarea
                        placeholder="Explain each step you took. Add commands or code where they help."
                        maxLength={10000}
                        rows={8}
                        className="w-full bg-background border border-surface-border rounded-lg px-4 py-2.5 text-sm font-sans focus:border-brand/50 outline-none transition-colors text-text-primary placeholder-zinc-700 resize-none"
                        {...register('content', { required: true, minLength: 50 })}
                      />
                      <p className="text-xs text-text-muted">50-10000 characters</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={submitMutation.isPending}
                        className="flex-1 py-2.5 bg-brand text-on-brand font-bold text-xs uppercase rounded-lg hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      >
                        {submitMutation.isPending ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            SUBMITTING...
                          </>
                        ) : (
                          'SUBMIT WRITEUP'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep('intro')}
                        disabled={submitMutation.isPending}
                        className="flex-1 py-2.5 bg-background-elevated border border-surface-border text-text-secondary font-bold text-xs uppercase rounded-lg hover:bg-surface transition-all disabled:opacity-50"
                      >
                        BDismiss
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>, document.body
  );
};

export default WriteupSubmissionModal;
