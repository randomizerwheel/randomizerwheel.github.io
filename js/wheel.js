// ===== WHEEL.JS =====
// Core wheel rendering and spinning engine for the Spin The Wheel application

// ===== WHEEL CLASS =====
class FortuneWheel {
  constructor(canvasId, options = {}) {
    this.canvas = typeof canvasId === 'string' ? document.getElementById(canvasId) : canvasId;
    if (!this.canvas) {
      console.error(`Canvas element not found: ${canvasId}`);
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.segments = [];
    this.rotation = 0;
    this.animationId = null;
    this.isSpinning = false;
    this.fontSize = options.fontSize || 14;
    this.theme = options.theme || 'vivid';
    this.onSpinStart = options.onSpinStart || null;
    this.onSpinEnd = options.onSpinEnd || null;
    this.onSegmentClick = options.onSegmentClick || null;
    
    // Bind methods
    this.handleResize = this.handleResize.bind(this);
    this.handleClick = this.handleClick.bind(this);
    
    // Setup event listeners
    window.addEventListener('resize', this.handleResize);
    this.canvas.addEventListener('click', this.handleClick);
    
    // Initial resize
    setTimeout(() => this.handleResize(), 100);
  }
  
  // ===== RESIZE HANDLER =====
  handleResize() {
    const container = this.canvas.parentElement;
    if (container) {
      const size = Math.min(container.clientWidth, 500);
      this.canvas.width = size;
      this.canvas.height = size;
      this.draw();
    }
  }
  
  // ===== UPDATE SEGMENTS =====
  updateSegments(segments) {
    if (!segments || segments.length === 0) {
      this.segments = [];
    } else {
      this.segments = segments.map((segment, index) => ({
        id: index,
        text: typeof segment === 'string' ? segment : segment.text,
        value: typeof segment === 'object' ? segment.value || 1 : 1,
        color: segment.color || null,
        weight: typeof segment === 'object' ? segment.weight || 1 : 1
      }));
    }
    this.draw();
  }
  
  // ===== GET SEGMENT COLORS =====
  getSegmentColors(segmentCount) {
    const themes = {
      vivid: ['#FF4D6D', '#FFB703', '#06D6A0', '#FF8C42', '#8338EC', '#3A86FF', '#E63946', '#F4A261', '#2A9D8F', '#9C89B8', '#EF476F', '#FFD166'],
      neon: ['#FF00FF', '#00FFFF', '#AAFF00', '#FF6600', '#FF0099', '#00FFAA', '#FF3366', '#33FFCC', '#FFCC00', '#9933FF', '#00FF66', '#FF9933'],
      pastel: ['#FFB3C1', '#FFD6A5', '#CAFFBF', '#BDE0FE', '#E4C1F9', '#FDE2C4', '#C5D3E8', '#FFC8DD', '#B5EAD7', '#C7E9FB', '#D4A5A5', '#FAD2E1'],
      dark: ['#2D2D2D', '#555555', '#888888', '#AAAAAA', '#3A3A3A', '#666666', '#1E1E1E', '#4A4A4A', '#777777', '#999999', '#2F2F2F', '#5E5E5E'],
      sunset: ['#F72585', '#FF8C00', '#FFD60A', '#B5179E', '#FF5C8A', '#FFB347', '#E63946', '#F4A261', '#9C27B0', '#FF6D00', '#FB8B67', '#F9C74F'],
      ocean: ['#0077B6', '#00B4D8', '#48CAE4', '#90E0EF', '#03045E', '#023E8A', '#0096C7', '#35A7FF', '#4EA8DE', '#56CFE1', '#1A759F', '#34A0A4']
    };
    
    const themeColors = themes[this.theme] || themes.vivid;
    const colors = [];
    for (let i = 0; i < segmentCount; i++) {
      colors.push(themeColors[i % themeColors.length]);
    }
    return colors;
  }
  
  // ===== DRAW THE WHEEL =====
  draw() {
    if (!this.ctx) return;
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 5;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);
    
    // Draw background glow effect
    this.ctx.shadowBlur = 0;
    
    if (this.segments.length === 0) {
      // Draw empty wheel state
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#1a1a35';
      this.ctx.fill();
      this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      this.ctx.fillStyle = '#9090bb';
      this.ctx.font = `bold ${Math.floor(radius / 10)}px 'Nunito', sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('Add Items', centerX, centerY);
      return;
    }
    
    const angleStep = (Math.PI * 2) / this.segments.length;
    const colors = this.getSegmentColors(this.segments.length);
    
    // Draw each segment
    for (let i = 0; i < this.segments.length; i++) {
      const startAngle = i * angleStep + this.rotation;
      const endAngle = (i + 1) * angleStep + this.rotation;
      const segment = this.segments[i];
      
      // Draw segment arc
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      this.ctx.closePath();
      
      // Fill segment
      this.ctx.fillStyle = segment.color || colors[i];
      this.ctx.fill();
      
      // Draw segment border
      this.ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
      
      // Draw separator line
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(centerX + Math.cos(startAngle) * radius, centerY + Math.sin(startAngle) * radius);
      this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      this.ctx.stroke();
      
      // Draw text
      const textAngle = startAngle + angleStep / 2;
      const textRadius = radius * 0.65;
      const x = centerX + Math.cos(textAngle) * textRadius;
      const y = centerY + Math.sin(textAngle) * textRadius;
      
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(textAngle + Math.PI / 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = `bold ${this.fontSize}px 'Nunito', sans-serif`;
      this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
      this.ctx.shadowBlur = 3;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      let displayText = segment.text;
      // Truncate long text based on available space
      const maxChars = Math.floor(radius / (this.fontSize * 0.6));
      if (displayText.length > maxChars) {
        displayText = displayText.substring(0, maxChars - 2) + '..';
      }
      this.ctx.fillText(displayText, 0, 0);
      this.ctx.restore();
    }
    
    // Draw inner circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius * 0.12, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius * 0.09, 0, Math.PI * 2);
    this.ctx.fillStyle = this.getSegmentColors(1)[0];
    this.ctx.fill();
    
    // Draw outer ring
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius + 3, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }
  
  // ===== SPIN THE WHEEL =====
  spin(options = {}) {
    if (this.isSpinning || this.segments.length === 0) {
      return null;
    }
    
    const duration = options.duration || 2000;
    const onComplete = options.onComplete || null;
    const onWin = options.onWin || null;
    
    // Calculate winner based on weights
    const totalWeight = this.segments.reduce((sum, s) => sum + (s.weight || 1), 0);
    let random = Math.random() * totalWeight;
    let winnerIndex = 0;
    let accumulated = 0;
    
    for (let i = 0; i < this.segments.length; i++) {
      accumulated += (this.segments[i].weight || 1);
      if (random <= accumulated) {
        winnerIndex = i;
        break;
      }
    }
    
    const winner = this.segments[winnerIndex];
    
    // Calculate target rotation
    const anglePerSegment = (Math.PI * 2) / this.segments.length;
    const currentSegmentIndex = this.getCurrentSegmentIndex();
    
    // Calculate additional full rotations (5-10 spins)
    const fullRotations = Math.floor(Math.random() * 6) + 5;
    let targetRotation = this.rotation;
    
    // We want the pointer (top) to point to the winner segment
    // Pointer is at angle -PI/2 (12 o'clock position)
    const pointerAngle = -Math.PI / 2;
    const targetAngleForWinner = (winnerIndex * anglePerSegment) + (anglePerSegment / 2);
    
    // Calculate needed rotation to align winner with pointer
    let neededRotation = pointerAngle - targetAngleForWinner;
    
    // Normalize to [0, 2PI)
    neededRotation = ((neededRotation % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
    
    // Add full rotations
    targetRotation = neededRotation + (fullRotations * Math.PI * 2);
    
    // Animate
    this.animateSpin(this.rotation, targetRotation, duration, () => {
      this.isSpinning = false;
      if (onComplete) onComplete(winner);
      if (onWin) onWin(winner.text, winnerIndex);
    });
    
    if (this.onSpinStart) this.onSpinStart();
    
    return winner;
  }
  
  // ===== GET CURRENT SEGMENT INDEX AT TOP (12 o'clock) =====
  getCurrentSegmentIndex() {
    if (this.segments.length === 0) return -1;
    
    const anglePerSegment = (Math.PI * 2) / this.segments.length;
    const pointerAngle = -Math.PI / 2; // 12 o'clock position
    
    // Calculate which segment is at the pointer
    let rawAngle = (pointerAngle - this.rotation) % (Math.PI * 2);
    if (rawAngle < 0) rawAngle += Math.PI * 2;
    
    const segmentIndex = Math.floor(rawAngle / anglePerSegment);
    return Math.min(segmentIndex, this.segments.length - 1);
  }
  
  // ===== ANIMATE SPIN =====
  animateSpin(startRotation, targetRotation, duration, onComplete) {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.isSpinning = true;
    const startTime = performance.now();
    
    const easeOutCubic = (t) => {
      return 1 - Math.pow(1 - t, 3);
    };
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      let progress = Math.min(1, elapsed / duration);
      const easeProgress = easeOutCubic(progress);
      
      this.rotation = startRotation + (targetRotation - startRotation) * easeProgress;
      this.draw();
      
      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.rotation = targetRotation % (Math.PI * 2);
        this.draw();
        this.animationId = null;
        this.isSpinning = false;
        if (onComplete) onComplete();
      }
    };
    
    this.animationId = requestAnimationFrame(animate);
  }
  
  // ===== STOP SPIN (if needed) =====
  stopSpin() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      this.isSpinning = false;
    }
  }
  
  // ===== HANDLE CLICK ON WHEEL =====
  handleClick(event) {
    if (this.isSpinning) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(this.canvas.width, this.canvas.height) / 2 - 5;
    
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if click is within wheel radius
    if (distance <= radius && distance > radius * 0.15 && this.segments.length > 0) {
      let angle = Math.atan2(dy, dx);
      if (angle < 0) angle += Math.PI * 2;
      
      // Adjust for rotation
      let adjustedAngle = angle - this.rotation;
      if (adjustedAngle < 0) adjustedAngle += Math.PI * 2;
      
      const anglePerSegment = (Math.PI * 2) / this.segments.length;
      const segmentIndex = Math.floor(adjustedAngle / anglePerSegment);
      
      if (segmentIndex >= 0 && segmentIndex < this.segments.length) {
        if (this.onSegmentClick) {
          this.onSegmentClick(this.segments[segmentIndex], segmentIndex);
        }
      }
    }
  }
  
  // ===== UPDATE THEME =====
  setTheme(theme) {
    this.theme = theme;
    this.draw();
  }
  
  // ===== UPDATE FONT SIZE =====
  setFontSize(size) {
    this.fontSize = size;
    this.draw();
  }
  
  // ===== GET SEGMENTS =====
  getSegments() {
    return [...this.segments];
  }
  
  // ===== GET SEGMENT COUNT =====
  getSegmentCount() {
    return this.segments.length;
  }
  
  // ===== IS SPINNING =====
  getIsSpinning() {
    return this.isSpinning;
  }
  
  // ===== RESET ROTATION =====
  resetRotation() {
    this.rotation = 0;
    this.draw();
  }
  
  // ===== DESTROY WHEEL =====
  destroy() {
    this.stopSpin();
    window.removeEventListener('resize', this.handleResize);
    this.canvas.removeEventListener('click', this.handleClick);
  }
}

// ===== PRESET WHEEL CONFIGURATIONS =====
const WheelPresets = {
  // Decision making wheels
  yesNo: {
    name: 'Yes / No',
    segments: ['Yes', 'No'],
    defaultTheme: 'vivid'
  },
  
  // Number wheels
  numbers1to10: {
    name: 'Numbers 1-10',
    segments: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    defaultTheme: 'ocean'
  },
  
  numbers1to20: {
    name: 'Numbers 1-20',
    segments: Array.from({ length: 20 }, (_, i) => (i + 1).toString()),
    defaultTheme: 'ocean'
  },
  
  // Alphabet wheels
  alphabet: {
    name: 'Alphabet A-Z',
    segments: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    defaultTheme: 'pastel'
  },
  
  vowels: {
    name: 'Vowels',
    segments: ['A', 'E', 'I', 'O', 'U', 'Y'],
    defaultTheme: 'pastel'
  },
  
  // Food wheels
  foodPicker: {
    name: 'Food Picker',
    segments: ['Pizza', 'Tacos', 'Sushi', 'Burgers', 'Pasta', 'Salad', 'Sandwich', 'Soup'],
    defaultTheme: 'vivid'
  },
  
  cuisinePicker: {
    name: 'Cuisine Picker',
    segments: ['Italian', 'Mexican', 'Japanese', 'Chinese', 'Indian', 'Thai', 'French', 'Greek'],
    defaultTheme: 'sunset'
  },
  
  // Activity wheels
  activityPicker: {
    name: 'Activity Picker',
    segments: ['Movie', 'Games', 'Reading', 'Exercise', 'Cooking', 'Music', 'Art', 'Walking'],
    defaultTheme: 'neon'
  },
  
  // Classroom wheels
  studentPicker: {
    name: 'Student Picker',
    segments: [], // To be filled by user
    defaultTheme: 'ocean'
  },
  
  topicPicker: {
    name: 'Topic Picker',
    segments: ['Math', 'Science', 'History', 'English', 'Art', 'Music', 'PE', 'Geography'],
    defaultTheme: 'pastel'
  },
  
  // Game wheels
  truthOrDare: {
    name: 'Truth or Dare',
    segments: ['Truth', 'Dare', 'Truth', 'Dare', 'Double Dare', 'Truth'],
    defaultTheme: 'vivid'
  },
  
  challengeWheel: {
    name: 'Challenge Wheel',
    segments: ['10 Pushups', 'Sing a Song', 'Tell a Joke', 'Dance', 'Facial Expression', 'Impersonation'],
    defaultTheme: 'neon'
  },
  
  // Chore wheels
  choreWheel: {
    name: 'Chore Wheel',
    segments: ['Dishes', 'Laundry', 'Vacuum', 'Take out Trash', 'Clean Bathroom', 'Dust', 'Mop', 'Walk Dog'],
    defaultTheme: 'dark'
  },
  
  // Color wheels
  colorWheel: {
    name: 'Color Wheel',
    segments: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown'],
    defaultTheme: 'vivid'
  },
  
  // Prize wheels
  prizeWheel: {
    name: 'Prize Wheel',
    segments: ['$5 Gift Card', 'Free Coffee', '10% Off', 'Mystery Box', 'Free Shipping', 'Try Again'],
    defaultTheme: 'sunset'
  },
  
  // Random wheels
  randomWords: {
    name: 'Random Words',
    segments: ['Happy', 'Awesome', 'Great', 'Wonderful', 'Amazing', 'Fantastic', 'Brilliant', 'Excellent'],
    defaultTheme: 'pastel'
  }
};

// ===== HELPER FUNCTIONS =====
function createRandomSegments(count, prefix = 'Item') {
  const segments = [];
  for (let i = 1; i <= count; i++) {
    segments.push(`${prefix} ${i}`);
  }
  return segments;
}

function createWeightedSegments(segments, weights) {
  if (segments.length !== weights.length) {
    console.error('Segments and weights must have same length');
    return segments.map(s => ({ text: s, weight: 1 }));
  }
  return segments.map((text, index) => ({ text, weight: weights[index] }));
}

function shuffleSegments(segments) {
  const shuffled = [...segments];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ===== EXPORT FOR MODULE USE =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FortuneWheel, WheelPresets, createRandomSegments, createWeightedSegments, shuffleSegments };
}

// ===== MAKE AVAILABLE GLOBALLY =====
if (typeof window !== 'undefined') {
  window.FortuneWheel = FortuneWheel;
  window.WheelPresets = WheelPresets;
  window.createRandomSegments = createRandomSegments;
  window.createWeightedSegments = createWeightedSegments;
  window.shuffleSegments = shuffleSegments;
}
