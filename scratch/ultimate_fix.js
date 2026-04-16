const fs = require('fs');

const filePath = 'c:\\Users\\azuln\\Documentos\\flowi_solutions\\Plattform\\src\\app\\dashboard\\admin\\users\\page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// We need to replace the specific sequence of tags that is breaking the build
// Line 458-460 area
content = content.replace(/<\/>\s*\)\)\)}/g, '</Fragment>\n                 ))}'); // Previous attempt fix
content = content.replace(/<\/>\s*\)\)\}/g, '</Fragment>\n                 ))}'); // Correct one

fs.writeFileSync(filePath, content);
console.log('Ultimate fix complete.');
