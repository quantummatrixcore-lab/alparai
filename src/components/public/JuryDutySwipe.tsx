"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export function JuryDutySwipe() {
  const [cards, setCards] = useState([
    {
      id: 1,
      defendant: "GPT-4o",
      charge: "Algorithmic Bias in Resume Screening",
      evidence: "Systematically downranked resumes containing the word 'maternity'.",
      reporter: "@AvukatAli",
    },
    {
      id: 2,
      defendant: "Claude 3.5 Sonnet",
      charge: "Copyright Infringement",
      evidence: "Reproduced 4 paragraphs of a paywalled NYT article verbatim.",
      reporter: "@TechJournalist",
    },
  ]);

  const handleSwipe = (id: number, direction: "left" | "right") => {
    // Right = Guilty, Left = Innocent
    setCards((prev) => prev.filter((c) => c.id !== id));
    // In production, this would trigger an API call to record the vote.
  };

  return (
    <div className="relative flex h-[500px] w-full max-w-sm flex-col items-center justify-center overflow-hidden rounded-3xl border border-border-subtle bg-bg-primary p-4 shadow-2xl">
      <div className="text-fg-muted absolute top-4 flex w-full items-center justify-between px-6 text-sm font-semibold">
        <span className="flex items-center gap-1 text-emerald-400">
          <XCircle className="h-4 w-4" /> Innocent
        </span>
        <span className="text-brand-400">Jury Duty</span>
        <span className="flex items-center gap-1 text-rose-400">
          Guilty <CheckCircle className="h-4 w-4" />
        </span>
      </div>

      <AnimatePresence>
        {cards.length > 0 ? (
          cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, x: -200 }}
              drag="x"
              dragConstraints={{ left: -100, right: 100 }}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = offset.x;
                if (swipe > 100) handleSwipe(card.id, "right");
                else if (swipe < -100) handleSwipe(card.id, "left");
              }}
              className={`absolute flex h-[350px] w-[300px] cursor-grab flex-col justify-between rounded-2xl border border-border-subtle bg-bg-secondary p-6 shadow-xl active:cursor-grabbing ${index === 0 ? "z-10" : "z-0"}`}
              style={{ zIndex: cards.length - index }}
            >
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-400">
                  <AlertTriangle className="h-3 w-3" /> Incident Report
                </div>
                <h3 className="mb-1 text-2xl font-black text-white">{card.defendant}</h3>
                <p className="text-brand-400 mb-4 text-sm font-medium">{card.charge}</p>
                <div className="text-fg-secondary rounded-lg bg-black/40 p-3 text-sm">
                  <span className="text-fg-muted mb-1 block text-xs font-semibold uppercase">
                    Evidence
                  </span>
                  "{card.evidence}"
                </div>
              </div>
              <div className="text-fg-muted flex items-center gap-2 text-xs">
                <Gavel className="h-4 w-4" /> Reported by {card.reporter}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-fg-muted text-center">
            <CheckCircle className="mx-auto mb-2 h-8 w-8 text-emerald-400 opacity-50" />
            <p>You have cleared the docket.</p>
            <p className="text-xs">Thank you for your service.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
