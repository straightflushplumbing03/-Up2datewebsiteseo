// STRAIGHT FLUSH PLUMBING — flagship interactive features
// 1) "Hear The Difference" acoustic sound comparison (Web Audio API, synthesized)
// 2) Home Plumbing Health Score interactive assessment

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================ SOUND TOOL
  let audioCtx = null;
  let activeSource = null;
  let activeGain = null;
  let stopTimer = null;

  function getCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    return audioCtx;
  }

  function stopActive() {
    if (activeGain) {
      try {
        const ctx = getCtx();
        activeGain.gain.cancelScheduledValues(ctx.currentTime);
        activeGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
      } catch (e) {}
    }
    if (activeSource) {
      try { activeSource.stop(); } catch (e) {}
    }
    if (stopTimer) { clearTimeout(stopTimer); stopTimer = null; }
    document.querySelectorAll('.sound-play-btn').forEach(b => b.classList.remove('playing'));
    document.querySelectorAll('.sound-wave').forEach(w => animateWave(w, false));
  }

  function animateWave(waveEl, active) {
    const bars = waveEl.querySelectorAll('span');
    if (waveEl._interval) { clearInterval(waveEl._interval); waveEl._interval = null; }
    if (!active) {
      bars.forEach(b => { b.style.height = '6px'; b.style.opacity = '0.35'; });
      return;
    }
    waveEl._interval = setInterval(() => {
      bars.forEach(b => {
        const h = 6 + Math.random() * 30;
        b.style.height = h + 'px';
        b.style.opacity = 0.6 + Math.random() * 0.4;
      });
    }, 120);
  }

  function playSteadyFlow(btn, waveEl) {
    const ctx = getCtx();
    if (!ctx) return;
    stopActive();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 140;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 3.5;
    lfoGain.gain.value = 8;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    lfo.start();
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.15);
    activeSource = osc;
    activeGain = gain;
    btn.classList.add('playing');
    animateWave(waveEl, true);
    stopTimer = setTimeout(() => stopActive(), 3500);
    osc._lfo = lfo;
  }

  function playLeakHiss(btn, waveEl) {
    const ctx = getCtx();
    if (!ctx) return;
    stopActive();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 2600;
    bandpass.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.15);
    activeSource = noise;
    activeGain = gain;
    btn.classList.add('playing');
    animateWave(waveEl, true);
    stopTimer = setTimeout(() => stopActive(), 3500);
  }

  document.querySelectorAll('[data-sound]').forEach(btn => {
    btn.addEventListener('click', () => {
      const wasPlaying = btn.classList.contains('playing');
      const waveEl = btn.parentElement.querySelector('.sound-wave');
      if (wasPlaying) { stopActive(); return; }
      const type = btn.getAttribute('data-sound');
      if (type === 'normal') playSteadyFlow(btn, waveEl);
      else playLeakHiss(btn, waveEl);
    });
  });

  // ============================================================ HEALTH SCORE QUIZ
  const healthTool = document.getElementById('healthTool');
  if (healthTool) {
    const questions = healthTool.querySelectorAll('.health-question');
    const progressFill = healthTool.querySelector('.health-progress-fill');
    const resultEl = healthTool.querySelector('.health-result');
    let currentQ = 0;
    let score = 0;
    const total = questions.length;

    function showQuestion(idx) {
      questions.forEach((q, i) => q.classList.toggle('active', i === idx));
      progressFill.style.width = Math.round((idx / total) * 100) + '%';
    }

    questions.forEach((q, qIdx) => {
      q.querySelectorAll('.health-option').forEach(opt => {
        opt.addEventListener('click', () => {
          q.querySelectorAll('.health-option').forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          score += parseInt(opt.getAttribute('data-points') || '0', 10);
          setTimeout(() => {
            if (qIdx < total - 1) {
              currentQ = qIdx + 1;
              showQuestion(currentQ);
            } else {
              progressFill.style.width = '100%';
              questions.forEach(x => x.classList.remove('active'));
              renderResult();
            }
          }, 250);
        });
      });
    });

    function renderResult() {
      const maxScore = 100;
      const pct = Math.max(5, Math.min(100, Math.round((score / maxScore) * 100)));
      let label, advice, color;
      if (pct >= 80) { label = 'Excellent'; color = '#2C7A72'; advice = "Your plumbing habits and home profile suggest low risk right now. Keep an eye on your water bill and you're in great shape."; }
      else if (pct >= 55) { label = 'Good, With Some Risk'; color = '#D9432E'; advice = "You're in reasonable shape, but a couple of factors are worth watching. A quick professional check-up could catch small issues early."; }
      else { label = 'Needs Attention'; color = '#B5341F'; advice = "Several factors point to a higher risk of hidden leaks or aging plumbing. We'd recommend scheduling a diagnostic visit soon."; }

      resultEl.innerHTML = `
        <div class="health-score-circle" style="border-color:${color};">
          <span class="num" style="color:${color};">${pct}</span>
          <span class="max">out of 100</span>
        </div>
        <h3>${label}</h3>
        <p>${advice}</p>
        <a href="${healthTool.dataset.prefix || ''}contact.html" class="btn btn-primary">Schedule A Real Diagnosis</a>
        <br><button class="health-back" type="button" id="healthRestart">Start over</button>
      `;
      resultEl.classList.add('show');
      const restartBtn = document.getElementById('healthRestart');
      if (restartBtn) restartBtn.addEventListener('click', restart);
    }

    function restart() {
      score = 0;
      currentQ = 0;
      resultEl.classList.remove('show');
      healthTool.querySelectorAll('.health-option').forEach(o => o.classList.remove('selected'));
      showQuestion(0);
    }

    showQuestion(0);
  }
});
