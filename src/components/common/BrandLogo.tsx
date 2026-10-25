/** Transparent version of the supplied Fsociety PK artwork. */
export default function BrandLogo({ className = '' }: { className?: string }) {
  return <img className={'brand-artwork ' + className} src="/brand/fsociety-logo-transparent.png" alt="Fsociety PK" width="1280" height="1280" />;
}
