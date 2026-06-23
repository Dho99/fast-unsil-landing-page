"use client";

import { useState, useEffect } from "react";

export default function CycleWord({ words }: { words: string[] }) {
    const [i, setI] = useState(0);
    const [on, setOn] = useState(true);

    useEffect(() => {
        const t = setInterval(() => {
            setOn(false);
            setTimeout(() => {
                setI((x) => (x + 1) % words.length);
                setOn(true);
            }, 350);
        }, 2800);
        return () => clearInterval(t);
    }, [words.length]);

    return (
        <span
            style={{
                color: "#00D4AA",
                fontStyle: "italic",
                display: "inline-block",
                opacity: on ? 1 : 0,
                transform: on ? "translateY(0)" : "translateY(-10px)",
                transition: "opacity 0.32s ease, transform 0.32s ease",
            }}
        >
            {words[i]}
        </span>
    );
}
