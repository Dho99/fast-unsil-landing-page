export default function Footer() {
    return (
        <div className="flex flex-col items-center gap-2 text-center border-t border-border-subtle py-5 px-[clamp(20px,5vw,60px)]">
            <span className="font-mono text-[11px] text-footer-text tracking-[0.1em]">
                © 2025 FAST · UNIVERSITAS SILIWANGI
            </span>
            <span className="font-mono text-[10px] text-footer-text-sub tracking-[0.18em]">
                FORENSIC AND SECURITY RESEARCH GROUP
            </span>
        </div>
    );
}
