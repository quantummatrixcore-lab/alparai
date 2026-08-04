import { Resend } from "resend";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testSend() {
  try {
    console.log("Sending test email...");
    const data = await resend.emails.send({
      from: "Ercument Erden <ercument.erden@alparai.com>",
      to: "quantum.matrix.core@gmail.com",
      subject: "Test Send from ALPAR AI",
      text: "This is a test email verifying Resend domain configuration.",
    });
    console.log("Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

testSend();
