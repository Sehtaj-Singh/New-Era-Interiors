document.addEventListener("DOMContentLoaded", () => {
  initHeaderFade();
  initServiceSlider();
});

/* ---------------- HEADER FADE ---------------- */

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

/* ---------------- SERVICE SCROLL SLIDER ---------------- */

function initServiceSlider() {
  const serviceSection = document.getElementById("service");
  const serviceContainer = document.getElementById("service-container");
  if (!serviceSection || !serviceContainer) return;

  const slides = Array.from(
    serviceContainer.querySelectorAll(".service-slide")
  );
  if (!slides.length) return;

  const totalSlides = slides.length;
  let currentIndex = 0;
  let direction = 0; // 1 = down/next, -1 = up/prev
  let progress = 0; // 0..1 for current transition

  // show first slide
  slides.forEach((slide, idx) => {
    if (idx === 0) {
      slide.classList.add("is-current");
      slide.style.opacity = 1;
      slide.style.pointerEvents = "auto";
    } else {
      slide.style.opacity = 0;
      slide.style.pointerEvents = "none";
    }
  });

  /**
   * Checks if the service section is in the viewport, allowing scroll-jacking.
   * Increased the range to make the scroll stop more reliable.
   */
  function isServiceInView() {
    const rect = serviceSection.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    // Section starts within 80% from top and ends within 80% from bottom
    return rect.top < vh * 0.8 && rect.bottom > vh * 0.2;
  }

  function setSlideOpacities() {
    // reset current state before setting new opacities
    slides.forEach((slide) => {
      slide.style.opacity = 0;
      slide.style.pointerEvents = "none";
      slide.classList.remove("is-current");
    });

    if (direction === 0) {
      // No transition in progress, show current slide fully
      const slide = slides[currentIndex];
      slide.style.opacity = 1;
      slide.style.pointerEvents = "auto";
      slide.classList.add("is-current");
      return;
    }

    const from = currentIndex;
    const to = currentIndex + direction;

    const fromOpacity = 1 - progress;
    const toOpacity = progress;

    if (slides[from]) {
      slides[from].style.opacity = fromOpacity;
      slides[from].style.pointerEvents = fromOpacity > 0.01 ? "auto" : "none";
      if (fromOpacity > 0.5) slides[from].classList.add("is-current");
    }

    if (slides[to]) {
      slides[to].style.opacity = toOpacity;
      slides[to].style.pointerEvents = toOpacity > 0.01 ? "auto" : "none";
      if (toOpacity > 0.5) slides[to].classList.add("is-current");
    }
  }

  function commitSlide(newIndex) {
    currentIndex = newIndex;
    progress = 0;
    direction = 0;

    slides.forEach((slide, idx) => {
      slide.classList.remove("is-current");
      if (idx === currentIndex) {
        slide.style.opacity = 1;
        slide.style.pointerEvents = "auto";
        slide.classList.add("is-current");
      } else {
        slide.style.opacity = 0;
        slide.style.pointerEvents = "none";
      }
    });
  }

  function handleWheel(e) {
    const isInView = isServiceInView();

    // Condition 1: If we are not in view AND not in the middle of a transition, allow normal scroll.
    if (!isInView && direction === 0) {
      return;
    }

    const delta = e.deltaY;
    if (delta === 0) return;

    // Condition 2: Allow scroll to escape the section boundary if at the start/end.
    // At first slide going UP -> allow normal scroll
    if (delta < 0 && currentIndex === 0 && direction === 0) return;
    // At last slide going DOWN -> allow normal scroll
    if (delta > 0 && currentIndex === totalSlides - 1 && direction === 0)
      return;

    // If we've reached this point, we are controlling the scroll inside the service section:
    e.preventDefault();

    // Adjusted step: A smaller number requires more scroll delta for the progress to reach 1.
    // This makes the transition slower/requires more scroll input.
    const scrollSensitivity = 800; // Increase this value to require more scroll
    const step = Math.min(Math.abs(delta) / scrollSensitivity, 1); // Clamp step to max 1

    // set direction when starting a new transition
    if (direction === 0) {
      if (delta > 0 && currentIndex < totalSlides - 1) {
        direction = 1; // Down/Next
      } else if (delta < 0 && currentIndex > 0) {
        direction = -1; // Up/Previous
      } else {
        return; // No valid transition direction
      }
    }

    progress += step;
    
    // Check if transition is complete (progress >= 1). Snap to the next slide.
    if (progress >= 1) {
      const nextIndex = currentIndex + direction;
      // Ensure nextIndex is within bounds before committing
      if (nextIndex >= 0 && nextIndex < totalSlides) {
        commitSlide(nextIndex);
      } else {
        // If we somehow went out of bounds, reset the transition state
        direction = 0;
        progress = 0;
        setSlideOpacities(); // Refresh the display
      }
    } else {
      // If transition is not complete, update opacities based on progress.
      setSlideOpacities();
    }
  }

  window.addEventListener("wheel", handleWheel, { passive: false });
}