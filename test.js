import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
});

const response = await client.responses.create({
  model: "gpt-4.1-mini",
  input: "API key test",
});

console.log(response.output[0].content[0].text);
