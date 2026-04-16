const fs = require('fs');

const filePath = 'c:\\Users\\azuln\\Documentos\\flowi_solutions\\Plattform\\src\\app\\dashboard\\admin\\users\\page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace ANY occurrence of </> followed by ))} within reasonable proximity
// We seek precisely the one at the end of the users.map
const search = '                    </>\n                 ))}';
const replace = '                    </Fragment>\n                 ))}';

if (content.indexOf(search) !== -1) {
    content = content.replace(search, replace);
    console.log('Exact match replaced.');
} else {
    // Fallback: replace using regex to ignore slight spacing variations
    console.log('Exact match not found. Using regex...');
    content = content.replace(/<\/>\s*\)\)\)}/g, '</Fragment>\n                 ))}');
}

fs.writeFileSync(filePath, content);
console.log('Fix complete.');
