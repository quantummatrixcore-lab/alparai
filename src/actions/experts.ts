"use server";

import { z } from "zod";
import { APP_EMAIL } from "@/lib/constants";
import { getResendClient } from "@/lib/email/resend";
import { headers } from "next/headers";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { hashIp } from "@/lib/utils/hash";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

import { maskPII } from "@/lib/pii/guardian";

const expertApplicationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be at most 100 characters"),
  institution: z
    .string()
    .min(2, "Institution must be at least 2 characters")
    .max(100, "Institution must be at most 100 characters"),
  expertiseArea: z.enum(
    ["legal", "medical", "cybersecurity", "research", "ethics", "policy", "other"],
    {
      message: "Please select a valid area of expertise",
    },
  ),
  linkedinUrl: z.string().url("Please provide a valid LinkedIn URL").optional().or(z.literal("")),
  email: z.string().email("Please provide a valid email address").max(200),
});

export interface ExpertState {
  ok: boolean;
  error?: string;
  formError?: string;
  fieldErrors?: Record<string, string[]>;
}

interface ExpertWorkInput {
  name: string;
  title: string;
  institution: string;
  expertiseArea: string;
  linkedinUrl?: string;
  email: string;
  ip: string;
  userAgent: string;
}

type ExpertWorkResult =
  { ok: true; sent: boolean; channel: "email" | "log" } | { ok: false; error: string };

const runExpertWork = async (data: ExpertWorkInput): Promise<ExpertWorkResult> => {
  try {
    const admin = createAdminClient();
    const { error: dbError } = await admin.from("expert_applications").insert({
      name: maskPII(data.name).masked,
      title_institution: `${maskPII(data.title).masked} - ${maskPII(data.institution).masked}`,
      expertise: data.expertiseArea,
      linkedin_url: data.linkedinUrl || null,
      email: data.email,
      expertise_area: data.expertiseArea,
      status: "pending",
    });
    if (dbError) {
      logger.error(
        "[submitExpert] Database insert failed",
        undefined,
        dbError instanceof Error ? dbError : undefined,
      );
      return { ok: false, error: dbError.message };
    }
  } catch (dbEx) {
    logger.error(
      "[submitExpert] Database exception",
      undefined,
      dbEx instanceof Error ? dbEx : undefined,
    );
    return { ok: false, error: dbEx instanceof Error ? dbEx.message : "db_error" };
  }

  const resend = getResendClient();
  if (!resend) {
    return { ok: true, sent: true, channel: "log" };
  }
  try {
    await resend.emails.send({
      from: `ALPAR AI Expert Panel <${APP_EMAIL}>`,
      to: APP_EMAIL,
      subject: `[Expert Panel Application] ${data.name}`,
      text: `Expert Panel Application:\n\nName: ${data.name}\nEmail: ${data.email}\nTitle: ${data.title}\nInstitution: ${data.institution}\nArea of Expertise: ${data.expertiseArea}\nLinkedIn: ${data.linkedinUrl || "N/A"}\n\n--\nIP Hash: ${hashIp(data.ip)}`,
      html: `
        <h2>Expert Panel Application</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Title:</strong> ${data.title}</p>
        <p><strong>Institution:</strong> ${data.institution}</p>
        <p><strong>Area of Expertise:</strong> ${data.expertiseArea}</p>
        <p><strong>LinkedIn:</strong> ${data.linkedinUrl ? `<a href="${data.linkedinUrl}" target="_blank" rel="noopener noreferrer">${data.linkedinUrl}</a>` : "N/A"}</p>
        <hr/>
        <p style="font-size: 11px; color: #666;">IP Hash: ${hashIp(data.ip)}</p>
      `,
    });
    return { ok: true, sent: true, channel: "email" };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "resend_failed",
    };
  }
};

export async function submitExpert(_prev: ExpertState, formData: FormData): Promise<ExpertState> {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const userAgent = hdrs.get("user-agent") ?? "unknown";

    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.expert_application}:${ip}`);
    if (!rl.ok) {
      return { ok: false, formError: `Too many submissions. Try again in ${rl.retryAfter}s.` };
    }

    const raw = {
      name: String(formData.get("name") ?? ""),
      title: String(formData.get("title") ?? ""),
      institution: String(formData.get("institution") ?? ""),
      expertiseArea: String(formData.get("expertiseArea") ?? ""),
      linkedinUrl: formData.get("linkedinUrl") ? String(formData.get("linkedinUrl")) : undefined,
      email: String(formData.get("email") ?? ""),
    };

    const parsed = expertApplicationSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const outcome = await runExpertWork({
      name: parsed.data.name,
      title: parsed.data.title,
      institution: parsed.data.institution,
      expertiseArea: parsed.data.expertiseArea,
      linkedinUrl: parsed.data.linkedinUrl,
      email: parsed.data.email,
      ip,
      userAgent,
    });

    if (outcome.ok) {
      return { ok: true };
    }
    return { ok: false, error: outcome.error, formError: outcome.error };
  } catch (e) {
    logger.error(
      "[submitExpert] Unhandled exception",
      undefined,
      e instanceof Error ? e : undefined,
    );
    return { ok: false, formError: "An unexpected error occurred. Please try again." };
  }
}
