import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generator(plan: string) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
Generate React code using ONLY these components:
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import Table from "@/components/ui/Table"
import Sidebar from "@/components/ui/Sidebar"
import Navbar from "@/components/ui/Navbar"

Return React code only.
`
      },
      { role: "user", content: plan }
    ]
  });

  return res.choices[0].message.content;
}
