import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function planner(prompt: string) {
  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `
You are a UI planner.

Allowed components:
Navbar, Sidebar, Card, Table, Button.

Return JSON only:
{
  "components": ["Navbar","Sidebar","Card"]
}
`
      },
      { role: "user", content: prompt }
    ]
  });

  return res.choices[0]?.message?.content || "{}";
}
