const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');
const path = require('path');

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

console.log('Finding explicit anys and unused variables...');

let fixedCount = 0;

for (const sourceFile of project.getSourceFiles()) {
  let fileChanged = false;

  // 1. Fix explicit any -> unknown
  const anyKeywords = sourceFile.getDescendantsOfKind(SyntaxKind.AnyKeyword);
  for (const anyNode of anyKeywords) {
    anyNode.replaceWithText('unknown');
    fileChanged = true;
    fixedCount++;
  }

  // 2. Fix unused variables (prefix with _)
  // Since we can't easily run full diagnostic per node fast enough, we just prefix _ to all unused diagnostic messages.
  const diagnostics = sourceFile.getPreEmitDiagnostics();
  
  for (const diagnostic of diagnostics) {
    const code = diagnostic.getCode();
    // 6133 is "X is declared but its value is never read"
    if (code === 6133 || code === 6196) {
      const start = diagnostic.getStart();
      if (start !== undefined) {
        const node = sourceFile.getDescendantAtPos(start);
        if (node) {
          const idNode = node.getKind() === SyntaxKind.Identifier ? node : node.getFirstChildByKind(SyntaxKind.Identifier);
          if (idNode) {
            const name = idNode.getText();
            if (!name.startsWith('_')) {
              idNode.replaceWithText('_' + name);
              fileChanged = true;
              fixedCount++;
            }
          }
        }
      }
    }
  }

  if (fileChanged) {
    sourceFile.saveSync();
  }
}

console.log(`Auto-fixed ${fixedCount} issues.`);
