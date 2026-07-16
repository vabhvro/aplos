/* ==========================================================
   Utility
   ========================================================== */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================
   1. AMBIENT ATMOSPHERE — floating hearts + glowing particles
   ========================================================== */
(function atmosphere() {
  const canvas = document.getElementById('atmosphere');
  const ctx = canvas.getContext('2d');
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const HEART_COUNT = window.innerWidth < 640 ? 10 : 18;
  const PARTICLE_COUNT = window.innerWidth < 640 ? 16 : 30;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  class Heart {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x = rand(0, w);
      this.y = initial ? rand(0, h) : h + rand(20, 100);
      this.size = rand(10, 26);
      this.speed = rand(0.25, 0.7);
      this.drift = rand(-0.3, 0.3);
      this.opacity = rand(0.12, 0.32);
      this.sway = rand(0, Math.PI * 2);
      this.swaySpeed = rand(0.005, 0.015);
      this.hue = Math.random() > 0.5 ? '#E8A6B8' : '#D9C7F5';
    }
    update() {
      this.y -= this.speed;
      this.sway += this.swaySpeed;
      this.x += Math.sin(this.sway) * 0.4 + this.drift * 0.1;
      if (this.y < -40) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.scale(this.size / 20, this.size / 20);
      ctx.fillStyle = this.hue;
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.bezierCurveTo(-10, -6, -20, 4, 0, 18);
      ctx.bezierCurveTo(20, 4, 10, -6, 0, 4);
      ctx.fill();
      ctx.restore();
    }
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = rand(0, w);
      this.y = rand(0, h);
      this.r = rand(1, 2.6);
      this.opacity = rand(0.15, 0.5);
      this.speed = rand(0.1, 0.35);
      this.pulse = rand(0, Math.PI * 2);
    }
    update() {
      this.y -= this.speed;
      this.pulse += 0.02;
      if (this.y < -10) { this.y = h + 10; this.x = rand(0, w); }
    }
    draw() {
      const flicker = (Math.sin(this.pulse) + 1) / 2;
      ctx.save();
      ctx.globalAlpha = this.opacity * (0.5 + flicker * 0.5);
      ctx.fillStyle = '#FFE9C7';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const hearts = Array.from({ length: HEART_COUNT }, () => new Heart());
  const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

  function loop() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    hearts.forEach(hheart => { hheart.update(); hheart.draw(); });
    requestAnimationFrame(loop);
  }

  if (!prefersReducedMotion) {
    loop();
  } else {
    // draw a single static, calm frame
    particles.forEach(p => p.draw());
    hearts.forEach(hh => hh.draw());
  }
})();

/* ==========================================================
   2. SCROLL CUE
   ========================================================== */
document.getElementById('scrollCue').addEventListener('click', () => {
  document.getElementById('letterSection').scrollIntoView({ behavior: 'smooth' });
});

/* ==========================================================
   3. WAITING CLOCK — counts every second since the page loaded
   ========================================================== */
(function waitingClock() {
  const el = document.getElementById('waitingClock');
  const start = Date.now();

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const hrs = Math.floor(elapsed / 3600);
    const mins = Math.floor((elapsed % 3600) / 60);
    const secs = elapsed % 60;
    el.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  tick();
  setInterval(tick, 1000);
})();

/* ==========================================================
   4. ENVELOPE OPEN + TYPEWRITER LETTER
   ========================================================== */
(function letterReveal() {
  const wrap = document.getElementById('envelopeWrap');
  const envelope = document.getElementById('envelope');
  const letterPaper = document.getElementById('letterPaper');
  const seal = document.getElementById('waxSeal');
  const cursor = document.getElementById('letterCursor');
  const lines = Array.from(document.querySelectorAll('.letter-line'));
  let opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;

    // Start playing romantic music box automatically
    if (typeof playRomanticMusic === 'function') {
      playRomanticMusic();
    }

    // Set wrapper height to envelope height so transition begins smoothly
    const envHeight = envelope.offsetHeight;
    wrap.style.height = envHeight + 'px';

    // Open flap & slide up letter paper
    wrap.classList.add('opened');

    setTimeout(() => {
      // Fade out the envelope graphics
      envelope.classList.add('fade-out');

      // Get the height of the letter paper
      const paperHeight = letterPaper.offsetHeight;

      // Animate envelope wrapper to match letter paper height
      wrap.style.height = paperHeight + 'px';

      setTimeout(() => {
        // Switch letter paper to relative flow (no transition)
        letterPaper.classList.add('flow-relative');
        envelope.classList.add('hide-layout');
        wrap.style.height = 'auto';

        // Start typing the letter
        typewriter();
      }, 800); // Duration matches CSS transition (0.8s)
    }, 1200); // 1.2s for flap flip and slide-up animation
  }

  function typewriter() {
    let lineIndex = 0;

    function typeLine() {
      if (lineIndex >= lines.length) {
        cursor.style.display = 'none';
        return;
      }
      const line = lines[lineIndex];
      const fullText = line.getAttribute('data-text');
      let charIndex = 0;

      // place cursor right after this line while typing
      line.after(cursor);

      function typeChar() {
        if (charIndex <= fullText.length) {
          line.textContent = fullText.slice(0, charIndex);
          charIndex++;
          setTimeout(typeChar, 14 + Math.random() * 18);
        } else {
          lineIndex++;
          setTimeout(typeLine, 260);
        }
      }
      typeChar();
    }
    typeLine();
  }

  envelope.addEventListener('click', openEnvelope);
  seal.addEventListener('click', openEnvelope);
  envelope.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); }
  });
  envelope.setAttribute('tabindex', '0');
  envelope.setAttribute('role', 'button');
  envelope.setAttribute('aria-label', 'Open the letter');

  // Auto-open once the envelope scrolls into view, as a gentle nudge
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !opened) {
        // subtle pulse is already handled in CSS via seal-glow
      }
    });
  }, { threshold: 0.5 });
  observer.observe(envelope);
})();

/* ==========================================================
   5. SCROLL-REVEAL FOR REASON CARDS
   ========================================================== */
(function revealCards() {
  const cards = document.querySelectorAll('.reason-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), i * 90);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  cards.forEach(card => observer.observe(card));
})();

/* ==========================================================
   6. FORGIVE BUTTON — confetti + hearts + message
   ========================================================== */
(function forgiveFlow() {
  const btn = document.getElementById('forgiveBtn');
  const thankYou = document.getElementById('forgiveThankYou');
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, pieces = [];
  let animating = false;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = canvas.width = canvas.parentElement.offsetWidth;
    h = canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const colors = ['#D98A9B', '#E8A6B8', '#E7DEFB', '#E3B980', '#FFFFFF'];

  function rand(min, max) { return Math.random() * (max - min) + min; }

  class Piece {
    constructor(isHeart) {
      this.isHeart = isHeart;
      this.x = rand(0, w);
      this.y = -20;
      this.size = isHeart ? rand(14, 24) : rand(6, 11);
      this.speedY = rand(1.5, 4);
      this.speedX = rand(-1.5, 1.5);
      this.rotation = rand(0, Math.PI * 2);
      this.rotSpeed = rand(-0.05, 0.05);
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.life = 0;
      this.maxLife = rand(180, 320);
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotSpeed;
      this.life++;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - this.life / this.maxLife);
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;
      if (this.isHeart) {
        const s = this.size / 20;
        ctx.scale(s, s);
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.bezierCurveTo(-10, -6, -20, 4, 0, 18);
        ctx.bezierCurveTo(20, 4, 10, -6, 0, 4);
        ctx.fill();
      } else {
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      }
      ctx.restore();
    }
  }

  function burst() {
    const count = window.innerWidth < 640 ? 60 : 110;
    for (let i = 0; i < count; i++) {
      pieces.push(new Piece(Math.random() < 0.4));
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    pieces.forEach(p => { p.update(); p.draw(); });
    pieces = pieces.filter(p => p.life < p.maxLife && p.y < h + 40);
    if (pieces.length > 0) {
      requestAnimationFrame(animate);
    } else {
      animating = false;
    }
  }

  btn.addEventListener('click', () => {
    resize();
    burst();
    if (!animating) { animating = true; animate(); }
    btn.classList.add('hidden');
    thankYou.classList.add('visible');
  });
})();

/* ==========================================================
   7. PEEKING CAT INTERACTION
   ========================================================== */
function playMeowSound() {
  const meowCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = meowCtx.createOscillator();
  const gain = meowCtx.createGain();
  const filter = meowCtx.createBiquadFilter();

  osc.type = 'triangle';
  
  const now = meowCtx.currentTime;
  // Cat meow pitch curve (slight scoop upward, then sweep down)
  osc.frequency.setValueAtTime(580, now);
  osc.frequency.exponentialRampToValueAtTime(920, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(720, now + 0.28);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.04); // soft pop in
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38); // fade out

  // Nasal bandpass filter
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1050, now);
  filter.Q.value = 1.9;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(meowCtx.destination);

  osc.start(now);
  osc.stop(now + 0.4);

  setTimeout(() => {
    meowCtx.close();
  }, 500);
}

(function peekingCatInteraction() {
  const peekCat = document.getElementById('peekCat');
  if (!peekCat) return;

  let spinning = false;
  peekCat.addEventListener('click', () => {
    if (spinning) return;
    spinning = true;

    try {
      playMeowSound();
    } catch (e) {
      console.log('Audio meow failed', e);
    }

    peekCat.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.3, 1.25)';
    peekCat.style.transform = 'rotate(372deg) scale(1.18)'; // spin 360 degrees plus normal offset

    setTimeout(() => {
      peekCat.style.transition = 'transform 0.4s ease';
      peekCat.style.transform = 'rotate(12deg)'; // back to initial style angle
      setTimeout(() => {
        spinning = false;
      }, 400);
    }, 600);
  });
})();

/* ==========================================================
   8. ROMANTIC MELODY PLAYER — Canon in D music box
   ========================================================== */
let audioCtx = null;
let musicPlaying = false;
let schedulerTimer = null;
let currentNoteIndex = 0;
let nextNoteTime = 0.0;
const scheduleAheadTime = 0.1;
const lookahead = 25.0;
const noteLength = 0.35; // duration of note step in seconds
let activeNodes = [];
let delayNode = null;
let masterGain = null;

// Pachelbel's Canon in D major notes frequencies
const noteFreqs = {
  'D3': 146.83, 'A3': 220.00, 'B3': 246.94, 'F#3': 185.00, 'G3': 196.00,
  'D4': 293.66, 'F#4': 369.99, 'A4': 440.00, 'B4': 493.88, 'C#5': 554.37,
  'D5': 587.33, 'E5': 659.25, 'F#5': 698.46, 'G5': 783.99, 'A5': 880.00,
  'B5': 987.77, 'C#6': 1109.73, 'D6': 1174.66, 'E6': 1318.51, 'F#6': 1396.91
};

// Canon in D Major beautiful chord arpeggios
const romanticMelody = [
  // D Major arpeggio
  'D5', 'F#5', 'A5', 'D6', 'A5', 'F#5', 'D5', 'A4',
  // A Major arpeggio
  'C#5', 'E5', 'A5', 'C#6', 'A5', 'E5', 'C#5', 'A4',
  // B minor arpeggio
  'D5', 'F#5', 'B5', 'D6', 'B5', 'F#5', 'D5', 'B4',
  // F# minor arpeggio
  'C#5', 'F#5', 'A5', 'C#6', 'A5', 'F#5', 'C#5', 'A4',
  // G Major arpeggio
  'D5', 'G5', 'B5', 'D6', 'B5', 'G5', 'D5', 'G4',
  // D Major arpeggio
  'D5', 'F#5', 'A5', 'D6', 'A5', 'F#5', 'D5', 'A4',
  // G Major arpeggio
  'D5', 'G5', 'B5', 'D6', 'B5', 'G5', 'D5', 'G4',
  // A Major arpeggio
  'C#5', 'E5', 'A5', 'C#6', 'A5', 'E5', 'C#5', 'A4'
];

function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  // Master Gain for soft output volume
  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  masterGain.connect(audioCtx.destination);
  masterGain.gain.linearRampToValueAtTime(0.24, audioCtx.currentTime + 1.2); // sweet fade-in

  // Spacious Delay Effect (for that dreamlike echo box charm)
  delayNode = audioCtx.createDelay();
  delayNode.delayTime.value = 0.525; // dotted-eighth note delay
  
  const feedback = audioCtx.createGain();
  feedback.gain.value = 0.42; // echo density
  
  delayNode.connect(feedback);
  feedback.connect(delayNode);
  delayNode.connect(masterGain);
}

function scheduleNote(index, time) {
  const noteName = romanticMelody[index];
  const freq = noteFreqs[noteName];
  if (!freq) return;

  const oscSine = audioCtx.createOscillator();
  const oscTriangle = audioCtx.createOscillator();
  const noteGain = audioCtx.createGain();

  // Basic soft bell tone
  oscSine.type = 'sine';
  oscSine.frequency.value = freq;

  // Brighter overtone chime detuned for chorus richness
  oscTriangle.type = 'triangle';
  oscTriangle.frequency.value = freq * 2 + 1.2;

  // ADSR Music Box shape
  noteGain.gain.setValueAtTime(0, time);
  noteGain.gain.linearRampToValueAtTime(0.08, time + 0.006); // pluck attack
  noteGain.gain.exponentialRampToValueAtTime(0.02, time + 0.16); // decay
  noteGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.4); // release ringing

  oscSine.connect(noteGain);
  oscTriangle.connect(noteGain);
  
  noteGain.connect(delayNode);
  noteGain.connect(masterGain);

  oscSine.start(time);
  oscSine.stop(time + 1.5);
  oscTriangle.start(time);
  oscTriangle.stop(time + 1.5);

  activeNodes.push(oscSine, oscTriangle, noteGain);
}

function scheduler() {
  while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
    scheduleNote(currentNoteIndex, nextNoteTime);
    nextNoteTime += noteLength;
    currentNoteIndex = (currentNoteIndex + 1) % romanticMelody.length;
  }
  schedulerTimer = setTimeout(scheduler, lookahead);
}

function playRomanticMusic() {
  if (musicPlaying) return;
  musicPlaying = true;

  const toggle = document.getElementById('musicToggle');
  const label = toggle.querySelector('.music-label');
  toggle.classList.add('playing');
  label.textContent = 'Pause the melody';
  toggle.setAttribute('aria-label', 'Pause background melody');

  if (!audioCtx) {
    initAudio();
  }
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  nextNoteTime = audioCtx.currentTime + 0.05;
  currentNoteIndex = 0;
  scheduler();
}

function stopRomanticMusic() {
  if (!musicPlaying) return;
  musicPlaying = false;

  const toggle = document.getElementById('musicToggle');
  const label = toggle.querySelector('.music-label');
  toggle.classList.remove('playing');
  label.textContent = 'Play a soft melody';
  toggle.setAttribute('aria-label', 'Play background melody');

  if (schedulerTimer) {
    clearTimeout(schedulerTimer);
    schedulerTimer = null;
  }

  if (masterGain && audioCtx) {
    const fadeOutTime = 0.8;
    masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + fadeOutTime);
    setTimeout(() => {
      if (!musicPlaying) {
        activeNodes.forEach(n => {
          try { n.stop && n.stop(); } catch(e) {}
        });
        activeNodes = [];
        if (audioCtx) {
          audioCtx.close();
          audioCtx = null;
        }
      }
    }, fadeOutTime * 1000 + 50);
  }
}

document.getElementById('musicToggle').addEventListener('click', () => {
  if (musicPlaying) {
    stopRomanticMusic();
  } else {
    playRomanticMusic();
  }
});
