/* ==========================================================================
   TK TASKKRAFT STUDIO - FOCUS TIMER & PROCEDURAL WEB AUDIO SOUNDSCAPES
   ========================================================================== */

window.TK_Timer = {
  durationSeconds: 1500,
  remainingSeconds: 1500,
  timerId: null,
  isRunning: false,
  mode: 'focus',
  
  // Audio Context & Soundscape Oscillators
  audioCtx: null,
  activeSound: null,
  soundNode: null,

  init: function() {
    this.updateClockDisplay();
    this.setupModeButtons();
    this.setupSoundCards();

    const startBtn = document.getElementById('btn-timer-toggle');
    const resetBtn = document.getElementById('btn-timer-reset');

    if (startBtn) startBtn.addEventListener('click', () => this.toggleTimer());
    if (resetBtn) resetBtn.addEventListener('click', () => this.resetTimer());
  },

  setupModeButtons: function() {
    const btns = document.querySelectorAll('.timer-mode-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.durationSeconds = parseInt(btn.getAttribute('data-time'), 10);
        this.mode = btn.getAttribute('data-mode');
        
        const label = document.getElementById('timer-status-label');
        if (label) {
          label.textContent = this.mode === 'focus' ? 'Deep Focus' : (this.mode === 'short' ? 'Short Break' : 'Long Break');
        }

        this.resetTimer();
      });
    });
  },

  toggleTimer: function() {
    const btn = document.getElementById('btn-timer-toggle');
    if (this.isRunning) {
      this.pauseTimer();
      if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
    } else {
      this.startTimer();
      if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
    }
  },

  startTimer: function() {
    if (this.isRunning) return;
    this.isRunning = true;

    const badge = document.getElementById('timer-status-badge');
    if (badge) {
      badge.textContent = 'Active';
      badge.style.background = 'rgba(16,185,129,0.2)';
      badge.style.color = 'var(--accent-emerald)';
    }

    this.timerId = setInterval(() => {
      this.remainingSeconds--;
      this.updateClockDisplay();

      if (this.remainingSeconds <= 0) {
        this.onComplete();
      }
    }, 1000);
  },

  pauseTimer: function() {
    this.isRunning = false;
    clearInterval(this.timerId);

    const badge = document.getElementById('timer-status-badge');
    if (badge) {
      badge.textContent = 'Paused';
      badge.style.background = 'rgba(245,158,11,0.2)';
      badge.style.color = 'var(--accent-amber)';
    }
  },

  resetTimer: function() {
    this.pauseTimer();
    this.remainingSeconds = this.durationSeconds;
    this.updateClockDisplay();

    const btn = document.getElementById('btn-timer-toggle');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Start';

    const badge = document.getElementById('timer-status-badge');
    if (badge) {
      badge.textContent = 'Ready';
      badge.style.background = 'rgba(6,182,212,0.2)';
      badge.style.color = 'var(--accent-cyan)';
    }
  },

  updateClockDisplay: function() {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const display = document.getElementById('timer-display');
    if (display) display.textContent = formatted;

    // Update Radial SVG Circle Stroke Offset
    const ring = document.getElementById('timer-progress-circle');
    if (ring) {
      const circumference = 848.23; // 2 * pi * 135
      const fraction = this.remainingSeconds / this.durationSeconds;
      const offset = circumference - (fraction * circumference);
      ring.style.strokeDashoffset = offset;
    }
  },

  onComplete: function() {
    this.pauseTimer();
    this.playChimeSound();
    
    // Log focus stats
    if (this.mode === 'focus') {
      window.TK.stats.focusSeconds += this.durationSeconds;
      window.TK.saveData();
    }

    window.TK.showToast(`Focus session completed! Great job. ⏱️`, 'fa-circle-check', 'emerald');
    if (typeof confetti === 'function') {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }
  },

  // Web Audio Chime Sound Synthesis
  playChimeSound: function() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  },

  // Procedural Web Audio Ambient Soundscapes
  setupSoundCards: function() {
    const cards = document.querySelectorAll('.sound-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const soundType = card.getAttribute('data-sound');

        if (this.activeSound === soundType) {
          // Toggle off
          this.stopSoundscape();
          cards.forEach(c => c.classList.remove('active'));
        } else {
          // Toggle on
          cards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          this.startSoundscape(soundType);
        }
      });
    });
  },

  startSoundscape: function(type) {
    this.stopSoundscape();
    
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      this.activeSound = type;
      const ctx = this.audioCtx;

      if (type === 'space') {
        // Binaural / Deep Space Sine Drone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(108, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        this.soundNode = { stop: () => osc.stop() };
      } 
      else if (type === 'rain' || type === 'noise' || type === 'waves') {
        // Procedural White/Pink Noise Buffer Generator
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Filter for specific ambient feel
        const filter = ctx.createBiquadFilter();
        filter.type = type === 'rain' ? 'lowpass' : (type === 'waves' ? 'bandpass' : 'highpass');
        filter.frequency.value = type === 'rain' ? 800 : (type === 'waves' ? 400 : 1200);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();
        this.soundNode = { stop: () => whiteNoise.stop() };
      }
    } catch (e) {
      console.warn('Audio synth error:', e);
    }
  },

  stopSoundscape: function() {
    if (this.soundNode) {
      try { this.soundNode.stop(); } catch (e) {}
      this.soundNode = null;
    }
    this.activeSound = null;
  }
};

// Initialize Timer on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  window.TK_Timer.init();
});
