"use client";

import { useEffect, useRef } from "react";

export default function CyberBg() {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resize();
        window.addEventListener("resize", resize);

        const FS = 14;
        const CHARS = "アカサタFAST01101#/>\\";
        const cols = Math.floor(canvas.width / FS);
        const drops = Array.from({ length: cols }, () => Math.random() * -50);

        const nodes = Array.from({ length: 55 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            r: Math.random() * 1.5 + 0.5,
            ph: Math.random() * Math.PI * 2,
        }));

        let frame = 0;

        const draw = () => {
            frame++;

            ctx.fillStyle = "rgba(7,11,24,0.07)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (frame % 2 === 0) {
                ctx.font = `${FS}px monospace`;
                drops.forEach((y, i) => {
                    const bright = Math.random() > 0.96;
                    ctx.fillStyle = bright
                        ? "rgba(0,212,170,0.88)"
                        : "rgba(0,212,170,0.09)";
                    ctx.fillText(
                        CHARS[Math.floor(Math.random() * CHARS.length)],
                        i * FS,
                        y * FS,
                    );
                    if (y * FS > canvas.height && Math.random() > 0.975)
                        drops[i] = 0;
                    drops[i] += 0.5;
                });
            }

            nodes.forEach((n) => {
                n.x += n.vx;
                n.y += n.vy;
                n.ph += 0.025;
                if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
                if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
                const pr = n.r + Math.sin(n.ph) * 0.4;
                ctx.beginPath();
                ctx.arc(n.x, n.y, pr, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(0,212,170,0.72)";
                ctx.fill();
            });

            ctx.lineWidth = 0.4;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const d = Math.hypot(
                        nodes[i].x - nodes[j].x,
                        nodes[i].y - nodes[j].y,
                    );
                    if (d < 130) {
                        ctx.strokeStyle = `rgba(0,212,170,${(1 - d / 130) * 0.2})`;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            animId = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={ref}
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                opacity: 0.72,
            }}
        />
    );
}
