import { Project } from 'ts-morph';
import fs from 'fs';

const project = new Project();
const sourceFile = project.addSourceFileAtPath('D:/01_SaaS_Products/Alparai/src/types/database.ts');

const dbType = sourceFile.getTypeAlias('Database');
if (!dbType) {
  console.log('Could not find Database type');
  process.exit(1);
}

const typeNode = dbType.getTypeNode();
console.log('Database type found. TypeNode kind:', typeNode.getKindName());

// Get public type
const publicProp = typeNode.getMembers().find(m => m.getName && m.getName() === 'public');
if (!publicProp) {
  console.log('Could not find public property');
  process.exit(1);
}

const publicTypeNode = publicProp.getTypeNode();
console.log('public property kind:', publicTypeNode.getKindName());

const publicMembers = publicTypeNode.getMembers();
console.log('public members:', publicMembers.map(m => m.getName ? m.getName() : m.getText()));

const tablesProp = publicMembers.find(m => m.getName && m.getName() === 'Tables');
const tablesObj = {};

if (tablesProp) {
  const tablesTypeNode = tablesProp.getTypeNode();
  for (const member of tablesTypeNode.getMembers()) {
    const tableName = member.getName();
    const tableTypeNode = member.getTypeNode();
    const cols = {};
    if (tableTypeNode && tableTypeNode.getMembers) {
      const rowProp = tableTypeNode.getMembers().find(m => m.getName && m.getName() === 'Row');
      if (rowProp && rowProp.getTypeNode && rowProp.getTypeNode().getMembers) {
        for (const colMember of rowProp.getTypeNode().getMembers()) {
          cols[colMember.getName()] = {
            hasQuestionToken: colMember.hasQuestionToken ? colMember.hasQuestionToken() : false,
            type: colMember.getTypeNode() ? colMember.getTypeNode().getText() : 'any'
          };
        }
      }
    }
    tablesObj[tableName] = cols;
  }
}

console.log('Successfully parsed tables in database.ts! Count:', Object.keys(tablesObj).length);

const enumsProp = publicMembers.find(m => m.getName && m.getName() === 'Enums');
const enumsObj = {};
if (enumsProp) {
  const enumsTypeNode = enumsProp.getTypeNode();
  for (const member of enumsTypeNode.getMembers()) {
    enumsObj[member.getName()] = member.getTypeNode() ? member.getTypeNode().getText() : 'any';
  }
}
console.log('Enums in database.ts count:', Object.keys(enumsObj).length);

const funcsProp = publicMembers.find(m => m.getName && m.getName() === 'Functions');
const funcsObj = {};
if (funcsProp) {
  const funcsTypeNode = funcsProp.getTypeNode();
  for (const member of funcsTypeNode.getMembers()) {
    funcsObj[member.getName()] = true;
  }
}
console.log('Functions in database.ts count:', Object.keys(funcsObj).length);

fs.writeFileSync('D:/01_SaaS_Products/Alparai/scratch/database_ts_ast.json', JSON.stringify({
  tables: tablesObj,
  enums: enumsObj,
  functions: funcsObj
}, null, 2));

console.log('Saved AST to scratch/database_ts_ast.json');
