// D:\Alparai\.agents\scripts\health_check.ts
const URL = "https://alparai.com";

async function runHealthCheck() {
  try {
    console.info(`[Spark Health Check] Pinging ${URL}...`);
    const response = await fetch(URL, {
      method: "GET",
      // Set a timeout using AbortSignal if supported, but simple fetch is fine for now
    });

    if (!response.ok) {
      console.error(`[Spark Health Check] FAILED: ${URL} returned status ${response.status}`);
      process.exit(1);
    }

    console.info(
      `[Spark Health Check] SUCCESS: ${URL} is up and running (Status: ${response.status}).`,
    );
  } catch (error) {
    console.error(`[Spark Health Check] ERROR: Failed to reach ${URL}.`, error);
    process.exit(1);
  }
}

runHealthCheck();
