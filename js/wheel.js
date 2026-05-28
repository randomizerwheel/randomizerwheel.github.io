// wheel.js - Advanced wheel drawing and spinning logic for RandomizerWheel

// =============================================
// WHEEL RENDERING ENGINE
// =============================================

// Cache for wheel rendering to improve performance
let wheelCache = {
  cached: false,
  imageData: null,
  segmentsHash: ""
};

function getSegmentsHash() {
  return wheelApp.segments.join(",") + "|" + wheelApp.colors.join(",") + "|" + wheelApp.spinAngle;
}

// Main wheel drawing function with advanced features
function drawWheel() {
  if (!wheelApp.ctx || !wheelApp.canvas) return;
  
  const ctx = wheelApp.ctx;
  const canvas = wheelApp.canvas;
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width * 0.45;
  const segmentCount = wheelApp.segments.length;
  
  if (segmentCount === 0) {
    drawEmptyWheel(ctx, centerX, centerY, radius);
    return;
  }
  
  const segmentAngle = (Math.PI * 2) / segmentCount;
  
  // Clear canvas with gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#f8f2ff");
  gradient.addColorStop(1, "#fff9f0");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Draw each segment
  for (let i = 0; i < segmentCount; i++) {
    const startAngle = i * segmentAngle + wheelApp.spinAngle;
    const endAngle = (i + 1) * segmentAngle + wheelApp.spinAngle;
    
    // Draw segment arc
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    
    // Fill with segment color
    ctx.fillStyle = wheelApp.colors[i % wheelApp.colors.length];
    ctx.fill();
    
    // Add subtle inner shadow/stroke
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    
    // Draw inner separator line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius * 0.85, startAngle, endAngle);
    ctx.lineTo(centerX, centerY);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw text on segment
    drawSegmentText(ctx, centerX, centerY, radius, startAngle, segmentAngle, wheelApp.segments[i], i);
  }
  
  // Draw decorative outer ring
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
  ctx.strokeStyle = "#ffd600";
  ctx.lineWidth = 4;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
  ctx.strokeStyle = "#ff5733";
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw inner decorative rings
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.85, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Draw center hub
  drawCenterHub(ctx, centerX, centerY, radius);
  
  // Draw outer dot pattern for visual appeal
  drawOuterDots(ctx, centerX, centerY, radius + 8, segmentCount);
}

function drawEmptyWheel(ctx, cx, cy, radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#e0d5f0";
  ctx.fill();
  ctx.fillStyle = "#8a7aa8";
  ctx.font = `bold ${Math.max(14, radius / 8)}px "Nunito"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Add Entries", cx, cy);
}

function drawSegmentText(ctx, cx, cy, radius, startAngle, segmentAngle, text, index) {
  const textRadius = radius * 0.65;
  const textAngle = startAngle + segmentAngle / 2;
  const x = cx + Math.cos(textAngle) * textRadius;
  const y = cy + Math.sin(textAngle) * textRadius;
  
  // Rotate text for better readability
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(textAngle + (textAngle > Math.PI/2 && textAngle < 3*Math.PI/2 ? Math.PI : 0));
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // Determine font size based on text length
  let fontSize = Math.max(10, Math.min(18, radius / 10));
  if (text.length > 15) fontSize = fontSize * 0.7;
  else if (text.length > 10) fontSize = fontSize * 0.85;
  
  ctx.font = `bold ${fontSize}px "Nunito", "Segoe UI", sans-serif`;
  
  // Text shadow for better readability
  ctx.shadowBlur = 2;
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, 0, 0);
  
  // Add second pass for stroke effect
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1.5;
  ctx.strokeText(text, 0, 0);
  
  ctx.restore();
}

function drawCenterHub(ctx, cx, cy, radius) {
  const hubRadius = radius * 0.12;
  const innerHubRadius = radius * 0.07;
  
  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, hubRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#2d2040";
  ctx.fill();
  ctx.strokeStyle = "#ffd600";
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Inner ring
  ctx.beginPath();
  ctx.arc(cx, cy, innerHubRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#ff5733";
  ctx.fill();
  
  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, hubRadius * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd600";
  ctx.fill();
  
  // Add shine effect
  ctx.beginPath();
  ctx.arc(cx - hubRadius * 0.3, cy - hubRadius * 0.3, hubRadius * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fill();
}

function drawOuterDots(ctx, cx, cy, radius, segmentCount) {
  const dotCount = Math.min(segmentCount * 2, 36);
  for (let i = 0; i < dotCount; i++) {
    const angle = (i / dotCount) * Math.PI * 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? "#ffd600" : "#ff5733";
    ctx.fill();
  }
}

// =============================================
// HERO WHEEL ANIMATION
// =============================================
let heroSpinAngle = 0;
let heroSpinAnimation = null;

function updateHeroWheel() {
  if (!wheelApp.heroCtx || !wheelApp.heroCanvas) return;
  
  const segments = ["Prize", "Game", "Movie", "Dinner", "Travel", "Music"];
  const colors = ["#FF595E", "#FFCA3A", "#8AC926", "#1982C4", "#6A4C93", "#FF6D00"];
  const ctx = wheelApp.heroCtx;
  const canvas = wheelApp.heroCanvas;
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const radius = w * 0.42;
  const segmentAngle = (Math.PI * 2) / segments.length;
  
  ctx.clearRect(0, 0, w, h);
  
  // Draw background
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, "#f8f2ff");
  gradient.addColorStop(1, "#fff9f0");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  
  // Draw segments
  for (let i = 0; i < segments.length; i++) {
    const startAngle = i * segmentAngle + heroSpinAngle;
    const endAngle = (i + 1) * segmentAngle + heroSpinAngle;
    
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw text
    const textRadius = radius * 0.65;
    const textAngle = startAngle + segmentAngle / 2;
    const x = cx + Math.cos(textAngle) * textRadius;
    const y = cy + Math.sin(textAngle) * textRadius;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(textAngle);
    ctx.font = "bold 11px Nunito";
    ctx.fillStyle = "#fff";
    ctx.shadowBlur = 1;
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.fillText(segments[i], 0, 0);
    ctx.restore();
  }
  
  // Draw center hub
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = "#2d2040";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd600";
  ctx.fill();
}

function animateHeroWheel() {
  heroSpinAngle += 0.02;
  updateHeroWheel();
  heroSpinAnimation = requestAnimationFrame(animateHeroWheel);
}

function startHeroAnimation() {
  if (heroSpinAnimation) cancelAnimationFrame(heroSpinAnimation);
  heroSpinAnimation = requestAnimationFrame(animateHeroWheel);
}

function stopHeroAnimation() {
  if (heroSpinAnimation) {
    cancelAnimationFrame(heroSpinAnimation);
    heroSpinAnimation = null;
  }
}

// =============================================
// ENHANCED SPINNING WITH PHYSICS
// =============================================

// Advanced spin with easing and physics
function spinWheelAdvanced() {
  if (wheelApp.spinning) return;
  if (wheelApp.segments.length === 0) {
    showToast("Please add some entries first!");
    return;
  }
  
  wheelApp.spinning = true;
  playSound('spin');
  stopHeroAnimation();
  
  // Random number of full rotations (5-12)
  const fullRotations = 5 + Math.random() * 8;
  const segmentCount = wheelApp.segments.length;
  const segmentAngle = (Math.PI * 2) / segmentCount;
  
  // Random target segment with some weight (can be biased if needed, but keeping fair)
  const targetIndex = Math.floor(Math.random() * segmentCount);
  
  // Calculate target angle (pointer at top = -PI/2)
  const pointerAngle = -Math.PI / 2;
  let targetAngle = pointerAngle - (targetIndex * segmentAngle) - (segmentAngle / 2);
  targetAngle = ((targetAngle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
  
  const startAngle = wheelApp.spinAngle % (Math.PI * 2);
  let delta = targetAngle - startAngle;
  if (delta < 0) delta += Math.PI * 2;
  
  const totalDelta = delta + (Math.PI * 2 * fullRotations);
  const startTime = performance.now();
  const duration = 2500; // 2.5 seconds spin
  
  // Tick sound intervals for realistic wheel clicking
  let lastTickIndex = -1;
  const tickInterval = setInterval(() => {
    if (!wheelApp.spinning) {
      clearInterval(tickInterval);
      return;
    }
    if (wheelApp.soundEnabled) {
      playTickSound();
    }
  }, 80);
  
  function animateSpin(now) {
    const elapsed = now - startTime;
    let t = Math.min(1, elapsed / duration);
    
    // Cubic ease out for smooth stop
    const easeOut = 1 - Math.pow(1 - t, 3);
    const currentDelta = totalDelta * easeOut;
    wheelApp.spinAngle = startAngle + currentDelta;
    wheelApp.spinAngle %= (Math.PI * 2);
    
    drawWheel();
    
    // Trigger tick visual feedback
    const currentAngle = wheelApp.spinAngle;
    const tickThreshold = Math.floor((currentAngle / (Math.PI * 2)) * 100);
    if (tickThreshold !== lastTickIndex && t < 0.95) {
      lastTickIndex = tickThreshold;
      // Optional: add visual flash effect on wheel edge
    }
    
    if (t < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      clearInterval(tickInterval);
      wheelApp.spinAngle = targetAngle;
      drawWheel();
      
      const winner = wheelApp.segments[targetIndex];
      showWinner(winner);
      
      if (wheelApp.removeWinner && wheelApp.segments.length > 1) {
        wheelApp.segments.splice(targetIndex, 1);
        updateColorsForSegments();
        renderEntriesList();
      }
      
      addToHistory(winner);
      playSound('cheer');
      if (wheelApp.confettiEnabled) showConfetti();
      
      wheelApp.spinning = false;
      saveWheelToLocal();
      startHeroAnimation();
    }
  }
  
  requestAnimationFrame(animateSpin);
}

function playTickSound() {
  if (!wheelApp.soundEnabled) return;
  try {
    if (!window.audioContext) {
      window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const now = window.audioContext.currentTime;
    const osc = window.audioContext.createOscillator();
    const gain = window.audioContext.createGain();
    osc.connect(gain);
    gain.connect(window.audioContext.destination);
    osc.frequency.value = 440 + Math.random() * 200;
    gain.gain.value = 0.08;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.08);
    osc.stop(now + 0.08);
  } catch(e) { /* silent fail */ }
}

// =============================================
// WHEEL RESIZE AND RESPONSIVENESS
// =============================================

function resizeWheel() {
  const mainCanvas = document.getElementById('mainWheel');
  if (!mainCanvas) return;
  
  let size;
  if (window.innerWidth < 768) {
    size = Math.min(320, window.innerWidth - 60);
  } else {
    size = 460;
  }
  
  mainCanvas.width = size;
  mainCanvas.height = size;
  drawWheel();
}

// =============================================
// WHEEL IMPORT/EXPORT
// =============================================

function exportWheelData() {
  const data = {
    segments: wheelApp.segments,
    theme: wheelApp.currentTheme,
    settings: {
      sound: wheelApp.soundEnabled,
      confetti: wheelApp.confettiEnabled,
      removeWinner: wheelApp.removeWinner
    }
  };
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "wheel-data.json";
  a.click();
  URL.revokeObjectURL(url);
  showToast("Wheel data exported!");
}

function importWheelData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.segments && Array.isArray(data.segments) && data.segments.length > 0) {
        wheelApp.segments = data.segments;
      }
      if (data.theme && THEMES[data.theme]) {
        setTheme(data.theme);
      }
      if (data.settings) {
        if (typeof data.settings.sound === 'boolean') wheelApp.soundEnabled = data.settings.sound;
        if (typeof data.settings.confetti === 'boolean') wheelApp.confettiEnabled = data.settings.confetti;
        if (typeof data.settings.removeWinner === 'boolean') wheelApp.removeWinner = data.settings.removeWinner;
        
        // Sync UI toggles
        const soundToggle = document.getElementById('soundToggle');
        const confettiToggle = document.getElementById('confettiToggle');
        const removeToggle = document.getElementById('removeToggle');
        if (soundToggle) soundToggle.checked = wheelApp.soundEnabled;
        if (confettiToggle) confettiToggle.checked = wheelApp.confettiEnabled;
        if (removeToggle) removeToggle.checked = wheelApp.removeWinner;
      }
      updateColorsForSegments();
      renderEntriesList();
      drawWheel();
      saveWheelToLocal();
      showToast("Wheel imported successfully!");
    } catch(err) {
      showToast("Invalid file format");
    }
  };
  reader.readAsText(file);
}

// =============================================
// KEYBOARD SHORTCUTS
// =============================================

function initWheelShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Space or Enter to spin
    if (e.code === 'Space' || e.code === 'Enter') {
      const activeElement = document.activeElement;
      // Don't spin if typing in input
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault();
      if (!wheelApp.spinning) {
        spinWheelAdvanced();
      }
    }
    // 'R' key to reset/clear entries
    if (e.code === 'KeyR' && e.ctrlKey) {
      e.preventDefault();
      if (confirm("Reset all entries?")) {
        wheelApp.segments = ["Spin Me!"];
        updateColorsForSegments();
        renderEntriesList();
        drawWheel();
        saveWheelToLocal();
        showToast("Wheel reset");
      }
    }
  });
}

// =============================================
// EXPORT PUBLIC METHODS
// =============================================

// Override the global spin function with advanced version
window.spinWheel = spinWheelAdvanced;

// Initialize wheel-specific features
function initWheel() {
  resizeWheel();
  startHeroAnimation();
  initWheelShortcuts();
  
  // Add resize listener
  window.addEventListener('resize', () => {
    resizeWheel();
  });
}

// Call this when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWheel);
} else {
  initWheel();
}
