import type { Metadata } from "next";
import { GaziChat } from "./gazi-chat";

export const metadata: Metadata = {
  title: "GAZİ — Dijital İkiz | Admin",
  robots: "noindex",
};

export default function GaziPage() {
  return <GaziChat />;
}
