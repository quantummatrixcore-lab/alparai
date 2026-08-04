"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { saveOnboardingData } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "@/i18n/routing";

import { toast } from "sonner";
import {
  Shield,
  Award,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  BrainCircuit,
  HeartHandshake,
} from "lucide-react";

interface OnboardingWizardProps {
  locale: string;
}

export function OnboardingWizard({ locale }: OnboardingWizardProps) {
  const t = useTranslations("onboarding");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const claim = searchParams.get("claim") || "";
  const roleParam = searchParams.get("role") || "";

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string>(
    roleParam === "provider" ? "provider" : "",
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    {
      id: "advocate",
      title: t("advocateTitle"),
      desc: t("advocateDesc"),
      icon: Shield,
      color: "text-brand-400 bg-brand-500/10 border-brand-500/20",
    },
    {
      id: "provider",
      title: t("providerTitle"),
      desc: t("providerDesc"),
      icon: BrainCircuit,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      id: "advisor",
      title: t("advisorTitle"),
      desc: t("advisorDesc"),
      icon: HeartHandshake,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      id: "researcher",
      title: t("researcherTitle"),
      desc: t("researcherDesc"),
      icon: BookOpen,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
  ];

  const interests = [
    { id: "safety", label: t("safety") },
    { id: "transparency", label: t("transparency") },
    { id: "privacy", label: t("privacy") },
    { id: "bias", label: t("bias") },
    { id: "hallucinations", label: t("hallucinations") },
  ];

  const handleInterestToggle = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleNext = () => {
    if (step === 1 && !selectedRole) {
      toast.error(t("roleTitle"));
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await saveOnboardingData(selectedRole, selectedInterests);
      if (res.ok) {
        setStep(3);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(res.error || "An error occurred");
      }
    } catch {
      toast.error("Failed to complete onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const slideVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <Card className="border-border-subtle bg-bg-secondary/40 relative overflow-hidden backdrop-blur-md">
      {/* Background radial gradient glow */}
      <div className="bg-brand-500/10 pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]" />

      {step < 3 && (
        <CardHeader className="space-y-4">
          {/* Progress Indicators */}
          <div className="text-fg-muted flex items-center justify-between font-mono text-xs">
            <span>
              {tAuth("step", { defaultValue: "STEP" })} {step}{" "}
              {tAuth("of_2", { defaultValue: "OF 2" })}
            </span>
            <div className="flex gap-1.5">
              <span
                className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 1 ? "bg-brand-500" : "bg-bg-tertiary"}`}
              />
              <span
                className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 2 ? "bg-brand-500" : "bg-bg-tertiary"}`}
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-black tracking-tight">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
      )}

      <CardContent className="relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h3 className="text-fg-primary mb-1 text-base font-bold">{t("roleTitle")}</h3>
                <p className="text-fg-muted text-xs">{t("roleDesc")}</p>
              </div>

              {claim && (
                <div className="bg-brand-500/10 border-brand-500/20 text-brand-400 flex items-center gap-3 rounded-xl border p-4 text-xs font-semibold">
                  <Shield className="text-brand-400 h-5 w-5 shrink-0" />
                  <div>
                    <span className="mb-0.5 block font-bold">
                      {locale === "tr" ? "Profil Talebi Aktif" : "Profile Claim Active"}
                    </span>
                    <span className="text-fg-secondary">
                      {locale === "tr"
                        ? `${claim.toUpperCase()} profilini sahiplenmek üzeresiniz. Lütfen devam etmek için "Yapay Zeka Sağlayıcısı" rolünü seçin.`
                        : `You are claiming the profile for ${claim.toUpperCase()}. Please select the "AI Provider" role to proceed.`}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRole(r.id)}
                      className={`group flex items-start gap-4 rounded-xl border p-5 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-brand-500 bg-brand-500/5 shadow-brand-500/5 shadow-lg"
                          : "border-border-subtle bg-bg-tertiary/20 hover:border-border-strong hover:bg-bg-tertiary/40"
                      }`}
                    >
                      <div
                        className={`shrink-0 rounded-lg border p-3 ${r.color} transition duration-300 group-hover:scale-105`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-fg-primary block text-sm font-bold">{r.title}</span>
                        <span className="text-fg-muted block text-[11px] leading-relaxed">
                          {r.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleNext} disabled={!selectedRole} className="group px-6">
                  {t("next")}{" "}
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h3 className="text-fg-primary mb-1 text-base font-bold">{t("interestsTitle")}</h3>
                <p className="text-fg-muted text-xs">{t("interestsDesc")}</p>
              </div>

              <div className="flex flex-col gap-2.5">
                {interests.map((i) => {
                  const isSelected = selectedInterests.includes(i.id);
                  return (
                    <button
                      key={i.id}
                      onClick={() => handleInterestToggle(i.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-brand-500 bg-brand-500/5"
                          : "border-border-subtle bg-bg-tertiary/20 hover:border-border-strong hover:bg-bg-tertiary/40"
                      }`}
                    >
                      <span className="text-fg-primary text-sm font-medium">{i.label}</span>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                          isSelected
                            ? "border-brand-500 bg-brand-500"
                            : "border-border-strong bg-transparent"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-4 w-4 font-bold text-black" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button variant="ghost" onClick={handleBack}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> {t("back")}
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="px-6 font-bold">
                  {isSubmitting ? "Saving..." : t("submit")}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center space-y-6 py-8 text-center"
            >
              <div className="bg-success-500/10 border-success-500/20 text-success-500 rounded-full border p-4">
                <CheckCircle2 className="h-12 w-12" />
              </div>

              <div className="max-w-md space-y-2">
                <h2 className="text-fg-primary text-2xl font-black tracking-tight">
                  {t("successTitle")}
                </h2>
                <p className="text-fg-muted text-sm leading-relaxed">{t("successDesc")}</p>
              </div>

              {/* Founder Reporter Badge Showcase Card */}
              <div className="group relative w-full max-w-sm overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 shadow-2xl">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:14px_14px]" />
                <div className="relative z-10 flex flex-col items-center space-y-3">
                  <div className="rounded-full border border-amber-500/30 bg-amber-500/20 p-3.5 text-amber-500 shadow-xl transition-transform duration-300 group-hover:scale-105">
                    <Award className="h-8 w-8" />
                  </div>
                  <div>
                    <span className="mb-1 block font-mono text-xs font-bold tracking-[0.2em] text-amber-400 uppercase">
                      {tAuth("unlockedBadge", { defaultValue: "UNLOCKED BADGE" })}
                    </span>
                    <span className="text-fg-primary block text-lg font-black">
                      {tAuth("foundingReporter", { defaultValue: "Founding Reporter" })}
                    </span>
                  </div>
                  <p className="text-fg-muted text-[11px] leading-relaxed">
                    {tAuth("badgeDesc", {
                      defaultValue:
                        "Exclusive early-adopter verification badge awarded to our first 100 beta participants.",
                    })}
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => router.push(`/${locale}/profile`)}
                  className="px-8 font-bold"
                >
                  {t("successCta")}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="border-border-subtle/50 text-fg-muted mt-6 border-t pt-4 text-center text-xs">
          {locale === "tr"
            ? "İçerik barındırma ve sağlayıcı ilişkilerimiz "
            : "Our content hosting and provider relationships follow our "}
          <Link href="/legal/neutrality" className="text-brand-400 font-medium hover:underline">
            {locale === "tr" ? "Tarafsızlık Şartı'na tabidir." : "Neutrality Charter."}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
