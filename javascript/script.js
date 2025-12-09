document.addEventListener("DOMContentLoaded", () => {
  initHeaderFade();
  initServiceSlider();
});

/* ---------------- HEADER FADE (KEPT AS IS) ---------------- */
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


/* ---------------- SERVICE SCROLL SLIDER (REVISED) ---------------- */

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
  let inServiceRange = false; // inside sticky "life" of section?

  const transitionDuration = 400; // ms
  const stickyTop = window.innerHeight * 0.06; // CSS top: 6vh

  // how long this section stays in sticky mode
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

  /* ------------ RANGE DETECTION (sticky life) ------------ */
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

    // first slide + scroll up → allow natural exit
    if (deltaY < 0 && currentIndex === 0) return;

    // last slide + scroll down → allow natural exit
    if (deltaY > 0 && currentIndex === totalSlides - 1) return;

    if (e.cancelable) e.preventDefault();
    if (isTransitioning) return;

    const direction = deltaY > 0 ? 1 : -1;
    changeSlide(direction);
  }

  /* ------------ MOBILE: TOUCH (no momentum) ------------ */

  let touchStartY = 0;
  let gestureHandled = false;   // slide change or exit already decided
  let pendingExit = 0;          // -1 = exit up, +1 = exit down

  function handleTouchStart(e) {
    const touch = e.touches[0];
    touchStartY = touch.clientY;
    gestureHandled = false;
    pendingExit = 0;
  }

  function handleTouchMove(e) {
    if (!inServiceRange) return;

    const touch = e.touches[0];
    const currentY = touch.clientY;
    const delta = touchStartY - currentY; // >0 swipe up (scroll down), <0 swipe down

    const threshold = 30; // px

    // ❗ While in service range, ALWAYS block native scroll → no momentum at all
    if (e.cancelable) e.preventDefault();

    if (gestureHandled || isTransitioning) return;
    if (Math.abs(delta) < threshold) return;

    // swipe up
    if (delta > 0) {
      if (currentIndex < totalSlides - 1) {
        // go to next slide (1→2→3…)
        changeSlide(1);
        gestureHandled = true;
      } else {
        // last slide and user swiped up → mark exit DOWN
        pendingExit = 1;
        gestureHandled = true;
      }
    } else {
      // swipe down
      if (currentIndex > 0) {
        // go to previous slide (3→2→1…)
        changeSlide(-1);
        gestureHandled = true;
      } else {
        // first slide and user swiped down → mark exit UP
        pendingExit = -1;
        gestureHandled = true;
      }
    }
  }

  function handleTouchEnd() {
    if (!inServiceRange && pendingExit === 0) {
      // nothing special
      gestureHandled = false;
      return;
    }

    if (pendingExit !== 0) {
      // Now perform the EXIT with a manual scroll (no momentum).
      const scrollY = window.scrollY || window.pageYOffset;
      const anchorTop = serviceAnchor.offsetTop;
      const startPin = anchorTop - stickyTop;
      const endPin = startPin + scrollLifeHeight;

      let target;
      if (pendingExit === -1) {
        // exit UP (to previous section)
        target = startPin - 10;
      } else {
        // exit DOWN (to next section)
        target = endPin + 10;
      }

      window.scrollTo({
        top: target,
        behavior: "smooth"
      });
    }

    gestureHandled = false;
    pendingExit = 0;
  }

  window.addEventListener("scroll", handleScroll);
  window.addEventListener("wheel", handleWheel, { passive: false });

  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("touchend", handleTouchEnd, { passive: true });

  handleScroll();
}
