import { callOpenAI, json, tryParseJson } from '../_shared.js';

function systemPrompt(lang) {
  if (lang === 'en') {
    return `
You are a professional pet nutrition analyst.
Return STRICT JSON only, no markdown, no code fences.
Analyze the uploaded pet food label image and the provided pet profile.
If the image is unclear, say so in the fields instead of inventing details.
Use English only.
Fields:
{
  "species_label": "Dog or Cat",
  "breed_label": "Breed label or Unknown",
  "food_estimate": "One-sentence estimate of macro profile",
  "rationale": "Why that estimate was made",
  "ingredients": ["..."],
  "guaranteed_analysis": ["..."],
  "daily_amount": "Practical daily feeding amount",
  "week_plan_text": "7-day meal plan as plain text",
  "report_text": "Full report in English",
  "warnings": ["..."]
}
`;
  }
  return `
당신은 반려동물 사료 분석 전문가입니다.
STRICT JSON만 반환하고, 마크다운이나 코드펜스는 쓰지 마세요.
업로드된 사료 라벨 이미지와 반려동물 프로필을 분석하세요.
이미지가 불명확하면 추측하지 말고 필드에 그렇게 적으세요.
한국어만 사용하세요.
필드:
{
  "species_label": "강아지 또는 고양이",
  "breed_label": "품종명 또는 무명",
  "food_estimate": "한 줄 영양 추정",
  "rationale": "그 추정을 한 이유",
  "ingredients": ["..."],
  "guaranteed_analysis": ["..."],
  "daily_amount": "실제 급여량",
  "week_plan_text": "7일 식단표를 일반 텍스트로",
  "report_text": "완전한 한국어 리포트",
  "warnings": ["..."]
}
`;
}

function userPrompt(lang, payload) {
  const profile = {
    species: payload.petType === 'cat' ? (lang === 'en' ? 'cat' : '고양이') : (lang === 'en' ? 'dog' : '강아지'),
    breed: payload.breed || (lang === 'en' ? 'Unknown' : '무명'),
    weight: payload.weight,
    age: payload.age,
    activity: payload.activity,
    neutered: payload.neutered,
    joint: payload.joint,
  };
  return `${lang === 'en' ? 'Profile' : '프로필'}: ${JSON.stringify(profile)}\n${lang === 'en' ? 'Analyze the food label image and return the JSON fields.' : '사료 라벨 이미지를 분석하고 JSON 필드를 반환하세요.'}`;
}

export async function onRequestPost(context) {
  try {
    const payload = await context.request.json();
    const lang = payload.lang === 'en' ? 'en' : 'ko';
    const input = [
      {
        role: 'system',
        content: [{ type: 'input_text', text: systemPrompt(lang) }],
      },
      {
        role: 'user',
        content: [
          { type: 'input_text', text: userPrompt(lang, payload) },
          ...(payload.imageDataUrl ? [{ type: 'input_image', image_url: payload.imageDataUrl, detail: 'high' }] : []),
        ],
      },
    ];
    const { text } = await callOpenAI(context.env, input);
    const parsed = tryParseJson(text);
    return json(200, parsed);
  } catch (error) {
    return json(500, { error: error.message || 'Food analysis failed' });
  }
}
