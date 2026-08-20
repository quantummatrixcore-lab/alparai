import WebSocket from "ws";

export interface CDPConnection {
  ws: WebSocket;
  close: () => void;
}

export async function connectToCDP(
  cdpUrl: string,
  logger: (msg: string) => void = console.warn,
): Promise<CDPConnection | null> {
  try {
    const urlObj = new URL(cdpUrl);
    if (urlObj.port) {
      const portNum = Number(urlObj.port);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        logger(`[CDP] Invalid port ${urlObj.port}.`);
        return null;
      }
    }
  } catch {
    logger(`[CDP] Invalid CDP URL ${cdpUrl}.`);
    return null;
  }

  let res;
  try {
    res = await fetch(`${cdpUrl}/json/list`);
  } catch (err) {
    logger(`[CDP] Connection failed: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }

  if (!res.ok) {
    logger(`[CDP] Chrome CDP endpoint unreachable (status ${res.status}).`);
    return null;
  }

  const tabs = (await res.json()) as Array<{ type: string; webSocketDebuggerUrl: string }>;
  const activeTab = tabs.find((t) => t.type === "page" && t.webSocketDebuggerUrl);

  if (!activeTab) {
    logger("[CDP] No active browser page found.");
    return null;
  }

  const ws = new WebSocket(activeTab.webSocketDebuggerUrl);
  await new Promise<void>((resolve, reject) => {
    ws.on("open", resolve);
    ws.on("error", reject);
  });

  return {
    ws,
    close: () => ws.close(),
  };
}
