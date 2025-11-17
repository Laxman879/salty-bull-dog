// Hero Section Navbar Overlap Scroll Handler
(function() {
  let scrolled = false;
  
  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const heroElement = document.querySelector('.site-hero');
    const navbarElement = document.querySelector('.header-wrapper');
    
    if (!heroElement || !navbarElement) return;
    
    const heroHeight = heroElement.offsetHeight;
    const navbarHeight = navbarElement.offsetHeight;
    
    // Calculate when hero should go behind navbar (when scrolled past 20% of navbar height)
    const triggerPoint = navbarHeight * 0.2;
    
    if (scrollTop > triggerPoint && !scrolled) {
      document.body.classList.add('scrolled');
      scrolled = true;
    } else if (scrollTop <= triggerPoint && scrolled) {
      document.body.classList.remove('scrolled');
      scrolled = false;
    }
  }
  
  // Throttle scroll events for better performance
  let ticking = false;
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(handleScroll);
      ticking = true;
      setTimeout(() => { ticking = false; }, 16);
    }
  }
  
  // Initialize when DOM is ready
  function init() {
    window.addEventListener('scroll', requestTick, { passive: true });
    handleScroll(); // Initial check
  }
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();