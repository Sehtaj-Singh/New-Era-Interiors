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

  const transitionDuration = 400; // ms
  const stickyTop = 0.06 * window.innerHeight; // 6vh in px
  const scrollDistancePerSlide = window.innerHeight * 0.8;
  const scrollLifeHeight = totalSlides * scrollDistancePerSlide;

  // Container height = section height + scroll distance for all slides
  const serviceHeight = serviceSection.offsetHeight || window.innerHeight;
  serviceAnchor.style.minHeight = `${serviceHeight + scrollLifeHeight}px`;

  function applySlideState() {
    slides.forEach((slide, idx) => {
      const isActive = idx === currentIndex;
      slide.style.opacity = isActive ? 1 : 0;
      slide.style.pointerEvents = isActive ? "auto" : "none";
      slide.classList.toggle("is-current", isActive);
    });
  }

  function setSlide(nextIndex) {
    if (nextIndex === currentIndex || isTransitioning) return;
    isTransitioning = true;
    currentIndex = nextIndex;
    applySlideState();
    setTimeout(() => {
      isTransitioning = false;
    }, transitionDuration);
  }

  // initial
  applySlideState();

  function handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const anchorTop = serviceAnchor.offsetTop;

    // point where the section “locks” at 6vh
    const startScroll = anchorTop - stickyTop;
    // point where the slider life ends (after 3 states)
    const endScroll = startScroll + scrollLifeHeight;

    // 1) BEFORE service: show first state
    if (scrollY < startScroll) {
      if (currentIndex !== 0) setSlide(0);
      return;
    }

    // 2) AFTER service: keep last state visible while it scrolls away
    if (scrollY >= endScroll) {
      if (currentIndex !== totalSlides - 1) setSlide(totalSlides - 1);
      return;
    }

    // 3) INSIDE service scroll-life: switch between states
    const progress = scrollY - startScroll;
    let targetIndex = Math.floor(progress / scrollDistancePerSlide);
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex > totalSlides - 1) targetIndex = totalSlides - 1;

    setSlide(targetIndex);
  }

  window.addEventListener("scroll", handleScroll);
  handleScroll();
}
