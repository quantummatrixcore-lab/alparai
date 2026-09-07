import fs from 'fs';
import path from 'path';
import { describe, it, expect, test, beforeAll } from 'vitest';

describe('Translation Integrity Contracts', () => {
  const enPath = path.resolve(__dirname, '../../messages/en.json');
  const trPath = path.resolve(__dirname, '../../messages/tr.json');

  let enData: Record<string, unknown>;
  let trData: Record<string, unknown>;
  let en: Record<string, unknown>;
  let tr: Record<string, unknown>;

  const countDeepKeys = (obj: Record<string, unknown>): number => {
    let count = 0;
    for (const k in obj) {
      const val = obj[k];
      if (typeof val === 'object' && val !== null) {
        count += countDeepKeys(val as Record<string, unknown>);
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

  const getNestedKey = (obj: unknown, keyPath: string): unknown => {
    return keyPath.split('.').reduce((acc: unknown, part: string) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined), obj);
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

  test('en.json and tr.json must have 100% parity with zero missing keys across all leaves', () => {
    const getLeaves = (obj: Record<string, unknown>, prefix = ''): string[] => {
      const leaves: string[] = [];
      for (const k in obj) {
        const full = prefix ? `${prefix}.${k}` : k;
        const val = obj[k];
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          leaves.push(...getLeaves(val as Record<string, unknown>, full));
        } else {
          leaves.push(full);
        }
      }
      return leaves;
    };

    const enLeaves = getLeaves(enData);
    const trLeaves = getLeaves(trData);
    const enSet = new Set(enLeaves);
    const trSet = new Set(trLeaves);

    const missingInTr = enLeaves.filter(k => !trSet.has(k));
    const missingInEn = trLeaves.filter(k => !enSet.has(k));

    expect(missingInTr, `Keys missing in tr.json: ${missingInTr.join(', ')}`).toEqual([]);
    expect(missingInEn, `Keys missing in en.json: ${missingInEn.join(', ')}`).toEqual([]);
    expect(enLeaves.length).toBe(trLeaves.length);
  });

  test('no translation leaf should be null, undefined, or empty string', () => {
    const checkNoEmpty = (obj: Record<string, unknown>, lang: string, prefix = '') => {
      for (const k in obj) {
        const full = prefix ? `${prefix}.${k}` : k;
        const val = obj[k];
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          checkNoEmpty(val as Record<string, unknown>, lang, full);
        } else if (typeof val === 'string') {
          expect(val.trim().length, `Empty translation string at [${lang}] ${full}`).toBeGreaterThan(0);
        }
      }
    };

    checkNoEmpty(enData, 'EN');
    checkNoEmpty(trData, 'TR');
  });

  it('should have about.advisoryBoardTitle in both locales', () => {
    expect(getNestedKey(en, 'about.advisoryBoardTitle')).toBeDefined();
    expect(getNestedKey(tr, 'about.advisoryBoardTitle')).toBeDefined();
  });

  it('should have suggestions.signInToSuggest in both locales', () => {
    expect(getNestedKey(en, 'suggestions.signInToSuggest')).toBeDefined();
    expect(getNestedKey(tr, 'suggestions.signInToSuggest')).toBeDefined();
  });

  it('should have transparency keys in both locales', () => {
    expect(getNestedKey(en, 'transparency.obligation_header')).toBeDefined();
    expect(getNestedKey(tr, 'transparency.obligation_header')).toBeDefined();
  });

  it('should have products.eu_ai_act_page correctly configured in both locales', () => {
    expect(getNestedKey(en, 'products.eu_ai_act_page.badge')).toBeDefined();
    expect(getNestedKey(tr, 'products.eu_ai_act_page.badge')).toBeDefined();
    expect(getNestedKey(en, 'products.eu_ai_act_page.title')).toBeDefined();
    expect(getNestedKey(tr, 'products.eu_ai_act_page.title')).toBeDefined();
  });

  it('should have admin, pricing, and constitution in both locales', () => {
    expect(getNestedKey(en, 'admin.admin_title')).toBeDefined();
    expect(getNestedKey(tr, 'admin.admin_title')).toBeDefined();
    expect(getNestedKey(en, 'pricing.title')).toBeDefined();
    expect(getNestedKey(tr, 'pricing.title')).toBeDefined();
    expect(getNestedKey(en, 'constitution.title')).toBeDefined();
    expect(getNestedKey(tr, 'constitution.title')).toBeDefined();
  });
});

