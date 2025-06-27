// Parallax sur le Hero logo & glow
document.addEventListener('mousemove', function(e) {
  const x = (e.clientX / window.innerWidth - 0.5) * 18;
  const y = (e.clientY / window.innerHeight - 0.5) * 14;
  document.querySelectorAll('.parallax-item').forEach(el => {
    el.style.transform = `translate(${x}px, ${y}px) scale(1.07)`;
  });
});

// Menu actif au scroll
const sections = document.querySelectorAll(".section");
const navLinks = document.querySelectorAll(".navbar ul li a");
window.addEventListener("scroll", () => {
  let fromTop = window.scrollY + 80;
  sections.forEach(section => {
    if (
      section.offsetTop <= fromTop &&
      section.offsetTop + section.offsetHeight > fromTop
    ) {
      navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + section.id) {
          link.classList.add("active");
        }
      });
    }
  });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      window.scrollTo({
        top: target.offsetTop - 60,
        behavior: "smooth"
      });
    }
  });
});

// Fade-in, slide-in apparition des sections
function revealOnScroll() {
  const reveals = document.querySelectorAll(".section, .reveal");
  for (let i = 0; i < reveals.length; i++) {
    const windowHeight = window.innerHeight;
    const elementTop = reveals[i].getBoundingClientRect().top;
    if (elementTop < windowHeight - 80) {
      reveals[i].classList.add("show");
    }
  }
}
window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

// particles.js config custom
particlesJS("particles-js", {
  "particles": {
    "number": { "value": 74, "density": { "enable": true, "value_area": 800 } },
    "color": { "value": ["#00ffff","#fff799"] },
    "shape": { "type": "circle" },
    "opacity": { "value": 0.32, "random": true },
    "size": { "value": 4, "random": true },
    "line_linked": {
      "enable": true,
      "distance": 140,
      "color": "#00ffff",
      "opacity": 0.14,
      "width": 1.2
    },
    "move": { "enable": true, "speed": 1.3, "direction": "none", "random": true }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": { "enable": true, "mode": "grab" },
      "onclick": { "enable": true, "mode": "push" }
    },
    "modes": {
      "grab": { "distance": 160, "line_linked": { "opacity": 0.37 } },
      "push": { "particles_nb": 2 }
    }
  },
  "retina_detect": true
});
