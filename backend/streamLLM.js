// streamLLM.js

const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function streamLLM(prompt, ws) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a concise interview assistant. Answer clearly and briefly.' },
      { role: 'user', content: prompt }
    ],
    stream: true
  });
  for await (const chunk of stream) {
    const part = chunk.choices?.[0]?.delta?.content;
    if (part) {
      ws.send(JSON.stringify({ type: 'answer_part', text: part }));
    }
  }
  ws.send(JSON.stringify({ type: 'answer_final' }));
}

module.exports = { streamLLM };
