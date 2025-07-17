// PARTICLES.JS INIT
window.addEventListener('DOMContentLoaded', () => {
  if (window.particlesJS) {
    particlesJS('particles-js', {
      particles: {
        number: { value: 72 },
        color: { value: "#ffe066" },
        shape: { type: "circle" },
        opacity: { value: 0.18 },
        size: { value: 3.5, random: true },
        move: { enable: true, speed: 1.2, direction: "none", out_mode: "out" }
      },
      interactivity: { detect_on: "canvas", events: { onclick: { enable: false } } },
      retina_detect: true
    });
  }
});

function isMobile() {
  return window.matchMedia("(max-width: 700px)").matches;
}

const STATIC_IMG_PC = "assets/tap2enter_pc_static.png";
const STATIC_IMG_MOBILE = "assets/tap2enter_mobile_static.png";
const GIF_IMG_PC = "assets/tap2enter_pc.gif";
const GIF_IMG_MOBILE = "assets/tap2enter_mobile.gif";

const welcome = document.getElementById("welcome-screen");
const tapImg = document.getElementById("tap2enter-img");
const headshotSound = document.getElementById("headshot-sound");
const musicWelcome = document.getElementById("music-welcome");
const musicMain = document.getElementById("music-main");
const pressAnyKey = document.getElementById("press-anykey");

let tapHandled = false;

function showStaticTapImg() {
  tapImg.src = isMobile() ? STATIC_IMG_MOBILE : STATIC_IMG_PC;
}
showStaticTapImg();
window.addEventListener("resize", showStaticTapImg);

function launchWelcomeMusic() {
  if (musicWelcome.paused) {
    musicWelcome.volume = 0.23;
    musicWelcome.currentTime = 0;
    musicWelcome.play().catch(()=>{});
  }
}
// Musique d'accueil : autoplay après 1er clic/tap (fix mobile)
['click', 'touchstart', 'keydown'].forEach(ev => {
  document.addEventListener(ev, launchWelcomeMusic, { once: true });
});

function hidePressAnyKey() {
  if(pressAnyKey) pressAnyKey.style.display = "none";
}
tapImg.addEventListener("click", () => { handleTap(); hidePressAnyKey(); });
tapImg.addEventListener("touchstart", () => { handleTap(); hidePressAnyKey(); });
welcome.addEventListener("click", () => { handleTap(); hidePressAnyKey(); });
welcome.addEventListener("touchstart", () => { handleTap(); hidePressAnyKey(); });
document.addEventListener("keydown", () => { handleTap(); hidePressAnyKey(); });

function handleTap() {
  if (tapHandled) return;
  tapHandled = true;

  tapImg.src = isMobile() ? GIF_IMG_MOBILE : GIF_IMG_PC;
  headshotSound.currentTime = 0;
  headshotSound.play();

  setTimeout(() => {
    welcome.classList.remove("fade-in");
    welcome.classList.add("fade-out");
    setTimeout(() => {
      welcome.style.display = "none";
      showLoader();
      musicWelcome.pause();
      musicWelcome.currentTime = 0;
    }, 750);
  }, 1100);
}

// === Loader avant la roulette ===
const loader = document.getElementById("loader-screen");
function showLoader() {
  loader.style.display = "flex";
  loader.classList.add("fade-in");
  setTimeout(() => {
    loader.classList.remove("fade-in");
    loader.classList.add("fade-out");
    setTimeout(() => {
      loader.style.display = "none";
      startRoulette();
    }, 600);
  }, 1200);
}

// === ROULETTE ===
const rouletteScreen = document.getElementById("roulette-screen");
const rouletteContainer = document.getElementById("roulette-container");
const rouletteSound = document.getElementById("roulette-sound");
const dropRareSound = document.getElementById("drop-rare-sound");

const caseBlank = "assets/case_blank.png";
const caseGold = "assets/onetap_gold.png";
const NB_CASES_VISIBLE = 8;
const NB_CASES_TOTAL = 34;
const DURATION = 5500;

function startRoulette() {
  rouletteScreen.style.display = "flex";
  rouletteScreen.classList.add("fade-in");
  rouletteContainer.innerHTML = "";

  const casesPool = [];
  for (let i = 0; i < NB_CASES_TOTAL - 1; i++) casesPool.push(caseBlank);
  casesPool.push(caseGold);

  function renderCases(pos, isBlur) {
    if(isBlur) rouletteContainer.classList.add("roulette-blur");
    else rouletteContainer.classList.remove("roulette-blur");
    rouletteContainer.innerHTML = "";
    for (let i = 0; i < NB_CASES_VISIBLE; i++) {
      let idx = (pos + i) % casesPool.length;
      let isGold = (idx === casesPool.length - 1 && i === Math.floor(NB_CASES_VISIBLE/2));
      let caseDiv = document.createElement("div");
      caseDiv.className = "roulette-case" + (isGold ? " gold" : "");
      let img = document.createElement("img");
      img.src = casesPool[idx];
      caseDiv.appendChild(img);
      rouletteContainer.appendChild(caseDiv);
    }
  }

  let totalScroll = casesPool.length * 8.3;
  let finalPos = (casesPool.length - 1) - Math.floor(NB_CASES_VISIBLE/2);

  rouletteSound.currentTime = 0;
  rouletteSound.volume = 0.6;
  rouletteSound.play();

  let t0 = Date.now();

  function animate() {
    let elapsed = Date.now() - t0;
    let progress = Math.min(elapsed / DURATION, 1);
    let ease = 1 - Math.pow(1 - progress, 2.3);
    let pos = Math.floor(totalScroll * ease);
    let currentPos = (pos + finalPos) % casesPool.length;
    let isBlur = (progress < 0.93);
    renderCases(currentPos, isBlur);

    if (progress < 1) {
      // Pour synchroniser la fin du son et de l'anim
      if(progress > 0.94 && !rouletteSound.paused) {
        rouletteSound.volume *= 0.97;
        if(rouletteSound.volume < 0.1) rouletteSound.pause();
      }
      requestAnimationFrame(animate);
    } else {
      rouletteSound.pause();
      setTimeout(() => {
        dropRareSound.currentTime = 0;
        dropRareSound.volume = 0.95;
        dropRareSound.play();
        rouletteScreen.classList.remove("fade-in");
        rouletteScreen.classList.add("fade-out");
        setTimeout(showDrop, 850);
      }, 720);
    }
  }
  animate();
}

// === INVENTAIRE & Drop ===
const mainInventory = document.getElementById("main-inventory");
function showDrop() {
  rouletteScreen.style.display = "none";
  mainInventory.style.display = "flex";
  mainInventory.classList.add("fade-in");
  musicMain.volume = 0.34;
  musicMain.play().catch(()=>{});
}

// SHARE BUTTONS dummy (à remplacer par vrais liens socials)
window.shareX = function() {
  window.open('https://x.com/intent/tweet?text=I+just+got+a+legendary+drop+on+$ONETAP!+%23ONETAP+%23memecoin','_blank');
}
window.shareTG = function() {
  window.open('https://t.me/share/url?url=https://onetapmeme.github.io/onetap-site/&text=I+just+got+a+legendary+drop+on+$ONETAP!','_blank');
}
