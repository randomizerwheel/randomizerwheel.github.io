// footer.js - Dynamic footer component for RandomizerWheel

(function() {
  const currentYear = new Date().getFullYear();
  
  function createFooter() {
    return `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <a href="/" class="footer-logo" style="text-decoration: none;">
                <span style="font-size: 1.8rem;">🎡</span>
                <span style="font-weight: 800;">Spin The<span style="color:#ffd600;">Wheel</span></span>
              </a>
              <p>The ultimate free spin the wheel random picker for giveaways, classrooms, games, and everyday decisions.</p>
              <div style="margin-top: 20px; display: flex; gap: 12px;">
                <span style="font-size: 1.4rem;">⭐</span>
                <span style="font-size: 1.4rem;">🎯</span>
                <span style="font-size: 1.4rem;">🎨</span>
                <span style="font-size: 1.4rem;">⚡</span>
              </div>
            </div>
            
            <div class="footer-col">
              <h4>Quick Links</h4>
              <a href="#home" class="footer-link" data-footer-nav="home">🏠 Home</a>
              <a href="#wheel-app" class="footer-link" data-footer-nav="wheel">🎡 Spin Wheel</a>
              <a href="#wheel-types" class="footer-link" data-footer-nav="types">🔄 Wheel Types</a>
              <a href="#features" class="footer-link" data-footer-nav="features">⭐ Features</a>
              <a href="#use-cases" class="footer-link" data-footer-nav="uses">📋 Use Cases</a>
              <a href="#how-it-works" class="footer-link" data-footer-nav="how">❓ How It Works</a>
              <a href="#faq" class="footer-link" data-footer-nav="faq">💬 FAQ</a>
            </div>
            
            <div class="footer-col">
              <h4>Popular Wheels</h4>
              <a href="#wheel-app" class="footer-link" data-preset="yesno">✅ Yes/No Wheel</a>
              <a href="#wheel-app" class="footer-link" data-preset="numbers">🔢 Number Wheel</a>
              <a href="#wheel-app" class="footer-link" data-preset="colors">🎨 Color Wheel</a>
              <a href="#wheel-app" class="footer-link" data-preset="names">👥 Name Picker</a>
              <a href="#wheel-app" class="footer-link" data-preset="lunch">🍔 Food Picker</a>
              <a href="#wheel-app" class="footer-link" data-preset="games">🎮 Game Picker</a>
            </div>
            
            <div class="footer-col">
              <h4>Pages</h4>
              <a href="about" class="footer-link">About</a>
              <a href="contact" class="footer-link">Contact</a>
              <a href="privacy" class="footer-link">Privacy Policy</a>
              <a href="terms" class="footer-link">Terms of Use</a>
              <a href="cookie" class="footer-link">Cookies Policy</a>
            </div>
          </div>
          
          <div class="footer-bottom">
            <p>&copy; ${currentYear} RandomizerWheel.github.io | Free Spin The Wheel Random Picker</p>
            <div style="display: flex; gap: 20px;">
              <span style="cursor: pointer;" id="scrollToTopBtn" class="footer-link">⬆️ Back to Top</span>
              <span style="cursor: pointer;" id="feedbackBtn" class="footer-link">💬 Feedback</span>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
  
  // Handle footer navigation links
  function initFooterNavigation() {
    const footerLinks = document.querySelectorAll('.footer-link[data-footer-nav]');
    footerLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            const headerHeight = document.querySelector('.site-header')?.offsetHeight || 70;
            window.scrollTo({
              top: targetElement.offsetTop - headerHeight,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }
  
  // Handle preset links in footer
  function initFooterPresets() {
    const presetLinks = document.querySelectorAll('.footer-link[data-preset]');
    presetLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const preset = link.getAttribute('data-preset');
        if (preset && typeof loadPreset === 'function') {
          // Navigate to wheel section first
          const wheelSection = document.getElementById('wheel-app');
          if (wheelSection) {
            const headerHeight = document.querySelector('.site-header')?.offsetHeight || 70;
            window.scrollTo({
              top: wheelSection.offsetTop - headerHeight,
              behavior: 'smooth'
            });
          }
          // Load preset after a short delay to ensure scroll completes
          setTimeout(() => {
            loadPreset(preset);
          }, 300);
        } else if (preset) {
          showToast('Wheel is loading, please try again in a moment');
        }
      });
    });
  }
  
  // Export wheel data
  function initExportWheel() {
    const exportBtn = document.getElementById('exportWheelLink');
    if (exportBtn && typeof exportWheelData === 'function') {
      exportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        exportWheelData();
      });
    } else if (exportBtn) {
      exportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Wheel data export available after wheel loads');
      });
    }
  }
  
  // Import wheel data
  function initImportWheel() {
    const importBtn = document.getElementById('importWheelLink');
    if (importBtn) {
      importBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Create file input dynamically
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.addEventListener('change', (event) => {
          const file = event.target.files[0];
          if (file && typeof importWheelData === 'function') {
            importWheelData(file);
          } else if (file) {
            showToast('Import feature ready - spin the wheel first!');
          }
        });
        fileInput.click();
      });
    }
  }
  
  // Reset wheel to default
  function initResetWheel() {
    const resetBtn = document.getElementById('resetWheelLink');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Reset wheel to default entries? Your current wheel will be lost.')) {
          if (typeof wheelApp !== 'undefined' && wheelApp) {
            wheelApp.segments = ["Pizza 🍕", "Tacos 🌮", "Sushi 🍣", "Burger 🍔", "Salad 🥗", "Pasta 🍝", "Ice Cream 🍦", "Coffee ☕"];
            if (typeof updateColorsForSegments === 'function') updateColorsForSegments();
            if (typeof renderEntriesList === 'function') renderEntriesList();
            if (typeof drawWheel === 'function') drawWheel();
            if (typeof saveWheelToLocal === 'function') saveWheelToLocal();
            showToast('Wheel reset to default!');
          } else {
            showToast('Please wait for wheel to initialize');
          }
        }
      });
    }
  }
  
  // Clear all localStorage data
  function initClearStorage() {
    const clearBtn = document.getElementById('clearStorageLink');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('⚠️ WARNING: This will clear all saved wheels and history. This action cannot be undone. Continue?')) {
          localStorage.removeItem('randomizerWheel');
          if (typeof wheelApp !== 'undefined' && wheelApp) {
            wheelApp.segments = ["Pizza 🍕", "Tacos 🌮", "Sushi 🍣", "Burger 🍔", "Salad 🥗", "Pasta 🍝", "Ice Cream 🍦", "Coffee ☕"];
            wheelApp.history = [];
            if (typeof updateColorsForSegments === 'function') updateColorsForSegments();
            if (typeof renderEntriesList === 'function') renderEntriesList();
            if (typeof updateHistoryUI === 'function') updateHistoryUI();
            if (typeof drawWheel === 'function') drawWheel();
          }
          showToast('All data cleared! Wheel reset to default.');
        }
      });
    }
  }
  
  // Share wheel link
  function initShareWheel() {
    const shareBtn = document.getElementById('shareWheelLink');
    if (shareBtn) {
      shareBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof copyShareLink === 'function') {
          copyShareLink();
        } else {
          const url = window.location.href;
          navigator.clipboard.writeText(url);
          showToast('Link copied to clipboard!');
        }
      });
    }
  }
  
  // Scroll to top button
  function initScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTopBtn');
    if (scrollBtn) {
      scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }
  
  // Feedback button
  function initFeedback() {
    const feedbackBtn = document.getElementById('feedbackBtn');
    if (feedbackBtn) {
      feedbackBtn.addEventListener('click', () => {
        const feedback = prompt('We value your feedback! Please share your thoughts or suggestions to help us improve RandomizerWheel:');
        if (feedback && feedback.trim()) {
          console.log('Feedback:', feedback);
          showToast('Thank you for your feedback! ❤️');
          // Optional: Send feedback to analytics or email
        } else if (feedback !== null) {
          showToast('Feel free to share anytime!');
        }
      });
    }
  }
  
  // Add toast function if not globally available
  function ensureToastFunction() {
    if (typeof showToast !== 'function') {
      window.showToast = function(message, duration = 3000) {
        let toast = document.querySelector('.toast');
        if (!toast) {
          toast = document.createElement('div');
          toast.className = 'toast';
          document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), duration);
      };
    }
  }
  
  // Add floating scroll indicator
  function addScrollIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'scrollIndicator';
    indicator.innerHTML = '↓';
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 45px;
      height: 45px;
      background: linear-gradient(135deg, #ff5733, #ff8c00);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.5rem;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(255,87,51,0.4);
      transition: all 0.3s ease;
      opacity: 0;
      visibility: hidden;
      z-index: 999;
    `;
    document.body.appendChild(indicator);
    
    indicator.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        indicator.style.opacity = '1';
        indicator.style.visibility = 'visible';
      } else {
        indicator.style.opacity = '0';
        indicator.style.visibility = 'hidden';
      }
    });
  }
  
  // Initialize footer
  function initFooter() {
    const footerContainer = document.getElementById('site-footer');
    if (!footerContainer) return;
    
    footerContainer.innerHTML = createFooter();
    
    // Initialize all footer functionalities
    initFooterNavigation();
    initFooterPresets();
    initExportWheel();
    initImportWheel();
    initResetWheel();
    initClearStorage();
    initShareWheel();
    initScrollToTop();
    initFeedback();
    ensureToastFunction();
    addScrollIndicator();
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
  } else {
    initFooter();
  }
})();
