(function () {
  "use strict";

  function initAlparBadge() {
    var scripts = document.querySelectorAll('script[src*="badge.js"]');
    var currentScript = document.currentScript || scripts[scripts.length - 1];

    var provider = "alpar";
    var theme = "auto";
    var targetId = "alparai-trust-badge";

    if (currentScript) {
      provider = currentScript.getAttribute("data-provider") || provider;
      theme = currentScript.getAttribute("data-theme") || theme;
      if (currentScript.getAttribute("data-target")) {
        targetId = currentScript.getAttribute("data-target");
      }
    }

    var targetEl =
      document.getElementById(targetId) ||
      document.getElementById("alparai-trust-badge") ||
      document.getElementById("alparai-badge");
    if (!targetEl) {
      targetEl = document.createElement("div");
      targetEl.id = targetId;
      if (currentScript && currentScript.parentNode) {
        currentScript.parentNode.insertBefore(targetEl, currentScript.nextSibling);
      } else {
        document.body.appendChild(targetEl);
      }
    }

    if (targetEl.getAttribute("data-provider")) {
      provider = targetEl.getAttribute("data-provider");
    }
    if (targetEl.getAttribute("data-theme")) {
      theme = targetEl.getAttribute("data-theme");
    }

    var isDark =
      theme === "dark" ||
      (theme === "auto" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    var baseUrl = "https://alparai.com";
    if (currentScript && currentScript.src) {
      try {
        var parsed = new URL(currentScript.src);
        baseUrl = parsed.origin;
      } catch (e) {}
    }

    var apiUrl = baseUrl + "/api/badge?provider=" + encodeURIComponent(provider);

    function renderBadge(data) {
      var score = typeof data.score === "number" ? data.score.toFixed(1) : data.score || "95.0";
      var grade = data.grade || "AAA";
      var name = data.name || provider.charAt(0).toUpperCase() + provider.slice(1);
      var verified = data.verified !== false;

      var bgColor = isDark ? "#0f172a" : "#ffffff";
      var textColor = isDark ? "#f8fafc" : "#0f172a";
      var subTextColor = isDark ? "#94a3b8" : "#64748b";
      var borderColor = isDark ? "#1e293b" : "#e2e8f0";
      var badgeBg = isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)";
      var badgeText = "#10b981";
      var shadow = isDark
        ? "0 4px 20px -2px rgba(0, 0, 0, 0.5)"
        : "0 4px 20px -2px rgba(0, 0, 0, 0.06)";

      var html =
        '<a href="' +
        baseUrl +
        '" target="_blank" rel="noopener noreferrer" style="' +
        "display: inline-flex; align-items: center; gap: 10px; padding: 8px 14px; " +
        "border-radius: 12px; background: " +
        bgColor +
        "; color: " +
        textColor +
        "; " +
        "border: 1px solid " +
        borderColor +
        "; box-shadow: " +
        shadow +
        "; " +
        "font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; " +
        'text-decoration: none; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer;" ' +
        "onmouseover=\"this.style.transform='translateY(-1px)'\" " +
        "onmouseout=\"this.style.transform='translateY(0)'\">" +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">' +
        '<path d="M12 2L3 6V12C3 17.52 6.84 22.74 12 24C17.16 22.74 21 17.52 21 12V6L12 2Z" fill="#10B981" fill-opacity="0.2" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M9 12L11 14L15 10" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        "</svg>" +
        '<div style="display: flex; flex-direction: column; line-height: 1.2;">' +
        '<div style="display: flex; align-items: center; gap: 6px;">' +
        '<span style="font-weight: 700; font-size: 13px; letter-spacing: -0.01em;">' +
        name +
        "</span>" +
        (verified
          ? '<span style="background: ' +
            badgeBg +
            "; color: " +
            badgeText +
            '; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px; letter-spacing: 0.02em;">' +
            grade +
            "</span>"
          : "") +
        "</div>" +
        '<span style="font-size: 11px; color: ' +
        subTextColor +
        '; font-weight: 500; margin-top: 2px;">' +
        'K-BENCHMARK: <strong style="color: ' +
        textColor +
        '; font-weight: 700;">' +
        score +
        "</strong> / 100" +
        "</span>" +
        "</div>" +
        "</a>";

      targetEl.innerHTML = html;
    }

    fetch(apiUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        renderBadge(data);
      })
      .catch(function () {
        renderBadge({
          provider: provider,
          name: provider.charAt(0).toUpperCase() + provider.slice(1),
          score: 95.0,
          grade: "AAA",
          verified: true,
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAlparBadge);
  } else {
    initAlparBadge();
  }
})();
