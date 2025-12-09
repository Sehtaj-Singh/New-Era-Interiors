document.addEventListener("DOMContentLoaded", () => {
  initHeaderFade();
  initServiceSlider();
});

/* ---------------- HEADER FADE (Kept as is) ---------------- */
// ... (omitted for brevity, keep as is)
function initHeaderFade() {
  const header = document.getElementById("site-header");
  const heroTitle = document.querySelector(".intro h1");

  if (!header || !heroTitle) return;

  const titleTop = heroTitle.offsetTop;
  const titleHeight = heroTitle.offsetHeight;
  const maxScroll = titleTop + titleHeight;

  function handleHeaderScroll() {
    const scrolled = window.scrollY || window.pageYOffset;

    let progress = scrolled / maxScroll;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    header.style.opacity = progress;
    header.style.pointerEvents = progress > 0 ? "auto" : "none";
    heroTitle.style.opacity = 1 - progress;
  }

  window.addEventListener("scroll", handleHeaderScroll);
  handleHeaderScroll();
}

/* ---------------- SERVICE SCROLL SLIDER (REVISED LOGIC) ---------------- */

function initServiceSlider() {
  const serviceAnchor = document.getElementById("service-scroll-anchor");
  const serviceSection = document.getElementById("service");
  const serviceContainer = document.getElementById("service-container");
  if (!serviceAnchor || !serviceSection || !serviceContainer) return;

  const slides = Array.from(
    serviceContainer.querySelectorAll(".service-slide")
  );
  if (!slides.length) return;

  const totalSlides = slides.length;
  let currentIndex = 0;
  let isTransitioning = false;
  let inServiceRange = false; // are we inside the slider zone?

  const transitionDuration = 400; // ms
  const stickyTop = window.innerHeight * 0.06; // must match CSS top: 6vh

  // how long the “life” of this sticky section is in scroll distance
  // NOTE: This scroll height is only for the illusion of vertical scroll,
  // the slide change is managed by wheel/touch events.
  const scrollDistancePerSlide = window.innerHeight * 0.8;
  const scrollLifeHeight = totalSlides * scrollDistancePerSlide;

  const sectionHeight = serviceSection.offsetHeight || window.innerHeight;
  serviceAnchor.style.minHeight = `${sectionHeight + scrollLifeHeight}px`;

  /* ------------ SLIDE VISIBILITY ------------ */
  function applySlides() {
    slides.forEach((slide, idx) => {
      const active = idx === currentIndex;
      slide.style.opacity = active ? 1 : 0;
      slide.style.pointerEvents = active ? "auto" : "none";
      slide.classList.toggle("is-current", active);
    });

    setTimeout(() => {
      isTransitioning = false;
    }, transitionDuration);
  }

  function changeSlide(direction) {
    if (isTransitioning) return;

    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= totalSlides) return false;

    isTransitioning = true;
    currentIndex = nextIndex;
    applySlides();
    return true; // Slide was changed
  }

  // init
  applySlides();

  /* ------------ SCROLL RANGE DETECTION (for sticky life) ------------ */
  function handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const anchorTop = serviceAnchor.offsetTop;

    const startPin = anchorTop - stickyTop;
    const endPin = startPin + scrollLifeHeight;

    inServiceRange = scrollY >= startPin && scrollY < endPin;
  }

  /* ------------ DESKTOP: WHEEL (1 scroll = 1 slide) ------------ */
  function handleWheel(e) {
    if (!inServiceRange) return;

    const deltaY = e.deltaY;
    if (deltaY === 0) return;

    // SCROLL UP (deltaY < 0): Try to go to previous slide
    if (deltaY < 0) {
      if (currentIndex === 0) {
        // At first slide, allow browser scroll (ejection UP)
        return;
      }
      // Not at first slide, try to change slide
      if (e.cancelable) e.preventDefault();
      changeSlide(-1);

    // SCROLL DOWN (deltaY > 0): Try to go to next slide
    } else if (deltaY > 0) {
      if (currentIndex === totalSlides - 1) {
        // At last slide, allow browser scroll (ejection DOWN)
        return;
      }
      // Not at last slide, try to change slide
      if (e.cancelable) e.preventDefault();
      changeSlide(1);
    }
  }

  /* ------------ MOBILE: TOUCH SWIPE (1 swipe = 1 slide) ------------ */
  let touchStartY = 0;
  let touchMoved = false;

  function handleTouchStart(e) {
    const touch = e.touches[0];
    touchStartY = touch.clientY;
    touchMoved = false; // Reset for a new gesture
  }

  function handleTouchMove(e) {
    if (!inServiceRange || isTransitioning) return;

    const touch = e.touches[0];
    const currentY = touch.clientY;
    const gestureDelta = touchStartY - currentY; // >0 = swipe up (scroll down), <0 = swipe down (scroll up)
    const threshold = 30; // px before we treat as a swipe

    if (Math.abs(gestureDelta) < threshold) return;

    // Set touchMoved so we only process one swipe action per gesture
    if (!touchMoved) {
        touchMoved = true;

        const direction = gestureDelta > 0 ? 1 : -1; // up swipe (scroll down) = 1, down swipe (scroll up) = -1

        // SWIPE UP (scroll down, direction = 1): Try to go to next slide or eject
        if (direction === 1) {
            if (currentIndex === totalSlides - 1) {
                // At last slide, allow browser scroll (ejection DOWN)
                // Do NOT preventDefault, let the browser handle the scroll
                return;
            }
        // SWIPE DOWN (scroll up, direction = -1): Try to go to previous slide or eject
        } else if (direction === -1) {
            if (currentIndex === 0) {
                // At first slide, allow browser scroll (ejection UP)
                // Do NOT preventDefault, let the browser handle the scroll
                return;
            }
        }
        
        // If we are still here, it means we are in a middle state (1 or 2)
        // and need to transition internally. Prevent default scroll.
        if (e.cancelable) e.preventDefault();
        changeSlide(direction);
    } else {
        // Once a slide change is triggered, keep preventing default for the rest of the gesture
        if (e.cancelable) e.preventDefault();
    }
  }

  function handleTouchEnd() {
    // Reset for the next touch/swipe
    touchMoved = false;
  }

  window.addEventListener("scroll", handleScroll);
  // Use non-passive for wheel to allow preventDefault to stop page scroll
  window.addEventListener("wheel", handleWheel, { passive: false });

  // Touch for mobile
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  // Use non-passive for touchmove to allow preventDefault to stop page scroll
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("touchend", handleTouchEnd, { passive: true });

  handleScroll();
}