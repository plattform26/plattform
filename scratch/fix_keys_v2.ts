import fs from 'fs';

const filePath = 'c:\\Users\\azuln\\Documentos\\flowi_solutions\\Plattform\\src\\app\\dashboard\\admin\\users\\page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace users.map start
const oldMapStart = ') : users.map(user => (\n                    <>';
if (content.indexOf(') : users.map(user => (') !== -1) {
    console.log('Found map start. Replacing fragments with keyed Fragment...');
    // Replace opening <>
    content = content.replace(/users\.map\(user => \(\s*<>/g, 'users.map(user => (\n                    <Fragment key={user.id}>');
    // Replace closing </> just before ))}
    content = content.replace(/<\/>\s*\)\)\)}/g, '</Fragment>\n                 ))}');
    
    // Also add the Error message in the UI
    const sinActividad = '<p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">Sin actividad registrada para este perfil.</p>';
    const errorMsg = `{isAuditError ? (
                                          <div className="flex flex-col items-center gap-2">
                                             <p className="text-red-400 font-black text-[10px] uppercase tracking-widest">Error al cargar datos de auditoría</p>
                                             <button onClick={() => handleAudit(auditingUserId!)} className="text-[10px] text-cyan-400 underline uppercase font-bold">Reintentar</button>
                                          </div>
                                       ) : (
                                          <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">Sin actividad registrada para este perfil.</p>
                                       )}`;
    
    if (content.indexOf(sinActividad) !== -1) {
        content = content.replace(sinActividad, errorMsg);
    }

    fs.writeFileSync(filePath, content);
    console.log('Successfully patched keys and error UI.');
} else {
    console.error('Map block not found.');
}
