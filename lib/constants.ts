export const NAV = ["Beranda", "Tentang", "Riset", "Anggota", "Info Dikti"];

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

export const NAV_ANCHORS: Record<string, string> = {
    Beranda: "/",
    Tentang: "#tentang",
    Riset: "#riset",
    Anggota: "#anggota",
    "Info Dikti": "/info-dikti",
};

export interface NewsArticle {
    id: string;
    category: string;
    categoryColor: string;
    imagePlaceholder: string;
    title: string;
    date: string;
    excerpt: string;
    link?: string;
    source?: string;
    pdfLink?: string;
    publishedAt?: string;
    createdAt?: string;
}

export const NEWS: NewsArticle[] = [
    {
        id: "n1",
        category: "CTF",
        categoryColor: "#3B82F6",
        imagePlaceholder:
            "linear-gradient(135deg, #1e3a5f 0%, #0d1b35 60%, #1a2840 100%)",
        title: "Tim FAST Raih Juara 2 CTF Nasional COMPFEST XVI",
        date: "12 Jun 2025",
        excerpt:
            "Tim mahasiswa FAST berhasil menembus babak final dan meraih posisi runner-up dalam ajang CTF bergengsi tingkat nasional.",
    },
    {
        id: "n2",
        category: "Riset",
        categoryColor: "#6366F1",
        imagePlaceholder:
            "linear-gradient(135deg, #1a1040 0%, #0d1b35 60%, #1e2a4a 100%)",
        title: "Publikasi Baru: Deteksi Malware Berbasis Machine Learning pada Jaringan IoT",
        date: "28 Mei 2025",
        excerpt:
            "Riset terbaru anggota FAST diterima di konferensi internasional ICCCS 2025 dengan tingkat deteksi mencapai 97.4%.",
    },
    {
        id: "n3",
        category: "Workshop",
        categoryColor: "#DC2626",
        imagePlaceholder:
            "linear-gradient(135deg, #3b0a0a 0%, #1a0505 60%, #2a1010 100%)",
        title: "Workshop Penetration Testing Web Application Dihadiri 200+ Peserta",
        date: "10 Mei 2025",
        excerpt:
            "FAST menyelenggarakan workshop hands-on selama dua hari dengan materi OWASP Top 10 dan praktik live hacking.",
    },
];

export interface Partner {
    name: string;
    logoPlaceholder: string;
}

export interface PartnerCategory {
    label: string;
    accent: string;
    partners: Partner[];
}

export const PARTNER_CATEGORIES: PartnerCategory[] = [
    {
        label: "Mitra Industri",
        accent: "#3B82F6",
        partners: [
            { name: "Indosat Ooredoo", logoPlaceholder: "IOH" },
            { name: "Mikrotik", logoPlaceholder: "MTK" },
            { name: "Oracle Academy", logoPlaceholder: "ORC" },
            { name: "Ruijie Networks", logoPlaceholder: "RJE" },
            { name: "Tam Networks", logoPlaceholder: "TAM" },
            { name: "InData Labs", logoPlaceholder: "IDL" },
        ],
    },
    {
        label: "Mitra Strategis",
        accent: "#DC2626",
        partners: [
            { name: "BSSN", logoPlaceholder: "BSSN" },
            { name: "Kemenkominfo", logoPlaceholder: "KMK" },
            { name: "SouseIT", logoPlaceholder: "SST" },
        ],
    },
    {
        label: "Mitra Akademik",
        accent: "#6366F1",
        partners: [
            { name: "Universitas Siliwangi", logoPlaceholder: "UNS" },
            { name: "UCAB Jabar", logoPlaceholder: "UCB" },
            { name: "Dr. Pro", logoPlaceholder: "DRP" },
            { name: "LNDRI", logoPlaceholder: "LND" },
            { name: "Unissula", logoPlaceholder: "USS" },
            { name: "UTM Malaysia", logoPlaceholder: "UTM" },
            { name: "UMT Malaysia", logoPlaceholder: "UMT" },
            { name: "Universitas Petra", logoPlaceholder: "UPT" },
        ],
    },
    {
        label: "Kegiatan",
        accent: "#3B82F6",
        partners: [
            { name: "RICS", logoPlaceholder: "RCS" },
            { name: "ICECOS", logoPlaceholder: "ICE" },
            { name: "BAKTI", logoPlaceholder: "BKT" },
        ],
    },
    {
        label: "Sertifikasi & Kredensial",
        accent: "#DC2626",
        partners: [
            { name: "CompTIA Security+", logoPlaceholder: "SEC+" },
            { name: "CEH", logoPlaceholder: "CEH" },
            { name: "OSCP", logoPlaceholder: "OSCP" },
            { name: "CySA+", logoPlaceholder: "CYS" },
            { name: "CHFI", logoPlaceholder: "CHF" },
            { name: "eJPT", logoPlaceholder: "eJPT" },
        ],
    },
];

export interface Publication {
    no: number;
    title: string;
    authors: string;
    venue: string;
    year: number;
    accentColor: string;
    link?: string;
}

export const PUBLICATIONS: Publication[] = [
    {
        no: 1,
        title: "A Comparative Analysis of Smart and Dendritic Cell Algorithm in Intrusion Detection Systems",
        authors: "D. Shiawan, A. Haryanto, M.Q. Raza",
        venue: "International Conference on Cybersecurity · ICCCS 2025",
        year: 2025,
        accentColor: "#3B82F6",
    },
    {
        no: 2,
        title: "A New System for Underwater Vehicle Balancing Control Based on Weightless Neural Network and Fuzzy Logic Methods",
        authors: "A. Haryanto, M.Q. Raza, D. Shiawan",
        venue: "International Journal of Intelligent Systems · IJIS 2024",
        year: 2024,
        accentColor: "#DC2626",
    },
    {
        no: 3,
        title: "Time-Efficiency on Computational Performance of PCA, FA and TSVO on Ransomware Detection",
        authors: "M.Q. Raza, D. Shiawan, A. Haryanto",
        venue: "IEEE Symposium on Security and Privacy · IEEE S&P 2024",
        year: 2024,
        accentColor: "#6366F1",
    },
    {
        no: 4,
        title: "IoT Malware Detection Using Hybrid Feature Selection and Ensemble Learning on Network Traffic",
        authors: "D. Shiawan, A. Bardiad, M.Q. Raza",
        venue: "ACM Conference on Computer and Communications Security · CCS 2024",
        year: 2024,
        accentColor: "#3B82F6",
    },
    {
        no: 5,
        title: "Forensic Memory Analysis Framework for Cloud-Native Container Environments",
        authors: "A. Haryanto, A. Bardiad, D. Shiawan",
        venue: "Digital Investigation Journal · DFRWS 2023",
        year: 2023,
        accentColor: "#DC2626",
    },
];

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    initials: string;
    accentColor: string;
}

export const TEAM: TeamMember[] = [
    {
        id: "t1",
        name: "Prof. Dr. Denis Shiawan, M.T., Ph.D.",
        role: "Ketua FAST · AI Security Researcher",
        initials: "DS",
        accentColor: "#3B82F6",
    },
    {
        id: "t2",
        name: "Dr. Ahmad Haryanto, S.Kom., M.T.",
        role: "Wakil Ketua · Penetration Testing",
        initials: "AH",
        accentColor: "#DC2626",
    },
    {
        id: "t3",
        name: "Muhammad Qurniawan Raza, S.Kom., M.Sc.",
        role: "Koordinator Riset · Digital Forensics",
        initials: "MQ",
        accentColor: "#6366F1",
    },
    {
        id: "t4",
        name: "Ali Bardiad, S.D., M.Kom.",
        role: "Koordinator CTF & Kompetisi",
        initials: "AB",
        accentColor: "#3B82F6",
    },
    {
        id: "t5",
        name: "Siti Rahayu Dewi, S.T., M.T.",
        role: "Riset Kriptografi & Blockchain",
        initials: "SR",
        accentColor: "#DC2626",
    },
    {
        id: "t6",
        name: "Fajar Nugraha, S.Kom., M.Kom.",
        role: "Security Operations & OSINT",
        initials: "FN",
        accentColor: "#6366F1",
    },
];
