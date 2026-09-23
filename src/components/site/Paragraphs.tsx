/** Renders admin-entered text: blank lines start new paragraphs, single line breaks are kept. */
export function Paragraphs({ text, className }: { text: string | null | undefined; className?: string }) {
  const parts = (text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <>
      {parts.map((p, i) => (
        <p key={i} className={`whitespace-pre-line ${className ?? ''}`}>
          {p}
        </p>
      ))}
    </>
  );
}
