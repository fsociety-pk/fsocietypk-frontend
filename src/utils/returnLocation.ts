/** Keep the complete router destination when an expired session needs login. */
export function returnLocation(value: unknown): string {
  if (!value || typeof value !== 'object') return '/dashboard';
  const from = value as { pathname?: unknown; search?: unknown; hash?: unknown };
  if (typeof from.pathname !== 'string' || !from.pathname.startsWith('/') || from.pathname.startsWith('//')) return '/dashboard';
  return from.pathname + (typeof from.search === 'string' ? from.search : '') + (typeof from.hash === 'string' ? from.hash : '');
}
