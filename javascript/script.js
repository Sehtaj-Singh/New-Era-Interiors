document.addEventListener("DOMContentLoaded", () => {
  initHeaderFade();
  initServiceSlider();
});

/* ---------------- HEADER FADE (Kept as is) ---------------- */

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

/* ---------------- SERVICE SCROLL SLIDER (FINAL EJECTION LOGIC) ---------------- */

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

  // Set a large scrollable height for the illusion of sticky scroll
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
    if (isTransitioning) return false;

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

  /* ------------ DESKTOP: WHEEL (Hijack scroll or Eject) ------------ */
  function handleWheel(e) {
    if (!inServiceRange) return;

    const deltaY = e.deltaY;
    if (deltaY === 0) return;

    // SCROLL UP (deltaY < 0)
    if (deltaY < 0) {
      if (currentIndex === 0) {
        // Eject Up: Allow browser scroll
        return;
      }
      // Internal transition: Disable scroll, change slide
      if (e.cancelable) e.preventDefault();
      changeSlide(-1);

    // SCROLL DOWN (deltaY > 0)
    } else if (deltaY > 0) {
      if (currentIndex === totalSlides - 1) {
        // Eject Down: Allow browser scroll
        return;
      }
      // Internal transition: Disable scroll, change slide
      if (e.cancelable) e.preventDefault();
      changeSlide(1);
    }
  }

  /* ------------ MOBILE: TOUCH SWIPE (Hijack scroll or Eject) ------------ */
  let touchStartY = 0;
  let touchMoved = false; // Only process one slide change per swipe gesture

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

    // Process the swipe action only once
    if (!touchMoved) {
        touchMoved = true;

        const direction = gestureDelta > 0 ? 1 : -1; // up swipe = next slide (1), down swipe = previous slide (-1)

        // Ejection Check
        if (direction === 1 && currentIndex === totalSlides - 1) {
            // Eject Down: At last slide, swiping up (down scroll)
            return;
        } else if (direction === -1 && currentIndex === 0) {
            // Eject Up: At first slide, swiping down (up scroll)
            return;
        }
        
        // Internal Transition: Disable scroll, change slide
        if (e.cancelable) e.preventDefault();
        changeSlide(direction);

    } else {
        // Block native scroll for the remainder of the active swipe gesture
        if (e.cancelable) e.preventDefault();
    }
  }

  function handleTouchEnd() {
    touchMoved = false;
  }

  window.addEventListener("scroll", handleScroll);
  // Must be non-passive to allow e.preventDefault()
  window.addEventListener("wheel", handleWheel, { passive: false });

  // Touch for mobile. touchstart/touchend can be passive. touchmove must be non-passive.
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("touchend", handleTouchEnd, { passive: true });

  handleScroll();
}