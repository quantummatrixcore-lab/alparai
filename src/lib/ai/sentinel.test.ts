import { describe, it, expect } from "vitest";
import { scanContent, luhnCheck, shannonEntropy, detectEncodeBypass, Sentinel } from "./sentinel";

describe("Sentinel Scanner", () => {
  describe("luhnCheck", () => {
    it("should validate correct credit card numbers", () => {
      expect(luhnCheck("4111111111111111")).toBe(true);
      expect(luhnCheck("5500000000000004")).toBe(true);
    });

    it("should reject invalid credit card numbers", () => {
      expect(luhnCheck("1234567890123456")).toBe(false);
    });
  });

  describe("shannonEntropy", () => {
    it("should return 0 for empty string", () => {
      expect(shannonEntropy("")).toBe(0);
    });

    it("should return high entropy for random strings", () => {
      expect(shannonEntropy("a1b2c3d4e5f6g7h8i9j0")).toBeGreaterThan(3);
    });

    it("should return low entropy for repeated chars", () => {
      expect(shannonEntropy("aaaaaaaaaa")).toBeLessThan(2);
    });
  });

  describe("detectEncodeBypass", () => {
    it("should detect base64 encoding", () => {
      const encoded = Buffer.from("secret=my-api-key-12345").toString("base64");
      const results = detectEncodeBypass(encoded);
      expect(results).toContain("base64");
    });

    it("should detect hex encoding", () => {
      const encoded = Buffer.from("secretKey").toString("hex");
      const results = detectEncodeBypass(encoded);
      expect(results).toContain("hex");
    });

    it("should not detect normal text", () => {
      const results = detectEncodeBypass("hello world");
      expect(results).toHaveLength(0);
    });
  });

  describe("scanContent", () => {
    it("should detect AWS access keys", () => {
      const result = scanContent("const key = 'AKIAIOSFODNN7EXAMPLE';");
      expect(result.threats.some((t) => t.type === "aws_key")).toBe(true);
      expect(result.score).toBeLessThan(100);
    });

    it("should detect JWT tokens", () => {
      const result = scanContent(
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNqPZNoaPTR",
      );
      expect(result.threats.some((t) => t.type === "jwt_token")).toBe(true);
    });

    it("should detect private keys", () => {
      const result = scanContent("-----BEGIN RSA PRIVATE KEY-----\nABCDEF");
      expect(result.threats.some((t) => t.type === "private_key")).toBe(true);
      expect(result.passed).toBe(false);
    });

    it("should pass clean content", () => {
      const result = scanContent("const greeting = 'hello world';");
      expect(result.passed).toBe(true);
      expect(result.score).toBe(100);
    });

    it("should detect database URLs", () => {
      const result = scanContent("postgres://user:password@localhost:5432/db");
      expect(result.threats.some((t) => t.type === "database_url")).toBe(true);
    });

    it("should detect API keys", () => {
      const result = scanContent("const apiKey = 'sk-1234567890abcdefghijklmnopqrstuvwxyz';");
      expect(result.threats.some((t) => t.type === "api_key")).toBe(true);
    });
  });

  describe("Sentinel class", () => {
    it("should provide quickCheck API", () => {
      const sentinel = new Sentinel();
      const result = sentinel.quickCheck("hello world");
      expect(result.safe).toBe(true);
    });

    it("should detect threats via quickCheck", () => {
      const sentinel = new Sentinel();
      const result = sentinel.quickCheck("AKIAIOSFODNN7EXAMPLE");
      expect(result.safe).toBe(false);
      expect(result.threats).toContain("aws_key");
    });

    it("should generate HTML report", () => {
      const sentinel = new Sentinel();
      const result = sentinel.scanFile("const key = 'AKIAIOSFODNN7EXAMPLE';", "test-file.ts");
      expect(result.htmlReport).toContain("<!DOCTYPE html");
      expect(result.htmlReport).toContain("FAILED");
      expect(result.htmlReport).toContain("AKIA");
    });
  });
});
