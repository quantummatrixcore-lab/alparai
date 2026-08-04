const API_BASE = "https://alparai.com";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const FETCH_TIMEOUT_MS = 3000; // 3 seconds timeout

const debounceTimers = new Map();

function debouncedCheckDomain(tab, delay = 300) {
  if (!tab?.id || !tab?.url) return;
  if (debounceTimers.has(tab.id)) {
    clearTimeout(debounceTimers.get(tab.id));
  }
  const timer = setTimeout(() => {
    debounceTimers.delete(tab.id);
    checkDomain(tab);
  }, delay);
  debounceTimers.set(tab.id, timer);
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) debouncedCheckDomain(tab);
  } catch {
    // tab may not be ready
  }
});

chrome.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    debouncedCheckDomain(tab);
  }
});

async function checkDomain(tab) {
  let url;
  try {
    url = new URL(tab.url);
  } catch {
    return;
  }
  const domain = url.hostname;

  // Skip alparai.com itself
  if (domain.includes("alparai.com")) {
    await updateBadge(tab.id, 0);
    return;
  }

  const cacheKey = `cache:${domain}`;
  try {
    const cached = await chrome.storage.local.get(cacheKey);
    if (cached[cacheKey] && Date.now() - cached[cacheKey].ts < CACHE_TTL_MS) {
      updateBadge(tab.id, cached[cacheKey].count);
      return;
    }
  } catch {
    // Storage read error fallback to fetch
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(
      `${API_BASE}/api/v1/incidents?domain=${encodeURIComponent(domain)}&limit=100`,
      { signal: controller.signal },
    );
    clearTimeout(timeoutId);

    if (!res.ok) return;
    const data = await res.json();
    const count = data.meta?.count ?? data.data?.length ?? 0;

    try {
      await chrome.storage.local.set({ [cacheKey]: { count, ts: Date.now() } });
    } catch {
      // Storage write error non-critical
    }
    updateBadge(tab.id, count);
  } catch {
    clearTimeout(timeoutId);
    // network error or timeout — leave badge empty
  }
}

function updateBadge(tabId, count) {
  try {
    if (count > 0) {
      chrome.action.setBadgeText({ text: count > 99 ? "99+" : String(count), tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#00FF88" }, tabId);
    } else {
      chrome.action.setBadgeText({ text: "", tabId });
    }
  } catch {
    // Tab closed before badge update
  }
}
