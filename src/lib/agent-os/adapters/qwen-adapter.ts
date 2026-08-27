import "server-only";
import { BaseAdapter, type DomSelectors } from "./base-adapter";

export class QwenAdapter extends BaseAdapter {
  constructor() {
    const selectors: DomSelectors = {
      // Qwen chat arayüzündeki olası spesifik seçiciler
      inputArea: 'textarea[placeholder*="Qwen"], div[contenteditable="true"]',
      submitButton: 'button[aria-label="Send"], button.send-btn, svg path[d*="M1"]', // SVG veya buton
      responseContainer: "div.message-content, div.markdown-body",
    };
    // Qwen Trust Weight: 0.85
    super("Qwen", 0.85, "chat.qwen.ai", selectors);
  }
}
