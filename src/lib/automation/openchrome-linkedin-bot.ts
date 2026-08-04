import WebSocket from "ws";

export interface LinkedInOutreachContact {
  readonly id: string;
  readonly fullName: string;
  readonly title: string;
  readonly profileUrl: string;
  readonly messageTemplate?: string;
  readonly status: "to_add" | "contacted" | "skipped";
}

export interface LinkedInBotResult {
  readonly processedCount: number;
  readonly navigatedCount: number;
  readonly connectedCount: number;
  readonly messageSentCount: number;
  readonly skippedCount: number;
  readonly logs: readonly string[];
}

export async function runLinkedInOutreachBot(
  contacts: readonly LinkedInOutreachContact[],
  cdpUrl = "http://127.0.0.1:9222",
): Promise<LinkedInBotResult> {
  const logs: string[] = [];
  logs.push(
    `[LinkedInBot] Starting automated outreach worker for ${contacts.length} target profiles.`,
  );

  try {
    const res = await fetch(`${cdpUrl}/json/list`).catch((err) => {
      logs.push(
        `[LinkedInBot Warning] CDP port ${cdpUrl} unavailable (${err instanceof Error ? err.message : String(err)}). Bot running in dry-run simulation mode.`,
      );
      return null;
    });

    if (!res || !res.ok) {
      if (res && !res.ok) {
        logs.push(
          `[LinkedInBot Warning] CDP port ${cdpUrl} unavailable (HTTP ${res.status}). Bot running in dry-run simulation mode.`,
        );
      }
      return {
        processedCount: contacts.length,
        navigatedCount: 0,
        connectedCount: 0,
        messageSentCount: 0,
        skippedCount: contacts.length,
        logs,
      };
    }

    const tabs = (await res.json()) as Array<{ type: string; webSocketDebuggerUrl: string }>;
    const activeTab = tabs.find((t) => t.type === "page" && t.webSocketDebuggerUrl);

    if (!activeTab) {
      logs.push("[LinkedInBot Warning] No active Chrome page tab found. Bot exiting gracefully.");
      return {
        processedCount: contacts.length,
        navigatedCount: 0,
        connectedCount: 0,
        messageSentCount: 0,
        skippedCount: contacts.length,
        logs,
      };
    }

    const ws = new WebSocket(activeTab.webSocketDebuggerUrl);
    await new Promise<void>((resolve, reject) => {
      ws.on("open", resolve);
      ws.on("error", reject);
    });

    let navigatedCount = 0;
    let connectedCount = 0;
    let messageSentCount = 0;
    let skippedCount = 0;

    for (const contact of contacts) {
      if (contact.status !== "to_add" || !contact.profileUrl) {
        skippedCount++;
        logs.push(`[LinkedInBot] Skipped ${contact.fullName} (Status: ${contact.status}).`);
        continue;
      }

      logs.push(`[LinkedInBot CDP] Navigating to ${contact.fullName} (${contact.profileUrl})...`);

      const navPromise = new Promise<boolean>((resolve) => {
        const handler = (data: WebSocket.Data) => {
          try {
            const msg = JSON.parse(data.toString());
            if (msg.id === 100) {
              ws.off("message", handler);
              resolve(Boolean(msg.result?.frameId));
            }
          } catch {
            // ignore
          }
        };
        ws.on("message", handler);
      });

      ws.send(
        JSON.stringify({
          id: 100,
          method: "Page.navigate",
          params: { url: contact.profileUrl },
        }),
      );

      const navSuccess = await navPromise;
      if (navSuccess) {
        navigatedCount++;
        await new Promise((r) => setTimeout(r, 2000));

        // Evaluate DOM for Connect button + modal confirmation dialog + verified post-send DOM signal
        const noteText =
          contact.messageTemplate ||
          `Hello ${contact.fullName}, I'd love to connect regarding ALPAR AI trust infrastructure!`;

        const connectPromise = new Promise<{ connected: boolean; messageSent: boolean }>(
          (resolve) => {
            const handler = (data: WebSocket.Data) => {
              try {
                const msg = JSON.parse(data.toString());
                if (msg.id === 101) {
                  ws.off("message", handler);
                  resolve({
                    connected: Boolean(msg.result?.result?.value?.connected),
                    messageSent: Boolean(msg.result?.result?.value?.messageSent),
                  });
                }
              } catch {
                // ignore
              }
            };
            ws.on("message", handler);
          },
        );

        ws.send(
          JSON.stringify({
            id: 101,
            method: "Runtime.evaluate",
            params: {
              expression: `
                (async () => {
                  const buttons = Array.from(document.querySelectorAll('button'));
                  const connectBtn = buttons.find(b => b.textContent?.trim().includes('Connect') || b.ariaLabel?.includes('Connect'));
                  if (!connectBtn) return { connected: false, messageSent: false, reason: 'Connect button not found' };

                  // Click initial connect button
                  connectBtn.click();
                  await new Promise(r => setTimeout(r, 800));

                  const modal = document.querySelector('div[role="dialog"], div.artdeco-modal');
                  let messageSent = false;
                  let invitationTransmitted = false;

                  if (modal) {
                    const modalButtons = Array.from(modal.querySelectorAll('button'));
                    const addNoteBtn = modalButtons.find(b => b.textContent?.trim().includes('Add a note'));
                    const sendWithoutNoteBtn = modalButtons.find(b => b.textContent?.trim().includes('Send without a note') || b.textContent?.trim() === 'Send');

                    if (addNoteBtn) {
                      addNoteBtn.click();
                      await new Promise(r => setTimeout(r, 400));
                      const textarea = modal.querySelector('textarea');
                      if (textarea) {
                        textarea.value = ${JSON.stringify(noteText)};
                        textarea.dispatchEvent(new Event('input', { bubbles: true }));
                        const sendBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Send');
                        if (sendBtn) {
                          sendBtn.click();
                          await new Promise(r => setTimeout(r, 1000));
                          // Verify post-send state: modal closed or button changed to Pending
                          const isModalClosed = !document.querySelector('div[role="dialog"], div.artdeco-modal');
                          const isPendingNow = Array.from(document.querySelectorAll('button')).some(b => b.textContent?.trim().includes('Pending'));
                          if (isModalClosed || isPendingNow) {
                            messageSent = true;
                            invitationTransmitted = true;
                          }
                        }
                      }
                    } else if (sendWithoutNoteBtn) {
                      sendWithoutNoteBtn.click();
                      await new Promise(r => setTimeout(r, 1000));
                      const isModalClosed = !document.querySelector('div[role="dialog"], div.artdeco-modal');
                      const isPendingNow = Array.from(document.querySelectorAll('button')).some(b => b.textContent?.trim().includes('Pending'));
                      if (isModalClosed || isPendingNow) {
                        invitationTransmitted = true;
                      }
                    }
                  } else {
                    // Direct connection without modal (rare direct connect)
                    const isPendingNow = Array.from(document.querySelectorAll('button')).some(b => b.textContent?.trim().includes('Pending'));
                    if (isPendingNow) {
                      invitationTransmitted = true;
                    }
                  }

                  return { connected: invitationTransmitted, messageSent };
                })()
              `,
              awaitPromise: true,
              returnByValue: true,
            },
          }),
        );

        const outcome = await connectPromise;
        if (outcome.connected) {
          connectedCount++;
          if (outcome.messageSent) {
            messageSentCount++;
            logs.push(
              `[LinkedInBot CDP] Connection request & customized note transmitted to ${contact.fullName}.`,
            );
          } else {
            logs.push(`[LinkedInBot CDP] Connection request transmitted to ${contact.fullName}.`);
          }
        } else {
          logs.push(
            `[LinkedInBot CDP] Navigated to ${contact.fullName}, Connect request pending DOM post-send verification.`,
          );
        }
      }
    }

    ws.close();

    return {
      processedCount: contacts.length,
      navigatedCount,
      connectedCount,
      messageSentCount,
      skippedCount,
      logs,
    };
  } catch (error) {
    logs.push(
      `[LinkedInBot Warning] CDP port ${cdpUrl} unavailable (${error instanceof Error ? error.message : String(error)}). Bot running in dry-run simulation mode.`,
    );
    return {
      processedCount: contacts.length,
      navigatedCount: 0,
      connectedCount: 0,
      messageSentCount: 0,
      skippedCount: contacts.length,
      logs,
    };
  }
}
