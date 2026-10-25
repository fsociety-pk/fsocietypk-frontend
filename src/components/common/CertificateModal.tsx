import { createPortal } from 'react-dom';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Copy, Linkedin, Trophy, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import {
  generateCertificateSVG,
  downloadCertificateAsImage,
  printCertificate,
  generateLinkedInDescription,
  CertificateData,
} from "../../utils/certificateGenerator";

interface CertificateModalProps {
  data: CertificateData;
  isOpen: boolean;
  onClose: () => void;
  onShare?: (description: string) => void;
}

const CertificateModal: React.FC<CertificateModalProps> = ({
  data,
  isOpen,
  onClose,
  onShare,
}) => {
  const dialogRef = useDialogFocus(isOpen, onClose);
  const certificateSVG = useMemo(() => generateCertificateSVG(data), [data]);
  const [isDownloading, setIsDownloading] = useState(false);
  const linkedInDescription = useMemo(() => generateLinkedInDescription(data), [data]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadCertificateAsImage(
        certificateSVG,
        `${data.userName}-${data.platformName}-Certificate`
      );
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download certificate');
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyDescription = async () => {
    try { await navigator.clipboard.writeText(linkedInDescription); toast.success('Post text copied.'); }
    catch { toast.error('Clipboard unavailable. Select and copy the text below.'); }
  };

  const handleShareLinkedIn = async () => {
    try {
      // Auto-download certificate
      setIsDownloading(true);
      await downloadCertificateAsImage(
        certificateSVG,
        `${data.userName}-${data.platformName}-Certificate`
      );

      // Copy to clipboard
      await navigator.clipboard.writeText(linkedInDescription);

      toast.success(
        'Certificate downloaded! Drop it into the LinkedIn post we just opened for you.',
        { duration: 5000, icon: '🚀' }
      );

      // Open LinkedIn Feed
      window.open('https://www.linkedin.com/feed/', '_blank', 'noopener,noreferrer');

      if (onShare) onShare(linkedInDescription);
    } catch (error) {
      toast.error('Share process encountered an error.');
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[90]"
          />

          {/* Modal */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
          >
            <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Achievement certificate" className="relative bg-background-card border border-brand/30 rounded-2xl p-6 md:p-8 max-w-6xl w-full pointer-events-auto max-h-[90vh] overflow-y-auto">
              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Close certificate"
                className="absolute top-6 right-6 p-2 hover:bg-surface rounded-lg transition-colors"
              >
                <X size={24} className="text-text-muted" />
              </button>

              {/* Header */}
              <div className="text-center mb-8 px-8">
                <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
                  <Trophy className="w-8 h-8 text-brand shrink-0" />
                  <h2 className="text-2xl md:text-3xl font-semibold  ">
                    Your achievement certificate
                  </h2>
                </div>
                <p className="text-text-muted font-sans text-sm md:text-base">
                  A record of the challenges you have completed on Fsociety PK.
                </p>
              </div>

              {/* Certificate Preview - Responsive Container */}
              <div className="bg-background/40 border border-surface-border rounded-xl p-4 md:p-6 mb-8 w-full">
                <div
                  dangerouslySetInnerHTML={{ __html: certificateSVG }}
                  className="w-full [&>svg]:block [&>svg]:w-full [&>svg]:h-auto"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>

              {/* Share Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-text-primary mb-4">
                  Share your progress
                </h3>

                {/* LinkedIn Description Preview */}
                <div className="bg-surface/50 border border-surface-border rounded-lg p-4 space-y-3">
                  <p className="text-sm text-text-muted font-sans tracking-wider">
                    Suggested LinkedIn post
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap ">
                    {linkedInDescription}
                  </p>
                  <button
                    onClick={handleCopyDescription}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-status-info rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-bold"
                  >
                    <Copy size={16} />
                    Copy text
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={clsx(
                      "flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all",
                      isDownloading
                        ? "bg-surface-hover text-text-secondary cursor-not-allowed"
                        : "bg-brand/10 border border-brand/50 text-brand hover:bg-brand/20"
                    )}
                  >
                    <Download size={18} />
                    {isDownloading ? 'Downloading…' : 'Download PNG'}
                  </button>

                  <button onClick={() => printCertificate(certificateSVG)} className="btn-outline"><Printer size={18}/> Print / Save PDF</button>
                  <button
                    disabled={isDownloading}
                    onClick={handleShareLinkedIn}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600/10 border border-blue-600/50 text-status-info rounded-lg hover:bg-blue-600/20 font-semibold text-sm transition-all"
                  >
                    <Linkedin size={18} />
                    Share on LinkedIn
                  </button>

                  <button
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-surface-hover/50 border border-surface-border/50 text-text-secondary rounded-lg hover:bg-surface-hover font-semibold text-sm transition-all"
                  >
                    <X size={18} />
                    Close
                  </button>
                </div>
              </div>

              {/* Legal notice */}
              <p className="text-xs text-text-muted text-center mt-6 font-sans">
                By sharing this certificate, you acknowledge that you completed this challenge on{' '}
                <span className="text-brand">{data.platformName}</span>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>, document.body
  );
};

export default CertificateModal;
