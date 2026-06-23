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
        c: "#00D4AA",
        rgb: "0,212,170",
    },
    {
        n: "02",
        title: "Penetration Testing",
        desc: "Simulasi serangan nyata untuk mengidentifikasi dan menutup celah keamanan sebelum dieksploitasi pihak lain.",
        c: "#E85A4F",
        rgb: "232,90,79",
    },
    {
        n: "03",
        title: "Security Research",
        desc: "Riset aktif dan publikasi di bidang kriptografi, keamanan jaringan, dan kerentanan sistem modern.",
        c: "#7B8EFF",
        rgb: "123,142,255",
    },
];

export const CSS = `
  @keyframes tk  { from { transform: translateX(0) }       to { transform: translateX(-50%) } }
  @keyframes fu  { from { opacity: 0; transform: translateY(36px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes bb  { 0%,100% { transform: translateX(-50%) translateY(0) } 50% { transform: translateX(-50%) translateY(8px) } }
  @keyframes pl  { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }
  @keyframes ci  { 0%,100% { clip-path: inset(0 0 0 0) } 25% { clip-path: inset(10% -4px 85% 0) } 50% { clip-path: inset(40% -4px 50% 0) } 75% { clip-path: inset(70% -4px 20% 0) } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  a { text-decoration: none; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #00D4AA25; border-radius: 4px; }
`;
