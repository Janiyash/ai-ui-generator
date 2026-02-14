"use client";

import { useState } from "react";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState("");
  const [aiMsg, setAiMsg] = useState("");
  const [stage, setStage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const cleanCode = (raw: string) => {
    if (!raw) return "";

    let c = raw;

    c = c.replace(/```tsx/g, "");
    c = c.replace(/```/g, "");
    c = c.replace(/import .*?;/g, "");
    c = c.replace(/export default/g, "");
    c = c.replace(/:\s*React\.\w+/g, "");
    c = c.replace(/interface\s+\w+\s*\{[^}]*\}/g, "");

    if (c.includes("<GeneratedUI")) {
      c = c.replace(/<\/?GeneratedUI>/g, "");
    }

    if (!c.includes("const GeneratedUI")) {
      c = `
const GeneratedUI = () => {
  return (
    <div className="p-6">
      ${c}
    </div>
  );
};
`;
    }

    return c;
  };

  const generate = async () => {
    if (!prompt) return;

    setLoading(true);
    setStage("🧠 Planner running...");

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, previousCode: code }),
      });

      setStage("⚙️ Generating UI...");
      const data = await res.json();

      setStage("🔒 Validating components...");

      setCode(data.code);
      setHistory((prev) => [...prev, data.code]);
      setAiMsg(data.explanation);

      setStage("✅ Rendering preview");
    } catch (e) {
      setCode("<div>Error</div>");
      setAiMsg("Generation failed");
      setStage("❌ Error");
    }

    setLoading(false);
  };

  const rollback = () => {
    if (history.length < 2) return;
    const prevCode = history[history.length - 2];
    setCode(prevCode);
    setHistory((prev) => prev.slice(0, -1));
    setAiMsg("Rolled back to previous version.");
  };

  const copyCode = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen bg-[#0b0f17] text-white flex">

      {/* LEFT PANEL */}
      <div className="w-[340px] border-r border-gray-800 flex flex-col">

        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">AI UI Generator</h1>
          <p className="text-xs text-gray-400">Deterministic Agent</p>
        </div>

        {stage && (
          <div className="px-4 py-2 text-xs text-green-400 border-b border-gray-800">
            {stage}
          </div>
        )}

        <div className="flex-1 p-4 overflow-auto space-y-4">
          {prompt && (
            <div className="bg-[#111827] p-3 rounded-lg shadow">
              <p className="text-xs text-gray-400">YOU</p>
              <p>{prompt}</p>
            </div>
          )}

          {aiMsg && (
            <div className="bg-[#1f2937] p-3 rounded-lg shadow">
              <p className="text-xs text-blue-400">AI ARCHITECT</p>
              <p className="text-sm whitespace-pre-line">{aiMsg}</p>
            </div>
          )}

          {/* STEP 5: ERROR UI */}
          {code === "<div>Error</div>" && (
            <div className="bg-red-900 text-red-200 p-3 rounded-lg">
              Generation failed. Try again.
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800">
          <textarea
            className="w-full bg-[#111827] border border-gray-700 p-3 rounded-lg"
            rows={3}
            placeholder="Describe the UI you want..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button
            onClick={generate}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-lg"
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          {/* STEP 4: REGENERATE BUTTON */}
          <button
            onClick={generate}
            className="mt-2 w-full bg-purple-600 hover:bg-purple-700 p-2 rounded-lg"
          >
            Regenerate UI
          </button>

          <button
            onClick={rollback}
            className="mt-2 w-full bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-sm"
          >
            Undo / Rollback
          </button>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 bg-gray-100 p-6 overflow-auto">
          {!code && (
            <div className="h-full flex items-center justify-center text-gray-500">
              Ready to Build
            </div>
          )}

          {code && (
            <div suppressHydrationWarning className="bg-white rounded-xl shadow p-4 h-full">
              <iframe
                className="w-full h-full border-0 rounded"
                srcDoc={`
<html>
<head>
<script src="https://cdn.tailwindcss.com"></script>
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>

<body>
<div id="root"></div>

<script type="text/babel">

const Navbar = ({children}) => <div style={{background:"#111",color:"#fff",padding:16}}>{children}</div>;
const Sidebar = ({children}) => <div style={{width:200,background:"#eee",padding:16}}>{children}</div>;
const Card = ({children}) => <div style={{border:"1px solid #ddd",padding:16,margin:10}}>{children}</div>;
const Button = ({children}) => <button style={{padding:"8px 12px",background:"black",color:"white"}}>{children}</button>;
const Table = ({children}) => <table style={{width:"100%"}}>{children}</table>;
const Input = (props) => <input style={{border:"1px solid #ccc",padding:8}} {...props} />;

${cleanCode(code)}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<GeneratedUI />);

</script>
</body>
</html>
`}
              />
            </div>
          )}
        </div>

        {/* EDITOR */}
        <div className="h-[300px] border-t border-gray-800 bg-[#020617] flex flex-col">
          <div className="flex justify-between items-center p-3 border-b border-gray-800">
            <span className="text-sm text-gray-400">EDITOR</span>
            <button onClick={copyCode} className="text-xs bg-gray-700 px-3 py-1 rounded">
              Copy Code
            </button>
          </div>

          {copied && (
            <div className="absolute bottom-6 right-6 bg-green-600 px-4 py-2 rounded">
              Copied ✓
            </div>
          )}

          <pre className="flex-1 overflow-auto text-xs p-4 text-green-400">
            {code || "// Generated code will appear here"}
          </pre>
        </div>
      </div>
    </div>
  );
}
