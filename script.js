const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const progressBar = document.querySelector(".progress-bar");
const pointerGlow = document.querySelector(".pointer-glow");

function updateProgress() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
  if (progressBar) progressBar.style.width = `${pct}%`;
}

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

if (!reduceMotion && pointerGlow) {
  document.body.classList.add("has-pointer");
  let raf = 0;
  let targetX = window.innerWidth * 0.7;
  let targetY = window.innerHeight * 0.25;
  let x = targetX;
  let y = targetY;

  const tick = () => {
    x += (targetX - x) * 0.12;
    y += (targetY - y) * 0.12;
    pointerGlow.style.left = `${x}px`;
    pointerGlow.style.top = `${y}px`;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  window.addEventListener(
    "pointermove",
    (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    },
    { passive: true }
  );
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Highlight the nav link of the section currently in view.
const navLinks = [...document.querySelectorAll("nav a[href^='#']")];
const sectionMap = new Map(
  navLinks
    .map((a) => [a, document.querySelector(a.getAttribute("href"))])
    .filter(([, el]) => el)
);

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => {
        const active = sectionMap.get(a) === entry.target;
        a.classList.toggle("active", active);
        if (active) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
);

sectionMap.forEach((el) => navObserver.observe(el));

// Click-to-enlarge for figures.
const lightbox = document.getElementById("lightbox");
if (lightbox && typeof lightbox.showModal === "function") {
  const lightboxImg = lightbox.querySelector("img");
  document.querySelectorAll(".fig-open").forEach((btn) => {
    btn.addEventListener("click", () => {
      const thumb = btn.querySelector("img");
      lightboxImg.src = btn.dataset.full;
      lightboxImg.alt = thumb ? thumb.alt : "";
      lightbox.showModal();
    });
  });
  lightbox.addEventListener("click", (e) => {
    // Close when clicking the backdrop or the close button.
    if (e.target === lightbox || e.target.closest(".lightbox-close")) lightbox.close();
  });
}
