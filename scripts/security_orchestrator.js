const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("[Security Orchestrator] Deterministik Güvenlik Taraması Başlatılıyor...");

const runCommand = (command) => {
  return new Promise((resolve) => {
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      // npm audit returns non-zero if vulnerabilities are found, we don't care about the exit code, just the JSON output.
      resolve(stdout || stderr);
    });
  });
};

async function runSecurityScans() {
  const findings = {
    timestamp: new Date().toISOString(),
    scans: {
      dependencyAudit: null,
      sastSimulation: null,
    },
  };

  console.log("-> 1. SCA (Software Composition Analysis) çalıştırılıyor (npm audit)...");
  try {
    const auditResult = await runCommand("npm audit --json");
    findings.scans.dependencyAudit = JSON.parse(auditResult);
  } catch (e) {
    findings.scans.dependencyAudit = {
      error: "Failed to parse npm audit JSON",
      raw: "audit failed",
    };
  }

  console.log("-> 2. SAST (Semgrep) kancası tetikleniyor...");
  // SAST simulation or integration hook for Semgrep/CodeQL
  findings.scans.sastSimulation = {
    status: "success",
    tool: "Simulated SAST Engine (Placeholder for Semgrep)",
    vulnerabilities: [
      {
        type: "Hardcoded Secret",
        file: "config.js",
        severity: "HIGH",
        description: "Possible API key leak.",
      },
    ],
  };

  const findingsPath = path.join(__dirname, "findings.json");
  fs.writeFileSync(findingsPath, JSON.stringify(findings, null, 2));

  console.log(
    `[Security Orchestrator] Tarama tamamlandı. Tüm bulgular (Findings Bus) şuraya yazıldı: ${findingsPath}`,
  );
  console.log(
    "[Security Orchestrator] AI Analisti (Security Analyst) şimdi bu dosyayı okuyup yorumlayabilir.",
  );
}

runSecurityScans();
