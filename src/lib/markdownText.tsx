/**
 * MarkdownText – lightweight inline markdown renderer.
 * Supported syntax:
 *   # Heading 1
 *   ## Heading 2
 *   ### Heading 3
 *   - bullet item
 *   (empty line) → vertical spacing
 *   everything else → paragraph
 */

type Props = {
  text: string;
  /** Extra Tailwind classes applied to <p> elements */
  pClass?: string;
  /** Center-align paragraphs (for poems) */
  poem?: boolean;
};

type Block =
  | { type: 'h1' | 'h2' | 'h3'; content: string; key: string }
  | { type: 'ul'; items: string[]; key: string }
  | { type: 'p'; content: string; key: string }
  | { type: 'spacer'; key: string };

export function MarkdownText({ text, pClass = '', poem = false }: Props) {
  const lines = text.split('\n');
  const blocks: Block[] = [];
  let idx = 0;

  while (idx < lines.length) {
    const raw = lines[idx];
    const trimmed = raw.trimEnd();

    if (trimmed === '') {
      blocks.push({ type: 'spacer', key: `s-${idx}` });
      idx++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', content: trimmed.slice(4), key: `h3-${idx}` });
      idx++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', content: trimmed.slice(3), key: `h2-${idx}` });
      idx++;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', content: trimmed.slice(2), key: `h1-${idx}` });
      idx++;
      continue;
    }

    if (trimmed.startsWith('- ')) {
      const items: string[] = [];
      const startIdx = idx;
      while (idx < lines.length && lines[idx].trimEnd().startsWith('- ')) {
        items.push(lines[idx].trimEnd().slice(2));
        idx++;
      }
      blocks.push({ type: 'ul', items, key: `ul-${startIdx}` });
      continue;
    }

    blocks.push({ type: 'p', content: trimmed, key: `p-${idx}` });
    idx++;
  }

  return (
    <div>
      {blocks.map((block) => {
        switch (block.type) {
          case 'h1':
            return (
              <h1 key={block.key} className="text-2xl font-serif font-bold text-[#1a4f99] mt-5 mb-2 leading-snug">
                {block.content}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={block.key} className="text-xl font-serif font-bold text-[#1a4f99] mt-4 mb-1.5 leading-snug">
                {block.content}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={block.key} className="text-base font-serif font-semibold text-[#1a4f99] mt-3 mb-1 leading-snug">
                {block.content}
              </h3>
            );
          case 'ul':
            return (
              <ul key={block.key} className="list-disc list-outside pl-5 my-2 space-y-1">
                {block.items.map((item, i) => (
                  <li key={i} className={`text-[#1c1c1c]/85 leading-relaxed ${pClass}`}>
                    {item}
                  </li>
                ))}
              </ul>
            );
          case 'p':
            return (
              <p
                key={block.key}
                className={`text-[#1c1c1c]/85 leading-relaxed mb-1 ${poem ? 'text-center' : ''} ${pClass}`}
              >
                {block.content}
              </p>
            );
          case 'spacer':
            return <div key={block.key} className="h-3" />;
        }
      })}
    </div>
  );
}
