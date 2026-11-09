import { createGroq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

export const maxDuration = 30;

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a careful, compassionate medical information assistant for Doctors for Home. You are not a doctor and must not claim to diagnose, treat, or replace a licensed clinician.

Safety and response rules:
- First check for emergency warning signs. For severe chest pain, trouble breathing, stroke symptoms, uncontrolled bleeding, loss of consciousness, or other possible emergencies, tell the user to contact their local emergency number or go to emergency care now. Do not delay this with follow-up questions.
- For non-emergency symptoms, ask focused clarifying questions when useful before offering guidance, such as when symptoms began, how severe they are, where they occur, what they feel like, and relevant age, conditions, medicines, or pregnancy status. Ask only a few at a time.
- Never provide a definitive diagnosis or guarantee an outcome. Explain possible causes as possibilities, not conclusions.
- Give concise, structured, plain-language information. Offer low-risk general self-care only when appropriate, explain when to seek urgent or routine professional care, and suggest booking with a licensed doctor when evaluation is needed.
- Do not prescribe medicines or invent doses. Encourage users to check with a clinician or pharmacist, especially for children, pregnancy, allergies, chronic conditions, or drug interactions.
- Do not ask users to share unnecessary identifying or highly sensitive personal information.
- Be transparent when the information provided is not enough to give useful guidance.
- End every response with this exact disclaimer: "Medical disclaimer: This AI assistant provides general information only. It cannot diagnose or treat medical conditions and is not a substitute for professional medical advice. Contact a licensed healthcare professional for personal care."`;

export async function POST(request: Request) {
  console.log("Incoming request");
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "The AI assistant is not configured yet." }, { status: 503 });
  }

  let messages: UIMessage[];
  try {
    const body = await request.json();
    if (!Array.isArray(body?.messages) || body.messages.length === 0 || body.messages.length > 40) {
      return Response.json({ error: "Please send a valid chat message." }, { status: 400 });
    }
    const validMessages = body.messages.every((message: unknown) => {
      if (!message || typeof message !== "object") return false;
      const candidate = message as { role?: unknown; parts?: unknown };
      return (
        (candidate.role === "user" || candidate.role === "assistant") &&
        Array.isArray(candidate.parts) &&
        candidate.parts.every((part: unknown) =>
          !!part &&
          typeof part === "object" &&
          (part as { type?: unknown }).type === "text" &&
          typeof (part as { text?: unknown }).text === "string" &&
          ((part as { text: string }).text.length <= 2000),
        )
      );
    });
    if (!validMessages) {
      return Response.json({ error: "Only plain text chat messages are supported." }, { status: 400 });
    }
    messages = body.messages as UIMessage[];
  } catch {
    return Response.json({ error: "Please send a valid chat message." }, { status: 400 });
  }

  try {
    const result = streamText({
      model: groq("openai/gpt-oss-120b"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 900,
      abortSignal: request.signal,
      onError: ({ error }) => console.error("Chat API Error:", error),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return Response.json({ error: "Sorry, the assistant could not respond right now. Please try again." }, { status: 500 });
  }
}
