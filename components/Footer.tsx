export default function Footer() {
    return (
        <div
            style={{
                borderTop: "1px solid rgba(255,255,255,0.05)",
                padding: "20px clamp(20px,5vw,60px)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
            }}
        >
            <span
                style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "#2A3244",
                    letterSpacing: "0.1em",
                }}
            >
                © 2025 FAST · UNIVERSITAS SILIWANGI
            </span>
            <span
                style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: "#1A2233",
                    letterSpacing: "0.18em",
                }}
            >
                FORENSIC AND SECURITY RESEARCH GROUP
            </span>
        </div>
    );
}
