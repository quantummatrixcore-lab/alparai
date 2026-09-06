import { NextResponse } from "next/server";
import { generateQuestionsFromIncidents, runBatchEvaluations } from "@/actions/admin-question-bank";

export async function GET(request: Request) {
  // 1. Verify Vercel Cron Secret (Authentication)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Generate new benchmark questions from incidents
    // Passing a limit of 20 to keep within Vercel's 5 minute limit for Pro tier
    const generateResult = await generateQuestionsFromIncidents(20);

    // 3. Run evaluations for the models against active questions
    const evalResult = await runBatchEvaluations(20);

    return NextResponse.json({
      success: true,
      message: "Benchmark pipeline executed successfully",
      generation: generateResult,
      evaluation: evalResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron /api/cron/benchmark error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 },
    );
  }
}
