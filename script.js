const NB_SLOTS = 9;
const SPIN_DURATION = 7000;
const BLANK_IMG = "assets/blank_case.png"; // Ton PNG case blanche pixelisé ici
const GOLD_IMG = "assets/onetap_gold.png";

// --- Accueil TAP2ENTER ---
const welcomeScreen = document.getElementById("welcome-screen");
const welcomeImg = document.getElementById("welcome-img");
const tapBtn = document.getElementById("tap-to-enter");
const headshotSound = document.getElementById("headshot-sound");
const musicWelcome = document.getElementById("music-welcome");
musicWelcome.volume = 0.28;
musicWelcome.play();

// Détecte mobile
function isMobile() {
  return window.matchMedia("(max-width: 700px)").matches;
}

tapBtn.onclick = function() {
  // Remplace l'image statique par le GIF tir/headshot
  welcomeImg.src = isMobile() ? "assets/tap2enter_mobile.gif" : "assets/tap2enter_pc.gif";
  headshotSound.play();

  setTimeout(() => {
    welcomeScreen.style.display = "none";
    launchRoulette();
    musicWelcome.pause();
  }, 1400); // Durée du GIF headshot
};

// --- Roulette ---
const rouletteScreen = document.getElementById("roulette-screen");
const rouletteContainer = document.getElementById("roulette-container");
const rouletteSound = document.getElementById("roulette-sound");
const dropRareSound = document.getElementById("drop-rare-sound");
const musicMain = document.getElementById("music-main");
musicMain.volume = 0.19;

function launchRoulette() {
  rouletteScreen.style.display = "flex";
  rouletteSound.currentTime = 0;
  rouletteSound.play();

  // Prépare les cases
  rouletteContainer.innerHTML = "";
  let slots = [];
  for (let i=0; i<NB_SLOTS; i++) {
    const slot = document.createElement("div");
    slot.className = "roulette-slot";
    const img = document.createElement("img");
    img.src = BLANK_IMG;
    slot.appendChild(img);
    rouletteContainer.appendChild(slot);
    slots.push(slot);
  }

  // Animation spin : toujours blanc pendant la durée
  let anim = setInterval(() => {
    for (let i=0; i<NB_SLOTS; i++) {
      slots[i].firstChild.src = BLANK_IMG;
    }
  }, 60);

  // Stop roulette, affiche la gold AU MILIEU seulement à la fin
  setTimeout(() => {
    clearInterval(anim);
    rouletteSound.pause();
    for (let i=0; i<NB_SLOTS; i++) {
      slots[i].firstChild.src = BLANK_IMG;
    }
    slots[Math.floor(NB_SLOTS/2)].firstChild.src = GOLD_IMG; // Case centrale en gold
    dropRareSound.currentTime = 0;
    dropRareSound.play();
    setTimeout(() => {
      rouletteScreen.style.display = "none";
      showInventory();
      musicMain.play();
    }, 2200);
  }, SPIN_DURATION);
}

// --- INVENTAIRE ---
function showInventory() {
  document.getElementById("main-inventory").style.display = "flex";
  // Personnalise ici l’affichage principal de ton site.
}
