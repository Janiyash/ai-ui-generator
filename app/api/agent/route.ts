import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { prompt, previousCode } = await req.json();

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    // =========================
    // 🧠 PLANNER
    // =========================
    const planRes = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are a UI planner.
Return ONLY JSON.

Allowed components:
Navbar, Sidebar, Card, Button, Table, Input

Example:
{
 "layout":"dashboard",
 "components":["Navbar","Sidebar","Table"]
}
`
        },
        { role: "user", content: prompt }
      ]
    });

    let plan: any = { layout: "default", components: [] };

    try {
      const text = planRes.choices[0]?.message?.content || "{}";
      plan = JSON.parse(text);
    } catch {
      plan = { layout: "default", components: [] };
    }

    // =========================
    // 🎨 GENERATOR
    // =========================
    const uiRes = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are a senior React UI architect.

CRITICAL RULES:
- Return ONLY JSX
- NO markdown
- NO imports
- NO export default
- Component MUST be:

const GeneratedUI = () => {
  return (
    <div>...</div>
  );
};

Use Tailwind styling.

Design must be modern & colorful like:
- Stripe dashboard
- Zomato UI
- SaaS admin panel

Use:
gradient headers
soft shadows
rounded-xl cards
spacing
modern typography

Navbar, Sidebar, Card, Button, Table, Input
`
        },
        {
          role: "user",
          content: `
User request: ${prompt}

Planner:
${JSON.stringify(plan)}

Previous UI:
${previousCode || "none"}
`
        }
      ]
    });

    let code = uiRes.choices[0]?.message?.content || "";

    // force wrap
    if (!code.includes("GeneratedUI")) {
      code = `
const GeneratedUI = () => {
  return (
    <div className="p-6">
      ${code}
    </div>
  );
};
`;
    }

    // =========================
    // 🔒 VALIDATION
    // =========================
    const allowed = ["Navbar","Sidebar","Card","Button","Table","Input"];
    const usedTags = code.match(/<([A-Z][A-Za-z]+)/g) || [];

    for (const tag of usedTags) {
      const name = tag.replace("<", "");
      if (!allowed.includes(name) && name !== "GeneratedUI") {
        return Response.json({
          code: "<div>Invalid component generated</div>",
          explanation: "Invalid component used",
          plan
        });
      }
    }

    // =========================
    // 🧠 EXPLAINER
    // =========================
    const explainRes = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are a senior UI architect.
Return short colorful explanation.
`
        },
        {
          role: "user",
          content: `
User request:
${prompt}

Planner:
${JSON.stringify(plan)}
`
        }
      ]
    });

    const explanation =
      explainRes.choices[0]?.message?.content ||
      `Layout: ${plan.layout}`;

    // ⭐⭐⭐ THIS WAS MISSING ⭐⭐⭐
    return Response.json({
      code,
      explanation,
      plan
    });

  } catch (err) {
    console.error(err);
    return Response.json({
      code: "<div>Error</div>",
      explanation: "AI failed"
    });
  }
}
