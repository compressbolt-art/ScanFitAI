export function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export function getModel(env = {}) {
  return env.OPENAI_MODEL || 'gpt-5.5';
}

export function stripJsonFence(text) {
  const raw = String(text || '').trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced ? fenced[1].trim() : raw;
}

export function tryParseJson(text) {
  const cleaned = stripJsonFence(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');
    if (first >= 0 && last > first) {
      return JSON.parse(cleaned.slice(first, last + 1));
    }
    throw new Error('Model did not return valid JSON');
  }
}

export async function callOpenAI(env, input) {
  const apiKey = env?.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY');

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getModel(env),
      input,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `OpenAI request failed (${res.status})`);
  }
  const text = data.output_text || '';
  if (!text) throw new Error('Empty model response');
  return { data, text };
}
