// --- CONSTANTES ---
const STATIC_IMG_PC = "assets/tap2enter_pc_static.png";
const STATIC_IMG_MOBILE = "assets/tap2enter_mobile_static.png";
const GIF_IMG_PC = "assets/tap2enter_pc.gif";
const GIF_IMG_MOBILE = "assets/tap2enter_mobile.gif";
const caseBlank = "assets/case_blank.png";
const caseGold = "assets/onetap_gold.png";
const mainCoin = "assets/onetap_logo.png";

const NB_CASES_VISIBLE = 9; // 9 cases visibles, gold au centre
const NB_CASES_TOTAL = 36;
const DURATION = 7000;

// --- ELEMENTS ---
const welcome = document.getElementById("welcome-screen");
const tapImg = document.getElementById("tap2enter-img");
const headshotSound = document.getElementById("headshot-sound");
const musicWelcome = document.getElementById("music-welcome");
const musicMain = document.getElementById("music-main");
const rouletteScreen = document.getElementById("roulette-screen");
const rouletteContainer = document.getElementById("roulette-container");
const rouletteSound = document.getElementById("roulette-sound");
const dropRareSound = document.getElementById("drop-rare-sound");
const dropScreen = document.getElementById("gold-drop-screen");
const dropImg = document.getElementById("gold-drop-img");
const dropTitle = document.getElementById("gold-drop-title");
const dropTap = document.getElementById("gold-drop-tap");
const mainInventory = document.getElementById("main-inventory");
const mainCoinImg = document.getElementById("main-coin-img");

// --- UTILS ---
function isMobile() {
  return window.matchMedia("(max-width: 700px)").matches;
}

function showStaticTapImg() {
  tapImg.src = isMobile() ? STATIC_IMG_MOBILE : STATIC_IMG_PC;
}

// --- ACCUEIL ---
let tapHandled = false;
showStaticTapImg();
musicWelcome.volume = 0.4;
musicWelcome.play().catch(()=>{});

window.addEventListener("resize", showStaticTapImg);

// Tap anywhere pour démarrer
["click", "touchstart"].forEach(evt => {
  welcome.addEventListener(evt, handleTap);
  tapImg.addEventListener(evt, handleTap);
});
function handleTap() {
  if (tapHandled) return;
  tapHandled = true;
  tapImg.src = isMobile() ? GIF_IMG_MOBILE : GIF_IMG_PC;
  headshotSound.currentTime = 0;
  headshotSound.play();
  setTimeout(() => musicWelcome.pause(), 500);
  setTimeout(() => {
    welcome.style.display = "none";
    startRoulette();
  }, 1200);
}

// --- ROULETTE ---
function startRoulette() {
  rouletteScreen.style.display = "flex";
  rouletteContainer.innerHTML = "";
  musicMain.currentTime = 0;
  musicMain.volume = 0.30;
  musicMain.play().catch(()=>{});

  // Génère la liste de cases
  const casesPool = [];
  for (let i = 0; i < NB_CASES_TOTAL - 1; i++) casesPool.push(caseBlank);
  casesPool.push(caseGold);

  // Pour centrer la gold
  let totalScroll = casesPool.length * 8;
  let finalPos = (casesPool.length - 1) - Math.floor(NB_CASES_VISIBLE / 2);

  rouletteSound.currentTime = 0;
  rouletteSound.volume = 0.40;
  rouletteSound.play();

  let t0 = Date.now();

  function renderCases(pos) {
    rouletteContainer.innerHTML = "";
    for (let i = 0; i < NB_CASES_VISIBLE; i++) {
      let idx = (pos + i) % casesPool.length;
      let isGold = (idx === casesPool.length - 1 && i === Math.floor(NB_CASES_VISIBLE / 2));
      let caseDiv = document.createElement("div");
      caseDiv.className = "roulette-case" + (isGold ? " gold" : "");
      let img = document.createElement("img");
      img.src = casesPool[idx];
      caseDiv.appendChild(img);
      rouletteContainer.appendChild(caseDiv);
    }
    // Effet de blur dynamique
    rouletteContainer.style.filter =
      (pos < totalScroll * 0.9) ? `blur(${2 + 7 * Math.abs(Math.sin(Date.now()/130))}px)` : "none";
  }

  function animate() {
    let elapsed = Date.now() - t0;
    let progress = Math.min(elapsed / DURATION, 1);
    let ease = 1 - Math.pow(1 - progress, 2);
    let pos = Math.floor(totalScroll * ease);
    let currentPos = (pos + finalPos) % casesPool.length;
    renderCases(currentPos);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      rouletteSound.pause();
      dropRareSound.currentTime = 0;
      dropRareSound.play();
      setTimeout(showDrop, 850);
    }
  }
  animate();
}

// --- DROP GOLD ---
function showDrop() {
  rouletteScreen.style.display = "none";
  dropScreen.style.display = "flex";
  // Animation scale et glow flash
  dropImg.classList.add("drop-flash");
  dropTitle.classList.add("gold-text");
  setTimeout(() => {
    dropImg.classList.remove("drop-flash");
    dropTap.style.opacity = 1;
  }, 1200);

  // Tap anywhere pour avancer
  ["click", "touchstart"].forEach(evt =>
    dropScreen.addEventListener(evt, showMainInventory, { once: true })
  );
}

// --- MAIN INVENTORY ---
function showMainInventory() {
  dropScreen.style.display = "none";
  mainInventory.style.display = "flex";
  musicMain.volume = 0.40;
  mainCoinImg.classList.add("main-coin-appear");
}

// --- INIT AU LOAD ---
document.addEventListener("DOMContentLoaded", () => {
  showStaticTapImg();
  tapHandled = false;
  welcome.style.display = "flex";
  rouletteScreen.style.display = "none";
  dropScreen.style.display = "none";
  mainInventory.style.display = "none";
  dropTap.style.opacity = 0;
});
