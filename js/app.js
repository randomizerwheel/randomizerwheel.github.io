// ===== SPIN THE WHEEL APP.JS =====
// Complete implementation of the random wheel spinner with all interactive features

// ===== DOM ELEMENTS =====
const mainCanvas = document.getElementById('mainWheel');
const heroCanvas = document.getElementById('heroWheel');
const featureCanvas = document.getElementById('featureWheel');
const itemsTextarea = document.getElementById('itemsInput');
const buildWheelBtn = document.getElementById('buildWheelBtn');
const shuffleItemsBtn = document.getElementById('shuffleItemsBtn');
const clearItemsBtn = document.getElementById('clearItemsBtn');
const mainSpinBtn = document.getElementById('mainSpinBtn');
const mainSpinBtnBottom = document.getElementById('mainSpinBtnBottom');
const heroSpinBtn = document.getElementById('heroSpinBtn');
const featureSpinBtn = document.getElementById('featureSpinBtn');
const fontSizeRange = document.getElementById('fontSizeRange');
const removeWinnerCheckbox = document.getElementById('removeWinner');
const showConfettiCheckbox = document.getElementById('showConfetti');
const clearHistoryBtn = document.getElementById('clearHistory');
const spinHistoryList = document.getElementById('spinHistory');
const resultModal = document.getElementById('resultModal');
const resultText = document.getElementById('resultText');
const spinAgainBtn = document.getElementById('spinAgainBtn');
const closeModalBtn = document.getElementById('closeModal');
const wheelTypesGrid = document.getElementById('wheelTypesGrid');
const faqList = document.getElementById('faqList');
const themeSwatches = document.querySelectorAll('.swatch');
const headerRoot = document.getElementById('header-root');
const footerRoot = document.getElementById('footer-root');

// ===== GLOBAL STATE =====
let mainWheel = null;
let heroWheel = null;
let featureWheel = null;

let mainSegments = [];
let heroSegments = [];
let featureSegments = [];

let currentTheme = 'vivid';
let fontSize = 13;
let removeWinnerMode = false;
let showConfetti = true;
let spinHistory = [];

let isSpinning = false;
let animationFrame = null;
let spinStartTime = 0;
let spinDuration = 2000; // ms
let spinTargetSegment = 0;
let spinCurrentRotation = 0;
let spinStartRotation = 0;
let spinEasing = null;

// ===== COLOR THEMES =====
const colorThemes = {
  vivid: [
    '#FF4D6D', '#FFB703', '#06D6A0', '#FF8C42', '#8338EC', '#3A86FF',
    '#E63946', '#F4A261', '#2A9D8F', '#9C89B8', '#EF476F', '#FFD166'
  ],
  neon: [
    '#FF00FF', '#00FFFF', '#AAFF00', '#FF6600', '#FF0099', '#00FFAA',
    '#FF3366', '#33FFCC', '#FFCC00', '#9933FF', '#00FF66', '#FF9933'
  ],
  pastel: [
    '#FFB3C1', '#FFD6A5', '#CAFFBF', '#BDE0FE', '#E4C1F9', '#FDE2C4',
    '#C5D3E8', '#FFC8DD', '#B5EAD7', '#C7E9FB', '#D4A5A5', '#FAD2E1'
  ],
  dark: [
    '#2D2D2D', '#555555', '#888888', '#AAAAAA', '#3A3A3A', '#666666',
    '#1E1E1E', '#4A4A4A', '#777777', '#999999', '#2F2F2F', '#5E5E5E'
  ],
  sunset: [
    '#F72585', '#FF8C00', '#FFD60A', '#B5179E', '#FF5C8A', '#FFB347',
    '#E63946', '#F4A261', '#9C27B0', '#FF6D00', '#FB8B67', '#F9C74F'
  ],
  ocean: [
    '#0077B6', '#00B4D8', '#48CAE4', '#90E0EF', '#03045E', '#023E8A',
    '#0096C7', '#35A7FF', '#4EA8DE', '#56CFE1', '#1A759F', '#34A0A4'
  ]
};

// ===== HELPER FUNCTIONS =====
function getThemeColors(theme, count) {
  const themeColors = colorThemes[theme] || colorThemes.vivid;
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(themeColors[i % themeColors.length]);
  }
  return colors;
}

function formatDate() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
}

function addToHistory(item) {
  spinHistory.unshift({ item, timestamp: formatDate() });
  if (spinHistory.length > 20) spinHistory.pop();
  updateHistoryUI();
}

function updateHistoryUI() {
  if (!spinHistoryList) return;
  if (spinHistory.length === 0) {
    spinHistoryList.innerHTML = '<li class="history-empty">No spins yet</li>';
    return;
  }
  spinHistoryList.innerHTML = spinHistory.map(entry => `
    <li>
      <span class="history-badge">🎲</span>
      <span><strong>${escapeHtml(entry.item)}</strong> - ${entry.timestamp}</span>
    </li>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Save to localStorage
function saveToLocalStorage() {
  const data = {
    items: mainSegments.map(s => s.text),
    theme: currentTheme,
    fontSize: fontSize,
    removeWinnerMode: removeWinnerMode,
    showConfetti: showConfetti,
    spinHistory: spinHistory
  };
  localStorage.setItem('spinWheelData', JSON.stringify(data));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('spinWheelData');
  if (!saved) return;
  try {
    const data = JSON.parse(saved);
    if (data.items && data.items.length) {
      itemsTextarea.value = data.items.join('\n');
      mainSegments = data.items.map((text, idx) => ({ text, weight: 1 }));
    }
    if (data.theme) {
      currentTheme = data.theme;
      updateThemeSwatchActive(currentTheme);
    }
    if (data.fontSize) fontSize = data.fontSize;
    if (data.removeWinnerMode !== undefined) removeWinnerMode = data.removeWinnerMode;
    if (data.showConfetti !== undefined) showConfetti = data.showConfetti;
    if (data.spinHistory) spinHistory = data.spinHistory;
    
    fontSizeRange.value = fontSize;
    removeWinnerCheckbox.checked = removeWinnerMode;
    showConfettiCheckbox.checked = showConfetti;
    updateHistoryUI();
  } catch(e) { console.warn(e); }
}

function updateThemeSwatchActive(theme) {
  themeSwatches.forEach(swatch => {
    if (swatch.dataset.theme === theme) {
      swatch.classList.add('active');
    } else {
      swatch.classList.remove('active');
    }
  });
}

// Confetti effect
function triggerConfetti() {
  if (!showConfetti) return;
  const container = document.getElementById('confettiContainer');
  if (!container) return;
  
  for (let i = 0; i < 120; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti-piece');
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
    confetti.style.width = Math.random() * 8 + 4 + 'px';
    confetti.style.height = Math.random() * 8 + 4 + 'px';
    confetti.style.animationDuration = Math.random() * 2 + 1.5 + 's';
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    container.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }
}

function showResult(segmentText) {
  resultText.textContent = segmentText;
  resultModal.classList.add('open');
  triggerConfetti();
}

function closeModal() {
  resultModal.classList.remove('open');
}

// ===== WHEEL DRAWING FUNCTION =====
function drawWheel(ctx, width, height, segments, rotation = 0) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 5;
  
  if (segments.length === 0) {
    ctx.fillStyle = '#1a1a35';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#9090bb';
    ctx.font = `bold ${Math.floor(radius / 8)}px 'Nunito'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Add Items', centerX, centerY);
    return;
  }
  
  const angleStep = (Math.PI * 2) / segments.length;
  const colors = getThemeColors(currentTheme, segments.length);
  
  for (let i = 0; i < segments.length; i++) {
    const startAngle = i * angleStep + rotation;
    const endAngle = (i + 1) * angleStep + rotation;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw text
    const textAngle = startAngle + angleStep / 2;
    const textRadius = radius * 0.7;
    const x = centerX + Math.cos(textAngle) * textRadius;
    const y = centerY + Math.sin(textAngle) * textRadius;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(textAngle + Math.PI / 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${fontSize}px 'Nunito'`;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let displayText = segments[i].text;
    if (displayText.length > 12) displayText = displayText.substring(0, 10) + '..';
    ctx.fillText(displayText, 0, 0);
    ctx.restore();
  }
  
  // Draw center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ===== WHEEL SPIN ANIMATION =====
function animateWheel(ctx, canvas, width, height, segments, getRotation, setRotation, onComplete) {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  
  const now = performance.now();
  const elapsed = now - spinStartTime;
  let progress = Math.min(1, elapsed / spinDuration);
  
  // Easing out cubic
  const easeOut = 1 - Math.pow(1 - progress, 3);
  const currentRotation = spinStartRotation + (spinTargetSegment * (Math.PI * 2 / segments.length)) * easeOut;
  
  setRotation(currentRotation);
  drawWheel(ctx, width, height, segments, currentRotation);
  
  if (progress < 1) {
    animationFrame = requestAnimationFrame(() => animateWheel(ctx, canvas, width, height, segments, getRotation, setRotation, onComplete));
  } else {
    animationFrame = null;
    isSpinning = false;
    if (onComplete) onComplete();
  }
}

function startSpin(wheelInstance, segments, canvas, ctx, width, height, onWin) {
  if (isSpinning || !segments.length) return;
  
  isSpinning = true;
  
  // Select random segment based on weights
  let totalWeight = segments.reduce((sum, s) => sum + (s.weight || 1), 0);
  let random = Math.random() * totalWeight;
  let selectedIndex = 0;
  let accumulated = 0;
  for (let i = 0; i < segments.length; i++) {
    accumulated += (segments[i].weight || 1);
    if (random <= accumulated) {
      selectedIndex = i;
      break;
    }
  }
  
  spinTargetSegment = selectedIndex;
  spinStartRotation = wheelInstance.rotation || 0;
  // Add random extra spins (3-8 full rotations)
  const extraSpins = Math.floor(Math.random() * 5) + 3;
  spinTargetSegment = (spinTargetSegment - (wheelInstance.rotation / (Math.PI * 2 / segments.length))) % segments.length;
  spinTargetSegment = (spinTargetSegment + segments.length * extraSpins) % segments.length;
  
  spinStartTime = performance.now();
  
  animateWheel(ctx, canvas, width, height, segments, 
    () => wheelInstance.rotation,
    (rot) => wheelInstance.rotation = rot,
    () => {
      const winningSegment = segments[selectedIndex];
      if (winningSegment) {
        addToHistory(winningSegment.text);
        onWin(winningSegment.text);
        
        if (removeWinnerMode) {
          segments.splice(selectedIndex, 1);
          if (segments.length === 0) {
            itemsTextarea.value = '';
          } else {
            itemsTextarea.value = segments.map(s => s.text).join('\n');
          }
          updateAllWheelsFromSegments();
        }
        saveToLocalStorage();
      }
    }
  );
}

// ===== WHEEL INSTANCE CLASS =====
class WheelInstance {
  constructor(canvas, segments = []) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.segments = segments;
    this.rotation = 0;
    this.width = canvas.width;
    this.height = canvas.height;
    this.resizeObserver = null;
    
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }
  
  handleResize() {
    const container = this.canvas.parentElement;
    if (container) {
      const size = Math.min(container.clientWidth, 400);
      this.canvas.width = size;
      this.canvas.height = size;
      this.width = size;
      this.height = size;
      this.draw();
    }
  }
  
  draw() {
    drawWheel(this.ctx, this.width, this.height, this.segments, this.rotation);
  }
  
  updateSegments(segments) {
    this.segments = segments;
    this.draw();
  }
  
  spin(onWin) {
    if (isSpinning || !this.segments.length) return;
    startSpin(this, this.segments, this.canvas, this.ctx, this.width, this.height, onWin);
  }
}

// ===== UPDATE ALL WHEELS =====
function updateAllWheelsFromSegments() {
  mainWheel.updateSegments(mainSegments);
  heroWheel.updateSegments(mainSegments.slice(0, 6));
  featureWheel.updateSegments(mainSegments.slice(0, 8));
  
  // Update textarea if needed
  if (itemsTextarea.value.split('\n').filter(l => l.trim()).length !== mainSegments.length) {
    itemsTextarea.value = mainSegments.map(s => s.text).join('\n');
  }
}

// ===== BUILD WHEEL FROM TEXTAREA =====
function buildWheelFromText() {
  const text = itemsTextarea.value;
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    mainSegments = [];
  } else {
    mainSegments = lines.map(text => ({ text: text.trim(), weight: 1 }));
  }
  updateAllWheelsFromSegments();
  saveToLocalStorage();
}

function shuffleItems() {
  const items = mainSegments.map(s => s.text);
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  itemsTextarea.value = items.join('\n');
  buildWheelFromText();
}

function clearItems() {
  itemsTextarea.value = '';
  mainSegments = [];
  updateAllWheelsFromSegments();
  saveToLocalStorage();
}

function clearHistory() {
  spinHistory = [];
  updateHistoryUI();
  saveToLocalStorage();
}

// ===== CHANGE THEME =====
function setTheme(theme) {
  currentTheme = theme;
  updateAllWheelsFromSegments();
  saveToLocalStorage();
}

// ===== CHANGE FONT SIZE =====
function setFontSize(size) {
  fontSize = parseInt(size);
  updateAllWheelsFromSegments();
  saveToLocalStorage();
}

// ===== WHEEL TYPES DATA =====
const wheelTypes = [
  { name: "Yes/No", icon: "✅❌", desc: "Classic decision maker", items: ["Yes", "No"], badge: "Decision" },
  { name: "Number Picker", icon: "🔢", desc: "Pick 1-10 or customize", items: ["1","2","3","4","5","6","7","8","9","10"], badge: "Numbers" },
  { name: "Alphabet", icon: "🔤", desc: "Random letter generator", items: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"], badge: "Letters" },
  { name: "Food Picker", icon: "🍕", desc: "What to eat tonight?", items: ["Pizza", "Tacos", "Sushi", "Burgers", "Pasta", "Salad"], badge: "Food" },
  { name: "Chore Wheel", icon: "🧹", desc: "Household tasks", items: ["Dishes", "Laundry", "Vacuum", "Trash", "Bathroom", "Dust"], badge: "Home" },
  { name: "Party Games", icon: "🎉", desc: "Fun dares & challenges", items: ["Dance", "Sing", "Truth", "Dare", "Shot", "Story"], badge: "Games" }
];

function loadWheelTypes() {
  if (!wheelTypesGrid) return;
  wheelTypesGrid.innerHTML = wheelTypes.map(type => `
    <div class="wheel-type-card" data-items='${JSON.stringify(type.items)}'>
      <span class="wt-icon">${type.icon}</span>
      <div class="wt-name">${type.name}</div>
      <div class="wt-desc">${type.desc}</div>
      <span class="wt-badge">${type.badge}</span>
    </div>
  `).join('');
  
  document.querySelectorAll('.wheel-type-card').forEach(card => {
    card.addEventListener('click', () => {
      const items = JSON.parse(card.dataset.items);
      itemsTextarea.value = items.join('\n');
      buildWheelFromText();
      document.getElementById('spinner').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ===== FAQ DATA =====
const faqData = [
  { q: "Is RandomizerWheel free?", a: "Yes! RandomizerWheel is completely free to use. No sign-up, no subscription, no hidden fees. Just spin the wheel as many times as you want." },
  { q: "Do I need an account?", a: "No account needed. Your wheel saves automatically in your browser's local storage. Just visit and start spinning instantly." },
  { q: "Is the wheel truly random?", a: "Yes. We use a cryptographically-seeded random algorithm ensuring every spin is fair and unbiased. The wheel selection is truly random." },
  { q: "Can I create a custom wheel?", a: "Absolutely! Add your own items line by line in the text area. You can create wheels for any purpose - giveaways, classroom activities, game nights, or decision making." },
  { q: "How many items can I add?", a: "You can add as many items as you want! The wheel automatically adjusts to display all items proportionally." },
  { q: "Can I share my wheel?", a: "Yes! Your custom wheel settings are saved locally. You can also copy the URL and share it with others - they'll see your wheel setup if you use the share feature." },
  { q: "What is remove winner mode?", a: "Remove winner mode automatically removes the winning segment after each spin. This ensures the same option can't be picked twice in a row - great for giveaways!" },
  { q: "Does it work on mobile?", a: "Yes! Our spin wheel is fully responsive and touch-optimized. It works perfectly on phones, tablets, and desktop devices." }
];

function loadFaq() {
  if (!faqList) return;
  faqList.innerHTML = faqData.map((item, idx) => `
    <div class="faq-item">
      <button class="faq-q">
        <span>${item.q}</span>
        <span class="arrow">▼</span>
      </button>
      <div class="faq-a">
        <div class="faq-a-inner">${item.a}</div>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.faq-item').forEach(item => {
    const qBtn = item.querySelector('.faq-q');
    qBtn.addEventListener('click', () => {
      item.classList.toggle('open');
    });
  });
}

// ===== SCROLL REVEAL ANIMATION =====
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));
}

// ===== HEADER SCROLL EFFECT =====
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// ===== MOBILE MENU =====
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
  }
}

// ===== LOAD HEADER AND FOOTER =====
async function loadHeaderAndFooter() {
  // Header HTML
  const headerHtml = `
    <header class="site-header">
      <div class="header-inner">
        <a href="/" class="logo">
          <div class="logo-icon">🎡</div>
          <div class="logo-text">Randomizer<span>Wheel</span></div>
        </a>
        <div class="hamburger">
          <span></span><span></span><span></span>
        </div>
        <div class="nav">
          <a href="#home">Home</a>
          <a href="#spinner">Spinner</a>
          <a href="#wheel-types">Wheels</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
          <a href="#spinner" class="btn btn-primary btn-sm">🎰 Spin Now</a>
        </div>
      </div>
    </header>
    <div class="mobile-nav">
      <a href="#home">Home</a>
      <a href="#spinner">Spinner</a>
      <a href="#wheel-types">Wheels</a>
      <a href="#how-it-works">How It Works</a>
      <a href="#features">Features</a>
      <a href="#faq">FAQ</a>
      <a href="#spinner">Spin Now</a>
    </div>
  `;
  
  // Footer HTML
  const footerHtml = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-inner">
          <div class="footer-brand">
            <a href="/" class="logo">
              <div class="logo-icon">🎡</div>
              <div class="logo-text">Randomizer<span>Wheel</span></div>
            </a>
            <p>The most advanced free spin the wheel app. Make any decision fun and fair.</p>
          </div>
          <div class="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#spinner">Wheel Spinner</a></li>
              <li><a href="#wheel-types">Wheel Types</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#features">Features</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Use</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Community</h4>
            <ul>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Feedback</a></li>
              <li><a href="#">Suggest a Feature</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2025 RandomizerWheel | Free Spin The Wheel Random Picker</p>
          <div class="footer-keywords">Random Wheel | Wheel Spinner | Spin Wheel | Random Picker | Decision Maker</div>
        </div>
      </div>
    </footer>
  `;
  
  if (headerRoot) headerRoot.innerHTML = headerHtml;
  if (footerRoot) footerRoot.innerHTML = footerHtml;
  
  initMobileMenu();
  initHeaderScroll();
}

// ===== INITIALIZE APP =====
async function init() {
  await loadHeaderAndFooter();
  
  // Initialize wheels
  mainWheel = new WheelInstance(mainCanvas, []);
  heroWheel = new WheelInstance(heroCanvas, []);
  featureWheel = new WheelInstance(featureCanvas, []);
  
  // Load saved data
  loadFromLocalStorage();
  
  // Default demo items if empty
  if (mainSegments.length === 0) {
    const defaultItems = ["Pizza", "Tacos", "Burgers", "Sushi", "Pasta", "Salad"];
    itemsTextarea.value = defaultItems.join('\n');
    mainSegments = defaultItems.map(text => ({ text, weight: 1 }));
    updateAllWheelsFromSegments();
  } else {
    updateAllWheelsFromSegments();
  }
  
  // Event listeners
  buildWheelBtn.addEventListener('click', buildWheelFromText);
  shuffleItemsBtn.addEventListener('click', shuffleItems);
  clearItemsBtn.addEventListener('click', clearItems);
  clearHistoryBtn.addEventListener('click', clearHistory);
  
  mainSpinBtn.addEventListener('click', () => mainWheel.spin(showResult));
  mainSpinBtnBottom.addEventListener('click', () => mainWheel.spin(showResult));
  heroSpinBtn.addEventListener('click', () => heroWheel.spin(showResult));
  featureSpinBtn.addEventListener('click', () => featureWheel.spin(showResult));
  
  fontSizeRange.addEventListener('input', (e) => setFontSize(e.target.value));
  removeWinnerCheckbox.addEventListener('change', (e) => {
    removeWinnerMode = e.target.checked;
    saveToLocalStorage();
  });
  showConfettiCheckbox.addEventListener('change', (e) => {
    showConfetti = e.target.checked;
    saveToLocalStorage();
  });
  
  themeSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => setTheme(swatch.dataset.theme));
  });
  
  spinAgainBtn.addEventListener('click', closeModal);
  closeModalBtn.addEventListener('click', closeModal);
  resultModal.addEventListener('click', (e) => {
    if (e.target === resultModal) closeModal();
  });
  
  // Load wheel types and FAQ
  loadWheelTypes();
  loadFaq();
  
  // Add reveal class to sections
  document.querySelectorAll('section').forEach(section => {
    section.classList.add('reveal');
  });
  initScrollReveal();
  
  // Add confetti container styles if missing
  const style = document.createElement('style');
  style.textContent = `
    .confetti-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    }
    .reveal {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.7s ease;
    }
    .reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
