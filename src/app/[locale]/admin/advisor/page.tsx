import type { Metadata } from "next";
import { AdvisorChat } from "./advisor-chat";

export const metadata: Metadata = {
  title: "GAZ─░ ÔÇö Dijital ─░kiz | Admin",
  robots: "noindex",
};

export default function GaziPage() {
  return <AdvisorChat />;
}
