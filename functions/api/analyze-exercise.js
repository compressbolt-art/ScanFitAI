import { callOpenAI, json, tryParseJson } from '../_shared.js';

function systemPrompt(lang) {
  if (lang === 'en') {
    return `
You are a professional pet rehabilitation and exercise planner.
Return STRICT JSON only, no markdown, no code fences.
Use the uploaded meal report text and food analysis to design a safe exercise prescription.
Fields:
{
  "summary": "One-sentence summary",
  "intensity": "Low/Moderate/High style intensity",
  "duration": "Practical duration",
  "notes": "Cautions and guidance",
  "plan_text": "Full exercise prescription in plain text",
  "report_text": "Full report in English"
}
`;
  }
  return `
당신은 반려동물 운동처방 전문가입니다.
STRICT JSON만 반환하고, 마크다운이나 코드펜스는 쓰지 마세요.
업로드된 식단 리포트와 사료 분석을 바탕으로 안전한 운동처방을 작성하세요.
필드:
{
  "summary": "한 줄 요약",
  "intensity": "강도",
  "duration": "기간",
  "notes": "주의사항",
  "plan_text": "전체 운동처방 텍스트",
  "report_text": "완전한 한국어 리포트"
}
`;
}

function userPrompt(lang, payload) {
  const base = {
    foodResult: payload.foodResult || null,
    reportText: payload.reportText || '',
  };
  return `${lang === 'en' ? 'Inputs' : '입력값'}: ${JSON.stringify(base)}`;
}

export async function onRequestPost(context) {
  try {
    const payload = await context.request.json();
    const lang = payload.lang === 'en' ? 'en' : 'ko';
    const input = [
      { role: 'system', content: [{ type: 'input_text', text: systemPrompt(lang) }] },
      { role: 'user', content: [{ type: 'input_text', text: userPrompt(lang, payload) }] },
    ];
    const { text } = await callOpenAI(context.env, input);
    const parsed = tryParseJson(text);
    return json(200, parsed);
  } catch (error) {
    return json(500, { error: error.message || 'Exercise analysis failed' });
  }
}
