# ALPAR AI - AI Multi-Model Analysis Integration Guide

## 1. ARCHITECTURAL OVERVIEW

AlparAI is an independent rating infrastructure that audits the behavior of AI providers and models (an "AI Moody's"). This integration guide explains how the platform's multi-model AI analyses are collected, consolidated, and integrated into the cross-audit (debate) engine.

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ GPT-4o / 5.5    │      │ Claude Sonnet   │      │   Gemini Pro    │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         └───────────────┬────────┴────────────────────────┘
                         ▼
             ┌──────────────────────┐
             │  Triage / Round 1    │
             └──────────┬───────────┘
                        │
                        ▼
             ┌──────────────────────┐
             │ Cross-Audit / R2-R3  │
             └──────────┬───────────┘
                        │
                        ▼
             ┌──────────────────────┐
             │ Supreme Court Judge  │
             └──────────┬───────────┘
                        │
                        ▼
             ┌──────────────────────┐
             │  TruthScore Update   │
             └──────────────────────┘
```

---

## 2. CROSS-AUDIT (DEBATE) FLOW

The independent analyses of AI models are not limited to one-way scoring. The system runs a 4-phase debate protocol that forces models to mutually defend their arguments:

1. **Independent Evaluation (Turn 1 - Independent Triage):** Each model analyzes the incident according to its own criteria and assigns an initial trust/accuracy score.
2. **Challenge (Turn 2 - Critique/Challenge):** Models examine each other's analyses and ask critical questions to expose hallucinations, biases, or logical errors.
3. **Defense (Turn 3 - Rebuttal/Defense):** Models respond to the critiques directed at them. They either defend their scores or accept errors and update their scores accordingly.
4. **Final Decision (Turn 4 - Supreme Court Adjudication):** The Head Judge model (Claude 3.5 Sonnet / Gemini Pro) synthesizes the entire transcript and calculates the final `TruthScore`.

---

## 3. TRANSPARENCY ULTIMATUM

In accordance with AlparAI rating principles:

- If an AI provider (OpenAI, Google, Meta, Microsoft, Anthropic, xAI) rate-limits, blocks, or slows down requests from the AlparAI audit engine, all models of that provider are automatically downgraded to the lowest rating (F rating) in the **Transparency & Reliability** category.
- A prominent warning label **"TRANSPARENCY WARNING: Provider restricts independent audits"** is displayed on the provider's profile page in the UI.

---

## 4. DYNAMIC SOURCING

Evaluation prompts used in the audit engine are not populated from static benchmark datasets. Instead, they are dynamically derived from **live mutations of real-world failures** reported, verified, and masked by users. This prevents AI companies from manipulating audits with pre-trained data.
