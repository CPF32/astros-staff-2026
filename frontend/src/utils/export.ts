export function downloadCsv<T>(
  rows: T[],
  filename: string,
  headers: Array<{ key: keyof T; label: string }>
): void {
  const escapeCell = (value: unknown): string => {
    const raw = value == null ? "" : String(value);
    const escaped = raw.replace(/"/g, '""');
    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
  };

  const headerRow = headers.map((h) => escapeCell(h.label)).join(",");
  const bodyRows = rows.map((row) =>
    headers.map((h) => escapeCell((row as Record<string, unknown>)[String(h.key)])).join(",")
  );
  const csv = [headerRow, ...bodyRows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
