document.addEventListener("DOMContentLoaded", () => {
  /* ---------------- HEADER FADE ---------------- */
  const header = document.getElementById("site-header");
  const heroTitle = document.querySelector(".intro h1");

  if (header && heroTitle) {
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

  /* ---------------- SERVICE VERTICAL SLIDER ---------------- */

  const serviceSection = document.getElementById("service");
  if (!serviceSection) return;

  const serviceTitle = serviceSection.querySelector(".service-data h3");
  const serviceText = serviceSection.querySelector(".service-data p");
  const serviceImageWrapper = serviceSection.querySelector(".service-images");

  if (!serviceTitle || !serviceText || !serviceImageWrapper) return;

  // Your 3 states (same image r1 for now – you can change later)
  const serviceSlides = [
    {
      title: "Fitted Kitchen",
      text: "Thoughtfully designed modular kitchens that balance function and clean aesthetics, tailored precisely to your space.",
      image: "assets/r1.jpg",
    },
    {
      title: "Custom Wardrobes",
      text: "Smart storage wardrobes with strong structure, smooth finishes and layouts that make everyday use easy.",
      image: "assets/r1.jpg",
    },
    {
      title: "Comfort Bedrooms",
      text: "Calm, comfortable bedroom designs built around warm materials, simple lines and practical details.",
      image: "assets/r1.jpg",
    },
  ];

  let currentSlide = 0;
  const totalSlides = serviceSlides.length;
  let lastSlideChange = 0;
  const slideCooldown = 500; // ms between slide changes

  // Initialize background image (in case CSS is different)
  serviceImageWrapper.style.backgroundImage = `url("${serviceSlides[0].image}")`;

  function applySlide(index) {
    const slide = serviceSlides[index];
    serviceTitle.textContent = slide.title;
    serviceText.textContent = slide.text;
    serviceImageWrapper.style.backgroundImage = `url("${slide.image}")`;
  }

  function animateToSlide(nextIndex) {
    if (nextIndex === currentSlide) return;

    const dataBlock = serviceSection.querySelector(".service-data");
    const imageBlock = serviceSection.querySelector(".service-images");
    if (!dataBlock || !imageBlock) return;

    dataBlock.classList.add("service-transition-out");
    imageBlock.classList.add("service-transition-out");

    setTimeout(() => {
      currentSlide = nextIndex;
      applySlide(currentSlide);
      dataBlock.classList.remove("service-transition-out");
      imageBlock.classList.remove("service-transition-out");
    }, 200);
  }

  // Helper to check if service section is mostly in view
  function isServiceInFocus() {
    const rect = serviceSection.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    const topIn = rect.top <= vh * 0.3;
    const bottomIn = rect.bottom >= vh * 0.4;

    return topIn && bottomIn;
  }

  // Wheel (mouse scroll) handling – vertical step slider
  serviceSection.addEventListener(
    "wheel",
    (event) => {
      if (!isServiceInFocus()) return;

      const now = Date.now();
      if (now - lastSlideChange < slideCooldown) {
        event.preventDefault();
        return;
      }

      const delta = event.deltaY;

      // Scroll down → next slide
      if (delta > 0) {
        if (currentSlide < totalSlides - 1) {
          event.preventDefault();
          animateToSlide(currentSlide + 1);
          lastSlideChange = now;
        }
        // else: last slide, allow normal scroll to Journey
      }

      // Scroll up → previous slide
      if (delta < 0) {
        if (currentSlide > 0) {
          event.preventDefault();
          animateToSlide(currentSlide - 1);
          lastSlideChange = now;
        }
        // else: first slide, allow scroll back to Portfolio
      }
    },
    { passive: false }
  );

  // Basic touch support (swipe up/down) for mobile
  let touchStartY = null;

  serviceSection.addEventListener(
    "touchstart",
    (e) => {
      if (!isServiceInFocus()) return;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  serviceSection.addEventListener(
    "touchend",
    (e) => {
      if (touchStartY === null || !isServiceInFocus()) return;

      const endY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - endY;
      const now = Date.now();

      if (Math.abs(deltaY) < 30) {
        touchStartY = null;
        return;
      }
      if (now - lastSlideChange < slideCooldown) {
        touchStartY = null;
        return;
      }

      // Swipe up (finger moves up -> user scrolling down)
      if (deltaY > 0 && currentSlide < totalSlides - 1) {
        animateToSlide(currentSlide + 1);
        lastSlideChange = now;
      }

      // Swipe down (finger moves down -> user scrolling up)
      if (deltaY < 0 && currentSlide > 0) {
        animateToSlide(currentSlide - 1);
        lastSlideChange = now;
      }

      touchStartY = null;
    },
    { passive: true }
  );
});
