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
  const totalSlides = slides.length;

  let currentIndex = 0;
  let isTransitioning = false;
  let inServiceRange = false;

  const transitionDuration = 400;
  const stickyTop = window.innerHeight * 0.06;

  const scrollDistancePerSlide = window.innerHeight * 0.8;
  const scrollLifeHeight = totalSlides * scrollDistancePerSlide;

  const sectionHeight = serviceSection.offsetHeight || window.innerHeight;
  serviceAnchor.style.minHeight = `${sectionHeight + scrollLifeHeight}px`;

  /* ---------------- SLIDE VISIBILITY ---------------- */
  function setSlides() {
    slides.forEach((slide, i) => {
      const active = i === currentIndex;
      slide.style.opacity = active ? 1 : 0;
      slide.style.pointerEvents = active ? "auto" : "none";
      slide.classList.toggle("is-current", active);
    });
    setTimeout(() => (isTransitioning = false), transitionDuration);
  }

  setSlides();

  /* ---------------- TRACK SCROLL RANGE ---------------- */
  function handleScroll() {
    const y = window.scrollY;
    const anchor = serviceAnchor.offsetTop;
    const startPin = anchor - stickyTop;
    const endPin = startPin + scrollLifeHeight;

    inServiceRange = y >= startPin && y < endPin;
  }

  /* ---------------- TOUCH LOGIC ---------------- */
  let touchStartY = 0;
  let gestureDone = false; // ensures only one action per swipe

  function handleTouchStart(e) {
    const t = e.touches[0];
    touchStartY = t.clientY;
    gestureDone = false;
  }

  function handleTouchMove(e) {
    if (!inServiceRange) return;

    const t = e.touches[0];
    const currentY = t.clientY;
    const delta = touchStartY - currentY; // >0 swipe up, <0 swipe down
    const threshold = 25;

    // PREVENT BROWSER SCROLL until we decide otherwise
    if (e.cancelable) e.preventDefault();

    if (gestureDone || isTransitioning) return;
    if (Math.abs(delta) < threshold) return;

    /* ---------------- DECISION LOGIC ---------------- */

    // Swipe UP (delta > 0)
    if (delta > 0) {
      // State 1 -> State 2 (block browser scroll)
      if (currentIndex === 0) {
        changeSlide(1);
      }
      // State 2 -> State 3 (block browser scroll)
      else if (currentIndex === 1) {
        changeSlide(1);
      }
      // State 3 -> EXIT DOWN
      else if (currentIndex === 2) {
        gestureDone = true;
        allowExitDown();
        return;
      }
    }

    // Swipe DOWN (delta < 0)
    else {
      // State 1 -> EXIT UP
      if (currentIndex === 0) {
        gestureDone = true;
        allowExitUp();
        return;
      }
      // State 2 -> State 1 (block browser scroll)
      else if (currentIndex === 1) {
        changeSlide(-1);
      }
      // State 3 -> State 2 (block browser scroll)
      else if (currentIndex === 2) {
        changeSlide(-1);
      }
    }

    gestureDone = true; // done for this swipe
  }

  function handleTouchEnd() {
    // nothing needed here
  }

  /* ---------------- EXIT HANDLERS ---------------- */

  function allowExitUp() {
    const y = window.scrollY;
    // Allow browser to scroll up
    setTimeout(() => {
      window.scrollTo({ top: y - 80, behavior: "smooth" });
    }, 10);
  }

  function allowExitDown() {
    const anchor = serviceAnchor.offsetTop;
    const target = anchor + scrollLifeHeight + 20;
    setTimeout(() => {
      window.scrollTo({ top: target, behavior: "smooth" });
    }, 10);
  }

  function changeSlide(dir) {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex += dir;
    setSlides();
  }

  /* ---------------- EVENT HOOKS ---------------- */

  window.addEventListener("scroll", handleScroll);

  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("touchend", handleTouchEnd, { passive: true });

  handleScroll();
}
