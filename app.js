(() => {
  const app = document.getElementById('app');
  const state = {
    lang: localStorage.getItem('scanfiai1.lang') || 'ko',
    theme: localStorage.getItem('scanfiai1.theme') || 'light',
    petType: 'dog',
    weight: 3,
  };

  const i18n = {
    ko: {
      title: 'ScanFitAI',
      dog: '강아지',
      cat: '고양이',
      weight: '중량 (kg)',
      analyze: '분석',
      report: '리포트 다운로드',
      themeLight: '낮',
      themeDark: '밤',
      langKo: '한국어',
      langEn: '영어',
      summary: (type, weight) => `${type} ${weight}kg 기준 분석 결과를 표시합니다.`,
    },
    en: {
      title: 'ScanFitAI',
      dog: 'Dog',
      cat: 'Cat',
      weight: 'Weight (kg)',
      analyze: 'Analyze',
      report: 'Download report',
      themeLight: 'Day',
      themeDark: 'Night',
      langKo: 'Korean',
      langEn: 'English',
      summary: (type, weight) => `Showing analysis results for a ${type.toLowerCase()} at ${weight} kg.`,
    },
  };

  const t = () => i18n[state.lang];
  const save = () => {
    localStorage.setItem('scanfiai1.lang', state.lang);
    localStorage.setItem('scanfiai1.theme', state.theme);
  };

  function render() {
    const tr = t();
    document.documentElement.lang = state.lang === 'ko' ? 'ko' : 'en';
    document.body.style.margin = '0';
    document.body.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    document.body.style.background = state.theme === 'dark' ? '#111' : '#f4f5f7';
    document.body.style.color = state.theme === 'dark' ? '#f4f5f7' : '#111';
    app.innerHTML = `
      <main style="max-width:860px;margin:0 auto;padding:16px;">
        <header style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;">
          <h1 style="font-size:24px;margin:0;">${tr.title}</h1>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button id="themeBtn" type="button">${state.theme === 'dark' ? tr.themeDark : tr.themeLight}</button>
            <button id="langBtn" type="button">${state.lang === 'ko' ? tr.langEn : tr.langKo}</button>
          </div>
        </header>
        <section style="margin-top:16px;display:grid;gap:12px;background:${state.theme === 'dark' ? '#1b1b1b' : '#fff'};padding:16px;border-radius:12px;">
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="pet" data-pet="dog" type="button">${tr.dog}</button>
            <button class="pet" data-pet="cat" type="button">${tr.cat}</button>
          </div>
          <label style="display:grid;gap:6px;max-width:240px;">
            <span>${tr.weight}</span>
            <input id="weightInput" type="number" min="0.1" step="0.1" value="${state.weight}" style="padding:10px;border-radius:8px;border:1px solid #999;">
          </label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button id="analyzeBtn" type="button">${tr.analyze}</button>
            <button id="downloadBtn" type="button">${tr.report}</button>
          </div>
          <div id="result" style="white-space:pre-wrap;line-height:1.5;"></div>
        </section>
      </main>
    `;
    document.getElementById('themeBtn').onclick = () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; save(); render(); };
    document.getElementById('langBtn').onclick = () => { state.lang = state.lang === 'ko' ? 'en' : 'ko'; save(); render(); };
    document.querySelectorAll('.pet').forEach((btn) => {
      btn.style.padding = '10px 12px';
      btn.style.borderRadius = '8px';
      btn.style.border = btn.dataset.pet === state.petType ? '2px solid #2563eb' : '1px solid #999';
      btn.onclick = () => { state.petType = btn.dataset.pet; render(); };
    });
    document.getElementById('analyzeBtn').onclick = () => {
      const weight = Number(document.getElementById('weightInput').value || state.weight);
      state.weight = weight;
      document.getElementById('result').textContent = tr.summary(state.petType === 'dog' ? tr.dog : tr.cat, weight);
      save();
    };
    document.getElementById('downloadBtn').onclick = () => {
      const weight = Number(document.getElementById('weightInput').value || state.weight);
      const text = tr.summary(state.petType === 'dog' ? tr.dog : tr.cat, weight);
      const blob = new Blob([`<html><body><p>${text}</p></body></html>`], { type: 'text/html;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'scanfitai-report.html';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    };
  }

  render();
})();
