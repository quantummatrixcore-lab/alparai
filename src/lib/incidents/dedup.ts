import { createAdminClient } from "@/lib/supabase/admin";

function calculateTrigramSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, "");
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (s1 === s2) return 1.0;

  const getTrigrams = (s: string) => {
    const trigrams = new Set<string>();
    for (let i = 0; i < s.length - 2; i++) {
      trigrams.add(s.slice(i, i + 3));
    }
    return trigrams;
  };

  const t1 = getTrigrams(s1);
  const t2 = getTrigrams(s2);
  if (t1.size === 0 || t2.size === 0) return 0;

  let intersection = 0;
  for (const tri of t1) {
    if (t2.has(tri)) intersection++;
  }

  return (2 * intersection) / (t1.size + t2.size);
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateOfId?: string;
  similarityScore: number;
}

interface IncidentItem {
  id: string;
  title?: string;
  vendor?: string;
}

export async function findDuplicateIncident(
  title: string,
  vendor: string,
): Promise<DuplicateCheckResult> {
  try {
    const admin = createAdminClient();
    const db = admin as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          order: (
            col: string,
            opts: { ascending: boolean },
          ) => {
            limit: (n: number) => Promise<{ data: IncidentItem[] | null }>;
          };
        };
      };
    };

    const { data: recent } = await db
      .from("incidents")
      .select("id, title, vendor")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!recent || recent.length === 0) {
      return { isDuplicate: false, similarityScore: 0 };
    }

    for (const item of recent) {
      const vendorMatch =
        item.vendor && vendor && item.vendor.toLowerCase() === vendor.toLowerCase();
      const similarity = calculateTrigramSimilarity(title, item.title || "");

      if ((vendorMatch && similarity >= 0.75) || similarity >= 0.85) {
        return {
          isDuplicate: true,
          duplicateOfId: item.id,
          similarityScore: similarity,
        };
      }
    }

    return { isDuplicate: false, similarityScore: 0 };
  } catch {
    return { isDuplicate: false, similarityScore: 0 };
  }
}
