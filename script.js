// ==========================
// 1. HEADSHOT ANIMATION
// ==========================
let welcomeScreen = document.getElementById('welcome-screen');
let welcomeImg = document.getElementById('main-welcome-gif');
let headshotSound = document.getElementById('headshot-sound');
let welcomeMusic = document.getElementById('welcome-music');
let rouletteMusic = document.getElementById('roulette-music');
let rouletteScreen = document.getElementById('roulette-screen');
let rouletteSound = document.getElementById('roulette-sound');
let dropScreen = document.getElementById('drop-screen');
let dropRareSound = document.getElementById('drop-rare-sound');
let mainInventory = document.getElementById('main-inventory');

// Démarre la musique d'accueil (30% volume)
welcomeMusic.volume = 0.3;
welcomeMusic.currentTime = 0;
welcomeMusic.play().catch(()=>{});

// Animation d'entrée (GIF au clic)
welcomeImg.addEventListener('click', function () {
  // Active le gif headshot
  let isMobile = window.matchMedia("(max-width: 700px)").matches;
  this.src = isMobile ? "assets/tap2enter_mobile.gif" : "assets/tap2enter_pc.gif";
  headshotSound.currentTime = 0;
  headshotSound.play().catch(()=>{});
  setTimeout(() => {
    welcomeScreen.style.opacity = 0;
    welcomeMusic.pause();
    // Passe à la roulette après un court délai
    setTimeout(() => {
      welcomeScreen.style.display = "none";
      launchRoulette();
    }, 800);
  }, 1100); // Durée du headshot gif
});

// ==========================
// 2. ROULETTE
// ==========================
function launchRoulette() {
  rouletteScreen.style.display = "flex";
  rouletteMusic.volume = 0.3;
  rouletteMusic.currentTime = 0;
  rouletteMusic.play().catch(()=>{});
  startRouletteAnimation();
}

function startRouletteAnimation() {
  let strip = document.getElementById("roulette-strip");
  strip.innerHTML = "";
  const caseCount = 9;
  // Compose la séquence: que des blancs SAUF le centre qui sera la gold
  let images = [];
  for (let i = 0; i < caseCount; i++) {
    if (i === Math.floor(caseCount / 2)) {
      images.push("assets/onetap_gold.png");
    } else {
      images.push("assets/case_blank.png");
    }
  }
  // Crée les éléments img
  for (let img of images) {
    let im = document.createElement("img");
    im.src = img;
    strip.appendChild(im);
  }

  // Animation du défilement
  let animationDuration = 4000; // ms
  let start = null;
  let loop;
  rouletteSound.currentTime = 0;
  rouletteSound.play().catch(()=>{});
  function animateRoulette(ts) {
    if (!start) start = ts;
    let elapsed = ts - start;
    let progress = Math.min(elapsed / animationDuration, 1);
    let shift = Math.pow(1 - progress, 1.7) * 320 + (progress * 32); // décélération

    strip.style.transform = `translateX(${-shift}px)`;
    if (progress < 1) {
      loop = requestAnimationFrame(animateRoulette);
    } else {
      rouletteSound.pause();
      rouletteMusic.pause();
      setTimeout(showDrop, 200);
    }
  }
  animateRoulette(performance.now());
}

function showDrop() {
  rouletteScreen.style.display = "none";
  dropScreen.style.display = "flex";
  dropRareSound.volume = 0.4;
  dropRareSound.currentTime = 0;
  dropRareSound.play().catch(()=>{});
  // On clique sur la gold pour afficher l'inventaire
  dropScreen.addEventListener('click', goToInventory, { once: true });
}

function goToInventory() {
  dropScreen.style.display = "none";
  mainInventory.style.display = "flex";
}
