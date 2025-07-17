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
const epicMusic = document.getElementById("epic-music");

let tapHandled = false;

// Dès le chargement, lance la musique welcome
musicWelcome.volume = 0.65;
musicWelcome.play().catch(()=>{});

function showStaticTapImg() {
  tapImg.src = isMobile() ? STATIC_IMG_MOBILE : STATIC_IMG_PC;
}
showStaticTapImg();

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
  }, 1300);
}

// Roulette
const rouletteScreen = document.getElementById("roulette-screen");
const rouletteContainer = document.getElementById("roulette-container");
const rouletteSound = document.getElementById("roulette-sound");
const dropRareSound = document.getElementById("drop-rare-sound");

const caseBlank = "assets/case_blank.png";
const caseGold = "assets/onetap_gold.png";
const NB_CASES_VISIBLE = 9;
const NB_CASES_TOTAL = 37;
const ROULETTE_DURATION = 7000;

function startRoulette() {
  rouletteScreen.style.display = "flex";
  rouletteContainer.innerHTML = "";
  musicMain.volume = 0.42;
  musicMain.currentTime = 0;
  musicMain.play().catch(()=>{});

  const casesPool = [];
  for (let i = 0; i < NB_CASES_TOTAL - 1; i++) casesPool.push(caseBlank);
  casesPool.push(caseGold);

  let scrollPos = 0;

  function renderCases(pos, blur=false) {
    rouletteContainer.innerHTML = "";
    if (blur) rouletteContainer.classList.add("roulette-blur");
    else rouletteContainer.classList.remove("roulette-blur");
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
  rouletteSound.volume = 0.35;
  rouletteSound.play();

  let t0 = Date.now();

  function animate() {
    let elapsed = Date.now() - t0;
    let progress = Math.min(elapsed / ROULETTE_DURATION, 1);
    let ease = 1 - Math.pow(1 - progress, 2.2);
    let pos = Math.floor(totalScroll * ease);
    scrollPos = pos;
    let currentPos = (pos + finalPos) % casesPool.length;
    // Blur sur la première partie du spin, puis net à la fin
    renderCases(currentPos, progress < 0.80);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      rouletteSound.pause();
      dropRareSound.currentTime = 0;
      dropRareSound.play();
      setTimeout(showDrop, 1100);
    }
  }
  animate();
}

const mainInventory = document.getElementById("main-inventory");
function showDrop() {
  rouletteScreen.style.display = "none";
  // Affiche la case gold drop avec animation
  mainInventory.style.display = "flex";
  const goldImg = document.querySelector(".gold-drop");
  goldImg.classList.add("gold-flash-anim");
  setTimeout(() => {
    goldImg.classList.remove("gold-flash-anim");
    mainInventory.style.opacity = 0;
    setTimeout(() => {
      mainInventory.style.display = "none";
      showRealDrop();
    }, 600);
  }, 2200);
}

// Drop final ultra animé
function showRealDrop() {
  // Stop musique main, play epic music
  musicMain.pause();
  epicMusic.currentTime = 0;
  epicMusic.volume = 0.55;
  epicMusic.play().catch(()=>{});

  const dropOverlay = document.createElement('div');
  dropOverlay.id = "final-drop";
  dropOverlay.innerHTML = `
    <img src="assets/onetap_logo.png" alt="$ONETAP Token" class="real-drop-anim" />
    <h1 class="drop-titre">$ONETAP Token Unlocked!</h1>
    <!-- Boutons partage ou autres éléments peuvent être ajoutés ici -->
  `;
  document.body.appendChild(dropOverlay);
}
