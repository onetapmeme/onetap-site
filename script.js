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

// Apparition des sections (pop/fade in pixel)
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

// particles.js config custom, fond hero
particlesJS("particles-js", {
  "particles": {
    "number": { "value": 62, "density": { "enable": true, "value_area": 800 } },
    "color": { "value": ["#26B6FA","#FF842A","#F8EDC2"] },
    "shape": { "type": "square" },
    "opacity": { "value": 0.38, "random": true },
    "size": { "value": 5, "random": true },
    "line_linked": {
      "enable": true,
      "distance": 135,
      "color": "#26B6FA",
      "opacity": 0.13,
      "width": 1.4
    },
    "move": { "enable": true, "speed": 1.35, "direction": "none", "random": true }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": { "enable": true, "mode": "grab" },
      "onclick": { "enable": true, "mode": "push" }
    },
    "modes": {
      "grab": { "distance": 170, "line_linked": { "opacity": 0.31 } },
      "push": { "particles_nb": 2 }
    }
  },
  "retina_detect": true
});

// ----------- Pixel burst effect on buttons ----------
function pixelBurst(el) {
  for (let i = 0; i < 14; i++) {
    const px = document.createElement('div');
    px.className = 'pixel-burst';
    const angle = Math.random() * 2 * Math.PI;
    const dist = 40 + Math.random() * 24;
    px.style.left = '50%';
    px.style.top = '50%';
    px.style.background = Math.random() > 0.5 ? '#26B6FA' : '#FF842A';
    el.appendChild(px);
    setTimeout(() => {
      px.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px) scale(0.7)`;
      px.style.opacity = 0;
    }, 10);
    setTimeout(() => px.remove(), 550);
  }
}

document.querySelectorAll('.btn-animate').forEach(btn => {
  btn.addEventListener('click', function(e) {
    pixelBurst(this);
  });
});
