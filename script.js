// ── AOS (Animate on Scroll) ──
function initAOS() {
  const els = document.querySelectorAll('.aos');
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => observer.observe(el));
}

// ── COUNTER ANIMATION ──
function animateCounter(el, target, suffix = '', decimals = 0) {
  const duration = 1800;
  const start = performance.now();
  function update(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const val = target * ease;
    el.textContent = decimals > 0 ? val.toFixed(decimals) + suffix : Math.round(val) + suffix;
    if (p < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.counter);
        const suffix = el.dataset.suffix || '';
        const decimals = parseInt(el.dataset.decimals || '0');
        animateCounter(el, target, suffix, decimals);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
}

// ── CASE CARDS EXPAND ──
function initCaseCards() {
  document.querySelectorAll('.case-card').forEach(card => {
    card.addEventListener('click', () => {
      const wasExpanded = card.classList.contains('expanded');
      document.querySelectorAll('.case-card').forEach(c => c.classList.remove('expanded'));
      if (!wasExpanded) card.classList.add('expanded');
    });
  });
}

// ── DOCTOR AUTH SIMULATION ──
let doctorVerified = false;

function initDoctorPortal() {
  const verifyBtn = document.getElementById('verify-btn');
  const licenseInput = document.getElementById('license-input');
  const qrScanBtn = document.getElementById('qr-scan-btn');
  const verifyStep = document.getElementById('verify-step');
  const recordView = document.getElementById('doctor-record-view');
  const scanStep = document.getElementById('scan-step');

  if (!verifyBtn) return;

  qrScanBtn && qrScanBtn.addEventListener('click', () => {
    if (scanStep) {
      scanStep.style.display = 'none';
      verifyStep.style.display = 'block';
      verifyStep.style.opacity = 0;
      setTimeout(() => {
        verifyStep.style.transition = 'opacity 0.4s';
        verifyStep.style.opacity = 1;
      }, 50);
    }
  });

  verifyBtn.addEventListener('click', () => {
    const val = licenseInput.value.trim();
    if (val.length < 4) {
      licenseInput.style.borderColor = 'var(--danger)';
      setTimeout(() => licenseInput.style.borderColor = '', 1000);
      return;
    }
    licenseInput.classList.add('verified');
    licenseInput.value = 'MCI-' + val.toUpperCase().replace(/[^A-Z0-9]/g,'').padEnd(8, '0').slice(0,8);
    verifyBtn.textContent = 'Verified';
    verifyBtn.style.background = 'var(--green)';
    verifyBtn.style.color = 'var(--black)';
    doctorVerified = true;

    setTimeout(() => {
      verifyStep.style.display = 'none';
      recordView.style.display = 'block';
      recordView.style.opacity = 0;
      setTimeout(() => {
        recordView.style.transition = 'opacity 0.5s';
        recordView.style.opacity = 1;
      }, 50);
    }, 900);
  });

  // Also allow Enter key
  licenseInput && licenseInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') verifyBtn.click();
  });
}

// ── AI SYMPTOM MATCHER ──
const aiCaseDB = [
  {
    title: 'Periodic Fever Syndrome (PFAPA)',
    score: 92,
    desc: 'Autoimmune-driven periodic fever with pharyngitis, adenitis — matches cyclical fever + fatigue pattern.',
    differentials: ['TRAPS (TNF receptor-associated)', 'Cyclic Neutropenia', 'Adult-onset Stills Disease']
  },
  {
    title: 'Systemic Lupus Erythematosus (SLE)',
    score: 78,
    desc: 'Multi-system autoimmune condition matching joint pain, fatigue, and neurological involvement pattern.',
    differentials: ['Mixed Connective Tissue Disease', 'Fibromyalgia', 'Reactive Arthritis']
  },
  {
    title: 'Postural Tachycardia Syndrome (PoTS)',
    score: 64,
    desc: 'Dysautonomia variant — matches dizziness, fatigue, and palpitation symptom cluster post-viral.',
    differentials: ['Orthostatic Hypotension', 'Chronic Fatigue Syndrome', 'Adrenal Insufficiency']
  }
];

let activeSymptoms = [];

function renderSymptomTags() {
  const container = document.getElementById('symptom-tags');
  if (!container) return;
  container.innerHTML = activeSymptoms.map((s, i) => `
    <span class="symptom-tag-item">
      ${s}
      <span class="remove" data-idx="${i}">x</span>
    </span>
  `).join('');
  container.querySelectorAll('.remove').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = parseInt(e.target.dataset.idx);
      activeSymptoms.splice(idx, 1);
      renderSymptomTags();
    });
  });
}

function renderAIResults() {
  const container = document.getElementById('ai-results');
  if (!container) return;

  if (activeSymptoms.length === 0) {
    container.innerHTML = `
      <div class="results-placeholder">
        <div style="width:24px;height:24px;border:2px solid var(--text-muted);border-radius:50%;margin:0 auto"></div>
        Add symptoms and run analysis
      </div>`;
    return;
  }

  container.innerHTML = `
    <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:14px;">
      Analysing ${activeSymptoms.length} symptom${activeSymptoms.length>1?'s':''} against 4,219 cases...
    </div>
    ${aiCaseDB.map(c => `
      <div class="match-result">
        <div class="match-header">
          <span class="match-title">${c.title}</span>
          <span class="match-score">${c.score}%</span>
        </div>
        <div class="match-bar"><div class="match-bar-fill" style="width:${c.score}%"></div></div>
        <div class="match-desc">${c.desc}</div>
        <ul class="differential-list" style="margin-top:8px">
          ${c.differentials.map(d => `<li>${d}</li>`).join('')}
        </ul>
      </div>
    `).join('')}
    <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
      Analysis complete — consult licensed physician before acting on results.
    </div>
  `;
}

function initAIEngine() {
  const addBtn = document.getElementById('add-symptom-btn');
  const input = document.getElementById('symptom-input');
  const runBtn = document.getElementById('run-analysis-btn');

  if (!addBtn) return;

  function addSymptom() {
    const val = input.value.trim();
    if (val && !activeSymptoms.includes(val)) {
      activeSymptoms.push(val);
      renderSymptomTags();
      input.value = '';
    }
  }

  addBtn.addEventListener('click', addSymptom);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') addSymptom(); });

  // Quick-add preset symptoms
  document.querySelectorAll('.preset-symptom').forEach(btn => {
    btn.addEventListener('click', () => {
      const sym = btn.textContent.trim();
      if (!activeSymptoms.includes(sym)) {
        activeSymptoms.push(sym);
        renderSymptomTags();
      }
    });
  });

  runBtn && runBtn.addEventListener('click', () => {
    renderAIResults();
  });

  renderAIResults();
}

// ── DASHBOARD TAB NAVIGATION ──
function initDashboardNav() {
  document.querySelectorAll('.sidebar-nav a[data-tab]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const tab = link.dataset.tab;
      document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.dashboard-tab').forEach(t => t.style.display = 'none');
      const target = document.getElementById('tab-' + tab);
      if (target) target.style.display = 'block';
    });
  });
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initAOS();
  initCounters();
  initCaseCards();
  initDoctorPortal();
  initAIEngine();
  initDashboardNav();
});