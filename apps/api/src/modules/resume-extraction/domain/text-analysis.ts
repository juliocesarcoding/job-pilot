export type DetectedLanguage = 'en' | 'pt' | 'es';

const portugueseWords = new Set([
  'com',
  'de',
  'desenvolvimento',
  'experiencia',
  'para',
  'projetos',
  'que',
  'sistemas',
]);
const spanishWords = new Set([
  'con',
  'de',
  'desarrollo',
  'experiencia',
  'para',
  'proyectos',
  'que',
  'sistemas',
]);
const englishWords = new Set([
  'and',
  'development',
  'engineer',
  'experience',
  'for',
  'projects',
  'systems',
  'with',
]);

export function countWords(text: string): number {
  return tokenize(text).length;
}

export function detectBasicLanguage(text: string): DetectedLanguage | null {
  const tokens = tokenize(text);

  if (tokens.length === 0) {
    return null;
  }

  const scores: Record<DetectedLanguage, number> = {
    en: 0,
    pt: 0,
    es: 0,
  };

  for (const token of tokens) {
    if (englishWords.has(token)) {
      scores.en += 1;
    }
    if (portugueseWords.has(token)) {
      scores.pt += 1;
    }
    if (spanishWords.has(token)) {
      scores.es += 1;
    }

    if (/[ãõç]/u.test(token)) {
      scores.pt += 2;
    }
    if (/[ñ¿¡]/u.test(token)) {
      scores.es += 2;
    }
  }

  const ranked = Object.entries(scores).sort((left, right) => right[1] - left[1]) as [
    DetectedLanguage,
    number,
  ][];

  if (ranked[0][1] === 0 || ranked[0][1] === ranked[1][1]) {
    return null;
  }

  return ranked[0][0];
}

function tokenize(text: string): string[] {
  return Array.from(text.toLocaleLowerCase('en-US').matchAll(/[\p{L}\p{N}]+/gu)).map(
    (match) => match[0],
  );
}
