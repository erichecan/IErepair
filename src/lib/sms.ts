import Telnyx from "telnyx";

const client = process.env.TELNYX_API_KEY
  ? new Telnyx({ apiKey: process.env.TELNYX_API_KEY })
  : null;

export async function sendSMS(to: string, text: string): Promise<void> {
  if (!client || !process.env.TELNYX_FROM_NUMBER) return;
  try {
    await client.messages.send({
      from: process.env.TELNYX_FROM_NUMBER,
      to,
      text,
    });
  } catch (error) {
    console.error("[SMS Send Error]", error);
  }
}
