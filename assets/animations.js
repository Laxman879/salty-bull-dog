const SCROLL_ANIMATION_TRIGGER_CLASSNAME = 'scroll-trigger';
const SCROLL_ANIMATION_OFFSCREEN_CLASSNAME = 'scroll-trigger--offscreen';
const SCROLL_ZOOM_IN_TRIGGER_CLASSNAME = 'animate--zoom-in';
const SCROLL_ANIMATION_CANCEL_CLASSNAME = 'scroll-trigger--cancel';

// Scroll in animation logic
function onIntersection(elements, observer) {
  elements.forEach((element, index) => {
    if (element.isIntersecting) {
      const elementTarget = element.target;
      if (elementTarget.classList.contains(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME)) {
        elementTarget.classList.remove(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
        if (elementTarget.hasAttribute('data-cascade'))
          elementTarget.setAttribute('style', `--animation-order: ${index};`);
      }
      observer.unobserve(elementTarget);
    } else {
      element.target.classList.add(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
      element.target.classList.remove(SCROLL_ANIMATION_CANCEL_CLASSNAME);
    }
  });
}

function initializeScrollAnimationTrigger(rootEl = document, isDesignModeEvent = false) {
  const animationTriggerElements = Array.from(rootEl.getElementsByClassName(SCROLL_ANIMATION_TRIGGER_CLASSNAME));
  if (animationTriggerElements.length === 0) return;

  if (isDesignModeEvent) {
    animationTriggerElements.forEach((element) => {
      element.classList.add('scroll-trigger--design-mode');
    });
    return;
  }

  const observer = new IntersectionObserver(onIntersection, {
    rootMargin: '0px 0px -50px 0px',
  });
  animationTriggerElements.forEach((element) => observer.observe(element));
}

// Zoom in animation logic
function initializeScrollZoomAnimationTrigger() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const animationTriggerElements = Array.from(document.getElementsByClassName(SCROLL_ZOOM_IN_TRIGGER_CLASSNAME));

  if (animationTriggerElements.length === 0) return;

  const scaleAmount = 0.2 / 100;

  animationTriggerElements.forEach((element) => {
    let elementIsVisible = false;
    const observer = new IntersectionObserver((elements) => {
      elements.forEach((entry) => {
        elementIsVisible = entry.isIntersecting;
      });
    });
    observer.observe(element);

    element.style.setProperty('--zoom-in-ratio', 1 + scaleAmount * percentageSeen(element));

    window.addEventListener(
      'scroll',
      throttle(() => {
        if (!elementIsVisible) return;

        element.style.setProperty('--zoom-in-ratio', 1 + scaleAmount * percentageSeen(element));
      }),
      { passive: true }
    );
  });
}

function percentageSeen(element) {
  const viewportHeight = window.innerHeight;
  const scrollY = window.scrollY;
  const elementPositionY = element.getBoundingClientRect().top + scrollY;
  const elementHeight = element.offsetHeight;

  if (elementPositionY > scrollY + viewportHeight) {
    // If we haven't reached the image yet
    return 0;
  } else if (elementPositionY + elementHeight < scrollY) {
    // If we've completely scrolled past the image
    return 100;
  }

  // When the image is in the viewport
  const distance = scrollY + viewportHeight - elementPositionY;
  let percentage = distance / ((viewportHeight + elementHeight) / 100);
  return Math.round(percentage);
}

// Button animation functions
function initializeButtonAnimations() {
  const buttons = document.querySelectorAll(
    'button, .button, .btn, .shopify-challenge__button, .customer button, .shopify-payment-button__button, input[type="submit"], input[type="button"], a[role="button"], .hero-shop-button, .product-form__submit, [class*="button"], [class*="btn"]'
  );

  buttons.forEach(button => {
    // Skip if already initialized
    if (button.hasAttribute('data-button-animated')) return;
    button.setAttribute('data-button-animated', 'true');

    // Add ripple effect on click
    button.addEventListener('click', function(e) {
      if (this.disabled || this.getAttribute('aria-disabled') === 'true') return;
      
      // Add ripple class
      this.classList.add('button-ripple');
      
      // Remove ripple class after animation
      setTimeout(() => {
        this.classList.remove('button-ripple');
      }, 300);
    });

    // Add touch feedback for mobile
    button.addEventListener('touchstart', function() {
      if (this.disabled || this.getAttribute('aria-disabled') === 'true') return;
      this.style.transform = 'scale(0.95)';
    });

    button.addEventListener('touchend', function() {
      if (this.disabled || this.getAttribute('aria-disabled') === 'true') return;
      this.style.transform = '';
    });

    // Keyboard accessibility
    button.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        if (this.disabled || this.getAttribute('aria-disabled') === 'true') return;
        this.classList.add('button-ripple');
        setTimeout(() => {
          this.classList.remove('button-ripple');
        }, 300);
      }
    });
  });
}

// Throttle function for performance


window.addEventListener('DOMContentLoaded', () => {
  initializeScrollAnimationTrigger();
  initializeScrollZoomAnimationTrigger();
  initializeButtonAnimations();
});

// Re-initialize button animations when new content is loaded
const observer = new MutationObserver(throttle(() => {
  initializeButtonAnimations();
}, 100));

observer.observe(document.body, {
  childList: true,
  subtree: true
});

if (Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => {
    initializeScrollAnimationTrigger(event.target, true);
    setTimeout(() => initializeButtonAnimations(), 100);
  });
  document.addEventListener('shopify:section:reorder', () => {
    initializeScrollAnimationTrigger(document, true);
    setTimeout(() => initializeButtonAnimations(), 100);
  });
}
