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
  const serviceSection = document.getElementById("service");
  const serviceContainer = document.getElementById("service-container");
  const scrollWrapper = document.getElementById("service-scroll-wrapper"); // New element for virtual space

  if (!serviceSection || !serviceContainer || !scrollWrapper) return;

  const slides = Array.from(
    serviceContainer.querySelectorAll(".service-slide")
  );
  if (!slides.length) return;

  const totalSlides = slides.length;
  // We need N-1 transitions to go through N slides
  const numTransitions = totalSlides - 1; 
  const viewportHeight = window.innerHeight;
  
  // Set the required "virtual" scroll space height. Each slide transition needs 1 viewport height of scroll.
  // We'll use 200vh per transition to make it require more scroll input.
  const transitionScrollHeight = 2 * viewportHeight; 
  const totalVirtualScrollHeight = numTransitions * transitionScrollHeight;

  // The scroll wrapper creates the required vertical space for pinning
  scrollWrapper.style.height = `${totalVirtualScrollHeight + viewportHeight}px`; // Add 1vh to fully show the last slide

  let pinStartScroll; // The scroll position where the service section hits the top

  // 1. Initial setup to get pin start position
  function setupPinStart() {
    // The scroll position when the service section's top aligns with the sticky point (6vh)
    const stickyOffset = 0.06 * viewportHeight; // The top offset from CSS (6vh)
    pinStartScroll = serviceSection.offsetTop - stickyOffset;
  }

  // Run once and on resize
  setupPinStart();
  window.addEventListener('resize', setupPinStart);


  // 2. Main scroll listener for transitions
  function handlePinScroll() {
    const currentScroll = window.scrollY || window.pageYOffset;

    // Check if we are inside the pinned section's scroll range
    if (currentScroll >= pinStartScroll && currentScroll < pinStartScroll + totalVirtualScrollHeight) {
      // The section is pinned, calculate internal slide transition
      
      // The amount the user has scrolled since the section was pinned
      const internalScroll = currentScroll - pinStartScroll;

      // Which transition are we in? (e.g., 0 for slide 1->2, 1 for slide 2->3)
      const transitionIndex = Math.floor(internalScroll / transitionScrollHeight);
      
      // Calculate progress within the current transition (0 to 1)
      const progress = (internalScroll % transitionScrollHeight) / transitionScrollHeight;

      // Determine the two slides involved in the transition
      const currentIndex = transitionIndex;
      const nextIndex = transitionIndex + 1;
      
      setSlideOpacities(currentIndex, nextIndex, progress);

    } else if (currentScroll < pinStartScroll) {
      // Before the pinned section: show first slide fully
      setSlideOpacities(0, 1, 0);

    } else if (currentScroll >= pinStartScroll + totalVirtualScrollHeight) {
      // After the pinned section: show last slide fully
      setSlideOpacities(totalSlides - 1, totalSlides, 1);
    }
  }

  
  // 3. Function to update slide opacities based on progress
  function setSlideOpacities(fromIndex, toIndex, progress) {
    // Ensure progress is clamped
    progress = Math.min(Math.max(progress, 0), 1);
    
    // Reset all slides
    slides.forEach(slide => {
      slide.style.opacity = 0;
      slide.style.pointerEvents = 'none';
      slide.classList.remove('is-current');
    });

    // Fade out the current slide (fromIndex)
    if (slides[fromIndex]) {
      const fromOpacity = 1 - progress;
      slides[fromIndex].style.opacity = fromOpacity;
      slides[fromIndex].style.pointerEvents = fromOpacity > 0.01 ? 'auto' : 'none';
      if (fromOpacity > 0.5) slides[fromIndex].classList.add('is-current');
    }

    // Fade in the next slide (toIndex)
    if (slides[toIndex]) {
      slides[toIndex].style.opacity = progress;
      slides[toIndex].style.pointerEvents = progress > 0.01 ? 'auto' : 'none';
      if (progress > 0.5) slides[toIndex].classList.add('is-current');
    }

    // After the final transition (when progress is 1 for the last slide), 
    // we need to make sure the last slide is fully visible.
    if (progress === 1 && toIndex === totalSlides - 1) {
       slides[totalSlides - 1].style.opacity = 1;
       slides[totalSlides - 1].style.pointerEvents = 'auto';
       slides[totalSlides - 1].classList.add('is-current');
    }
  }


  window.addEventListener("scroll", handlePinScroll);
  handlePinScroll(); // Initial call
}