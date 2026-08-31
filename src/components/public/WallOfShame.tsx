// @ts-nocheck
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Sahte Veri: AI Şirketleri Utanç Listesi
const shamedCompanies = [
  { id: 1, name: "OpenAI", logo: "🤖", reason: "Closed Source Reality", score: 99 },
  { id: 2, name: "Google", logo: "🔍", reason: "Woke Gemini Fiasco", score: 85 },
  { id: 3, name: "Anthropic", logo: "🧠", reason: "Over-alignment Sandbox", score: 78 },
  { id: 4, name: "Meta", logo: "♾️", reason: "Privacy Illusion", score: 65 },
];

// Framer Motion Varyantları
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, x: -50, filter: "blur(10px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 12 },
  },
};

const glitchVariants: any = {
  initial: { x: 0, y: 0, opacity: 1 },
  hover: {
    x: [-2, 3, -1, 2, -3, 0],
    y: [1, -2, 2, -1, 1, 0],
    opacity: [1, 0.8, 1, 0.9, 1],
    transition: { duration: 0.3, repeat: Infinity, repeatType: "mirror" },
  },
};

export function WallOfShame() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black p-8 font-mono">
      {/* Kırmızı Neon Başlık */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 mb-12 text-center"
      >
        <h1 className="bg-gradient-to-r from-red-500 to-red-800 bg-clip-text text-5xl font-black tracking-widest text-transparent uppercase drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
          Wall of Shame
        </h1>
        <div className="mt-2 h-1 w-full bg-red-600 shadow-[0_0_20px_#ef4444]" />
        <p className="mt-4 text-sm tracking-widest text-red-400/80 uppercase">
          Alparai Ecosystem Warning Matrix
        </p>
      </motion.div>

      {/* Şirketler Listesi */}
      <motion.ul
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-3xl space-y-6"
      >
        <AnimatePresence>
          {shamedCompanies.map((company, index) => (
            <motion.li
              key={company.id}
              variants={itemVariants}
              onHoverStart={() => setHoveredId(company.id)}
              onHoverEnd={() => setHoveredId(null)}
              className="group relative cursor-crosshair"
            >
              {/* Neon Glow Arka Plan */}
              <div className="absolute inset-0 rounded-lg bg-red-600/10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

              {/* Ana Kart Bileşeni */}
              <motion.div
                variants={glitchVariants}
                initial="initial"
                animate={hoveredId === company.id ? "hover" : "initial"}
                className={`relative z-10 flex items-center justify-between rounded-lg border bg-black/50 p-6 backdrop-blur-sm transition-all duration-300 ${
                  hoveredId === company.id
                    ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                    : "border-red-900/50 shadow-[0_0_10px_rgba(153,27,27,0.2)]"
                }`}
              >
                {/* Sol Kısım: Sıra ve Logo */}
                <div className="flex items-center gap-6">
                  <span className="text-4xl font-bold text-red-700/50 drop-shadow-[0_0_5px_rgba(185,28,28,0.8)]">
                    #{index + 1}
                  </span>
                  <div className="text-4xl">{company.logo}</div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-wider text-red-500">
                      {company.name}
                    </h2>
                    <p className="text-sm text-red-400/60 uppercase">[ İHLAL: {company.reason} ]</p>
                  </div>
                </div>

                {/* Sağ Kısım: Tehdit Skoru */}
                <div className="text-right">
                  <div className="text-3xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                    {company.score}%
                  </div>
                  <div className="mt-1 text-xs tracking-widest text-red-600/80 uppercase">
                    Tehdit Skoru
                  </div>
                </div>

                {/* Cyberpunk Glitch Çizgileri */}
                {hoveredId === company.id && (
                  <>
                    <motion.div
                      className="absolute top-0 left-10 h-px w-20 bg-red-500/80 shadow-[0_0_8px_#ef4444]"
                      animate={{ x: [-50, 200, -50] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute right-10 bottom-0 h-px w-32 bg-red-500/80 shadow-[0_0_8px_#ef4444]"
                      animate={{ x: [50, -200, 50] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                    />
                  </>
                )}
              </motion.div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {/* CRT Ekran Overlay Efekti */}
      <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20" />
    </div>
  );
}
