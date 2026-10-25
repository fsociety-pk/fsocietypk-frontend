import { useReducedMotion } from 'framer-motion';
/** Approved artwork and eye animation from the certificate project, unchanged. */
export default function BrandLogo({ className = '' }: { className?: string }) {
  const reduced = useReducedMotion();
  return <img className={'brand-artwork ' + className} src={reduced ? '/brand/fsociety-logo.png' : '/brand/fsociety-logo-animated.gif'} alt="Fsociety PK" width="600" height="600" />;
}
