import { createPortal } from 'react-dom';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Download, X, Copy, Linkedin, Trophy, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  const reducedMotion = useReducedMotion();
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
      {isOpen && <div className="certificate-overlay">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="certificate-backdrop" />
        <motion.div initial={reducedMotion ? false : { opacity: 0, scale: .98, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .2 }}
          ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="certificate-title" aria-describedby="certificate-description" className="certificate-dialog">
          <header className="certificate-header"><span className="certificate-trophy"><Trophy size={22} /></span><div><h2 id="certificate-title">Your achievement certificate</h2><p id="certificate-description">Well earned, {data.userName}. Keep a copy of your solve.</p></div><button onClick={onClose} aria-label="Close certificate" className="certificate-close"><X size={20} /></button></header>
          <div className="certificate-body">
            <div className="certificate-preview" dangerouslySetInnerHTML={{ __html: certificateSVG }} />
            <div className="certificate-actions">
              <button className="btn-primary" onClick={handleDownload} disabled={isDownloading}><Download size={16} />{isDownloading ? 'Downloading…' : 'Download PNG'}</button>
              <button className="btn-outline" onClick={() => printCertificate(certificateSVG)}><Printer size={16} />Print / Save PDF</button>
              <button className="btn-outline" onClick={handleShareLinkedIn} disabled={isDownloading}><Linkedin size={16} />Share on LinkedIn</button>
            </div>
            <details className="certificate-share"><summary>Suggested LinkedIn post</summary><p>{linkedInDescription}</p><button className="btn-outline" onClick={handleCopyDescription}><Copy size={15} />Copy text</button></details>
          </div>
          <footer className="certificate-footer"><span>Completed on {data.platformName}</span><button className="btn-outline" onClick={onClose}>Back to challenge</button></footer>
        </motion.div>
      </div>}
    </AnimatePresence>, document.body
  );
};

export default CertificateModal;
