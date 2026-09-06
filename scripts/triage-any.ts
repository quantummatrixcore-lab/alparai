import { Project, SyntaxKind, Node } from "ts-morph";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const sourceFiles = project.getSourceFiles("src/**/*.ts*");
let anyCount = 0;

for (const sourceFile of sourceFiles) {
  const anyKeywords = sourceFile.getDescendantsOfKind(SyntaxKind.AnyKeyword);
  if (anyKeywords.length > 0) {
    let modified = false;
    
    // Sort descending by position so insertions don't mess up earlier offsets
    const sortedKeywords = anyKeywords.sort((a, b) => b.getStart() - a.getStart());
    
    for (const keyword of sortedKeywords) {
      anyCount++;
      const statement = keyword.getFirstAncestor(node => {
        return Node.isStatement(node) || Node.isPropertyDeclaration(node) || Node.isPropertySignature(node) || Node.isMethodDeclaration(node) || Node.isParameterDeclaration(node);
      });
      
      if (statement) {
        const fullText = statement.getFullText();
        if (!fullText.includes("eslint-disable-next-line @typescript-eslint/no-explicit-any")) {
           // We insert the comment right before the statement
           const leadingTrivia = statement.getLeadingCommentRanges();
           statement.replaceWithText(`// eslint-disable-next-line @typescript-eslint/no-explicit-any\n${statement.getText()}`);
           modified = true;
        }
      }
    }
    if (modified) {
      sourceFile.saveSync();
    }
  }
}

console.log(`Allowlisted ${anyCount} 'any' occurrences.`);
