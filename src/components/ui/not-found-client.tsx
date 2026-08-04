"use client";

import { Link } from "@/i18n/routing";
import { motion, type Variants } from "framer-motion";
import { Container } from "@/components/ui/layout";
import { Home, FileSearch, ArrowLeft, AlertCircle } from "lucide-react";

interface NotFoundClientProps {
  code: string;
  badge: string;
  title: string;
  description: string;
  homeLabel: string;
  homeDesc: string;
  incidentsLabel: string;
  incidentsDesc: string;
  backLabel: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, ease: "easeOut" },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function NotFoundClient({
  code,
  badge,
  title,
  description,
  homeLabel,
  homeDesc,
  incidentsLabel,
  incidentsDesc,
  backLabel,
}: NotFoundClientProps) {
  return (
    <div className="relative min-h-[70vh] overflow-hidden">
      {/* Ambient background orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: ["-50%", "-48%", "-52%", "-50%"] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="bg-brand-600/8 absolute -top-[20%] left-1/3 h-[600px] w-[600px] rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], y: [0, 30, -30, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="bg-danger-500/10 absolute right-[15%] bottom-0 h-[400px] w-[400px] rounded-full blur-[100px]"
        />
      </div>

      <Container size="narrow" className="relative z-10 py-24 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <div
              className="border-danger-500/30 bg-danger-500/5 text-danger-400 mb-6 inline-flex items-center gap-2 rounded-sm border px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(230,57,70,0.15)]"
              role="status"
            >
              <AlertCircle className="h-4 w-4" />
              {badge}
            </div>
          </motion.div>

          {/* 404 Number */}
          <motion.p
            variants={itemVariants}
            className="from-brand-300 via-danger-400 to-brand-500 bg-gradient-to-r bg-clip-text text-8xl font-black tracking-tighter text-transparent drop-shadow-2xl select-none md:text-[10rem] lg:text-[12rem]"
          >
            {code}
          </motion.p>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-fg-primary mt-4 text-3xl font-black tracking-tight md:text-4xl"
          >
            {title}
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-fg-secondary mt-4 max-w-xl text-base leading-relaxed md:text-lg"
          >
            {description}
          </motion.p>

          {/* Navigation cards */}
          <motion.div
            variants={itemVariants}
            className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <Link
                href="/"
                className="border-border-subtle bg-bg-secondary hover:border-brand-500/40 hover:shadow-brand-500/5 flex items-center gap-3 rounded-xl border p-5 text-left transition-all duration-300 hover:shadow-lg"
              >
                <div className="bg-brand-500/10 border-brand-500/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
                  <Home className="text-brand-400 h-5 w-5" />
                </div>
                <div>
                  <p className="text-fg-primary text-sm font-semibold">{homeLabel}</p>
                  <p className="text-fg-muted mt-0.5 text-xs">{homeDesc}</p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <Link
                href="/incidents"
                className="border-border-subtle bg-bg-secondary hover:border-brand-500/40 hover:shadow-brand-500/5 flex items-center gap-3 rounded-xl border p-5 text-left transition-all duration-300 hover:shadow-lg"
              >
                <div className="bg-brand-500/10 border-brand-500/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
                  <FileSearch className="text-brand-400 h-5 w-5" />
                </div>
                <div>
                  <p className="text-fg-primary text-sm font-semibold">{incidentsLabel}</p>
                  <p className="text-fg-muted mt-0.5 text-xs">{incidentsDesc}</p>
                </div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Back link */}
          <motion.div variants={itemVariants} className="mt-10">
            <Link
              href="/"
              className="text-fg-muted hover:text-brand-400 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
}
