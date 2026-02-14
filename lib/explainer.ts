import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function explainer(prompt: string) {
  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "Explain what UI was created and why."
      },
      { role: "user", content: prompt }
    ]
  });

  return res.choices[0]?.message?.content || "";
}
