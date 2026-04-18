const API = 'http://127.0.0.1:8000';

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

// ── LOAD STATS FROM API ──
async function loadStats() {
  try {
    const res = await fetch(`${API}/api/stats`);
    const stats = await res.json();

    // Update all data-counter elements with live values from the API
    const map = {
      'retrieval_time_seconds': { suffix: 's', decimals: 1 },
      'rare_cases_solved':      { suffix: '',  decimals: 0 },
      'countries_active':       { suffix: '',  decimals: 0 },
      'cases_in_db':            { suffix: '',  decimals: 0 },
    };

    document.querySelectorAll('[data-stat]').forEach(el => {
      const key = el.dataset.stat;
      if (stats[key] !== undefined) {
        const { suffix, decimals } = map[key] || { suffix: '', decimals: 0 };
        el.dataset.counter = stats[key];
        el.dataset.suffix  = suffix;
        el.dataset.decimals = decimals;
      }
    });
  } catch (err) {
    console.warn('Could not load stats from API — using hardcoded fallback values.', err);
  }
}

// ── LOAD PATIENT DATA FROM API ──
async function loadPatient(vid = 'VID-8842-KX') {
  try {
    const res = await fetch(`${API}/api/patient/${vid}`);
    if (!res.ok) return;
    const p = await res.json();

    // QR card
    setText('qr-patient-name', p.name);
    setText('qr-patient-vid', p.vid);
    setText('qr-patient-blood', p.blood_group);
    const criticalAllergy = p.critical_allergies?.[0]?.name?.split('/')[0].trim() || '—';
    setText('qr-patient-allergy', criticalAllergy);

    // Dashboard header
    setText('dash-patient-name', `${p.name} (${p.vid})`);
    setText('dash-sidebar-name', p.name);
    setText('dash-sidebar-vid', p.vid);
    setText('dash-sidebar-blood', `${p.blood_group} Blood Group`);
    setText('dash-age', p.age);
    setText('dash-height', p.height);
    setText('dash-weight', p.weight);

  } catch (err) {
    console.warn('Could not load patient data from API.', err);
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? '—';
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

// ── DOCTOR AUTH — calls the API ──
async function initDoctorPortal() {
  const verifyBtn   = document.getElementById('verify-btn');
  const licenseInput = document.getElementById('license-input');
  const qrScanBtn   = document.getElementById('qr-scan-btn');
  const verifyStep  = document.getElementById('verify-step');
  const recordView  = document.getElementById('doctor-record-view');
  const scanStep    = document.getElementById('scan-step');

  if (!verifyBtn) return;

  qrScanBtn?.addEventListener('click', () => {
    scanStep.style.display = 'none';
    verifyStep.style.display = 'block';
    verifyStep.style.opacity = 0;
    setTimeout(() => {
      verifyStep.style.transition = 'opacity 0.4s';
      verifyStep.style.opacity = 1;
    }, 50);
  });

  verifyBtn.addEventListener('click', async () => {
    const val = licenseInput.value.trim();
    if (val.length < 4) {
      licenseInput.style.borderColor = 'var(--danger)';
      setTimeout(() => licenseInput.style.borderColor = '', 1000);
      return;
    }

    verifyBtn.textContent = 'Verifying...';
    verifyBtn.disabled = true;

    try {
      const res = await fetch(`${API}/api/doctor/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_no: val, vid: 'VID-8842-KX' }),
      });

      if (!res.ok) throw new Error('Verification failed');

      const data = await res.json();

      licenseInput.value = data.doctor_license;
      licenseInput.classList.add('verified');
      verifyBtn.textContent = 'Verified ✓';
      verifyBtn.style.background = 'var(--green)';
      verifyBtn.style.color = 'var(--black)';

      // Populate the doctor record view with API data
      if (data.patient) populateDoctorView(data.patient);

      setTimeout(() => {
        verifyStep.style.display = 'none';
        recordView.style.display = 'block';
        recordView.style.opacity = 0;
        setTimeout(() => {
          recordView.style.transition = 'opacity 0.5s';
          recordView.style.opacity = 1;
        }, 50);
      }, 900);

    } catch (err) {
      verifyBtn.textContent = 'Verification Failed';
      verifyBtn.style.background = 'var(--danger)';
      verifyBtn.disabled = false;
      console.error(err);
    }
  });

  licenseInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') verifyBtn.click();
  });
}

function populateDoctorView(p) {
  setText('dr-patient-name', p.name);
  setText('dr-patient-meta', `${p.vid}  ·  DOB: ${p.dob}  ·  ${p.gender}`);
  setText('dr-blood-group', `${p.blood_group} (Rh Positive)`);
  const allergy = p.critical_allergies?.[0];
  setText('dr-critical-allergy', allergy ? `${allergy.name} — ${allergy.severity.toUpperCase()}` : '—');
  setText('dr-conditions', p.active_conditions?.map(c => c.name).join(', ') || '—');
  setText('dr-medications', p.prescriptions?.current?.map(rx => rx.name).join(', ') || '—');
  const surgery = p.history?.find(h => h.event.includes('Appendectomy'));
  setText('dr-surgeries', surgery ? `Appendectomy (${surgery.year})` : 'None on record');

  if (p.restricted) {
    setText('dr-restricted-diagnosis', p.restricted.diagnosis);
    setText('dr-restricted-psychiatrist', p.restricted.psychiatrist);
    setText('dr-restricted-medication', p.restricted.medication);
  }
}

// ── AI SYMPTOM MATCHER — calls the API ──
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
      activeSymptoms.splice(parseInt(e.target.dataset.idx), 1);
      renderSymptomTags();
    });
  });
}

function renderAIResults(data) {
  const container = document.getElementById('ai-results');
  if (!container) return;

  if (!data) {
    container.innerHTML = `
      <div class="results-placeholder">
        <div style="width:24px;height:24px;border:2px solid var(--text-muted);border-radius:50%;margin:0 auto"></div>
        Add symptoms and run analysis
      </div>`;
    return;
  }

  container.innerHTML = `
    <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:14px;">
      Analysed ${data.symptoms_analysed.length} symptom${data.symptoms_analysed.length > 1 ? 's' : ''} — ${data.matches.length} matches found
    </div>
    ${data.matches.map(c => `
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
      ${data.disclaimer}
    </div>
  `;
}

function initAIEngine() {
  const addBtn  = document.getElementById('add-symptom-btn');
  const input   = document.getElementById('symptom-input');
  const runBtn  = document.getElementById('run-analysis-btn');

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

  document.querySelectorAll('.preset-symptom').forEach(btn => {
    btn.addEventListener('click', () => {
      const sym = btn.textContent.trim();
      if (!activeSymptoms.includes(sym)) {
        activeSymptoms.push(sym);
        renderSymptomTags();
      }
    });
  });

  runBtn?.addEventListener('click', async () => {
    if (activeSymptoms.length === 0) return;

    runBtn.textContent = 'Analysing...';
    runBtn.disabled = true;

    const ageEl = document.querySelector('#ai-engine input[type="number"]');
    const durEl = document.querySelector('#ai-engine input[placeholder*="month"]');

    try {
      const res = await fetch(`${API}/api/ai/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: activeSymptoms,
          patient_age: ageEl?.value ? parseInt(ageEl.value) : null,
          duration: durEl?.value || null,
        }),
      });

      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      renderAIResults(data);

    } catch (err) {
      document.getElementById('ai-results').innerHTML =
        `<div class="results-placeholder" style="color:var(--danger)">API error — could not reach backend.</div>`;
      console.error(err);
    } finally {
      runBtn.textContent = 'Run AI Analysis';
      runBtn.disabled = false;
    }
  });

  renderAIResults(null);
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
document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();       // fetch live stats first so counters have correct targets
  initAOS();
  initCounters();
  initCaseCards();
  await loadPatient();     // populate patient name/VID/blood group from API
  await initDoctorPortal();
  initAIEngine();
  initDashboardNav();
});
