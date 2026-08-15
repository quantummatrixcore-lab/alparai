import { EventBus } from './event-bus';
import { exec } from 'child_process';
import path from 'path';

export class KahinOracle {
  private eventBus: EventBus;
  private scriptPath: string;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.scriptPath = path.resolve(process.cwd(), 'kahin_cdp_bridge.js');
  }

  // Ajanların Kahin'e (NotebookLM) soru sorması
  async askKahin(agentRole: string, question: string): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(`[Wolf Pack Oracle] ${agentRole} Kahin'e danışıyor: ${question}`);
      
      const cmd = `node ${this.scriptPath} ask "${question}"`;
      
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`[Wolf Pack Oracle] Hata: ${error.message}`);
          return reject(error);
        }
        if (stderr) {
          console.warn(`[Wolf Pack Oracle] Uyarı: ${stderr}`);
        }
        resolve(stdout.trim());
      });
    });
  }

  // Kod tabanının Kahin'e senkronize edilmesi
  async syncCodebaseToKahin(codebaseSummary: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`[Wolf Pack Oracle] Kod tabanı Kahin'e (NotebookLM) senkronize ediliyor...`);
      
      const cmd = `node ${this.scriptPath} sync "${codebaseSummary.replace(/"/g, '\\"')}"`;
      
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`[Wolf Pack Oracle] Hata: ${error.message}`);
          return reject(error);
        }
        resolve();
      });
    });
  }
}
