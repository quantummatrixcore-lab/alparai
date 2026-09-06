import "server-only";
import { BaseAdapter, type DomSelectors } from "./base-adapter";

export class ClaudeAdapter extends BaseAdapter {
  constructor() {
    const selectors: DomSelectors = {
      // Claude spesifik DOM yapısı (contenteditable div)
      inputArea: 'div[contenteditable="true"]',
      submitButton: 'button[aria-label="Send Message"]',
      responseContainer: "div.font-claude-message",
    };
    // Claude Trust Weight: 0.95 (Sürünün Baş Mimarı)
    super("Claude", 0.95, "claude.ai", selectors);
  }
}
