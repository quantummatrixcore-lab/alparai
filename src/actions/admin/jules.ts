"use server";

import { logger } from "@/lib/utils/logger";

const JULES_API_BASE = "https://jules.googleapis.com/v1alpha";

interface JulesSession {
  name: string;
  sessionId: string;
  state: string;
  createTime: string;
  prompt: string;
}

interface JulesActivity {
  name: string;
  type: string;
  createTime: string;
  content?: string;
}

interface CreateSessionParams {
  prompt: string;
  repo: string;
  branch?: string;
}

function getApiKey(): string {
  const key = process.env.JULES_API_KEY;
  if (!key) throw new Error("JULES_API_KEY not configured");
  return key;
}

export async function createJulesSession(params: CreateSessionParams): Promise<{
  success: boolean;
  session?: JulesSession;
  error?: string;
}> {
  try {
    const apiKey = getApiKey();
    const [owner, repoName] = params.repo.split("/");

    const response = await fetch(`${JULES_API_BASE}/sessions`, {
      method: "POST",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: params.prompt,
        sourceContext: {
          repository: {
            owner,
            name: repoName,
            branch: params.branch ?? "master",
          },
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      logger.error("Jules API session creation failed", { status: response.status, err });
      return { success: false, error: `Jules API error: ${response.status}` };
    }

    const session = (await response.json()) as JulesSession;
    logger.info("Jules session created", { sessionId: session.sessionId, prompt: params.prompt });
    return { success: true, session };
  } catch (error) {
    logger.error(
      "Failed to create Jules session",
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return { success: false, error: String(error) };
  }
}

export async function listJulesSessions(): Promise<{
  success: boolean;
  sessions?: JulesSession[];
  error?: string;
}> {
  try {
    const apiKey = getApiKey();
    const response = await fetch(`${JULES_API_BASE}/sessions`, {
      headers: { "X-Goog-Api-Key": apiKey },
      cache: "no-store",
    });

    if (!response.ok) {
      return { success: false, error: `Jules API error: ${response.status}` };
    }

    const data = (await response.json()) as { sessions?: JulesSession[] };
    return { success: true, sessions: data.sessions ?? [] };
  } catch (error) {
    logger.error(
      "Failed to list Jules sessions",
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return { success: false, error: String(error) };
  }
}

export async function getJulesSession(sessionId: string): Promise<{
  success: boolean;
  session?: JulesSession;
  activities?: JulesActivity[];
  error?: string;
}> {
  try {
    const apiKey = getApiKey();
    const [sessionRes, activitiesRes] = await Promise.all([
      fetch(`${JULES_API_BASE}/sessions/${sessionId}`, {
        headers: { "X-Goog-Api-Key": apiKey },
        cache: "no-store",
      }),
      fetch(`${JULES_API_BASE}/sessions/${sessionId}/activities`, {
        headers: { "X-Goog-Api-Key": apiKey },
        cache: "no-store",
      }),
    ]);

    if (!sessionRes.ok) {
      return { success: false, error: `Jules API error: ${sessionRes.status}` };
    }

    const session = (await sessionRes.json()) as JulesSession;
    const activitiesData = activitiesRes.ok
      ? ((await activitiesRes.json()) as { activities?: JulesActivity[] })
      : { activities: [] };

    return {
      success: true,
      session,
      activities: activitiesData.activities ?? [],
    };
  } catch (error) {
    logger.error(
      "Failed to get Jules session",
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return { success: false, error: String(error) };
  }
}

export async function getJulesHealth(): Promise<{
  connected: boolean;
  sessionCount: number;
  error?: string;
}> {
  const apiKey = process.env.JULES_API_KEY;
  if (!apiKey) return { connected: false, sessionCount: 0, error: "JULES_API_KEY not set" };

  try {
    const response = await fetch(`${JULES_API_BASE}/sessions`, {
      headers: { "X-Goog-Api-Key": apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok)
      return { connected: false, sessionCount: 0, error: `HTTP ${response.status}` };
    const data = (await response.json()) as { sessions?: unknown[] };
    return { connected: true, sessionCount: data.sessions?.length ?? 0 };
  } catch (error) {
    return { connected: false, sessionCount: 0, error: String(error) };
  }
}
