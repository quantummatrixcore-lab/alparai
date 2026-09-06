import "server-only";

export interface DomSelectors {
  inputArea: string;
  submitButton: string;
  responseContainer: string;
}

export interface ModelAdapter {
  providerName: string;
  trustWeight: number;
  urlMatch: string;
  selectors: DomSelectors;
  getInjectionScript(prompt: string): string;
  getExtractionScript(): string;
}

export abstract class BaseAdapter implements ModelAdapter {
  providerName: string;
  trustWeight: number;
  urlMatch: string;
  selectors: DomSelectors;

  constructor(name: string, weight: number, match: string, selectors: DomSelectors) {
    this.providerName = name;
    this.trustWeight = weight;
    this.urlMatch = match;
    this.selectors = selectors;
  }

  // Varsayılan enjeksiyon (Fallback planı)
  getInjectionScript(prompt: string): string {
    return `(async () => {
      return new Promise((resolve) => {
        const input = document.querySelector("${this.selectors.inputArea}");
        if (!input) return resolve("HATA: Input bulunamadı.");
        
        // React/Vue Synthetic Event Bypass
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set || 
                             Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                             
        if (nativeSetter) {
            nativeSetter.call(input, ${JSON.stringify(prompt)});
            input.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (input.isContentEditable) {
            input.innerText = ${JSON.stringify(prompt)};
            input.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            input.value = ${JSON.stringify(prompt)};
        }

        setTimeout(() => {
          const btn = document.querySelector("${this.selectors.submitButton}");
          if (btn && !btn.disabled) {
              btn.click();
              resolve("BASARILI_CLICK");
          } else {
              const enterEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, keyCode: 13, key: 'Enter', code: 'Enter' });
              input.dispatchEvent(enterEvent);
              resolve("BASARILI_ENTER");
          }
        }, 500);
      });
    })();`;
  }

  getExtractionScript(): string {
    return `document.querySelector("${this.selectors.responseContainer}")?.innerText || document.body.innerText;`;
  }
}
