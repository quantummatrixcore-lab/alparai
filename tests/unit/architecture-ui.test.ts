import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { MODULAR_PILLARS } from '../../src/lib/config/modular-architecture';

const SRC_DIR = path.resolve(__dirname, '../../src');

describe('Architecture & UI/UX Compliance', () => {
  it('Server Actions isolation check: verifies mutation files enforce use server directive', () => {
    const actionsDir = path.join(SRC_DIR, 'actions');
    expect(fs.existsSync(actionsDir)).toBe(true);

    const actionFiles = [
      path.join(actionsDir, 'incidents.ts'),
      path.join(actionsDir, 'billing.ts'),
      path.join(actionsDir, 'vendor.ts'),
      path.join(actionsDir, 'admin/moderation.ts'),
    ];

    for (const filePath of actionFiles) {
      expect(fs.existsSync(filePath), `File should exist: ${filePath}`).toBe(true);
      const content = fs.readFileSync(filePath, 'utf8');
      const hasUseServer = content.includes('"use server"') || content.includes("'use server'");
      expect(hasUseServer, `${path.basename(filePath)} must declare 'use server' for mutation isolation`).toBe(true);
    }
  });

  it('UI/UX a11y 44px rule: verifies button component enforces minimum 44px touch targets', () => {
    const buttonFile = path.join(SRC_DIR, 'components/ui/button.tsx');
    expect(fs.existsSync(buttonFile)).toBe(true);
    const content = fs.readFileSync(buttonFile, 'utf8');

    expect(content).toContain('sizeClasses');
    
    const sizes = ['sm', 'md', 'lg', 'icon'];
    for (const size of sizes) {
      const sizeRegex = new RegExp(`${size}:\\s*"([^"]+)"`);
      const match = content.match(sizeRegex);
      expect(match, `Button size '${size}' should be defined in sizeClasses`).toBeTruthy();
      const classes = match ? match[1] : '';
      const has44pxMin = classes.includes('min-h-[44px]') || classes.includes('min-h-[48px]');
      expect(has44pxMin, `Button size '${size}' must satisfy WCAG 44px touch target rule`).toBe(true);
    }
  });

  it('Modular Product Pillars verification: verifies 6 core pillars exist with valid metadata', () => {
    expect(Array.isArray(MODULAR_PILLARS)).toBe(true);
    expect(MODULAR_PILLARS.length).toBeGreaterThanOrEqual(6);

    for (const pillar of MODULAR_PILLARS) {
      expect(pillar.id).toBeDefined();
      expect(typeof pillar.number).toBe('number');
      expect(pillar.name.length).toBeGreaterThan(0);
      expect(pillar.route.startsWith('/')).toBe(true);
    }
  });

  it('Core UI Design System component existence check', () => {
    const uiDir = path.join(SRC_DIR, 'components/ui');
    const requiredComponents = ['button.tsx', 'card.tsx', 'badge.tsx', 'input.tsx', 'modal.tsx'];
    for (const comp of requiredComponents) {
      const compPath = path.join(uiDir, comp);
      expect(fs.existsSync(compPath), `UI component ${comp} must exist in Design System`).toBe(true);
    }
  });
});
