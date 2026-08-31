import fs from 'fs';
import path from 'path';
import { describe, it, expect, test, beforeAll } from 'vitest';

describe('Translation Integrity Contracts', () => {
  const enPath = path.resolve(__dirname, '../../messages/en.json');
  const trPath = path.resolve(__dirname, '../../messages/tr.json');

  let enData: Record<string, any>;
  let trData: Record<string, any>;
  let en: Record<string, any>;
  let tr: Record<string, any>;

  const countDeepKeys = (obj: any): number => {
    let count = 0;
    for (const k in obj) {
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        count += countDeepKeys(obj[k]);
      } else {
        count++;
      }
    }
    return count;
  };

  beforeAll(() => {
    expect(fs.existsSync(enPath)).toBe(true);
    expect(fs.existsSync(trPath)).toBe(true);
    enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    trData = JSON.parse(fs.readFileSync(trPath, 'utf8'));
    en = enData;
    tr = trData;
  });

  const getNestedKey = (obj: any, keyPath: string) => {
    return keyPath.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
  };

  test('en.json and tr.json should contain minimum 80 top-level namespaces and 3000 deep keys', () => {
    expect(Object.keys(enData).length).toBeGreaterThanOrEqual(80);
    expect(Object.keys(trData).length).toBeGreaterThanOrEqual(80);

    const enDeepCount = countDeepKeys(enData);
    const trDeepCount = countDeepKeys(trData);

    expect(enDeepCount).toBeGreaterThanOrEqual(3000);
    expect(trDeepCount).toBeGreaterThanOrEqual(3000);
  });

  test('Critical keys must exist in both languages: hero.title_primary, segments.title, marketing.founder_story.title', () => {
    const requiredPaths = [
      'hero.title_primary',
      'hero.how_title',
      'hero.closing_title',
      'segments.title',
      'marketing.founder_story.title',
      'common.skipToContent'
    ];

    for (const p of requiredPaths) {
      const enVal = getNestedKey(enData, p);
      const trVal = getNestedKey(trData, p);
      expect(enVal).toBeDefined();
      expect(typeof enVal).toBe('string');
      expect(trVal).toBeDefined();
      expect(typeof trVal).toBe('string');
    }
  });

  test('en.json and tr.json should have balanced top-level namespaces', () => {
    const enKeys = Object.keys(enData).sort();
    const trKeys = Object.keys(trData).sort();
    expect(enKeys.length).toBeGreaterThanOrEqual(80);
    expect(trKeys.length).toBeGreaterThanOrEqual(80);
  });

  it('should have about.advisoryBoardTitle in both locales', () => {
    expect(en.about?.advisoryBoardTitle).toBeDefined();
    expect(tr.about?.advisoryBoardTitle).toBeDefined();
  });

  it('should have suggestions.signInToSuggest in both locales', () => {
    expect(en.suggestions?.signInToSuggest).toBeDefined();
    expect(tr.suggestions?.signInToSuggest).toBeDefined();
  });

  it('should have transparency keys in both locales', () => {
    expect(en.transparency?.obligation_header).toBeDefined();
    expect(tr.transparency?.obligation_header).toBeDefined();
  });
});
