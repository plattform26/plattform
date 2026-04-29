const { PDFParse } = await import('pdf-parse');

// Mock a minimal PDF buffer (empty or dummy)
const dummyBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

try {
    console.log('--- TESTING PDFParse CLASS ---');
    const parser = new PDFParse({ data: dummyBuffer });
    console.log('Constructor OK');
    
    console.log('Available Methods:', Object.getOwnPropertyNames(PDFParse.prototype));
    
    // Test getText if possible (might fail on dummy, but we check if it exists)
    if (typeof parser.getText === 'function') {
        console.log('getText() method FOUND');
    } else {
        console.log('getText() method NOT FOUND');
    }
} catch (err) {
    console.error('Test failed:', err.message);
}
