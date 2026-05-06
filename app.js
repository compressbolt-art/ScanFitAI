(() => {
  const app = document.getElementById('app');
  const state = {
    lang: localStorage.getItem('scanfiai1.lang') || 'ko',
    theme: localStorage.getItem('scanfiai1.theme') || 'light',
    petType: 'dog',
    breed: '',
    weight: 3,
    age: 3,
    activity: 'moderate',
    neutered: 'yes',
    joint: 'no',
    foodResult: null,
    exerciseResult: null,
    foodImageDataUrl: '',
    reportText: '',
  };

  const i18n = {
    ko: {
      title: 'ScanFitAI',
      themeLight: '낮',
      themeDark: '밤',
      langKo: '한국어',
      langEn: '영어',
      dog: '강아지',
      cat: '고양이',
      breed: '품종',
      weight: '중량 (kg)',
      age: '나이',
      activity: '활동량',
      neutered: '중성화',
      joint: '관절 문제',
      uploadLabel: '사료 라벨 이미지 업로드',
      analyzeFood: '사료 분석',
      analyzeExercise: '운동처방 분석',
      foodReport: '사료/식단 리포트 다운로드',
      exerciseReport: '운동처방 리포트 다운로드',
      reportUpload: '리포트 업로드',
      reportPaste: '리포트 내용을 붙여넣거나 HTML 파일을 업로드하세요',
      scanFoodHint: '라벨 이미지를 올린 뒤 분석 버튼을 누르세요.',
      scanExerciseHint: '식단 리포트를 업로드한 뒤 Enter 또는 분석 버튼을 누르세요.',
      summary: '분석 결과',
      exercise: '운동처방',
      loading: '분석 중...',
      errorApi: 'AI 분석을 실행할 수 없습니다. API 키와 Pages Functions를 확인하세요.',
      saveOk: '분석 결과가 저장되었습니다.',
    },
    en: {
      title: 'ScanFitAI',
      themeLight: 'Day',
      themeDark: 'Night',
      langKo: 'Korean',
      langEn: 'English',
      dog: 'Dog',
      cat: 'Cat',
      breed: 'Breed',
      weight: 'Weight (kg)',
      age: 'Age',
      activity: 'Activity',
      neutered: 'Neutered',
      joint: 'Joint issue',
      uploadLabel: 'Upload food label image',
      analyzeFood: 'Analyze food',
      analyzeExercise: 'Analyze exercise plan',
      foodReport: 'Download food/meal report',
      exerciseReport: 'Download exercise report',
      reportUpload: 'Upload report',
      reportPaste: 'Paste report text or upload an HTML file',
      scanFoodHint: 'Upload the label image, then run analysis.',
      scanExerciseHint: 'Upload the meal report, then press Enter or analyze.',
      summary: 'Analysis results',
      exercise: 'Exercise plan',
      loading: 'Analyzing...',
      errorApi: 'AI analysis is unavailable. Check the API key and Pages Functions.',
      saveOk: 'Analysis saved.',
    },
  };

  const t = () => i18n[state.lang];

  function savePrefs() {
    localStorage.setItem('scanfiai1.lang', state.lang);
    localStorage.setItem('scanfiai1.theme', state.theme);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function setTheme() {
    document.body.style.margin = '0';
    document.body.style.fontFamily = 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
    document.body.style.background = state.theme === 'dark' ? '#0f172a' : '#f3f4f6';
    document.body.style.color = state.theme === 'dark' ? '#e5e7eb' : '#111827';
  }

  async function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function fileToText(file) {
    return await file.text();
  }

  async function callApi(path, payload) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'API error');
    return data;
  }

  function reportHtml(kind, obj) {
    const title = kind === 'food'
      ? (state.lang === 'ko' ? '사료/식단 리포트' : 'Food/Meal Report')
      : (state.lang === 'ko' ? '운동처방 리포트' : 'Exercise Report');
    const body = escapeHtml(JSON.stringify(obj, null, 2)).replaceAll('\n', '<br>');
    return `<!doctype html><html lang="${state.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{font-family:system-ui;margin:24px;line-height:1.5}pre{white-space:pre-wrap;background:#f3f4f6;padding:16px;border-radius:12px}</style></head><body><h1>${title}</h1><pre>${body}</pre></body></html>`;
  }

  function downloadHtml(filename, html) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function renderFoodResult() {
    const res = state.foodResult;
    if (!res) return '';
    const tr = t();
    return `
      <div class="panel">
        <h3>${tr.summary}</h3>
        <div class="grid2">
          <div><strong>${state.lang === 'ko' ? '품종' : 'Breed'}</strong><br>${escapeHtml(res.breed_label || state.breed || '-')}</div>
          <div><strong>${state.lang === 'ko' ? '추정' : 'Estimate'}</strong><br>${escapeHtml(res.food_estimate || '-')}</div>
          <div><strong>${state.lang === 'ko' ? '1일 급여량' : 'Daily amount'}</strong><br>${escapeHtml(res.daily_amount || '-')}</div>
          <div><strong>${state.lang === 'ko' ? '권장 사유' : 'Why'}</strong><br>${escapeHtml(res.rationale || '-')}</div>
        </div>
        <div class="list">
          <strong>${state.lang === 'ko' ? '1주 식단표' : '7-day meal plan'}</strong>
          <pre>${escapeHtml(res.week_plan_text || '')}</pre>
        </div>
      </div>
    `;
  }

  function renderExerciseResult() {
    const res = state.exerciseResult;
    if (!res) return '';
    return `
      <div class="panel">
        <h3>${t().exercise}</h3>
        <div class="grid2">
          <div><strong>${state.lang === 'ko' ? '운동 강도' : 'Intensity'}</strong><br>${escapeHtml(res.intensity || '-')}</div>
          <div><strong>${state.lang === 'ko' ? '기간' : 'Duration'}</strong><br>${escapeHtml(res.duration || '-')}</div>
          <div><strong>${state.lang === 'ko' ? '주의사항' : 'Notes'}</strong><br>${escapeHtml(res.notes || '-')}</div>
          <div><strong>${state.lang === 'ko' ? '요약' : 'Summary'}</strong><br>${escapeHtml(res.summary || '-')}</div>
        </div>
        <pre>${escapeHtml(res.plan_text || '')}</pre>
      </div>
    `;
  }

  function render() {
    const tr = t();
    document.documentElement.lang = state.lang === 'ko' ? 'ko' : 'en';
    setTheme();
    app.innerHTML = `
      <style>
        .wrap{max-width:980px;margin:0 auto;padding:16px}
        .top{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap}
        .btn{border:1px solid rgba(100,116,139,.35);background:${state.theme === 'dark' ? '#111827' : '#fff'};color:inherit;padding:10px 12px;border-radius:10px;cursor:pointer}
        .card{background:${state.theme === 'dark' ? '#111827' : '#fff'};border:1px solid rgba(100,116,139,.18);border-radius:16px;padding:16px;box-shadow:0 8px 24px rgba(15,23,42,.06)}
        .row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
        .grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
        label{display:grid;gap:6px}
        input,select,textarea{width:100%;box-sizing:border-box;padding:11px 12px;border-radius:10px;border:1px solid rgba(100,116,139,.35);background:${state.theme === 'dark' ? '#0b1220' : '#fff'};color:inherit}
        textarea{min-height:96px;resize:vertical}
        .stack{display:grid;gap:12px}
        .tabs{display:flex;gap:8px;flex-wrap:wrap}
        .panel{display:grid;gap:12px;padding:14px;border-radius:14px;background:${state.theme === 'dark' ? '#0b1220' : '#f8fafc'};border:1px solid rgba(100,116,139,.15)}
        .hint{font-size:13px;opacity:.8}
        .mono{white-space:pre-wrap;word-break:break-word}
        .actions{display:flex;gap:8px;flex-wrap:wrap}
        @media (max-width:720px){ .row,.grid2{grid-template-columns:1fr} }
      </style>
      <div class="wrap">
        <div class="top">
          <h1 style="margin:0">${tr.title}</h1>
          <div class="tabs">
            <button class="btn" id="themeBtn" type="button">${state.theme === 'dark' ? tr.themeDark : tr.themeLight}</button>
            <button class="btn" id="langBtn" type="button">${state.lang === 'ko' ? tr.langEn : tr.langKo}</button>
          </div>
        </div>

        <div class="stack" style="margin-top:16px">
          <section class="card stack">
            <div class="row">
              <label>
                <span>${tr.dog}/${tr.cat}</span>
                <select id="petType">
                  <option value="dog" ${state.petType === 'dog' ? 'selected' : ''}>${tr.dog}</option>
                  <option value="cat" ${state.petType === 'cat' ? 'selected' : ''}>${tr.cat}</option>
                </select>
              </label>
              <label>
                <span>${tr.breed}</span>
                <input id="breed" value="${escapeHtml(state.breed)}" placeholder="${state.lang === 'ko' ? '예: 치와와 / 말티즈 / 믹스' : 'e.g. Chihuahua / Maltese / Mix'}">
              </label>
              <label>
                <span>${tr.weight}</span>
                <input id="weight" type="number" min="0.1" step="0.1" value="${state.weight}">
              </label>
              <label>
                <span>${tr.age}</span>
                <input id="age" type="number" min="0.1" step="0.1" value="${state.age}">
              </label>
              <label>
                <span>${tr.activity}</span>
                <select id="activity">
                  <option value="low" ${state.activity === 'low' ? 'selected' : ''}>${state.lang === 'ko' ? '낮음' : 'Low'}</option>
                  <option value="moderate" ${state.activity === 'moderate' ? 'selected' : ''}>${state.lang === 'ko' ? '보통' : 'Moderate'}</option>
                  <option value="high" ${state.activity === 'high' ? 'selected' : ''}>${state.lang === 'ko' ? '높음' : 'High'}</option>
                </select>
              </label>
              <label>
                <span>${tr.neutered}</span>
                <select id="neutered">
                  <option value="yes" ${state.neutered === 'yes' ? 'selected' : ''}>${state.lang === 'ko' ? '예' : 'Yes'}</option>
                  <option value="no" ${state.neutered === 'no' ? 'selected' : ''}>${state.lang === 'ko' ? '아니오' : 'No'}</option>
                </select>
              </label>
              <label>
                <span>${tr.joint}</span>
                <select id="joint">
                  <option value="no" ${state.joint === 'no' ? 'selected' : ''}>${state.lang === 'ko' ? '아니오' : 'No'}</option>
                  <option value="yes" ${state.joint === 'yes' ? 'selected' : ''}>${state.lang === 'ko' ? '예' : 'Yes'}</option>
                </select>
              </label>
            </div>

            <label>
              <span>${tr.uploadLabel}</span>
              <input id="foodImage" type="file" accept="image/*">
              <span class="hint">${tr.scanFoodHint}</span>
            </label>
            <img id="preview" alt="" style="display:none;max-width:100%;border-radius:14px;border:1px solid rgba(100,116,139,.18)">
            <div class="actions">
              <button class="btn" id="foodBtn" type="button">${tr.analyzeFood}</button>
              <button class="btn" id="foodDownload" type="button" ${state.foodResult ? '' : 'disabled'}>${tr.foodReport}</button>
            </div>
            <div id="foodStatus" class="hint"></div>
            <div id="foodResult">${renderFoodResult()}</div>
          </section>

          <section class="card stack">
            <label>
              <span>${tr.reportUpload}</span>
              <input id="reportFile" type="file" accept=".html,.txt,.json,.md">
              <textarea id="reportText" placeholder="${tr.reportPaste}">${escapeHtml(state.reportText)}</textarea>
              <span class="hint">${tr.scanExerciseHint}</span>
            </label>
            <div class="actions">
              <button class="btn" id="exerciseBtn" type="button">${tr.analyzeExercise}</button>
              <button class="btn" id="exerciseDownload" type="button" ${state.exerciseResult ? '' : 'disabled'}>${tr.exerciseReport}</button>
            </div>
            <div id="exerciseStatus" class="hint"></div>
            <div id="exerciseResult">${renderExerciseResult()}</div>
          </section>
        </div>
      </div>
    `;

    document.getElementById('themeBtn').onclick = () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      savePrefs();
      render();
    };
    document.getElementById('langBtn').onclick = () => {
      state.lang = state.lang === 'ko' ? 'en' : 'ko';
      savePrefs();
      render();
    };
    document.getElementById('petType').onchange = (e) => { state.petType = e.target.value; };
    document.getElementById('breed').oninput = (e) => { state.breed = e.target.value; };
    document.getElementById('weight').oninput = (e) => { state.weight = Number(e.target.value || 0); };
    document.getElementById('age').oninput = (e) => { state.age = Number(e.target.value || 0); };
    document.getElementById('activity').onchange = (e) => { state.activity = e.target.value; };
    document.getElementById('neutered').onchange = (e) => { state.neutered = e.target.value; };
    document.getElementById('joint').onchange = (e) => { state.joint = e.target.value; };

    const foodImage = document.getElementById('foodImage');
    const preview = document.getElementById('preview');
    foodImage.onchange = async () => {
      const file = foodImage.files && foodImage.files[0];
      if (!file) return;
      state.foodImageDataUrl = await fileToDataUrl(file);
      preview.src = state.foodImageDataUrl;
      preview.style.display = 'block';
    };

    const reportFile = document.getElementById('reportFile');
    reportFile.onchange = async () => {
      const file = reportFile.files && reportFile.files[0];
      if (!file) return;
      state.reportText = await fileToText(file);
      document.getElementById('reportText').value = state.reportText;
    };
    document.getElementById('reportText').oninput = (e) => { state.reportText = e.target.value; };

    document.getElementById('foodBtn').onclick = async () => {
      const status = document.getElementById('foodStatus');
      status.textContent = tr.loading;
      try {
        const payload = {
          lang: state.lang,
          petType: state.petType,
          breed: state.breed,
          weight: state.weight,
          age: state.age,
          activity: state.activity,
          neutered: state.neutered,
          joint: state.joint,
          imageDataUrl: state.foodImageDataUrl,
        };
        const data = await callApi('/api/analyze-food', payload);
        state.foodResult = data;
        state.reportText = data.report_text || '';
        document.getElementById('foodResult').innerHTML = renderFoodResult();
        document.getElementById('foodDownload').disabled = false;
        status.textContent = tr.saveOk;
      } catch (err) {
        status.textContent = err?.message || tr.errorApi;
      }
    };

    document.getElementById('exerciseBtn').onclick = async () => {
      const status = document.getElementById('exerciseStatus');
      status.textContent = tr.loading;
      try {
        const payload = {
          lang: state.lang,
          reportText: state.reportText || '',
          foodResult: state.foodResult,
        };
        const data = await callApi('/api/analyze-exercise', payload);
        state.exerciseResult = data;
        document.getElementById('exerciseResult').innerHTML = renderExerciseResult();
        document.getElementById('exerciseDownload').disabled = false;
        status.textContent = tr.saveOk;
      } catch (err) {
        status.textContent = err?.message || tr.errorApi;
      }
    };

    document.getElementById('reportText').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || e.shiftKey)) {
        e.preventDefault();
        document.getElementById('exerciseBtn').click();
      }
    });

    document.getElementById('foodDownload').onclick = () => {
      if (!state.foodResult) return;
      downloadHtml(`food-meal-report-${state.lang}.html`, reportHtml('food', state.foodResult));
    };
    document.getElementById('exerciseDownload').onclick = () => {
      if (!state.exerciseResult) return;
      downloadHtml(`exercise-report-${state.lang}.html`, reportHtml('exercise', state.exerciseResult));
    };
  }

  render();
})();
