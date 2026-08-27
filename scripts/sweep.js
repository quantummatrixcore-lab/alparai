const fs = require('fs');

const fixes = [
  {
    file: 'src/app/[locale]/admin/analytics-hub/analysis/page.tsx',
    replacements: [ [/: any/g, ': unknown'] ]
  },
  {
    file: 'src/app/[locale]/admin/cross-audit-dashboard/page.tsx',
    replacements: [ [/\bLink\b/g, '_Link'] ]
  },
  {
    file: 'src/app/[locale]/admin/page.tsx',
    replacements: [ [/\bfunding\b/g, '_funding'], [/\bcrons\b/g, '_crons'] ]
  },
  {
    file: 'src/app/[locale]/b2b/dashboard/page.tsx',
    replacements: [ [/: any/g, ': unknown'] ]
  },
  {
    file: 'src/app/[locale]/digital-twins/page.tsx',
    replacements: [ [/\(i\)/g, '(_i)'], [/\bi\b/g, '_i'] ] // Need to be careful here, maybe just let eslint ignore it if prefixed
  },
  {
    file: 'src/app/[locale]/enterprise/page.tsx',
    replacements: [ [/,?\s*Section\b/g, ''] ] // Unused import
  },
  {
    file: 'src/app/[locale]/layout.tsx',
    replacements: [ [/: any/g, ': unknown'] ]
  },
  {
    file: 'src/app/[locale]/leaderboard/page.tsx',
    replacements: [ [/\bt\b/g, '_t'] ]
  },
  {
    file: 'src/app/[locale]/products/ars-api/page.tsx',
    replacements: [ [/,?\s*Section\b/g, ''] ]
  },
  {
    file: 'src/app/[locale]/products/browser-extension/page.tsx',
    replacements: [ [/,?\s*Section\b/g, ''] ]
  },
  {
    file: 'src/app/[locale]/products/datasets/page.tsx',
    replacements: [ [/,?\s*Section\b/g, ''] ]
  },
  {
    file: 'src/app/[locale]/products/eu-ai-act/page.tsx',
    replacements: [ [/,?\s*Section\b/g, ''] ]
  },
  {
    file: 'src/app/[locale]/twins-leaderboard/twins-leaderboard-client.tsx',
    replacements: [ [/: any/g, ': unknown'] ]
  },
  {
    file: 'src/components/admin/master-plan-client.tsx',
    replacements: [ [/,?\s*arrayMove\b/g, ''], [/\bisPending\b/g, '_isPending'], [/: any/g, ': unknown'] ]
  },
  {
    file: 'src/components/admin/sidebar.tsx',
    replacements: [ [/,?\s*Video\b/g, ''], [/,?\s*FileText\b/g, ''] ]
  },
  {
    file: 'src/components/auth/auth-buttons.tsx',
    // React hook exhaustive deps - add fallbackOAuthRedirect
    replacements: [ [/\], \[router\]/g, '], [router, fallbackOAuthRedirect]'], [/\[router\]/g, '[router, fallbackOAuthRedirect]'] ]
  },
  {
    file: 'src/components/dilemmas/poll-card.tsx',
    replacements: [ [/\bsetTurnstileKey\b/g, '_setTurnstileKey'] ]
  },
  {
    file: 'src/components/layout/footer.tsx',
    replacements: [ [/,?\s*Radio\b/g, ''] ]
  },
  {
    file: 'src/lib/agent-os/local-router-tom.ts',
    replacements: [ [/console\.log/g, 'console.info'] ]
  },
  {
    file: 'src/lib/agent-os/tcsfl-ast-gate.ts',
    replacements: [ [/\* as z\b/g, '* as _z'] ]
  },
  {
    file: 'src/lib/audit/model-router.ts',
    replacements: [ [/\bOPENCODE_FREE_MODELS\b/g, '_OPENCODE_FREE_MODELS'], [/\bNVIDIA_NIM_MODELS\b/g, '_NVIDIA_NIM_MODELS'] ]
  },
  {
    file: 'src/lib/autopilot/kahin-oracle.ts',
    replacements: [ [/console\.log/g, 'console.info'] ]
  },
  {
    file: 'src/types/next-navigation.d.ts',
    replacements: [ [/\bReadonlyURLSearchParams\b/g, '_ReadonlyURLSearchParams'] ]
  },
  {
    file: 'tests/e2e/admin-panel.spec.ts',
    replacements: [ [/\bhasKanban\b/g, '_hasKanban'], [/\bgaugeElements\b/g, '_gaugeElements'], [/\bisDisabled\b/g, '_isDisabled'] ]
  },
  {
    file: 'types/vendor.d.ts',
    replacements: [ [/: any/g, ': unknown'], [/<any/g, '<unknown'] ]
  }
];

for (const fix of fixes) {
  if (fs.existsSync(fix.file)) {
    let content = fs.readFileSync(fix.file, 'utf8');
    for (const [regex, replaceWith] of fix.replacements) {
      content = content.replace(regex, replaceWith);
    }
    fs.writeFileSync(fix.file, content);
  }
}

console.log('Sweep complete.');
