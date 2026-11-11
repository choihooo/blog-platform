type TextPart = { text: string; matched: boolean };
const graphemes = new Intl.Segmenter('ko', { granularity: 'grapheme' });
const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase('ko-KR');

export function highlightSearchMatches(text: string, query: string): TextPart[] {
  const terms = [...new Set(normalize(query).trim().split(/\s+/).filter(Boolean))];
  if (!text || !terms.length) return [{ text, matched: false }];

  // Normalization can change length; keep offsets into the original graphemes.
  let normalized = '';
  const origins: { start: number; end: number }[] = [];
  for (const { segment, index } of graphemes.segment(text)) {
    const value = normalize(segment);
    normalized += value;
    for (let i = 0; i < value.length; i++) origins.push({ start: index, end: index + segment.length });
  }

  const matched = new Array<boolean>(text.length).fill(false);
  for (const term of terms) {
    let position = normalized.indexOf(term);
    while (position !== -1) {
      matched.fill(true, origins[position].start, origins[position + term.length - 1].end);
      position = normalized.indexOf(term, position + 1);
    }
  }

  const parts: TextPart[] = [];
  let start = 0;
  for (let end = 1; end <= text.length; end++) {
    if (end === text.length || matched[end] !== matched[start]) {
      parts.push({ text: text.slice(start, end), matched: matched[start] });
      start = end;
    }
  }
  return parts;
}
