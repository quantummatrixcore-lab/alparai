const API_BASE = "https://alparai.com";
const FETCH_TIMEOUT_MS = 3000;
const popupCache = new Map();

function hideLoading() {
  const el = document.getElementById("loadingMsg");
  if (el) el.style.display = "none";
}

function showEmpty(msg) {
  hideLoading();
  const el = document.getElementById("emptyMsg");
  if (el) {
    el.style.display = "block";
    if (msg) el.textContent = msg;
  }
}

function displayResults(count, domain) {
  hideLoading();
  if (count > 0) {
    const badge = document.getElementById("countBadge");
    const num = document.getElementById("countNum");
    const viewBtn = document.getElementById("viewBtn");

    if (badge) badge.style.display = "flex";
    if (num) num.textContent = count;
    if (viewBtn) {
      viewBtn.style.display = "block";
      viewBtn.href = `${API_BASE}/en/incidents?q=${encodeURIComponent(domain)}`;
    }
  } else {
    showEmpty();
  }
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;

  let url;
  try {
    url = new URL(tab.url);
  } catch {
    return;
  }

  const domain = url.hostname;
  const domainEl = document.getElementById("domain");
  if (domainEl) domainEl.textContent = domain;

  if (domain.includes("alparai.com")) {
    showEmpty("You're on ALPAR AI.");
    return;
  }

  if (popupCache.has(domain)) {
    const cachedCount = popupCache.get(domain);
    displayResults(cachedCount, domain);
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(
      `${API_BASE}/api/v1/incidents?domain=${encodeURIComponent(domain)}&limit=100`,
      { signal: controller.signal },
    );
    clearTimeout(timeoutId);

    const data = await res.json();
    const count = data.meta?.count ?? data.data?.length ?? 0;

    popupCache.set(domain, count);
    displayResults(count, domain);
  } catch {
    clearTimeout(timeoutId);
    showEmpty("Could not reach ALPAR AI database.");
  }
}

const reportBtn = document.getElementById("reportBtn");
if (reportBtn) {
  reportBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabUrl = tabs[0]?.url || "";
      window.open(`${API_BASE}/en/submit?source=extension&ref=${encodeURIComponent(tabUrl)}`);
    });
  });
}

init();
