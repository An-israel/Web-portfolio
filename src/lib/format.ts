// Plain helpers usable from both server and client components.

export function formatNaira(n: number): string {
  return `₦${(n || 0).toLocaleString('en-NG')}`;
}
