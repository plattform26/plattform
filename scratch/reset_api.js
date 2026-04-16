const fs = require('fs');

const targetFile = 'c:\\Users\\azuln\\Documentos\\flowi_solutions\\Plattform\\src\\app\\api\\admin\\users\\[id]\\audit\\route.ts';
const sourceFile = 'c:\\Users\\azuln\\Documentos\\flowi_solutions\\Plattform\\scratch\\rewrite_api.ts';

const content = fs.readFileSync(sourceFile, 'utf-8');

// Ensure the directory exists (it should, but safety first)
fs.writeFileSync(targetFile, content);

console.log('Audit API has been reset and rewritten with clean syntax.');
