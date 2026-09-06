import { type EventBus } from "./event-bus";
import { spawn } from "child_process";
import path from "path";

export class KahinOracle {
  private scriptPath: string;

  constructor(_eventBus: EventBus) {
    this.scriptPath = path.resolve(process.cwd(), "kahin_cdp_bridge.js");
  }

  // Ajanların Kahin'e (NotebookLM) soru sorması
  async askKahin(agentRole: string, question: string): Promise<string> {
    return new Promise((resolve, reject) => {
      console.info(`[Wolf Pack Oracle] ${agentRole} Kahin'e danışıyor: ${question}`);

      const child = spawn("node", [this.scriptPath, "ask", question]);

      let stdoutData = "";
      let stderrData = "";

      child.stdout.on("data", (data) => (stdoutData += data));
      child.stderr.on("data", (data) => (stderrData += data));

      child.on("close", (code) => {
        if (code !== 0) {
          console.error(`[Wolf Pack Oracle] Hata (Kod ${code}): ${stderrData}`);
          return reject(new Error(stderrData || "Bilinmeyen Hata"));
        }
        if (stderrData) {
          console.warn(`[Wolf Pack Oracle] Uyarı: ${stderrData}`);
        }
        resolve(stdoutData.trim());
      });
    });
  }

  // Kod tabanının Kahin'e senkronize edilmesi
  async syncCodebaseToKahin(codebaseSummary: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.info(`[Wolf Pack Oracle] Kod tabanı Kahin'e (NotebookLM) senkronize ediliyor...`);

      const child = spawn("node", [this.scriptPath, "sync", codebaseSummary]);

      let stderrData = "";
      child.stderr.on("data", (data) => (stderrData += data));

      child.on("close", (code) => {
        if (code !== 0) {
          console.error(`[Wolf Pack Oracle] Hata (Kod ${code}): ${stderrData}`);
          return reject(new Error(stderrData || "Bilinmeyen Hata"));
        }
        resolve();
      });
    });
  }
}
