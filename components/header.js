// header.js - Dynamic header component for RandomizerWheel

(function() {
  // Create header HTML structure
  function createHeader() {
    return `
      <header class="site-header">
        <a href="/" class="header-logo">
          <span class="logo-icon">🎡</span>
          <span>Spin The<span style="color:#ff5733;">Wheel</span></span>
        </a>
        
        <button class="hamburger" id="hamburgerBtn" aria-label="Menu">
          ☰
        </button>
        
        <nav class="header-nav">
          <a href="#home" class="nav-link" data-nav="home">Home</a>
          <a href="#wheel-app" class="nav-link" data-nav="wheel">Spin Wheel</a>
          <a href="#wheel-types" class="nav-link" data-nav="types">Wheel Types</a>
          <a href="#features" class="nav-link" data-nav="features">Features</a>
          <a href="#use-cases" class="nav-link" data-nav="uses">Use Cases</a>
          <a href="#how-it-works" class="nav-link" data-nav="how">How It Works</a>
          <a href="#faq" class="nav-link" data-nav="faq">FAQ</a>
        </nav>
        
        <div class="header-cta">
          <a href="#wheel-app" class="btn btn-primary btn-sm">🎡 Spin Now</a>
        </div>
      </header>
      
      <div class="mobile-nav" id="mobileNav">
        <a href="#home" class="nav-link" data-nav="home">🏠 Home</a>
        <a href="#wheel-app" class="nav-link" data-nav="wheel">🎡 Spin Wheel</a>
        <a href="#wheel-types" class="nav-link" data-nav="types">🔄 Wheel Types</a>
        <a href="#features" class="nav-link" data-nav="features">⭐ Features</a>
        <a href="#use-cases" class="nav-link" data-nav="uses">📋 Use Cases</a>
        <a href="#how-it-works" class="nav-link" data-nav="how">❓ How It Works</a>
        <a href="#faq" class="nav-link" data-nav="faq">💬 FAQ</a>
        <hr style="margin: 12px 0; border-color: #e8e0f5;">
        <a href="#wheel-app" class="btn btn-primary btn-sm full-width" style="text-align: center;">🎡 Spin The Wheel</a>
      </div>
    `;
  }
  
  // Handle smooth scrolling for navigation links
  function handleNavClick(e) {
    const link = e.target.closest('.nav-link');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // Close mobile menu if open
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav && mobileNav.classList.contains('open')) {
          mobileNav.classList.remove('open');
        }
        
        // Smooth scroll to target
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 70;
        const targetPosition = targetElement.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Update active state
        updateActiveNavLink(targetId);
      }
    }
  }
  
  // Update active navigation link based on scroll position
  function updateActiveNavLink(activeId) {
    const allNavLinks = document.querySelectorAll('.nav-link');
    allNavLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.substring(1) === activeId) {
        link.style.color = '#ff5733';
        link.style.fontWeight = '900';
      } else if (href && href !== '#') {
        link.style.color = '';
        link.style.fontWeight = '';
      }
    });
  }
  
  // Handle scroll spy (update active link based on scroll)
  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (sections.length === 0) return;
    
    window.addEventListener('scroll', () => {
      let current = '';
      const scrollPosition = window.scrollY + 100;
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          current = section.getAttribute('id');
        }
      });
      
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.substring(1) === current) {
          link.style.color = '#ff5733';
          link.style.fontWeight = '900';
          link.style.borderBottom = '2px solid #ff5733';
        } else if (href && href !== '#') {
          link.style.color = '';
          link.style.fontWeight = '';
          link.style.borderBottom = '';
        }
      });
    });
  }
  
  // Handle mobile menu toggle
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    
    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileNav.classList.toggle('open');
        hamburger.textContent = mobileNav.classList.contains('open') ? '✕' : '☰';
      });
      
      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (mobileNav.classList.contains('open') && 
            !mobileNav.contains(e.target) && 
            !hamburger.contains(e.target)) {
          mobileNav.classList.remove('open');
          hamburger.textContent = '☰';
        }
      });
      
      // Close mobile menu on window resize if open
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileNav.classList.contains('open')) {
          mobileNav.classList.remove('open');
          hamburger.textContent = '☰';
        }
      });
    }
  }
  
  // Add sticky header shadow on scroll
  function initStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        header.style.boxShadow = '0 4px 30px rgba(60, 20, 120, 0.15)';
        header.style.background = 'rgba(255, 255, 255, 0.98)';
      } else {
        header.style.boxShadow = '0 2px 20px rgba(60, 20, 120, 0.08)';
        header.style.background = 'rgba(255, 255, 255, 0.95)';
      }
    });
  }
  
  // Add logo hover animation
  function initLogoAnimation() {
    const logo = document.querySelector('.header-logo');
    if (!logo) return;
    
    logo.addEventListener('mouseenter', () => {
      const icon = logo.querySelector('.logo-icon');
      if (icon) {
        icon.style.animation = 'none';
        icon.offsetHeight; // Trigger reflow
        icon.style.animation = 'spin-slow 0.6s linear';
        setTimeout(() => {
          if (icon) icon.style.animation = 'spin-slow 8s linear infinite';
        }, 600);
      }
    });
  }
  
  // Initialize header
  function initHeader() {
    const headerContainer = document.getElementById('site-header');
    if (!headerContainer) return;
    
    headerContainer.innerHTML = createHeader();
    
    // Initialize all header functionalities
    document.addEventListener('click', handleNavClick);
    initMobileMenu();
    initScrollSpy();
    initStickyHeader();
    initLogoAnimation();
    
    // Add CSS for mobile nav if not already in stylesheet
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .header-nav, .header-cta { display: none; }
        .hamburger { display: block; }
        .mobile-nav { display: none; }
        .mobile-nav.open { display: flex; }
        .mobile-nav .nav-link { padding: 12px 16px; font-size: 1rem; }
        .mobile-nav hr { margin: 8px 0; }
      }
      @media (min-width: 769px) {
        .hamburger { display: none; }
        .mobile-nav { display: none !important; }
      }
      .site-header {
        position: sticky;
        top: 0;
        z-index: 1000;
        transition: all 0.3s ease;
      }
      .nav-link {
        transition: all 0.2s ease;
        position: relative;
      }
      .nav-link:hover {
        transform: translateY(-2px);
      }
    `;
    document.head.appendChild(style);
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }
})();
