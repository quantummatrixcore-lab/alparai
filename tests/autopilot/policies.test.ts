import { describe, it, expect } from "vitest";
import {
  submitIncidentPolicy,
  submitContactPolicy,
  submitTakedownPolicy,
  voteIncidentPolicy,
  moderateIncidentPolicy,
  submitSuggestionPolicy,
  reviewTakedownPolicy,
  exportDataPolicy,
  submitModelReviewPolicy,
  submitModelFeatureRequestPolicy,
  syncNewsPolicy,
  autoModerateIncidentPolicy,
  subscribeNewsletterPolicy,
  weeklyReportPolicy,
  weeklyPollPolicy,
  submitWhistleblowerPolicy,
  submitInvestorPolicy,
  policies,
  isAutopilotPolicyName,
  getPolicy,
  policyNames,
  buildConfig,
} from "@/lib/autopilot/policies";

describe("autopilot policies", () => {
  it("exposes 17 named policies", () => {
    expect(policyNames().length).toBe(17);
  });

  it("each policy has a unique action", () => {
    const actions = policyNames().map((n) => policies[n].config.action);
    expect(new Set(actions).size).toBe(actions.length);
  });

  it("submitIncidentPolicy uses silent_log exhaustion", () => {
    expect(submitIncidentPolicy.config.onExhaust).toBe("silent_log");
  });

  it("submitTakedownPolicy escalates via email_fallback", () => {
    expect(submitTakedownPolicy.config.onExhaust).toBe("email_fallback");
  });

  it("moderateIncidentPolicy escalates to admin", () => {
    expect(moderateIncidentPolicy.config.onExhaust).toBe("escalate_admin");
  });

  it("voteIncidentPolicy has small budget", () => {
    expect(voteIncidentPolicy.config.budget.maxMs).toBeLessThan(5_000);
  });

  it("submitSuggestionPolicy uses toast_warn with api_key redaction", () => {
    expect(submitSuggestionPolicy.config.action).toBe("submitSuggestion");
    expect(submitSuggestionPolicy.config.onExhaust).toBe("toast_warn");
    expect(submitSuggestionPolicy.config.redactionFields).toContain("api_key");
  });

  it("reviewTakedownPolicy escalates to admin", () => {
    expect(reviewTakedownPolicy.config.action).toBe("reviewTakedown");
    expect(reviewTakedownPolicy.config.onExhaust).toBe("escalate_admin");
  });

  it("exportDataPolicy has quiet silent_log exhaustion with safe redaction", () => {
    expect(exportDataPolicy.config.action).toBe("exportUserData");
    expect(exportDataPolicy.config.onExhaust).toBe("silent_log");
    expect(exportDataPolicy.config.redactionFields).toContain("api_key");
    expect(exportDataPolicy.config.redactionFields).toContain("private_key");
  });

  it("isAutopilotPolicyName accepts known and rejects unknown", () => {
    expect(isAutopilotPolicyName("submitIncident")).toBe(true);
    expect(isAutopilotPolicyName("exportUserData")).toBe(true);
    expect(isAutopilotPolicyName("nope")).toBe(false);
  });

  it("getPolicy returns the policy", () => {
    expect(getPolicy("submitContact").config.action).toBe("submitContact");
    expect(submitContactPolicy.config.onExhaust).toBe("toast_warn");
  });

  it("buildConfig merges overrides", () => {
    const merged = buildConfig(submitIncidentPolicy.config, { onExhaust: "throw" });
    expect(merged.onExhaust).toBe("throw");
    expect(merged.retry.attempts).toBe(submitIncidentPolicy.config.retry.attempts);
  });

  it("submitModelReviewPolicy has standard retry config", () => {
    expect(submitModelReviewPolicy.config.action).toBe("submitModelReview");
    expect(submitModelReviewPolicy.config.onExhaust).toBe("toast_warn");
  });

  it("submitModelFeatureRequestPolicy has standard retry config", () => {
    expect(submitModelFeatureRequestPolicy.config.action).toBe("submitModelFeatureRequest");
    expect(submitModelFeatureRequestPolicy.config.onExhaust).toBe("toast_warn");
  });

  it("syncNewsPolicy has standard config", () => {
    expect(syncNewsPolicy.config.action).toBe("syncNews");
    expect(syncNewsPolicy.config.onExhaust).toBe("silent_log");
  });

  it("autoModerateIncidentPolicy has standard config", () => {
    expect(autoModerateIncidentPolicy.config.action).toBe("autoModerateIncident");
    expect(autoModerateIncidentPolicy.config.onExhaust).toBe("silent_log");
  });

  it("subscribeNewsletterPolicy has standard config", () => {
    expect(subscribeNewsletterPolicy.config.action).toBe("subscribeNewsletter");
    expect(subscribeNewsletterPolicy.config.onExhaust).toBe("toast_warn");
  });

  it("weeklyReportPolicy has standard config", () => {
    expect(weeklyReportPolicy.config.action).toBe("weeklyReport");
    expect(weeklyReportPolicy.config.onExhaust).toBe("silent_log");
  });

  it("weeklyPollPolicy has standard config", () => {
    expect(weeklyPollPolicy.config.action).toBe("weeklyPoll");
    expect(weeklyPollPolicy.config.onExhaust).toBe("silent_log");
  });

  it("submitWhistleblowerPolicy has standard config", () => {
    expect(submitWhistleblowerPolicy.config.action).toBe("submitWhistleblower");
    expect(submitWhistleblowerPolicy.config.onExhaust).toBe("toast_warn");
  });

  it("submitInvestorPolicy has standard config", () => {
    expect(submitInvestorPolicy.config.action).toBe("submitInvestor");
    expect(submitInvestorPolicy.config.onExhaust).toBe("toast_warn");
  });
});
