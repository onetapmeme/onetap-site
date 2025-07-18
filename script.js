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

// Centrage de l'image d'accueil selon device
function showStaticTapImg() {
  tapImg.src = isMobile() ? STATIC_IMG_MOBILE : STATIC_IMG_PC;
}
showStaticTapImg();

musicWelcome.volume = 0.7;
musicWelcome.play().catch(()=>{}); // Joue dès le chargement du site !

// Tap anywhere sur tout l'écran d'accueil
welcome.addEventListener("click", handleTap);
welcome.addEventListener("touchstart", handleTap);

function handleTap() {
  if (tapHandled) return;
  tapHandled = true;
  // Animation headshot
  tapImg.src = isMobile() ? GIF_IMG_MOBILE : GIF_IMG_PC;
  headshotSound.currentTime = 0;
  headshotSound.play();
  setTimeout(() => musicWelcome.pause(), 300);
  setTimeout(() => {
    welcome.style.display = "none";
    startRoulette();
  }, 1050);
}

// ================= Roulette ===================
const rouletteScreen = document.getElementById("roulette-screen");
const rouletteContainer = document.getElementById("roulette-container");
const rouletteSound = document.getElementById("roulette-sound");
const dropRareSound = document.getElementById("drop-rare-sound");

// Noms des images/assets
const caseBlank = "assets/case_blank.png";
const caseGold = "assets/onetap_gold.png";
const NB_CASES_VISIBLE = 9;
const NB_CASES_TOTAL = 36;
const DURATION = 7000; // 7 secondes

function startRoulette() {
  rouletteScreen.style.display = "flex";
  rouletteContainer.innerHTML = "";

  const casesPool = [];
  for (let i = 0; i < NB_CASES_TOTAL - 1; i++) casesPool.push(caseBlank);
  casesPool.push(caseGold); // La gold à la fin !

  let scrollPos = 0;
  let rolling = true;

  // Ajoute un blur au début, puis réduit
  rouletteContainer.style.filter = "blur(5.5px)";
  setTimeout(() => {
    rouletteContainer.style.transition = "filter 1.2s cubic-bezier(.6,1.5,.65,1)";
    rouletteContainer.style.filter = "blur(0)";
  }, 1800);

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

  // Centre la gold au centre du carrousel
  let totalScroll = casesPool.length * 8;
  let finalPos = (casesPool.length - 1) - Math.floor(NB_CASES_VISIBLE/2);

  musicMain.volume = 0.25;
  musicMain.currentTime = 0;
  musicMain.play().catch(()=>{});

  rouletteSound.currentTime = 0;
  rouletteSound.play();

  let t0 = Date.now();
  function animate() {
    let elapsed = Date.now() - t0;
    let progress = Math.min(elapsed / DURATION, 1);
    let ease = 1 - Math.pow(1 - progress, 2.1);
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
      setTimeout(showGoldDrop, 950);
    }
  }
  animate();
}

// ================= GOLD DROP ===================
const goldDropScreen = document.getElementById("gold-drop-screen");
const goldDropImg = document.getElementById("gold-drop-img");
const mainInventory = document.getElementById("main-inventory");

function showGoldDrop() {
  rouletteScreen.style.display = "none";
  goldDropScreen.style.display = "flex";
  // Laisse l'animation pop du CSS
  // Ajoute effet secousse et glow pour l'epicness
  goldDropImg.classList.remove("gold-drop-img"); // reset animation
  void goldDropImg.offsetWidth; // trick: force reflow
  goldDropImg.classList.add("gold-drop-img");
}

// TAP anywhere pour continuer vers inventaire
goldDropScreen.addEventListener("click", toInventory);
goldDropScreen.addEventListener("touchstart", toInventory);

function toInventory() {
  goldDropScreen.style.display = "none";
  mainInventory.style.display = "flex";
  // Stop la musique main si besoin, lance musique “epic” si tu veux
}

// ================= Responsive (option) ===================
window.addEventListener('resize', showStaticTapImg);
