import type { MetadataRoute } from "next";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ALPAR AI Mission Control",
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: "/admin",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#0A1622",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      { src: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    categories: ["news", "social", "productivity"],
  };
}
