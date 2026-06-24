export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are a helpful, friendly AI assistant integrated into the "Kalingang Tahanan" (Smart Home Care) app.
You support both English and Tagalog (Filipino) languages equally well.

Guidelines:
- Answer any question the user asks — you are a general-purpose AI assistant like ChatGPT
- If the question is about pet or plant care, provide detailed, practical advice
- If asked about other topics (tech, science, daily life, etc.), answer helpfully
- Use the same language the user wrote in (English or Tagalog)
- Be concise but thorough; adapt response length to the question
- For medical or veterinary advice, include a disclaimer to consult a professional
- Be warm, encouraging, and conversational
- Format responses with line breaks for readability`;

function buildMessages(messages: ChatMessage[]) {
  const result: { role: string; content: string }[] = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];
  for (const m of messages) {
    result.push({ role: m.role, content: m.content });
  }
  return result;
}

export async function sendMessage(
  _apiKey: string,
  messages: ChatMessage[],
  onChunk?: (text: string) => void
): Promise<string> {
  if (!navigator.onLine) {
    throw new Error('offline');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${_apiKey}`
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: buildMessages(messages),
      max_tokens: 500,
      stream: true,
    }),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('unauthorized');
    }
    throw new Error(`API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullResponse = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;

      try {
        const json = JSON.parse(trimmed.slice(6));
        const content = json.choices?.[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onChunk?.(content);
        }
      } catch {
        // skip malformed chunks
      }
    }
  }

  return fullResponse;
}

export function isOnline(): boolean {
  return navigator.onLine;
}
