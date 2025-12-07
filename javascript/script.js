document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("site-header");
  const heroTitle = document.querySelector(".intro h1");

  if (!header || !heroTitle) return;

  // Scroll distance at which title is fully out of view
  const titleTop = heroTitle.offsetTop;
  const titleHeight = heroTitle.offsetHeight;
  const maxScroll = titleTop + titleHeight; // when scrollY >= this, title is gone

  function handleScroll() {
    const scrolled = window.scrollY || window.pageYOffset;

    // progress: 0 → 1 between top and "title gone"
    let progress = scrolled / maxScroll;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    // Header opacity follows progress
    header.style.opacity = progress;

    // Optional: header background becomes more solid as you scroll
    const baseAlpha = 0.1;      // starting transparency
    const maxExtraAlpha = 0.8;  // extra by the time progress = 1
    const bgAlpha = baseAlpha + maxExtraAlpha * progress;
    header.style.backgroundColor = `rgba(44, 45, 49, ${bgAlpha})`;

    // Title fades out opposite to header
    heroTitle.style.opacity = 1 - progress;
  }

  window.addEventListener("scroll", handleScroll);
  handleScroll(); // run once on load
});