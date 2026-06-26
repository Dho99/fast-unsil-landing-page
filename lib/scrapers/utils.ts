const ID_MONTHS: Record<string, number> = {
    januari: 0, jan: 0,
    februari: 1, feb: 1,
    maret: 2, mar: 2,
    april: 3, apr: 3,
    mei: 4,
    juni: 5, jun: 5,
    juli: 6, jul: 6,
    agustus: 7, agt: 7, agu: 7, aug: 7,
    september: 8, sep: 8,
    oktober: 9, okt: 9, oct: 9,
    november: 10, nov: 10,
    desember: 11, des: 11, dec: 11,
};

// Parse "25 Juni 2026", "25 Jun 2026 15:21:21", ISO dates, etc.
export function parseIndonesianDate(raw: string): string | null {
    if (!raw) return null;

    // Try ISO first
    const iso = Date.parse(raw);
    if (!isNaN(iso)) return new Date(iso).toISOString();

    // Match "DD MonthName YYYY"
    const m = raw.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (!m) return null;
    const day = parseInt(m[1], 10);
    const month = ID_MONTHS[m[2].toLowerCase()];
    const year = parseInt(m[3], 10);
    if (month === undefined) return null;
    return new Date(year, month, day).toISOString();
}

export function formatIsoToDisplay(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}
