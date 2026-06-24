"use client";

import { motion } from "framer-motion";
import { MapPin, Mail, Phone } from "lucide-react";

export default function ContactSection() {
    return (
        <section id="kontak" className="py-20 px-[clamp(16px,4vw,56px)]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-[clamp(36px,6vw,66px)] flex flex-col items-center">
                    <div className="text-[13px] text-[#3B82F6] tracking-[0.32em] font-mono mb-[13px] font-semibold">
                        ▸ LOKASI &amp; KONTAK
                    </div>
                    <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.02em] mb-[14px] text-content font-heading">
                        Kunjungi Kami
                    </h2>
                    <p className="text-muted-text max-w-[440px] mx-auto leading-[1.75] text-[1.1rem]">
                        Temukan kami di kampus Universitas Siliwangi atau
                        hubungi melalui saluran berikut.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-10 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col gap-4"
                    >
                        <div
                            className="flex gap-4 p-6 rounded-2xl border border-[rgba(59,130,246,0.12)]"
                            style={{ background: "var(--card-custom-bg)" }}
                        >
                            <div className="shrink-0 w-10 h-10 rounded-full bg-[rgba(59,130,246,0.12)] flex items-center justify-center">
                                <MapPin size={18} className="text-[#3B82F6]" />
                            </div>
                            <div>
                                <p className="font-mono text-[11px] tracking-[0.2em] text-[#3B82F6] font-semibold mb-1 uppercase">
                                    Alamat
                                </p>
                                <p className="text-content text-[0.95rem] leading-[1.7]">
                                    Jl. Siliwangi No.24, Kahuripan, Kec. Tawang
                                    <br />
                                    Kota Tasikmalaya, Jawa Barat 46115
                                </p>
                            </div>
                        </div>

                        <div
                            className="flex gap-4 p-6 rounded-2xl border border-[rgba(59,130,246,0.12)]"
                            style={{ background: "var(--card-custom-bg)" }}
                        >
                            <div className="shrink-0 w-10 h-10 rounded-full bg-[rgba(220,38,38,0.1)] flex items-center justify-center">
                                <Mail size={18} className="text-[#DC2626]" />
                            </div>
                            <div>
                                <p className="font-mono text-[11px] tracking-[0.2em] text-[#DC2626] font-semibold mb-1 uppercase">
                                    Email
                                </p>
                                <a
                                    href="mailto:fast@unsil.ac.id"
                                    className="text-content text-[0.95rem] hover:text-[#3B82F6] transition-colors"
                                >
                                    fast@unsil.ac.id
                                </a>
                            </div>
                        </div>

                        <div
                            className="flex gap-4 p-6 rounded-2xl border border-[rgba(59,130,246,0.12)]"
                            style={{ background: "var(--card-custom-bg)" }}
                        >
                            <div className="shrink-0 w-10 h-10 rounded-full bg-[rgba(99,102,241,0.12)] flex items-center justify-center">
                                <Phone size={18} className="text-[#6366F1]" />
                            </div>
                            <div>
                                <p className="font-mono text-[11px] tracking-[0.2em] text-[#6366F1] font-semibold mb-1 uppercase">
                                    Telepon
                                </p>
                                <a
                                    href="tel:+62265330634"
                                    className="text-content text-[0.95rem] hover:text-[#3B82F6] transition-colors"
                                >
                                    +62 265 330 634
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5 }}
                    >
                        <iframe
                            src="https://maps.google.com/maps?q=Universitas+Siliwangi+Tasikmalaya&output=embed"
                            title="Lokasi Universitas Siliwangi"
                            className="w-full h-[360px] rounded-2xl border border-[rgba(59,130,246,0.15)]"
                            loading="lazy"
                            allowFullScreen
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
