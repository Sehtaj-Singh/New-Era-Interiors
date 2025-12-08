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
  let inServiceRange = false; // are we inside the sticky “life” of this section?

  const transitionDuration = 400; // ms (fade duration)
  const stickyTop = window.innerHeight * 0.06; // must match CSS top: 6vh;

  // how much scroll distance we allocate for the service “life”
  const scrollDistancePerSlide = window.innerHeight * 0.8;
  const scrollLifeHeight = totalSlides * scrollDistancePerSlide;

  // make the anchor tall enough so the page can scroll past the sticky section
  const sectionHeight = serviceSection.offsetHeight || window.innerHeight;
  serviceAnchor.style.minHeight = `${sectionHeight + scrollLifeHeight}px`;

  /* ---------- SLIDE VISIBILITY ---------- */
  function applySlides() {
    slides.forEach((slide, idx) => {
      const active = idx === currentIndex;
      slide.style.opacity = active ? 1 : 0;
      slide.style.pointerEvents = active ? "auto" : "none";
      slide.classList.toggle("is-current", active);
    });

    // unlock new slide change after fade
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

  // initial state
  applySlides();

  /* ---------- DETECT WHEN WE ARE IN SERVICE RANGE ---------- */
  function handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const anchorTop = serviceAnchor.offsetTop;

    // point where #service sticks at 6vh
    const startPin = anchorTop - stickyTop;
    // end of the artificial scroll-life
    const endPin = startPin + scrollLifeHeight;

    inServiceRange = scrollY >= startPin && scrollY < endPin;
  }

  /* ---------- WHEEL: ONE SCROLL = ONE SLIDE ---------- */
  function handleWheel(e) {
    if (!inServiceRange) return; // outside our zone, let browser scroll normally

    const deltaY = e.deltaY;
    if (deltaY === 0) return;

    // At first slide, scrolling UP: let user leave to previous section
    if (deltaY < 0 && currentIndex === 0) {
      return; // do NOT preventDefault → normal scroll up
    }

    // At last slide, scrolling DOWN: let user leave to next section
    if (deltaY > 0 && currentIndex === totalSlides - 1) {
      return; // do NOT preventDefault → normal scroll down
    }

    // Otherwise we are between states → hijack scroll and step exactly 1 slide
    if (e.cancelable) e.preventDefault();
    if (isTransitioning) return;

    const direction = deltaY > 0 ? 1 : -1; // down = next, up = previous
    changeSlide(direction);
  }

  window.addEventListener("scroll", handleScroll);
  // passive:false so we can preventDefault and stop the “long hard” scroll
  window.addEventListener("wheel", handleWheel, { passive: false });

  handleScroll();
}
