export type CsvValue = string | number | null | undefined;

/**
 * U+FEFF byte order mark — makes Excel read the file as UTF-8 rather than the
 * system codepage, which otherwise mangles ₦ and accented names. Built from a
 * char code so it stays visible in source instead of being an invisible byte.
 */
const UTF8_BOM = String.fromCharCode(0xfeff);

/**
 * Quote a field per RFC 4180 — required whenever it contains a comma, a double
 * quote or a line break, which product and customer names routinely do.
 */
export function csvField(value: CsvValue): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Join rows into a CSV document. CRLF line endings are what Excel expects. */
export function toCsv(rows: CsvValue[][]): string {
  return rows.map((row) => row.map(csvField).join(",")).join("\r\n");
}

/** Prompt the browser to save `content` as a .csv file. Browser only. */
export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([UTF8_BOM, content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
