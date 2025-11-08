const chips = document.querySelectorAll('.chip');
const customSlider = document.getElementById('customMinutes');
const customLabel = document.getElementById('customLabel');
const customUnit = document.getElementById('customUnit');
const timeDisplay = document.getElementById('timeDisplay');
const statusText = document.getElementById('statusText');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const soundToggle = document.getElementById('soundToggle');
const vibrateToggle = document.getElementById('vibrateToggle');
const noteField = document.getElementById('noteField');
const confettiHolder = document.getElementById('confetti');
const progressCircle = document.querySelector('.progress-ring__value');
const card = document.querySelector('.card');

const circumference = 2 * Math.PI * 100;
progressCircle.style.strokeDasharray = `${circumference}`;

const DEFAULT_MINUTES = 8;
const DEFAULT_SECONDS = DEFAULT_MINUTES * 60;
const DEBUG_DEFAULT_SECONDS = 10;
const params = new URLSearchParams(window.location.search);
const hasDebugParam = params.has('debug');
const parsedDebugValue = Number(params.get('debug'));
const debugSeconds =
  hasDebugParam && Number.isFinite(parsedDebugValue) && parsedDebugValue > 0
    ? parsedDebugValue
    : DEBUG_DEFAULT_SECONDS;
const isDebugMode = hasDebugParam;
const timeScale = isDebugMode ? debugSeconds / DEFAULT_SECONDS : 1;

const storageKey = 'cute-egg-note';
noteField.value = localStorage.getItem(storageKey) || '';
noteField.addEventListener('input', () => {
  localStorage.setItem(storageKey, noteField.value.trim());
});

const minutesToSeconds = (minutes) => minutes * 60 * timeScale;
const formatMinutes = (minutes) => {
  const rounded = Number(minutes);
  return Number.isInteger(rounded) ? `${rounded}` : `${rounded.toFixed(1).replace(/\\.0$/, '')}`;
};
const setCustomLabelValue = (minutes) => {
  customLabel.textContent = isDebugMode ? Math.round(minutesToSeconds(minutes)) : formatMinutes(minutes);
};
const updateChipBadges = () => {
  chips.forEach((chip) => {
    const tag = chip.querySelector('small');
    if (!tag) return;
    const minutes = Number(chip.dataset.minutes);
    tag.textContent = isDebugMode ? `${Math.round(minutesToSeconds(minutes))} sec` : `${minutes} min`;
  });
};

const activePreset = document.querySelector('.chip[aria-pressed=\"true\"]');
const defaultMinutes = activePreset ? Number(activePreset.dataset.minutes) : DEFAULT_MINUTES;

let totalSeconds = minutesToSeconds(defaultMinutes);
let remainingSeconds = totalSeconds;
let timerId = null;
let startTimestamp = 0;
let pausedAt = 0;
let chimeInterval = null;

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

const setProgress = (ratio) => {
  const offset = circumference - ratio * circumference;
  progressCircle.style.strokeDashoffset = offset;
};

const updateDisplay = () => {
  timeDisplay.textContent = formatTime(remainingSeconds);
  setProgress(1 - remainingSeconds / totalSeconds);
};

const setStatus = (text) => {
  statusText.textContent = text;
};

const selectPreset = (minutes) => {
  totalSeconds = Math.round(minutesToSeconds(minutes));
  remainingSeconds = totalSeconds;
  updateDisplay();
  setStatus('Ready to bubble!');
  chips.forEach((chip) => {
    chip.setAttribute('aria-pressed', chip.dataset.minutes === minutes.toString());
  });
  customSlider.value = minutes;
  setCustomLabelValue(minutes);
  stopTimer();
};

const stopTimer = () => {
  if (timerId) {
    cancelAnimationFrame(timerId);
    timerId = null;
  }
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resetBtn.disabled = remainingSeconds >= totalSeconds;
  stopChimeLoop();
};

const finishTimer = () => {
  remainingSeconds = 0;
  updateDisplay();
  setStatus('Egg-cellent! Time to scoop.');
  triggerCelebration();
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resetBtn.disabled = false;
  if (soundToggle.checked) startChimeLoop();
  if (vibrateToggle.checked && 'vibrate' in navigator) {
    navigator.vibrate([80, 30, 80, 30, 120]);
  }
};

const tick = (timestamp) => {
  if (startTimestamp === 0) startTimestamp = timestamp;
  const elapsed = (timestamp - startTimestamp) / 1000 + pausedAt;
  remainingSeconds = Math.max(totalSeconds - elapsed, 0);
  updateDisplay();
  if (remainingSeconds <= 0.1) {
    timerId = null;
    finishTimer();
    return;
  }
  timerId = requestAnimationFrame(tick);
};

const startTimer = () => {
  if (timerId) return;
  setStatus('Boiling in progress…');
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;
  startTimestamp = 0;
  timerId = requestAnimationFrame(tick);
};

const pauseTimer = () => {
  if (!timerId) return;
  cancelAnimationFrame(timerId);
  timerId = null;
  pausedAt = totalSeconds - remainingSeconds;
  setStatus('Paused. Pop me back when ready.');
  startBtn.disabled = false;
  pauseBtn.disabled = true;
};

const resetTimer = () => {
  cancelAnimationFrame(timerId);
  timerId = null;
  pausedAt = 0;
  remainingSeconds = totalSeconds;
  updateDisplay();
  setStatus('Reset and waiting!');
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resetBtn.disabled = true;
  stopChimeLoop();
};

const triggerCelebration = () => {
  const colors = ['#ff9ec4', '#ffd685', '#b4f2d3', '#c8c6ff'];
  for (let i = 0; i < 24; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.2}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiHolder.appendChild(piece);
    setTimeout(() => piece.remove(), 2500);
  }
};

const playChime = () => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const now = audioCtx.currentTime;
  const notes = [880, 1318, 1046];
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + idx * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.3, now + idx * 0.15 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 0.4);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now + idx * 0.15);
    osc.stop(now + idx * 0.15 + 0.5);
  });
};

const startChimeLoop = () => {
  stopChimeLoop();
  playChime();
  chimeInterval = setInterval(() => {
    if (!soundToggle.checked) {
      stopChimeLoop();
      return;
    }
    playChime();
  }, 4500);
};

const stopChimeLoop = () => {
  if (chimeInterval) {
    clearInterval(chimeInterval);
    chimeInterval = null;
  }
};

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
    chip.setAttribute('aria-pressed', 'true');
    const mins = Number(chip.dataset.minutes);
    customSlider.value = mins;
    setCustomLabelValue(mins);
    pausedAt = 0;
    totalSeconds = minutesToSeconds(mins);
    remainingSeconds = totalSeconds;
    updateDisplay();
    setStatus('Preset locked in!');
    resetBtn.disabled = true;
    cancelAnimationFrame(timerId);
    timerId = null;
  });
});

customSlider.addEventListener('input', (event) => {
  const mins = Number(event.target.value);
  setCustomLabelValue(mins);
  chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
  totalSeconds = minutesToSeconds(mins);
  remainingSeconds = totalSeconds;
  pausedAt = 0;
  updateDisplay();
  setStatus('Custom time ready.');
  resetBtn.disabled = true;
  cancelAnimationFrame(timerId);
  timerId = null;
});

startBtn.addEventListener('click', () => {
  if (remainingSeconds <= 0) {
    remainingSeconds = totalSeconds;
  }
  pausedAt = totalSeconds - remainingSeconds;
  stopChimeLoop();
  startTimer();
});

pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

updateDisplay();
resetBtn.disabled = true;

if (isDebugMode) {
  document.body.classList.add('debug-mode');
  if (customUnit) customUnit.textContent = 'sec';
  const banner = document.createElement('p');
  banner.className = 'debug-banner';
  banner.textContent = `Debug mode: timers scaled so medium preset ≈ ${Math.round(debugSeconds)} sec. Remove '?debug' to return to minutes.`;
  card?.insertAdjacentElement('afterbegin', banner);
  setStatus('Debug mode active — perfect for rapid testing.');
} else if (customUnit) {
  customUnit.textContent = 'min';
}

customSlider.value = defaultMinutes;
setCustomLabelValue(defaultMinutes);
updateChipBadges();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('service-worker.js')
      .catch((err) => console.warn('SW registration failed', err));
  });
}
