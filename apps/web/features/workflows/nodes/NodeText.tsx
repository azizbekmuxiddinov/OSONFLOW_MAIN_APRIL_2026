import type { ReactNode } from 'react';

const VARIABLE = /\{\{\s*([\w.-]+)\s*\}\}/g;

/**
 * A user-authored string as the canvas shows it.
 *
 * {{variables}} render as the same blue pills the config panel uses, so a node
 * preview reads like the sentence the author wrote rather than like its
 * template source. A string with no variables in it comes out unchanged, which
 * is why every preview can be wrapped in this without thinking about it.
 */
const NodeText = ({ text }: { text: string | undefined }) => {
  const source = text ?? '';
  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const match of source.matchAll(VARIABLE)) {
    const start = match.index ?? 0;

    if (start > cursor) {
      parts.push(source.slice(cursor, start));
    }

    parts.push(
      <span className="variable-token" key={`${start}-${match[1]}`}>
        {match[1]}
      </span>
    );

    cursor = start + match[0].length;
  }

  if (parts.length === 0) {
    return <>{source}</>;
  }

  if (cursor < source.length) {
    parts.push(source.slice(cursor));
  }

  return <>{parts}</>;
};

export default NodeText;
