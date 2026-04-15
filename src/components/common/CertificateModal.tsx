import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Copy, Linkedin, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import {
  generateCertificateSVG,
  downloadCertificateAsImage,
  generateLinkedInDescription,
  shareToLinkedIn,
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
  const [certificateSVG] = useState(() => generateCertificateSVG(data));
  const [isDownloading, setIsDownloading] = useState(false);
  const [linkedInDescription] = useState(() => generateLinkedInDescription(data));

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

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(linkedInDescription);
    toast.success('LinkedIn description copied to clipboard!');
  };

  const handleShareLinkedIn = () => {
    shareToLinkedIn(linkedInDescription);
    if (onShare) onShare(linkedInDescription);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-background-card border border-neon-green/30 rounded-2xl p-8 max-w-4xl w-full pointer-events-auto max-h-[90vh] overflow-y-auto">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-surface rounded-lg transition-colors"
              >
                <X size={24} className="text-text-muted" />
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Trophy className="w-8 h-8 text-neon-green" />
                  <h2 className="text-3xl font-black italic text-glow uppercase">
                    MISSION ACCOMPLISHED!
                  </h2>
                </div>
                <p className="text-text-muted font-mono">
                  You've successfully completed all challenges. Here's your certificate of achievement.
                </p>
              </div>

              {/* Certificate Preview */}
              <div className="bg-black/40 border border-surface-border rounded-xl p-6 mb-8 flex justify-center">
                <div
                  dangerouslySetInnerHTML={{ __html: certificateSVG }}
                  className="max-w-full"
                  style={{ maxWidth: '600px' }}
                />
              </div>

              {/* Share Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-text-primary uppercase mb-4">
                  SHARE YOUR ACHIEVEMENT
                </h3>

                {/* LinkedIn Description Preview */}
                <div className="bg-surface/50 border border-surface-border rounded-lg p-4 space-y-3">
                  <p className="text-sm text-text-muted font-mono uppercase tracking-wider">
                    Suggested LinkedIn Post:
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap italic">
                    {linkedInDescription}
                  </p>
                  <button
                    onClick={handleCopyDescription}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-bold"
                  >
                    <Copy size={16} />
                    COPY TO CLIPBOARD
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={clsx(
                      "flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-black uppercase text-sm transition-all",
                      isDownloading
                        ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                        : "bg-neon-green/10 border border-neon-green/50 text-neon-green hover:bg-neon-green/20"
                    )}
                  >
                    <Download size={18} />
                    {isDownloading ? 'DOWNLOADING...' : 'DOWNLOAD CERTIFICATE'}
                  </button>

                  <button
                    onClick={handleShareLinkedIn}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600/10 border border-blue-600/50 text-blue-400 rounded-lg hover:bg-blue-600/20 font-black uppercase text-sm transition-all"
                  >
                    <Linkedin size={18} />
                    SHARE ON LINKEDIN
                  </button>

                  <button
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-700/50 border border-zinc-600/50 text-zinc-300 rounded-lg hover:bg-zinc-700 font-black uppercase text-sm transition-all"
                  >
                    <X size={18} />
                    CLOSE
                  </button>
                </div>
              </div>

              {/* Legal notice */}
              <p className="text-xs text-text-muted text-center mt-6 font-mono">
                By sharing this certificate, you acknowledge that you completed this challenge on{' '}
                <span className="text-neon-green">{data.platformName}</span>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CertificateModal;
