---
status: pending
author: Antigravity
date: 2026-07-16
epic: Item 91 (LinkedIn Human-in-the-loop Automation)
---

# PROPOSAL 010: Spark + Google Labs (Veo) Video Automation

## Executive Summary

This proposal outlines the architecture for integrating the **Spark background agent** with the Founder's active **Google Labs** subscription (https://labs.google/). This integration will automate the generation of high-quality videos (via Veo) and images (via Imagen 3) for Alpar AI's LinkedIn marketing pipeline, adhering to the "Human-in-the-Loop" doctrine.

## The Architectural Breakthrough (Rule #17)

Google Labs tools often lack direct, stable server-to-server APIs for public use. However, per **Global Rule #17 (WebBridge & Local Browser Automation Protocol)**, the Spark agent does not need an API key.

Spark will utilize `openchrome` (or WebBridge) to hijack a local browser context where the Founder is already authenticated into `labs.google/`.

## Workflow (The Automation Pipeline)

1. **Content Strategy Trigger (Cron/Spark):**
   Spark identifies a trend or a completed project milestone and drafts a LinkedIn post text.
2. **Video Prompt Generation:**
   Spark generates a highly descriptive video prompt tailored for Google Veo.
3. **Browser Automation (openchrome):**
   - Spark opens a hidden local tab navigated to `labs.google/`.
   - Spark uses DOM manipulation to input the prompt into the Veo video generator.
   - Spark waits for the rendering to complete and downloads the MP4 output to the local file system.
4. **Draft Queueing (Human-in-the-Loop):**
   - Spark uploads the video to Supabase Storage (temporary `draft_media` bucket).
   - Spark creates a record in the `marketing_drafts` table with the text and video URL.
5. **One-Click Approval:**
   - The Founder receives a Slack/email notification or sees it in the Admin Dashboard (`/en/admin/social`).
   - The Founder clicks "Approve".
   - The official LinkedIn API publishes the post with the video.

## Security & Doctrine Compliance

- **No Stored Credentials:** Spark uses the existing Chrome session cookie. No passwords or API keys are stored in the codebase or Vercel env vars.
- **Kill Switch:** The automation only runs if `process.env.MARKETING_AUTOPILOT === "enabled"`.
- **Zero Hallucination Risk:** Videos and texts are NEVER published directly. They sit in a database queue until a human clicks "Approve".

## Acceptance Criteria for Implementation (Target: Aug 10+)

1. A new Spark action `generateLabsVideo(prompt)` is created using `openchrome` logic.
2. Videos downloaded from Labs are successfully parsed and pushed to Supabase storage.
3. The Admin Panel (`/en/admin/social`) correctly renders the video preview from the pending queue.
