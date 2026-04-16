import fs from 'fs';

const filePath = 'c:\\Users\\azuln\\Documentos\\flowi_solutions\\Plattform\\src\\app\\dashboard\\admin\\users\\page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// The problematic line is around 450-460
// It currently has </> followed by ))}
if (content.indexOf('</>\n                 ))}') !== -1) {
    console.log('Found problematic tag. Replacing...');
    content = content.replace('</>\n                 ))}', '</Fragment>\n                 ))}');
} else {
    // Try without specific indentation
    console.log('Indentation mismatch. Trying fuzzy match...');
    content = content.replace(/<\/>\s*\)\)\)}/g, '</Fragment>\n                 ))}');
}

fs.writeFileSync(filePath, content);
console.log('Emergency fix applied.');
