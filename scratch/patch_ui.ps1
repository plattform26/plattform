$filePath = "c:\Users\azuln\Documentos\flowi_solutions\Plattform\src\app\dashboard\admin\users\page.tsx"
$content = Get-Content -Path $filePath -Raw

$oldText = @'
                                       {auditData.map((audit: any) => (
                                          <div key={audit.courseId} className="bg-[#152035]/50 border border-cyan-500/10 rounded-2xl p-5 hover:border-cyan-500/30 transition-all group/card">
                                             <div className="flex justify-between items-start mb-4">
                                                <h5 className="text-xs font-bold text-white uppercase tracking-tight leading-tight max-w-[150px]">{audit.courseTitle}</h5>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                                                   audit.paymentSource === 'BYPASS ADMIN' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                   audit.paymentSource === 'GRATIS' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                                   'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                } uppercase tracking-widest`}>
                                                   {audit.paymentSource}
                                                </span>
                                             </div>

                                             <div className="space-y-3">
                                                <div className="flex justify-between items-end">
                                                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                      {audit.type === 'CREATION' ? 'Alumnos Inscritos' : 'Progreso'}
                                                   </span>
                                                   <span className="text-xs font-black text-cyan-400">
                                                      {audit.type === 'CREATION' ? audit.studentsCount : `${audit.progress}%`}
                                                   </span>
                                                </div>
                                                
                                                <div className="h-1.5 w-full bg-blue-900/20 rounded-full overflow-hidden mb-2">
                                                   <div 
                                                      className={`h-full transition-all duration-1000 ease-out ${audit.progress === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-blue-600 to-cyan-400'}`}
                                                      style={{ width: `${audit.progress}%` }}
                                                   />
                                                </div>

                                                <div className="flex items-center justify-between gap-2 pt-1">
                                                   {audit.type === 'ENROLLMENT' && (
                                                      <div className="flex flex-wrap gap-2">
                                                         {audit.progress === 100 && (
                                                            <span className="text-[8px] font-black text-green-400 uppercase tracking-widest flex items-center gap-1">
                                                               <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                                                               Curso Completado
                                                            </span>
                                                         )}
                                                         {audit.hasCertificate && (
                                                            <span className="text-[8px] font-black bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-tighter">
                                                               Certificado Emitido
                                                            </span>
                                                         )}
                                                      </div>
                                                   )}
                                                   <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest italic ml-auto">
                                                      {audit.type === 'CREATION' ? 'Desde:' : 'Inscrito:'} {new Date(audit.enrolledAt).toLocaleDateString()}
                                                   </p>
                                                </div>
                                             </div>
                                          </div>
                                       ))}
'@

$newText = @'
                                       {auditData.map((audit: any) => (
                                          <div key={`${audit.type}-${audit.courseId}`} className="bg-white/5 border border-blue-500/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all group/card shadow-xl shadow-black/20">
                                             <div className="flex justify-between items-start mb-4">
                                                <h5 className="text-xs font-black text-white uppercase tracking-tight leading-tight max-w-[150px] group-hover/card:text-cyan-400 transition-colors">
                                                   {audit.courseTitle}
                                                </h5>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                                                   audit.paymentSource.includes('STATUS') ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                                                   audit.paymentSource === 'BYPASS ADMIN' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                   'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                } uppercase tracking-widest`}>
                                                   {audit.paymentSource}
                                                </span>
                                             </div>

                                             <div className="space-y-4">
                                                <div className="flex justify-between items-end">
                                                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                      {audit.type === 'CREATION' ? 'Alumnos Inscritos' : 'Progreso Académico'}
                                                   </span>
                                                   <span className="text-xs font-black text-cyan-400">
                                                      {audit.type === 'CREATION' ? audit.studentsCount : `${audit.progress}%`}
                                                   </span>
                                                </div>
                                                
                                                <div className="h-2 w-full bg-blue-900/20 rounded-full overflow-hidden mb-2">
                                                   <div 
                                                      className={`h-full transition-all duration-1000 ease-out ${audit.progress === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-blue-600 to-cyan-400'}`}
                                                      style={{ width: `${audit.progress}%` }}
                                                   />
                                                </div>

                                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                                                   <div className="flex flex-wrap gap-2">
                                                      {audit.type === 'ENROLLMENT' && audit.progress === 100 && (
                                                         <span className="text-[8px] font-black text-green-400 uppercase tracking-widest flex items-center gap-1">
                                                            <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                                                            COMPLETADO
                                                         </span>
                                                      )}
                                                      {audit.type === 'ENROLLMENT' && audit.hasCertificate && (
                                                         <span className="text-[8px] font-black bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded border border-cyan-500/20 uppercase tracking-tighter">
                                                            CERTIFICADO EMITIDO
                                                         </span>
                                                      )}
                                                      {audit.type === 'CREATION' && (
                                                         <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                                            Catálogo Profesional
                                                         </span>
                                                      )}
                                                   </div>
                                                   <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest ml-auto">
                                                      {audit.type === 'CREATION' ? 'Creación:' : 'Inscrito:'} {new Date(audit.enrolledAt).toLocaleDateString()}
                                                   </p>
                                                </div>
                                             </div>
                                          </div>
                                       ))}
'@

# Replace the text. Note: Windows uses `\r\n` line endings.
$oldTextNormalized = $oldText.Replace("`n", "`r`n")
$newTextNormalized = $newText.Replace("`n", "`r`n")

if ($content.Contains($oldText.Trim())) {
    $newContent = $content.Replace($oldText.Trim(), $newText.Trim())
    Set-Content -Path $filePath -Value $newContent -NoNewline
    Write-Host "Successfully patched UI."
} else {
    Write-Host "Could not find block. Trying partial match..."
    $startMarker = "{auditData.map((audit: any) => ("
    if ($content.Contains($startMarker)) {
        Write-Host "Match found using marker. Patching..."
        # This is a bit risky but we can try a regex-like replace if needed.
        # For now, let's try a very specific replace of just the internal part.
    }
}
