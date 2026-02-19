export interface ParsedCSV {
  headers: string[];
  content: Record<string, string>[];
  rowCount: number;
}

// Robust CSV Parser that handles newlines within quotes, escaped quotes, and various line endings.
export const parseCSV = (text: string): ParsedCSV => {
    // Remove Byte Order Mark (BOM) if present
    text = text.replace(/^\uFEFF/, '');
    
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuote = false;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i+1];
        
        if (inQuote) {
            if (char === '"' && nextChar === '"') {
                // Escaped quote inside quoted field
                currentField += '"';
                i++; // Skip the next quote
            } else if (char === '"') {
                // End of quoted field
                inQuote = false;
            } else {
                currentField += char;
            }
        } else {
            if (char === '"') {
                // Start of quoted field
                inQuote = true;
            } else if (char === ',') {
                // End of field
                currentRow.push(currentField.trim()); // Trim whitespace around unquoted fields
                currentField = '';
            } else if (char === '\r' || char === '\n') {
                // End of row
                currentRow.push(currentField.trim());
                rows.push(currentRow);
                currentRow = [];
                currentField = '';
                
                // Handle CRLF
                if (char === '\r' && nextChar === '\n') {
                    i++;
                }
            } else {
                currentField += char;
            }
        }
    }
    
    // Flush remaining data
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
    }
    
    // Filter out completely empty rows (common at end of files)
    const validRows = rows.filter(r => r.length > 0 && r.some(c => c !== ''));
    
    if (validRows.length === 0) {
         return { headers: [], content: [], rowCount: 0 };
    }

    // Assume first row is header
    const headers = validRows[0];
    const dataRows = validRows.slice(1);
    
    const content = dataRows.map(row => {
        const record: Record<string, string> = {};
        headers.forEach((h, idx) => {
            record[h] = row[idx] || ''; // Handle ragged rows safely
        });
        return record;
    });

    return { headers, content, rowCount: content.length };
};