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

let tapHandled = false;

function showStaticTapImg() {
  tapImg.src = isMobile() ? STATIC_IMG_MOBILE : STATIC_IMG_PC;
}
showStaticTapImg();
musicWelcome.volume = 0.7;
musicWelcome.play().catch(()=>{});

tapImg.addEventListener("click", handleTap);
tapImg.addEventListener("touchstart", handleTap);
welcome.addEventListener("click", handleTap);
welcome.addEventListener("touchstart", handleTap);

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

// Roulette
const rouletteScreen = document.getElementById("roulette-screen");
const rouletteContainer = document.getElementById("roulette-container");
const rouletteSound = document.getElementById("roulette-sound");
const dropRareSound = document.getElementById("drop-rare-sound");

const caseBlank = "assets/case_blank.png";
const caseGold = "assets/onetap_gold.png";
const NB_CASES_VISIBLE = 8;
const NB_CASES_TOTAL = 34;
const DURATION = 6000;

function startRoulette() {
  rouletteScreen.style.display = "flex";
  rouletteContainer.innerHTML = "";

  const casesPool = [];
  for (let i = 0; i < NB_CASES_TOTAL - 1; i++) casesPool.push(caseBlank);
  casesPool.push(caseGold);

  let scrollPos = 0;
  let rolling = true;

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

  let totalScroll = casesPool.length * 8;
  let finalPos = (casesPool.length - 1) - Math.floor(NB_CASES_VISIBLE/2);

  rouletteSound.currentTime = 0;
  rouletteSound.play();

  let t0 = Date.now();

  function animate() {
    let elapsed = Date.now() - t0;
    let progress = Math.min(elapsed / DURATION, 1);
    let ease = 1 - Math.pow(1 - progress, 2);
    let pos = Math.floor(totalScroll * ease);
    scrollPos = pos;
    let currentPos = (pos + finalPos) % casesPool.length;
    renderCases(currentPos);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      rouletteSound.pause();
      dropRareSound.currentTime = 0;
      dropRareSound.play();
      setTimeout(showDrop, 900);
    }
  }
  animate();
}

const mainInventory = document.getElementById("main-inventory");
function showDrop() {
  rouletteScreen.style.display = "none";
  mainInventory.style.display = "flex";
  musicMain.volume = 0.6;
  musicMain.play().catch(()=>{});
}
