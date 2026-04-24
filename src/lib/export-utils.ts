/**
 * Exporta un array de objetos a un archivo CSV.
 */
export function exportToCSV(data: any[], fileName: string) {
  if (!data || data.length === 0) return;
  
  const replacer = (key: string, value: any) => (value === null ? '' : value);
  const header = Object.keys(data[0]);
  const csv = [
    header.join(','),
    ...data.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(',')
    ),
  ].join('\r\n');

  // Añadimos el BOM (Byte Order Mark) para que Excel reconozca UTF-8 automáticamente (acentos, ñ, etc)
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
