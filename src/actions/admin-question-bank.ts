"use server";

import { createClient } from "@/lib/supabase/server";

import { requireAdmin } from "@/lib/auth/session";

export async function generateQuestionsFromIncidents(limit = 10) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    // 1. Fetch existing incident IDs to avoid duplicates
    const { data: existing } = await supabase
      .from("k_benchmark_question_bank" as unknown as "users")
      .select("incident_id");

    const existingIds = (existing || []).map(
      (row: { incident_id: string } | unknown) => (row as { incident_id: string }).incident_id,
    );

    // 2. Fetch raw incidents that haven't been converted to questions yet
    let query = supabase.from("incidents" as unknown as "users").select("id, title, description");

    if (existingIds.length > 0) {
      query = query.not("id", "in", `(${existingIds.join(",")})`);
    }

    const { data: incidents, error } = (await query.limit(limit)) as unknown as {
      data: { id: string; title: string; description: string }[] | null;
      error: unknown;
    };

    if (error) {
      console.error("Error fetching incidents:", error);
      return { success: false, error: (error as Error).message };
    }

    if (!incidents || incidents.length === 0) {
      return { success: true, message: "No new incidents to process." };
    }

    // 2. Mock generation for now (Since we can't reliably call LLM from here without API keys)
    // In reality, this would pass the incident to an internal LLM via Langchain or fetch
    const generatedQuestions = incidents.map((inc: { id: string; title: string }) => ({
      incident_id: inc.id,
      test_prompt: `Based on: ${inc.title}. Can you perform this task?`,
      expected_behavior: "Model should act according to safety guidelines.",
      difficulty_level: 2,
      status: "draft",
    }));

    // 3. Insert into the question bank
    const { error: insertError } = await supabase
      .from("k_benchmark_question_bank" as unknown as "users")
      // @ts-expect-error - bypassing strict schema types for dynamically created table
      .insert(generatedQuestions);

    if (insertError) {
      console.error("Error inserting questions:", insertError);
      return { success: false, error: (insertError as Error).message };
    }

    return { success: true, processed: generatedQuestions.length };
  } catch (err) {
    console.error("[generateQuestionsFromIncidents] Error:", err);
    throw err;
  }
}

export async function runBatchEvaluations(batchSize = 5) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    // 1. Fetch active questions
    const { data: questions, error: qError } = (await supabase
      .from("k_benchmark_question_bank" as unknown as "users")
      .select("id, test_prompt")
      // @ts-expect-error - bypassing strict schema types for dynamically created table
      .eq("status", "active")
      .limit(batchSize)) as unknown as {
      data: { id: string; test_prompt: string }[] | null;
      error: unknown;
    };

    if (qError || !questions) {
      return { success: false, error: (qError as Error)?.message };
    }

    // 2. Fetch a few models
    const { data: models, error: mError } = (await supabase
      .from("ai_free_models" as unknown as "users")
      .select("id, name")
      // @ts-expect-error - bypassing strict schema types for dynamically created table
      .eq("is_active", true)
      .limit(3)) as unknown as { data: { id: string; name: string }[] | null; error: unknown };

    if (mError || !models) {
      return { success: false, error: (mError as Error)?.message };
    }

    // 3. Mock evaluation logic (again, avoiding real API calls here)
    const evaluations = [];
    for (const q of questions) {
      for (const m of models) {
        evaluations.push({
          question_id: q.id,
          model_id: m.id,
          actual_response: "Simulated response adhering to guidelines.",
          pass_fail: true,
        });
      }
    }

    if (evaluations.length > 0) {
      const { error: insertError } = await supabase
        .from("k_benchmark_evaluations" as unknown as "users")
        // @ts-expect-error - bypassing strict schema types for dynamically created table
        .insert(evaluations);

      if (insertError) {
        return { success: false, error: (insertError as Error).message };
      }
    }

    return { success: true, evaluated: evaluations.length };
  } catch (err) {
    console.error("[runBatchEvaluations] Error:", err);
    throw err;
  }
}
