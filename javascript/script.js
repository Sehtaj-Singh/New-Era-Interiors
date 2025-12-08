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

/* ---------------- SERVICE SCROLL SLIDER (FINAL REVISION 3) ---------------- */

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
    if (nextIndex < 0 || nextIndex >= totalSlides) return;

    isTransitioning = true;
    currentIndex = nextIndex;
    applySlides();
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

    // at first slide + scroll up → let page move naturally
    if (deltaY < 0 && currentIndex === 0) return;

    // at last slide + scroll down → let page move naturally
    if (deltaY > 0 && currentIndex === totalSlides - 1) return;

    // otherwise: hijack scroll and move exactly one slide
    if (e.cancelable) e.preventDefault();
    if (isTransitioning) return;

    const direction = deltaY > 0 ? 1 : -1;
    changeSlide(direction);
  }

  /* ------------ MOBILE: TOUCH SWIPE (1 swipe = 1 slide, NO eject in same swipe) ------------ */
  let touchStartY = 0;
  let touchGestureUsed = false; // whether this gesture already triggered a slide

  function handleTouchStart(e) {
    // Always reset for a new gesture
    const touch = e.touches[0];
    touchStartY = touch.clientY;
    touchGestureUsed = false;
  }

  function handleTouchMove(e) {
    if (!inServiceRange) return;

    const touch = e.touches[0];
    const currentY = touch.clientY;
    const gestureDelta = touchStartY - currentY; // >0 = swipe up, <0 = swipe down
    const threshold = 30; // px before we treat as a swipe

    // ✅ If this gesture already changed a slide, keep blocking scroll
    // so a long hard swipe cannot also eject you.
    if (touchGestureUsed) {
      if (e.cancelable) e.preventDefault();
      return;
    }

    if (Math.abs(gestureDelta) < threshold) return;

    // At first slide + swipe down (scroll up) → allow exit (no preventDefault)
    if (gestureDelta < 0 && currentIndex === 0) {
      touchGestureUsed = true; // don't double-process this gesture
      return;
    }

    // At last slide + swipe up (scroll down) → allow exit (no preventDefault)
    if (gestureDelta > 0 && currentIndex === totalSlides - 1) {
      touchGestureUsed = true;
      return;
    }

    // Otherwise: inside slider (1 → 2 → 3 or reverse)
    // ➜ hijack scroll and move EXACTLY one slide
    if (e.cancelable) e.preventDefault();
    const direction = gestureDelta > 0 ? 1 : -1; // up = next, down = previous
    changeSlide(direction);
    touchGestureUsed = true;
  }

  function handleTouchEnd() {
    // After finger is lifted, next swipe is a new gesture
    touchGestureUsed = false;
  }

  window.addEventListener("scroll", handleScroll);
  window.addEventListener("wheel", handleWheel, { passive: false });

  // touch for mobile
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("touchend", handleTouchEnd, { passive: true });

  handleScroll();
}
