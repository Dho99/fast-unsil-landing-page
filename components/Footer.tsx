export default function Footer() {
    return (
        <div
            style={{
                borderTop: "1px solid rgba(255,255,255,0.05)",
                padding: "20px clamp(20px,5vw,60px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                textAlign: "center",
            }}
        >
            <span
                style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "#2A3244",
                    letterSpacing: "0.1em",
                    textAlign: "center",
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
                    textAlign: "center",
                }}
            >
                FORENSIC AND SECURITY RESEARCH GROUP
            </span>
        </div>
    );
}
