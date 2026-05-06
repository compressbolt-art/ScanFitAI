(() => {
  const app = document.getElementById('app');
  const prefs = {
    lang: 'scanfiai1.lang',
    theme: 'scanfiai1.theme',
  };

  const state = {
    lang: localStorage.getItem(prefs.lang) === 'en' ? 'en' : 'ko',
    theme: localStorage.getItem(prefs.theme) === 'dark' ? 'dark' : 'light',
    petType: 'dog',
    breed: '',
    weight: 3,
    age: 3,
    activity: 'moderate',
    neutered: 'yes',
    joint: 'no',
    foodImageDataUrl: '',
    foodResult: null,
    exerciseResult: null,
    reportText: '',
  };

  const I18N = {
    ko: {
      brand: 'ScanFitAI',
      eyebrow: '반려동물 식단 분석',
      title: '사료 분석, 7일 식단표, 운동처방',
      copy: '이미지 하나 올리고 품종과 체중만 넣으면, 바로 읽히는 리포트와 실전용 운동처방이 나옵니다.',
      primary: '분석 시작',
      theme: '테마',
      lang: 'English',
      foodTitle: '사료 / 식단 분석',
      foodCopy: '사료 라벨을 올리고 반려동물 정보를 넣으면 분석 결과를 만듭니다.',
      exerciseTitle: '운동처방',
      exerciseCopy: '분석 결과를 바탕으로 주간 운동과 휴식 밸런스를 계산합니다.',
      petType: '반려동물',
      breed: '품종',
      weight: '체중(kg)',
      age: '나이',
      activity: '활동량',
      neutered: '중성화',
      joint: '관절',
      upload: '사료 라벨 이미지',
      reportUpload: '리포트 텍스트',
      analyzeFood: '사료 분석',
      analyzeExercise: '운동처방 분석',
      foodDownload: '식단 리포트 다운로드',
      exerciseDownload: '운동처방 리포트 다운로드',
      reportPlaceholder: '리포트 내용을 붙여넣거나 HTML 파일을 업로드하세요',
      foodHint: '라벨 전체가 보이게 찍은 이미지를 올리면 정확도가 올라갑니다.',
      exerciseHint: '식단 리포트를 붙여넣고 Enter 또는 분석 버튼을 누르세요.',
      loading: '분석 중...',
      ready: '결과가 준비되었습니다.',
      errorApi: 'AI 분석을 실행할 수 없습니다. API 키와 Pages Functions를 확인하세요.',
      noResult: '아직 분석 결과가 없습니다.',
      summary: '요약',
      why: '근거',
      warnings: '주의사항',
      ingredients: '원료',
      analysis: '보증성분',
      daily: '1일 급여량',
      week: '7일 식단표',
      plan: '운동처방',
      intensity: '강도',
      duration: '기간',
      notes: '주의사항',
      saveOk: '분석 결과가 저장되었습니다.',
      dog: '강아지',
      cat: '고양이',
      low: '낮음',
      moderate: '보통',
      high: '높음',
      yes: '예',
      no: '아니오',
    },
    en: {
      brand: 'ScanFitAI',
      eyebrow: 'Pet food analysis',
      title: 'Food analysis, 7-day meal plan, exercise prescription',
      copy: 'Upload one image, add breed and weight, and get a readable report with a practical exercise plan.',
      primary: 'Start Analysis',
      theme: 'Theme',
      lang: '한국어',
      foodTitle: 'Food / Meal Analysis',
      foodCopy: 'Upload a label image and enter the pet profile to generate an analysis.',
      exerciseTitle: 'Exercise Prescription',
      exerciseCopy: 'Turn the food report into a weekly activity and rest balance.',
      petType: 'Pet',
      breed: 'Breed',
      weight: 'Weight (kg)',
      age: 'Age',
      activity: 'Activity',
      neutered: 'Neutered',
      joint: 'Joint',
      upload: 'Food label image',
      reportUpload: 'Report text',
      analyzeFood: 'Analyze Food',
      analyzeExercise: 'Analyze Exercise',
      foodDownload: 'Download Food Report',
      exerciseDownload: 'Download Exercise Report',
      reportPlaceholder: 'Paste the report text or upload an HTML file',
      foodHint: 'A full-frame label shot improves accuracy.',
      exerciseHint: 'Paste the meal report, then press Enter or analyze.',
      loading: 'Analyzing...',
      ready: 'Result ready.',
      errorApi: 'AI analysis is unavailable. Check the API key and Pages Functions.',
      noResult: 'No analysis result yet.',
      summary: 'Summary',
      why: 'Why',
      warnings: 'Warnings',
      ingredients: 'Ingredients',
      analysis: 'Guaranteed analysis',
      daily: 'Daily amount',
      week: '7-day meal plan',
      plan: 'Exercise plan',
      intensity: 'Intensity',
      duration: 'Duration',
      notes: 'Notes',
      saveOk: 'Analysis saved.',
      dog: 'Dog',
      cat: 'Cat',
      low: 'Low',
      moderate: 'Moderate',
      high: 'High',
      yes: 'Yes',
      no: 'No',
    },
  };

  const BREEDS = {
    dog: ['Jindo', 'Maltese', 'Poodle', 'Chihuahua', 'Shiba Inu', 'Corgi', 'Labrador Retriever', 'Golden Retriever'],
    cat: ['Korean Shorthair', 'Persian', 'Maine Coon', 'Ragdoll', 'Siamese', 'Bengal', 'British Shorthair'],
  };

  function t(key) {
    return I18N[state.lang][key] || I18N.ko[key] || key;
  }

  function savePrefs() {
    localStorage.setItem(prefs.lang, state.lang);
    localStorage.setItem(prefs.theme, state.theme);
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function listify(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') return value.split(/\n|,/).map(s => s.trim()).filter(Boolean);
    return [];
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

  async function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function fileToText(file) {
    return file.text();
  }

  async function callApi(path, payload) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'API error');
    return data;
  }

  function themeVars() {
    return state.theme === 'dark'
      ? {
          bg: '#09111c',
          bg2: '#0e1a2a',
          panel: 'rgba(12, 20, 31, 0.82)',
          panelSoft: 'rgba(15, 24, 38, 0.72)',
          line: 'rgba(148, 163, 184, 0.16)',
          text: '#f8fafc',
          muted: '#94a3b8',
          accent: '#8ef0c8',
          accent2: '#f3c45d',
          shadow: '0 24px 80px rgba(0, 0, 0, 0.35)',
        }
      : {
          bg: '#f6f2ea',
          bg2: '#fffaf1',
          panel: 'rgba(255, 255, 255, 0.82)',
          panelSoft: 'rgba(255, 255, 255, 0.68)',
          line: 'rgba(15, 23, 42, 0.10)',
          text: '#0f172a',
          muted: '#5f6b7a',
          accent: '#1f7a57',
          accent2: '#c26a17',
          shadow: '0 24px 80px rgba(15, 23, 42, 0.12)',
        };
  }

  function reportHtml(kind, obj) {
    const vars = themeVars();
    const title = kind === 'food'
      ? (state.lang === 'en' ? 'Food / Meal Report' : '사료 / 식단 리포트')
      : (state.lang === 'en' ? 'Exercise Report' : '운동처방 리포트');
    const payload = esc(JSON.stringify(obj, null, 2)).replace(/\n/g, '<br>');
    return `<!doctype html>
<html lang="${state.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <style>
    :root{color-scheme:${state.theme === 'dark' ? 'dark' : 'light'}}
    body{margin:0;font-family:Inter,system-ui,sans-serif;background:${vars.bg};color:${vars.text};}
    .page{max-width:980px;margin:0 auto;padding:32px 20px 48px;}
    .hero{display:grid;grid-template-columns:1.1fr .9fr;gap:20px;align-items:center;margin-bottom:20px}
    .title{font-size:42px;line-height:1.02;margin:0 0 12px;font-weight:800;letter-spacing:-.03em}
    .copy{font-size:16px;line-height:1.7;color:${vars.muted};max-width:62ch}
    .sheet{background:${vars.panel};border:1px solid ${vars.line};border-radius:24px;padding:22px;box-shadow:${vars.shadow}}
    .sheet h2{margin:0 0 12px;font-size:18px}
    pre{margin:0;white-space:pre-wrap;word-break:break-word;font:13px/1.7 ui-monospace,SFMono-Regular,Menlo,monospace;background:${vars.bg2};border:1px solid ${vars.line};padding:16px;border-radius:18px}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:18px}
    .metric{padding:14px;border-radius:18px;background:${vars.bg2};border:1px solid ${vars.line}}
    .metric span{display:block;font-size:12px;color:${vars.muted};margin-bottom:6px}
    .metric strong{font-size:18px}
    @media (max-width:900px){.hero{grid-template-columns:1fr}.grid{grid-template-columns:1fr 1fr}}
    @media (max-width:640px){.title{font-size:34px}.grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <div class="page">
    <section class="hero">
      <div>
        <p style="margin:0 0 8px;color:${vars.accent};font-weight:800;letter-spacing:.08em;text-transform:uppercase">ScanFitAI</p>
        <h1 class="title">${title}</h1>
        <p class="copy">${state.lang === 'en' ? 'A clean, printable report layout for pet nutrition and exercise guidance.' : '반려동물 식단과 운동처방을 바로 읽을 수 있는 간결한 리포트 레이아웃입니다.'}</p>
      </div>
      <div class="sheet">
        <div class="grid">
          <div class="metric"><span>${state.lang === 'en' ? 'Species' : '반려동물'}</span><strong>${esc(obj.species_label || obj.breed_label || '-')}</strong></div>
          <div class="metric"><span>${state.lang === 'en' ? 'Daily amount' : '1일 급여량'}</span><strong>${esc(obj.daily_amount || obj.plan_text || '-')}</strong></div>
          <div class="metric"><span>${state.lang === 'en' ? 'Status' : '상태'}</span><strong>${state.lang === 'en' ? 'Ready' : '완료'}</strong></div>
        </div>
      </div>
    </section>
    <section class="sheet">
      <h2>${state.lang === 'en' ? 'Report' : '리포트'}</h2>
      <pre>${payload}</pre>
    </section>
  </div>
</body>
</html>`;
  }

  function renderFoodResult() {
    const res = state.foodResult;
    if (!res) {
      return `<div class="empty">${t('noResult')}</div>`;
    }
    const ingredients = listify(res.ingredients);
    const warnings = listify(res.warnings);
    const analysis = listify(res.guaranteed_analysis);
    const summary = res.report_text || res.food_estimate || res.summary || '';
    const plan = res.week_plan_text || '';
    return `
      <div class="result-hero">
        <div>
          <div class="eyebrow">${state.lang === 'en' ? 'Food analysis' : '사료 분석'}</div>
          <h3>${esc(res.species_label || res.breed_label || state.breed || t('foodTitle'))}</h3>
          <p>${esc(summary)}</p>
        </div>
        <div class="result-actions">
          <button class="pill-btn" id="foodDownload" type="button">${t('foodDownload')}</button>
        </div>
      </div>
      <div class="mini-grid">
        <div class="mini"><span>${t('daily')}</span><strong>${esc(res.daily_amount || '-')}</strong></div>
        <div class="mini"><span>${t('summary')}</span><strong>${esc(res.food_estimate || res.summary || '-')}</strong></div>
        <div class="mini"><span>${t('why')}</span><strong>${esc(res.rationale || '-')}</strong></div>
      </div>
      <div class="detail-grid">
        <section class="detail">
          <h4>${t('ingredients')}</h4>
          <div class="chips">${ingredients.length ? ingredients.map(v => `<span class="chip">${esc(v)}</span>`).join('') : `<span class="muted">${state.lang === 'en' ? 'No ingredient list returned.' : '원료 정보가 없습니다.'}</span>`}</div>
        </section>
        <section class="detail">
          <h4>${t('analysis')}</h4>
          <div class="chips">${analysis.length ? analysis.map(v => `<span class="chip">${esc(v)}</span>`).join('') : `<span class="muted">${state.lang === 'en' ? 'No guaranteed analysis returned.' : '보증성분 정보가 없습니다.'}</span>`}</div>
        </section>
      </div>
      <section class="detail">
        <h4>${t('week')}</h4>
        <pre class="plain">${esc(plan)}</pre>
      </section>
      <section class="detail">
        <h4>${t('warnings')}</h4>
        <div class="chips">${warnings.length ? warnings.map(v => `<span class="chip chip-warn">${esc(v)}</span>`).join('') : `<span class="muted">${state.lang === 'en' ? 'No warnings returned.' : '주의사항이 없습니다.'}</span>`}</div>
      </section>
    `;
  }

  function renderExerciseResult() {
    const res = state.exerciseResult;
    if (!res) {
      return `<div class="empty">${t('noResult')}</div>`;
    }
    return `
      <div class="result-hero">
        <div>
          <div class="eyebrow">${state.lang === 'en' ? 'Exercise prescription' : '운동처방'}</div>
          <h3>${esc(res.summary || t('exerciseTitle'))}</h3>
          <p>${esc(res.report_text || res.notes || '')}</p>
        </div>
        <div class="result-actions">
          <button class="pill-btn" id="exerciseDownload" type="button">${t('exerciseDownload')}</button>
        </div>
      </div>
      <div class="mini-grid">
        <div class="mini"><span>${t('intensity')}</span><strong>${esc(res.intensity || '-')}</strong></div>
        <div class="mini"><span>${t('duration')}</span><strong>${esc(res.duration || '-')}</strong></div>
        <div class="mini"><span>${t('notes')}</span><strong>${esc(res.notes || '-')}</strong></div>
      </div>
      <section class="detail">
        <h4>${t('plan')}</h4>
        <pre class="plain">${esc(res.plan_text || '')}</pre>
      </section>
    `;
  }

  function render() {
    const vars = themeVars();
    document.documentElement.lang = state.lang === 'en' ? 'en' : 'ko';
    document.body.dataset.theme = state.theme;
    document.body.style.margin = '0';
    document.body.style.color = vars.text;
    document.body.style.background = `
      radial-gradient(circle at top left, rgba(31,122,87,.14), transparent 34%),
      radial-gradient(circle at 80% 18%, rgba(194,106,23,.12), transparent 26%),
      linear-gradient(180deg, ${vars.bg2}, ${vars.bg})
    `;
    document.body.style.fontFamily = 'Manrope, Inter, system-ui, sans-serif';

    app.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&display=swap');
        :root{
          --bg:${vars.bg};
          --bg2:${vars.bg2};
          --panel:${vars.panel};
          --panel-soft:${vars.panelSoft};
          --line:${vars.line};
          --text:${vars.text};
          --muted:${vars.muted};
          --accent:${vars.accent};
          --accent2:${vars.accent2};
          --shadow:${vars.shadow};
        }
        *{box-sizing:border-box}
        a,button,input,select,textarea{font:inherit}
        button{cursor:pointer}
        .page{min-height:100vh;position:relative;overflow:hidden}
        .page::before{
          content:"";
          position:absolute;inset:0;
          background:
            linear-gradient(transparent 31px, rgba(148,163,184,.08) 32px),
            linear-gradient(90deg, transparent 31px, rgba(148,163,184,.08) 32px);
          background-size:32px 32px;
          mask-image:linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,0) 70%);
          pointer-events:none;
          opacity:.28;
        }
        .shell{position:relative;max-width:1200px;margin:0 auto;padding:22px 18px 36px}
        .topbar{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;padding:8px 0 18px}
        .brand{display:flex;align-items:center;gap:10px;font-weight:900;letter-spacing:-.03em;font-size:18px}
        .brand-mark{width:14px;height:14px;border-radius:999px;background:linear-gradient(135deg,var(--accent),var(--accent2));box-shadow:0 0 0 4px rgba(255,255,255,.06)}
        .toolbar{display:flex;gap:10px;flex-wrap:wrap}
        .toggle,.cta,.pill-btn{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:10px 14px;box-shadow:var(--shadow)}
        .toggle{display:inline-flex;align-items:center;gap:8px}
        .cta{background:linear-gradient(135deg,var(--accent),#2fa272);color:#fff;border-color:transparent;font-weight:800;text-decoration:none}
        .hero{display:grid;grid-template-columns:1.2fr .8fr;gap:18px;align-items:stretch;margin:12px 0 18px}
        .hero-copy,.hero-art,.panel{border:1px solid var(--line);background:var(--panel);backdrop-filter:blur(16px);border-radius:28px;box-shadow:var(--shadow)}
        .hero-copy{padding:28px 28px 24px;display:grid;gap:18px}
        .eyebrow{font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:var(--accent)}
        h1,h2,h3,h4,p{margin:0}
        h1{font-size:clamp(34px,5vw,64px);line-height:1.02;letter-spacing:-.05em}
        .lede{font-size:16px;line-height:1.75;max-width:62ch;color:var(--muted)}
        .stat-row{display:flex;gap:10px;flex-wrap:wrap}
        .stat{padding:10px 12px;border-radius:999px;border:1px solid var(--line);background:var(--panel-soft);font-size:13px;color:var(--muted);font-weight:700}
        .hero-art{position:relative;min-height:320px;overflow:hidden;display:grid;place-items:center;padding:22px}
        .art-stage{position:relative;width:min(100%,360px);aspect-ratio:1/1;perspective:1200px}
        .sheet{
          position:absolute;left:50%;top:50%;
          width:78%;height:70%;
          transform-style:preserve-3d;
          border-radius:28px;
          border:1px solid rgba(255,255,255,.25);
          background:
            linear-gradient(145deg, rgba(255,255,255,.92), rgba(237,242,247,.8)),
            linear-gradient(135deg, rgba(31,122,87,.14), transparent 55%);
          box-shadow:0 24px 50px rgba(15,23,42,.18);
        }
        .sheet.one{transform:translate(-52%,-48%) rotateX(12deg) rotateY(-18deg) translateZ(24px)}
        .sheet.two{transform:translate(-46%,-40%) rotateX(18deg) rotateY(-12deg) translateZ(10px);opacity:.78}
        .sheet.three{transform:translate(-40%,-32%) rotateX(24deg) rotateY(-6deg);opacity:.55}
        .report-card{
          position:absolute;left:50%;top:50%;
          width:66%;height:58%;
          transform:translate(-50%,-52%) rotateX(16deg) rotateY(-22deg) translateZ(60px);
          border-radius:24px;
          background:
            linear-gradient(180deg, rgba(9,17,28,.96), rgba(15,23,42,.96));
          border:1px solid rgba(255,255,255,.12);
          color:#f8fafc;
          padding:18px;
          box-shadow:0 28px 60px rgba(0,0,0,.28);
          display:grid;
          gap:12px;
        }
        .report-top{display:flex;justify-content:space-between;gap:10px;align-items:center}
        .badge{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8ef0c8;font-weight:900}
        .score{padding:8px 10px;border-radius:999px;background:rgba(142,240,200,.12);color:#8ef0c8;font-size:12px;font-weight:800}
        .bars{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;align-items:end;flex:1}
        .bar{border-radius:16px 16px 8px 8px;background:linear-gradient(180deg,#8ef0c8,#2ca57a);min-height:24px}
        .bar:nth-child(2){min-height:42px}
        .bar:nth-child(3){min-height:58px}
        .bar:nth-child(4){min-height:34px}
        .report-foot{display:flex;justify-content:space-between;gap:10px;align-items:center;color:rgba(248,250,252,.82);font-size:13px}
        .grid{display:grid;grid-template-columns:minmax(0,.95fr) minmax(0,1.05fr);gap:18px;align-items:start}
        .panel{padding:20px}
        .panel h2{font-size:18px;line-height:1.2;letter-spacing:-.03em;margin-bottom:8px}
        .panel p{color:var(--muted);line-height:1.6;margin-bottom:14px}
        .field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
        .field{display:grid;gap:7px}
        label{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
        input,select,textarea{
          width:100%;border:1px solid var(--line);background:var(--panel-soft);color:var(--text);
          border-radius:16px;padding:12px 13px;outline:none
        }
        textarea{min-height:96px;resize:vertical}
        input:focus,select:focus,textarea:focus{border-color:rgba(31,122,87,.5);box-shadow:0 0 0 4px rgba(31,122,87,.12)}
        .wide{grid-column:1/-1}
        .upload-row{display:grid;gap:10px}
        .preview{
          display:block;width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:18px;
          border:1px solid var(--line);background:var(--bg2)
        }
        .actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
        .action{
          border:none;border-radius:999px;padding:12px 16px;font-weight:800;
          background:linear-gradient(135deg,var(--accent),#2fa272);color:#fff;box-shadow:var(--shadow)
        }
        .action.secondary{background:var(--panel-soft);border:1px solid var(--line);color:var(--text)}
        .status{font-size:13px;color:var(--muted);min-height:18px}
        .result-shell{display:grid;gap:14px}
        .result-hero{
          display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;
          padding:18px;border-radius:22px;border:1px solid var(--line);background:linear-gradient(180deg,rgba(255,255,255,.06),transparent)
        }
        .result-hero h3{font-size:22px;letter-spacing:-.04em;margin:3px 0 8px}
        .result-hero p{margin:0;max-width:60ch;color:var(--muted);line-height:1.65}
        .result-actions{display:flex;gap:10px;align-items:center}
        .mini-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
        .mini{padding:14px;border-radius:18px;background:var(--panel-soft);border:1px solid var(--line)}
        .mini span{display:block;font-size:12px;color:var(--muted);margin-bottom:8px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
        .mini strong{font-size:15px;line-height:1.5;display:block}
        .detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
        .detail{padding:16px;border-radius:18px;border:1px solid var(--line);background:var(--panel-soft)}
        .detail h4{font-size:14px;margin-bottom:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
        .chips{display:flex;flex-wrap:wrap;gap:8px}
        .chip{padding:9px 11px;border-radius:999px;border:1px solid var(--line);background:var(--bg2);font-size:13px}
        .chip-warn{background:rgba(194,106,23,.09)}
        .plain{margin:0;white-space:pre-wrap;word-break:break-word;line-height:1.7;color:var(--text);font-size:14px}
        .empty{padding:18px;border-radius:18px;border:1px dashed var(--line);color:var(--muted)}
        @media (max-width: 1024px){
          .hero,.grid{grid-template-columns:1fr}
          .hero-art{min-height:280px}
        }
        @media (max-width: 720px){
          .shell{padding:16px 12px 28px}
          .hero-copy,.panel{padding:18px}
          .field-grid,.mini-grid,.detail-grid{grid-template-columns:1fr}
          h1{font-size:clamp(30px,10vw,44px)}
        }
      </style>

      <div class="page">
        <div class="shell">
          <header class="topbar">
            <div class="brand"><span class="brand-mark"></span><span>${t('brand')}</span></div>
            <div class="toolbar">
              <button class="toggle" id="themeBtn" type="button">${t('theme')} · ${state.theme === 'dark' ? 'Dark' : 'Light'}</button>
              <button class="toggle" id="langBtn" type="button">${state.lang === 'ko' ? 'EN' : 'KR'}</button>
              <a class="cta" href="#analysis">${t('primary')}</a>
            </div>
          </header>

          <section class="hero">
            <div class="hero-copy">
              <div>
                <div class="eyebrow">${t('eyebrow')}</div>
                <h1>${t('title')}</h1>
              </div>
              <p class="lede">${t('copy')}</p>
              <div class="stat-row">
                <span class="stat">${state.lang === 'ko' ? '1장 업로드' : 'One upload'}</span>
                <span class="stat">${state.lang === 'ko' ? '7일 식단표' : '7-day meal plan'}</span>
                <span class="stat">${state.lang === 'ko' ? '운동처방 포함' : 'Exercise included'}</span>
              </div>
            </div>
            <div class="hero-art" aria-hidden="true">
              <div class="art-stage">
                <div class="sheet three"></div>
                <div class="sheet two"></div>
                <div class="sheet one"></div>
                <div class="report-card">
                  <div class="report-top">
                    <div>
                      <div class="badge">ScanFitAI</div>
                      <div style="font-size:18px;font-weight:800;letter-spacing:-.03em;margin-top:6px">${state.lang === 'ko' ? '입체 리포트' : '3D Report'}</div>
                    </div>
                    <div class="score">${state.lang === 'ko' ? 'READY' : 'READY'}</div>
                  </div>
                  <div class="bars">
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                  </div>
                  <div class="report-foot">
                    <span>${state.lang === 'ko' ? '사료 분석' : 'Food analysis'}</span>
                    <span>${state.lang === 'ko' ? '운동처방' : 'Exercise'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="grid" id="analysis">
            <div class="panel">
              <h2>${t('foodTitle')}</h2>
              <p>${t('foodCopy')}</p>
              <div class="field-grid">
                <div class="field">
                  <label for="petType">${t('petType')}</label>
                  <select id="petType">
                    <option value="dog" ${state.petType === 'dog' ? 'selected' : ''}>${t('dog')}</option>
                    <option value="cat" ${state.petType === 'cat' ? 'selected' : ''}>${t('cat')}</option>
                  </select>
                </div>
                <div class="field">
                  <label for="breed">${t('breed')}</label>
                  <input id="breed" list="breedList" value="${esc(state.breed)}" placeholder="${state.lang === 'ko' ? '예: 말티즈 / 치와와 / 믹스' : 'e.g. Maltese / Chihuahua / Mix'}">
                  <datalist id="breedList">
                    ${BREEDS[state.petType].map(v => `<option value="${esc(v)}"></option>`).join('')}
                  </datalist>
                </div>
                <div class="field">
                  <label for="weight">${t('weight')}</label>
                  <input id="weight" type="number" min="0.1" step="0.1" value="${state.weight}">
                </div>
                <div class="field">
                  <label for="age">${t('age')}</label>
                  <input id="age" type="number" min="0.1" step="0.1" value="${state.age}">
                </div>
                <div class="field">
                  <label for="activity">${t('activity')}</label>
                  <select id="activity">
                    <option value="low" ${state.activity === 'low' ? 'selected' : ''}>${t('low')}</option>
                    <option value="moderate" ${state.activity === 'moderate' ? 'selected' : ''}>${t('moderate')}</option>
                    <option value="high" ${state.activity === 'high' ? 'selected' : ''}>${t('high')}</option>
                  </select>
                </div>
                <div class="field">
                  <label for="neutered">${t('neutered')}</label>
                  <select id="neutered">
                    <option value="yes" ${state.neutered === 'yes' ? 'selected' : ''}>${t('yes')}</option>
                    <option value="no" ${state.neutered === 'no' ? 'selected' : ''}>${t('no')}</option>
                  </select>
                </div>
                <div class="field wide">
                  <label for="joint">${t('joint')}</label>
                  <select id="joint">
                    <option value="no" ${state.joint === 'no' ? 'selected' : ''}>${t('no')}</option>
                    <option value="yes" ${state.joint === 'yes' ? 'selected' : ''}>${t('yes')}</option>
                  </select>
                </div>
                <div class="field wide upload-row">
                  <label for="foodImage">${t('upload')}</label>
                  <input id="foodImage" type="file" accept="image/*">
                  <span style="font-size:13px;color:var(--muted)">${t('foodHint')}</span>
                  <img id="preview" class="preview" alt="" src="${esc(state.foodImageDataUrl)}" style="display:${state.foodImageDataUrl ? 'block' : 'none'}">
                </div>
                <div class="field wide">
                  <div class="actions">
                    <button class="action" id="foodBtn" type="button">${t('analyzeFood')}</button>
                    <button class="action secondary" id="foodDownload" type="button" ${state.foodResult ? '' : 'disabled'}>${t('foodDownload')}</button>
                  </div>
                </div>
                <div class="field wide">
                  <div id="foodStatus" class="status"></div>
                </div>
              </div>

              <div class="result-shell" style="margin-top:16px">
                ${renderFoodResult()}
              </div>
            </div>

            <div class="panel">
              <h2>${t('exerciseTitle')}</h2>
              <p>${t('exerciseCopy')}</p>
              <div class="field-grid">
                <div class="field wide">
                  <label for="reportFile">${t('reportUpload')}</label>
                  <input id="reportFile" type="file" accept=".html,.txt,.json,.md">
                  <textarea id="reportText" placeholder="${t('reportPlaceholder')}">${esc(state.reportText)}</textarea>
                  <span style="font-size:13px;color:var(--muted)">${t('exerciseHint')}</span>
                </div>
                <div class="field wide">
                  <div class="actions">
                    <button class="action" id="exerciseBtn" type="button">${t('analyzeExercise')}</button>
                    <button class="action secondary" id="exerciseDownload" type="button" ${state.exerciseResult ? '' : 'disabled'}>${t('exerciseDownload')}</button>
                  </div>
                </div>
                <div class="field wide">
                  <div id="exerciseStatus" class="status"></div>
                </div>
              </div>

              <div class="result-shell" style="margin-top:16px">
                ${renderExerciseResult()}
              </div>
            </div>
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

    document.getElementById('petType').onchange = (e) => {
      state.petType = e.target.value === 'cat' ? 'cat' : 'dog';
      render();
    };

    document.getElementById('breed').oninput = (e) => {
      state.breed = e.target.value;
    };

    document.getElementById('weight').oninput = (e) => {
      state.weight = Number(e.target.value || 0);
    };

    document.getElementById('age').oninput = (e) => {
      state.age = Number(e.target.value || 0);
    };

    document.getElementById('activity').onchange = (e) => {
      state.activity = e.target.value;
    };

    document.getElementById('neutered').onchange = (e) => {
      state.neutered = e.target.value;
    };

    document.getElementById('joint').onchange = (e) => {
      state.joint = e.target.value;
    };

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
    const reportText = document.getElementById('reportText');
    reportFile.onchange = async () => {
      const file = reportFile.files && reportFile.files[0];
      if (!file) return;
      state.reportText = await fileToText(file);
      reportText.value = state.reportText;
    };
    reportText.oninput = (e) => {
      state.reportText = e.target.value;
    };
    reportText.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || e.shiftKey)) {
        e.preventDefault();
        document.getElementById('exerciseBtn').click();
      }
    });

    document.getElementById('foodBtn').onclick = async () => {
      const status = document.getElementById('foodStatus');
      status.textContent = t('loading');
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
        status.textContent = t('saveOk');
        render();
      } catch (err) {
        status.textContent = err?.message || t('errorApi');
      }
    };

    document.getElementById('exerciseBtn').onclick = async () => {
      const status = document.getElementById('exerciseStatus');
      status.textContent = t('loading');
      try {
        const payload = {
          lang: state.lang,
          reportText: state.reportText || '',
          foodResult: state.foodResult,
        };
        const data = await callApi('/api/analyze-exercise', payload);
        state.exerciseResult = data;
        status.textContent = t('saveOk');
        render();
      } catch (err) {
        status.textContent = err?.message || t('errorApi');
      }
    };

    const foodDownload = document.getElementById('foodDownload');
    if (foodDownload) {
      foodDownload.onclick = () => {
        if (!state.foodResult) return;
        downloadHtml(`ScanFitAI_Food_Report_${state.lang}.html`, reportHtml('food', state.foodResult));
      };
    }

    const exerciseDownload = document.getElementById('exerciseDownload');
    if (exerciseDownload) {
      exerciseDownload.onclick = () => {
        if (!state.exerciseResult) return;
        downloadHtml(`ScanFitAI_Exercise_Report_${state.lang}.html`, reportHtml('exercise', state.exerciseResult));
      };
    }
  }

  render();
})();
