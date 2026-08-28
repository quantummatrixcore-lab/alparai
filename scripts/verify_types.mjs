import { Project } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'D:/01_SaaS_Products/Alparai/tsconfig.json'
});

const filesToCheck = [
  'D:/01_SaaS_Products/Alparai/src/types/database.types.ts',
  'D:/01_SaaS_Products/Alparai/src/types/database.ts',
  'D:/01_SaaS_Products/Alparai/src/types/index.ts',
  'D:/01_SaaS_Products/Alparai/src/lib/supabase/client.ts',
  'D:/01_SaaS_Products/Alparai/src/lib/supabase/server.ts',
  'D:/01_SaaS_Products/Alparai/src/lib/supabase/admin.ts'
];

let hasErrors = false;

for (const f of filesToCheck) {
  console.log(`Checking ${f.split(/[\\\\/]/).pop()}...`);
  const sf = project.getSourceFile(f);
  if (!sf) {
    console.log(`  Warning: File not found in project: ${f}`);
    continue;
  }
  const diags = sf.getPreEmitDiagnostics();
  console.log(`  Diagnostics count: ${diags.length}`);
  if (diags.length > 0) {
    hasErrors = true;
    diags.forEach(d => {
      console.log(`  - [Line ${d.getLineNumber()}] ${d.getMessageText()}`);
    });
  }
}

if (!hasErrors) {
  console.log('\n>>> ALL SUPABASE & CORE DATABASE TYPE CHECKS PASSED WITH 0 ERRORS! <<<');
} else {
  console.log('\n>>> Some type errors detected! <<<');
}
