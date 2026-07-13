import { describe, expect, it } from 'vitest';
import { countWords, detectBasicLanguage } from './text-analysis';

describe('resume extraction text analysis', () => {
  it('counts words from resume text', () => {
    expect(countWords('Senior Engineer\nTypeScript, Node.js, 10 projects')).toBe(7);
  });

  it('detects English, Portuguese, and Spanish with lightweight rules', () => {
    expect(detectBasicLanguage('Senior engineer with development experience and systems projects')).toBe(
      'en',
    );
    expect(detectBasicLanguage('Engenheiro com experiência em desenvolvimento de sistemas')).toBe('pt');
    expect(detectBasicLanguage('Ingeniero con experiencia en desarrollo de sistemas')).toBe('es');
  });

  it('returns null when language evidence is missing or ambiguous', () => {
    expect(detectBasicLanguage('')).toBeNull();
    expect(detectBasicLanguage('React Kubernetes PostgreSQL')).toBeNull();
  });
});
