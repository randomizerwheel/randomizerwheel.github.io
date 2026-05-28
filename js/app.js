// app.js - Main application logic for RandomizerWheel

// =============================================
// GLOBAL STATE
// =============================================
let wheelApp = {
  // Wheel data
  segments: ["Pizza 🍕", "Tacos 🌮", "Sushi 🍣", "Burger 🍔", "Salad 🥗", "Pasta 🍝", "Ice Cream 🍦", "Coffee ☕"],
  colors: [], // Will be generated based on theme
  currentTheme: "rainbow",
  spinning: false,
  
  // Settings
  soundEnabled: true,
  confettiEnabled: true,
  removeWinner: false,
  
  // History
  history: [],
  
  // DOM Elements
  canvas: null,
  ctx: null,
  heroCanvas: null,
  heroCtx: null,
  
  // Audio
  spinSound: null,
  tickSound: null,
  cheerSound: null,
  
  // Animation frame
  animationId: null,
  spinAngle: 0,
  spinStartTime: 0,
  spinDuration: 2000,
  spinTargetSegment: 0,
  spinCallback: null,
  
  // Current preset (to avoid duplicate loading)
  currentPresetType: "custom"
};

// =============================================
// COLOR THEMES
// =============================================
const THEMES = {
  rainbow: ["#FF595E", "#FFCA3A", "#8AC926", "#1982C4", "#6A4C93", "#FF6D00", "#42CAFD", "#FFB347"],
  ocean: ["#003B5C", "#006A8E", "#0096C7", "#48CAE4", "#90E0EF", "#ADE8F4", "#CAF0F8", "#005F73"],
  fire: ["#800000", "#A52A2A", "#CD5C5C", "#F08080", "#FA8072", "#E97451", "#D35400", "#FF4500"],
  forest: ["#1B4332", "#2D6A4F", "#40916C", "#52B788", "#74C69D", "#95D5B2", "#B7E4C7", "#D8F3DC"],
  candy: ["#FF69B4", "#FF1493", "#DB7093", "#FFB6C1", "#FFC0CB", "#FF85B3", "#FDA7DF", "#F8C7E5"],
  night: ["#1A1025", "#2D1B4E", "#4A2B7A", "#6C3F9E", "#8E5BC2", "#B07FE6", "#D2A8FF", "#F4E8FF"],
  gold: ["#D4AF37", "#FFDF00", "#CFB53B", "#F9F3A5", "#F4D03F", "#F39C12", "#E67E22", "#D35400"],
  pastel: ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF", "#D4B8FF", "#FFC8DD", "#C0E0FF"],
  neon: ["#FF00FF", "#00FFFF", "#39FF14", "#FFFF00", "#FF6D00", "#FF006E", "#8338EC", "#3A86FF"]
};

// =============================================
// UTILITY FUNCTIONS
// =============================================
function showToast(message, duration = 3000) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function showConfetti() {
  if (!wheelApp.confettiEnabled) return;
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  canvas.style.display = 'block';
  const duration = 2000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 20, spread: 360, ticks: 60, zIndex: 10000, origin: { y: 0.6 } };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      clearInterval(interval);
      canvas.style.display = 'none';
      return;
    }
    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}

function playSound(soundName) {
  if (!wheelApp.soundEnabled) return;
  try {
    // Create audio context on first user interaction
    if (!window.audioContext) {
      window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Simple beep/spin sound using oscillator for better compatibility
    if (soundName === 'spin') {
      const osc = window.audioContext.createOscillator();
      const gain = window.audioContext.createGain();
      osc.connect(gain);
      gain.connect(window.audioContext.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.15;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, window.audioContext.currentTime + 0.3);
      osc.stop(window.audioContext.currentTime + 0.3);
    } else if (soundName === 'cheer') {
      const osc = window.audioContext.createOscillator();
      const gain = window.audioContext.createGain();
      osc.connect(gain);
      gain.connect(window.audioContext.destination);
      osc.type = 'sine';
      osc.frequency.value = 523.25;
      gain.gain.value = 0.2;
      osc.start();
      setTimeout(() => { osc.frequency.value = 659.25; }, 80);
      setTimeout(() => { osc.frequency.value = 783.99; }, 160);
      setTimeout(() => { gain.gain.exponentialRampToValueAtTime(0.00001, window.audioContext.currentTime + 0.3); }, 200);
      setTimeout(() => osc.stop(), 500);
    }
  } catch(e) { console.log('Audio error:', e); }
}

// =============================================
// WHEEL DRAWING (will be expanded in wheel.js)
// =============================================
function drawWheel() {
  if (!wheelApp.ctx || !wheelApp.canvas) return;
  const ctx = wheelApp.ctx;
  const width = wheelApp.canvas.width;
  const height = wheelApp.canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width * 0.45;
  
  ctx.clearRect(0, 0, width, height);
  const segmentAngle = (Math.PI * 2) / wheelApp.segments.length;
  
  for (let i = 0; i < wheelApp.segments.length; i++) {
    const startAngle = i * segmentAngle + wheelApp.spinAngle;
    const endAngle = (i + 1) * segmentAngle + wheelApp.spinAngle;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.fillStyle = wheelApp.colors[i % wheelApp.colors.length];
    ctx.fill();
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + segmentAngle / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.max(10, Math.min(18, radius / 10))}px "Nunito"`;
    ctx.shadowBlur = 0;
    let text = wheelApp.segments[i];
    if (text.length > 12) text = text.slice(0, 10) + "..";
    ctx.fillText(text, radius * 0.65, 5);
    ctx.restore();
  }
  
  // Draw center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "#2d2040";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd600";
  ctx.fill();
}

function updateHeroWheel() {
  if (!wheelApp.heroCtx || !wheelApp.heroCanvas) return;
  const segments = ["Prize", "Game", "Movie", "Dinner", "Travel", "Music"];
  const colors = ["#FF595E", "#FFCA3A", "#8AC926", "#1982C4", "#6A4C93", "#FF6D00"];
  const ctx = wheelApp.heroCtx;
  const w = wheelApp.heroCanvas.width;
  const h = wheelApp.heroCanvas.height;
  const cx = w/2, cy = h/2;
  const rad = w * 0.42;
  const angleStep = (Math.PI * 2) / segments.length;
  
  ctx.clearRect(0, 0, w, h);
  for (let i = 0; i < segments.length; i++) {
    const start = i * angleStep;
    const end = (i+1) * angleStep;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, rad, start, end);
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + angleStep/2);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px Nunito";
    ctx.shadowBlur = 0;
    ctx.fillText(segments[i], rad * 0.65, 5);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, rad*0.15, 0, Math.PI*2);
  ctx.fillStyle = "#2d2040";
  ctx.fill();
}

// =============================================
// ENTRIES MANAGEMENT
// =============================================
function renderEntriesList() {
  const container = document.getElementById('entriesList');
  if (!container) return;
  container.innerHTML = '';
  wheelApp.segments.forEach((segment, idx) => {
    const row = document.createElement('div');
    row.className = 'entry-row';
    row.innerHTML = `
      <div class="entry-color-dot" style="background: ${wheelApp.colors[idx % wheelApp.colors.length]}"></div>
      <input type="text" class="entry-input" value="${escapeHtml(segment)}" data-index="${idx}" />
      <button class="entry-delete" data-index="${idx}">✖</button>
    `;
    container.appendChild(row);
  });
  document.getElementById('entryCount').textContent = wheelApp.segments.length;
  
  // Attach event listeners
  document.querySelectorAll('.entry-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index);
      if (!isNaN(idx) && e.target.value.trim()) {
        wheelApp.segments[idx] = e.target.value.trim();
        updateColorsForSegments();
        drawWheel();
        saveWheelToLocal();
      }
    });
  });
  document.querySelectorAll('.entry-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(btn.dataset.index);
      if (!isNaN(idx) && wheelApp.segments.length > 1) {
        wheelApp.segments.splice(idx, 1);
        updateColorsForSegments();
        renderEntriesList();
        drawWheel();
        saveWheelToLocal();
      } else if (wheelApp.segments.length <= 1) {
        showToast("You need at least one entry!");
      }
    });
  });
}

function updateColorsForSegments() {
  const themeColors = THEMES[wheelApp.currentTheme] || THEMES.rainbow;
  wheelApp.colors = [];
  for (let i = 0; i < wheelApp.segments.length; i++) {
    wheelApp.colors.push(themeColors[i % themeColors.length]);
  }
}

function addNewEntry() {
  const newName = `Option ${wheelApp.segments.length + 1}`;
  wheelApp.segments.push(newName);
  updateColorsForSegments();
  renderEntriesList();
  drawWheel();
  saveWheelToLocal();
  showToast(`Added "${newName}"`);
}

function clearAllEntries() {
  if (wheelApp.segments.length <= 1) {
    wheelApp.segments = ["Spin Me!"];
  } else {
    if (confirm("Are you sure you want to clear all entries?")) {
      wheelApp.segments = ["Spin Me!"];
      updateColorsForSegments();
      renderEntriesList();
      drawWheel();
      saveWheelToLocal();
      showToast("All entries cleared");
    }
  }
}

function loadPreset(presetType) {
  const presets = {
    lunch: ["🍔 Burger", "🍕 Pizza", "🥗 Salad", "🍣 Sushi", "🌮 Tacos", "🍜 Ramen", "🥪 Sandwich", "🍝 Pasta"],
    chores: ["🧹 Sweep", "🧼 Dishes", "🗑 Trash", "🧺 Laundry", "🍳 Cook", "💸 Shopping", "🚽 Bathroom", "🌿 Plants"],
    games: ["🎮 Valorant", "🎲 Chess", "🎯 Among Us", "⚽ FIFA", "🏀 NBA 2K", "🎴 Poker", "🧩 Minecraft", "🚗 GTA"],
    truth: ["Truth", "Dare", "Truth", "Dare", "Truth", "Dare", "Double Dare", "Wild Card"],
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    team: ["Design", "Frontend", "Backend", "Testing", "Docs", "PM", "QA", "DevOps"]
  };
  const entries = presets[presetType];
  if (entries) {
    wheelApp.segments = [...entries];
    updateColorsForSegments();
    renderEntriesList();
    drawWheel();
    saveWheelToLocal();
    showToast(`${presetType} wheel loaded!`);
  }
}

// =============================================
// HISTORY MANAGEMENT
// =============================================
function addToHistory(winner) {
  wheelApp.history.unshift(winner);
  if (wheelApp.history.length > 20) wheelApp.history.pop();
  updateHistoryUI();
  saveWheelToLocal();
}

function updateHistoryUI() {
  const historyList = document.getElementById('historyList');
  const clearBtn = document.getElementById('clearHistoryBtn');
  if (!historyList) return;
  if (wheelApp.history.length === 0) {
    historyList.innerHTML = '<p class="history-empty">Spin to see results here!</p>';
    if (clearBtn) clearBtn.style.display = 'none';
    return;
  }
  if (clearBtn) clearBtn.style.display = 'block';
  historyList.innerHTML = wheelApp.history.map((item, idx) => `
    <div class="history-item">
      <span class="history-num">#${idx+1}</span>
      <span>🎡 ${escapeHtml(item)}</span>
    </div>
  `).join('');
}

function clearHistory() {
  wheelApp.history = [];
  updateHistoryUI();
  saveWheelToLocal();
  showToast("History cleared");
}

// =============================================
// WHEEL SPIN LOGIC
// =============================================
function spinWheel() {
  if (wheelApp.spinning) return;
  if (wheelApp.segments.length === 0) {
    showToast("Please add some entries first!");
    return;
  }
  
  wheelApp.spinning = true;
  playSound('spin');
  
  const randomSegment = Math.floor(Math.random() * wheelApp.segments.length);
  const segmentAngle = (Math.PI * 2) / wheelApp.segments.length;
  const targetAngle = (Math.PI * 2) - (randomSegment * segmentAngle) - (segmentAngle / 2);
  
  const startAngle = wheelApp.spinAngle % (Math.PI * 2);
  let delta = targetAngle - startAngle;
  if (delta < 0) delta += Math.PI * 2;
  
  const totalDelta = delta + (Math.PI * 2 * 5);
  const startTime = performance.now();
  const duration = 2000;
  
  function animateSpin(now) {
    const elapsed = now - startTime;
    let t = Math.min(1, elapsed / duration);
    const easeOut = 1 - Math.pow(1 - t, 3);
    const currentDelta = totalDelta * easeOut;
    wheelApp.spinAngle = startAngle + currentDelta;
    wheelApp.spinAngle %= (Math.PI * 2);
    drawWheel();
    
    if (t < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      wheelApp.spinAngle = targetAngle;
      drawWheel();
      const winner = wheelApp.segments[randomSegment];
      showWinner(winner);
      
      if (wheelApp.removeWinner && wheelApp.segments.length > 1) {
        wheelApp.segments.splice(randomSegment, 1);
        updateColorsForSegments();
        renderEntriesList();
      }
      
      addToHistory(winner);
      playSound('cheer');
      if (wheelApp.confettiEnabled) showConfetti();
      
      wheelApp.spinning = false;
      saveWheelToLocal();
    }
  }
  
  requestAnimationFrame(animateSpin);
}

function showWinner(winner) {
  const winnerDisplay = document.getElementById('winnerDisplay');
  const winnerName = document.getElementById('winnerName');
  if (winnerDisplay && winnerName) {
    winnerName.textContent = winner;
    winnerDisplay.style.display = 'block';
    setTimeout(() => {
      if (document.getElementById('winnerDisplay')) {
        // Auto-hide after 5 seconds
      }
    }, 5000);
  }
  showToast(`🎉 Winner: ${winner} 🎉`, 4000);
}

// =============================================
// THEME MANAGEMENT
// =============================================
function setTheme(themeName) {
  if (THEMES[themeName]) {
    wheelApp.currentTheme = themeName;
    updateColorsForSegments();
    drawWheel();
    // Update active button styling
    document.querySelectorAll('.theme-btn').forEach(btn => {
      if (btn.dataset.theme === themeName) btn.classList.add('active');
      else btn.classList.remove('active');
    });
    saveWheelToLocal();
  }
}

// =============================================
// LOCAL STORAGE
// =============================================
function saveWheelToLocal() {
  const saveData = {
    segments: wheelApp.segments,
    currentTheme: wheelApp.currentTheme,
    history: wheelApp.history,
    soundEnabled: wheelApp.soundEnabled,
    confettiEnabled: wheelApp.confettiEnabled,
    removeWinner: wheelApp.removeWinner
  };
  localStorage.setItem('randomizerWheel', JSON.stringify(saveData));
}

function loadWheelFromLocal() {
  const saved = localStorage.getItem('randomizerWheel');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.segments && data.segments.length) wheelApp.segments = data.segments;
      if (data.currentTheme) wheelApp.currentTheme = data.currentTheme;
      if (data.history) wheelApp.history = data.history;
      if (typeof data.soundEnabled === 'boolean') wheelApp.soundEnabled = data.soundEnabled;
      if (typeof data.confettiEnabled === 'boolean') wheelApp.confettiEnabled = data.confettiEnabled;
      if (typeof data.removeWinner === 'boolean') wheelApp.removeWinner = data.removeWinner;
      
      // Sync UI toggles
      document.getElementById('soundToggle').checked = wheelApp.soundEnabled;
      document.getElementById('confettiToggle').checked = wheelApp.confettiEnabled;
      document.getElementById('removeToggle').checked = wheelApp.removeWinner;
    } catch(e) { console.warn(e); }
  }
  updateColorsForSegments();
  updateHistoryUI();
}

// =============================================
// SHARE & EXPORT FUNCTIONS
// =============================================
function copyShareLink() {
  const url = window.location.href.split('#')[0];
  const state = btoa(JSON.stringify({
    s: wheelApp.segments,
    t: wheelApp.currentTheme
  }));
  const shareUrl = `${url}?load=${encodeURIComponent(state)}`;
  navigator.clipboard.writeText(shareUrl);
  showToast("Link copied to clipboard!");
}

function saveWheelAsImage() {
  if (!wheelApp.canvas) return;
  const link = document.createElement('a');
  link.download = 'wheel-spin.png';
  link.href = wheelApp.canvas.toDataURL();
  link.click();
  showToast("Wheel image saved!");
}

// =============================================
// TAB/PRESET EVENT HANDLERS
// =============================================
function initTabSwitching() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const type = tab.dataset.wheel;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const presetsMap = {
        yesno: ["Yes ✅", "No ❌"],
        numbers: ["1", "2", "3", "4", "5", "6", "7", "8"],
        colors: ["🔴 Red", "🔵 Blue", "🟢 Green", "🟡 Yellow", "🟣 Purple", "🟠 Orange"],
        names: ["Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah"]
      };
      if (presetsMap[type]) {
        wheelApp.segments = [...presetsMap[type]];
        wheelApp.currentPresetType = type;
        updateColorsForSegments();
        renderEntriesList();
        drawWheel();
        saveWheelToLocal();
        showToast(`${type} wheel loaded!`);
      } else if (type === 'custom') {
        // Load custom from storage or default
        loadWheelFromLocal();
        renderEntriesList();
        drawWheel();
      }
    });
  });
}

// =============================================
// INITIALIZATION
// =============================================
function initEventListeners() {
  // Spin button
  const spinBtn = document.getElementById('mainSpinBtn');
  if (spinBtn) spinBtn.addEventListener('click', () => spinWheel());
  
  // Hero spin button
  const heroSpin = document.getElementById('heroSpinBtn');
  if (heroSpin) heroSpin.addEventListener('click', () => spinWheel());
  
  // Add entry
  const addBtn = document.getElementById('addEntryBtn');
  if (addBtn) addBtn.addEventListener('click', () => addNewEntry());
  
  // Clear all
  const clearBtn = document.getElementById('clearAllBtn');
  if (clearBtn) clearBtn.addEventListener('click', () => clearAllEntries());
  
  // Settings toggles
  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) soundToggle.addEventListener('change', (e) => {
    wheelApp.soundEnabled = e.target.checked;
    saveWheelToLocal();
  });
  const confettiToggle = document.getElementById('confettiToggle');
  if (confettiToggle) confettiToggle.addEventListener('change', (e) => {
    wheelApp.confettiEnabled = e.target.checked;
    saveWheelToLocal();
  });
  const removeToggle = document.getElementById('removeToggle');
  if (removeToggle) removeToggle.addEventListener('change', (e) => {
    wheelApp.removeWinner = e.target.checked;
    saveWheelToLocal();
  });
  
  // Clear history
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', () => clearHistory());
  
  // Theme buttons
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme));
  });
  
  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => loadPreset(btn.dataset.preset));
  });
  
  // Share buttons
  const copyLink = document.getElementById('copyLinkBtn');
  if (copyLink) copyLink.addEventListener('click', () => copyShareLink());
  const saveImg = document.getElementById('saveImageBtn');
  if (saveImg) saveImg.addEventListener('click', () => saveWheelAsImage());
  
  // Spin again button
  const spinAgain = document.getElementById('spinAgainBtn');
  if (spinAgain) spinAgain.addEventListener('click', () => {
    document.getElementById('winnerDisplay').style.display = 'none';
    spinWheel();
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Make hero spin button scroll to main wheel app
const heroSpinBtn = document.getElementById('heroSpinBtn');
if (heroSpinBtn) {
  heroSpinBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const wheelAppSection = document.getElementById('wheel-app');
    if (wheelAppSection) {
      wheelAppSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    // Optional: Auto-trigger the main spin after scrolling
    setTimeout(() => {
      const mainSpinBtn = document.getElementById('mainSpinBtn');
      if (mainSpinBtn) {
        mainSpinBtn.click();
      }
    }, 500);
  });
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  // Set up canvas references
  const mainCanvas = document.getElementById('mainWheel');
  const heroCanvasElem = document.getElementById('heroMiniWheel');
  if (mainCanvas) {
    wheelApp.canvas = mainCanvas;
    wheelApp.ctx = mainCanvas.getContext('2d');
    // Set canvas dimensions
    const size = Math.min(460, window.innerWidth - 100);
    mainCanvas.width = size;
    mainCanvas.height = size;
  }
  if (heroCanvasElem) {
    wheelApp.heroCanvas = heroCanvasElem;
    wheelApp.heroCtx = heroCanvasElem.getContext('2d');
    heroCanvasElem.width = 260;
    heroCanvasElem.height = 260;
  }
  
  loadWheelFromLocal();
  renderEntriesList();
  updateHistoryUI();
  initTabSwitching();
  initEventListeners();
  drawWheel();
  updateHeroWheel();
  
  // Handle URL params for share
  const urlParams = new URLSearchParams(window.location.search);
  const loadData = urlParams.get('load');
  if (loadData) {
    try {
      const decoded = JSON.parse(atob(loadData));
      if (decoded.s) wheelApp.segments = decoded.s;
      if (decoded.t) setTheme(decoded.t);
      renderEntriesList();
      drawWheel();
      showToast("Shared wheel loaded!");
    } catch(e) { console.warn(e); }
  }

  // =============================================
// FAQ ACCORDION FIX
// =============================================
function initFaqAccordion() {
  const faqButtons = document.querySelectorAll('.faq-q');
  
  faqButtons.forEach(button => {
    // Remove any existing listeners to avoid duplicates
    button.removeEventListener('click', button.faqHandler);
    
    // Create handler function
    button.faqHandler = function() {
      // Toggle active class on button
      this.classList.toggle('active');
      
      // Find and toggle the answer
      const answer = this.nextElementSibling;
      if (answer) {
        answer.classList.toggle('open');
      }
    };
    
    // Add click listener
    button.addEventListener('click', button.faqHandler);
  });
}

// Initialize FAQ when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFaqAccordion);
} else {
  initFaqAccordion();
}
  
  // Resize handler
  window.addEventListener('resize', () => {
    if (mainCanvas && window.innerWidth < 768) {
      const newSize = Math.min(320, window.innerWidth - 60);
      mainCanvas.width = newSize;
      mainCanvas.height = newSize;
    } else if (mainCanvas && window.innerWidth >= 768) {
      mainCanvas.width = 460;
      mainCanvas.height = 460;
    }
    drawWheel();
  });
});
