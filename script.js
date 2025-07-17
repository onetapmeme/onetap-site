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
const loader = document.getElementById("loader-screen");

let tapHandled = false;
function showStaticTapImg() {
  tapImg.src = isMobile() ? STATIC_IMG_MOBILE : STATIC_IMG_PC;
}
showStaticTapImg();
window.addEventListener("resize", showStaticTapImg);
function launchWelcomeMusic() {
  if (musicWelcome && musicWelcome.paused) {
    musicWelcome.volume = 0.24;
    musicWelcome.currentTime = 0;
    musicWelcome.play().catch(()=>{});
  }
}
window.addEventListener("load", launchWelcomeMusic);

tapImg.addEventListener("click", handleTap);
tapImg.addEventListener("touchstart", handleTap);
welcome.addEventListener("click", handleTap);
welcome.addEventListener("touchstart", handleTap);
document.addEventListener("keydown", handleTap);

function handleTap() {
  if (tapHandled) return;
  tapHandled = true;
  pressAnyKey.style.display = "none";
  tapImg.src = isMobile() ? GIF_IMG_MOBILE : GIF_IMG_PC;
  headshotSound.currentTime = 0;
  headshotSound.play();
  musicWelcome.pause(); musicWelcome.currentTime = 0;
  setTimeout(() => {
    welcome.style.display = "none";
    showLoader();
  }, 1200);
}
function showLoader() {
  loader.style.display = "flex";
  setTimeout(() => {
    loader.style.display = "none";
    startRoulette();
  }, 1100);
}

// Roulette
const rouletteScreen = document.getElementById("roulette-screen");
const rouletteContainer = document.getElementById("roulette-container");
const rouletteSound = document.getElementById("roulette-sound");
const dropRareSound = document.getElementById("drop-rare-sound");
const musicEpic = document.getElementById("music-epic");

const caseBlank = "assets/case_blank.png";
const caseGold = "assets/onetap_gold.png";
const NB_CASES_VISIBLE = 9; // Pour que la gold tombe bien au centre !
const NB_CASES_TOTAL = 37;
const DURATION = 7000;

function startRoulette() {
  rouletteScreen.style.display = "flex";
  rouletteContainer.innerHTML = "";
  if (musicMain) {
    musicMain.volume = 0.33;
    musicMain.currentTime = 0;
    musicMain.play().catch(()=>{});
  }
  // --- Roulette setup ---
  const casesPool = [];
  for (let i = 0; i < NB_CASES_TOTAL - 1; i++) casesPool.push(caseBlank);
  casesPool.push(caseGold);
  function renderCases(pos) {
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
  let totalScroll = casesPool.length * 10;
  let finalPos = (casesPool.length - 1) - Math.floor(NB_CASES_VISIBLE/2);
  rouletteSound.currentTime = 0;
  rouletteSound.volume = 0.9;
  rouletteSound.play();
  let t0 = Date.now();
  function animate() {
    let elapsed = Date.now() - t0;
    let progress = Math.min(elapsed / DURATION, 1);
    let ease = progress < 0.87
      ? Math.pow(progress, 0.62)
      : 1 - Math.pow(1 - progress, 2.35);
    let pos = Math.floor(totalScroll * ease);
    let currentPos = (pos + finalPos) % casesPool.length;
    renderCases(currentPos);
    if (progress < 1) {
      if(progress > 0.97 && !rouletteSound.paused) {
        rouletteSound.volume *= 0.85;
        if(rouletteSound.volume < 0.03) rouletteSound.pause();
      }
      requestAnimationFrame(animate);
    } else {
      rouletteSound.pause();
      musicMain.pause();
      dropRareSound.currentTime = 0;
      dropRareSound.play();
      setTimeout(showEpicDrop, 900);
    }
  }
  animate();
}

// --- DROP ANIMATION ---
const dropAnimation = document.getElementById("drop-animation");
const goldMemecoin = document.getElementById("gold-memecoin");
function showEpicDrop() {
  rouletteScreen.style.display = "none";
  dropAnimation.style.display = "flex";
  musicEpic.volume = 0.36;
  musicEpic.currentTime = 0;
  musicEpic.play().catch(()=>{});
  setTimeout(() => {
    dropAnimation.style.display = "none";
    showInventory();
  }, 2700); // Laisse l’animation un bon moment
}

// INVENTAIRE
const mainInventory = document.getElementById("main-inventory");
function showInventory() {
  mainInventory.style.display = "flex";
}
