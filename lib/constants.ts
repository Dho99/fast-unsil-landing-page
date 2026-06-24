export const NAV = ["Beranda", "Tentang", "Riset", "Anggota"];

export const WORDS = ["Investigate", "Protect", "Analyze"];

export const TICKER = [
    "Digital Forensics",
    "Penetration Testing",
    "CTF Competitions",
    "Security Research",
    "OSINT",
    "Reverse Engineering",
    "Vulnerability Assessment",
    "Incident Response",
    "Malware Analysis",
];

export interface CardData {
    n: string;
    title: string;
    desc: string;
    c: string;
    rgb: string;
}

export const CARDS: CardData[] = [
    {
        n: "01",
        title: "Digital Forensics",
        desc: "Investigasi mendalam pada artefak digital — log, memori, dan disk — untuk mengungkap jejak aktivitas mencurigakan.",
        c: "#3B82F6",
        rgb: "59,130,246",
    },
    {
        n: "02",
        title: "Penetration Testing",
        desc: "Simulasi serangan nyata untuk mengidentifikasi dan menutup celah keamanan sebelum dieksploitasi pihak lain.",
        c: "#DC2626",
        rgb: "220,38,38",
    },
    {
        n: "03",
        title: "Security Research",
        desc: "Riset aktif dan publikasi di bidang kriptografi, keamanan jaringan, dan kerentanan sistem modern.",
        c: "#6366F1",
        rgb: "99,102,241",
    },
];

export const CSS = `
  @keyframes tk  { from { transform: translateX(0) }       to { transform: translateX(-50%) } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  a { text-decoration: none; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #3B82F625; border-radius: 4px; }
`;
