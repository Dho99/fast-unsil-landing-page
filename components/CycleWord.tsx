"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function CycleWord({ words }: { words: string[] }) {
    const [i, setI] = useState(0);

    useEffect(() => {
        const t = setInterval(() => {
            setI((x) => (x + 1) % words.length);
        }, 2800);
        return () => clearInterval(t);
    }, [words.length]);

    return (
        <AnimatePresence mode="wait">
            <motion.span
                key={words[i]}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.32 }}
                style={{
                    color: "#00D4AA",
                    fontStyle: "italic",
                    display: "inline-block",
                }}
            >
                {words[i]}
            </motion.span>
        </AnimatePresence>
    );
}
