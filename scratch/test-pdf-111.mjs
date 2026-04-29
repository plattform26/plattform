import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
    const pdfParse = require('pdf-parse');
    console.log('--- TESTING pdf-parse v1.1.1 ---');
    console.log('Type of pdfParse:', typeof pdfParse);
    console.log('Keys of pdfParse:', Object.keys(pdfParse || {}));
    
    const dummyBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    
    if (typeof pdfParse === 'function') {
        console.log('It is a function! Attempting to call with dummy buffer...');
        // We don't necessarily need to await it if we just want to see if it throws on call
        const p = pdfParse(dummyBuffer);
        console.log('Call initiated (Promise returned)');
    }
} catch (err) {
    console.error('Test failed:', err.message);
}
