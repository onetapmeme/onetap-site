// Fichiers utilisés :
const IS_MOBILE = window.matchMedia("(max-width:700px)").matches;
const tap2enterImg = document.getElementById('tap2enter-img');
tap2enterImg.src = IS_MOBILE ? "assets/tap2enter_mobile_static.png" : "assets/tap2enter_pc_static.png";

const welcomeScreen = document.getElementById('welcome-screen');
const rouletteScreen = document.getElementById('roulette-screen');
const dropScreen = document.getElementById('drop-screen');
const mainInventory = document.getElementById('main-inventory');

const audioIntro = document.getElementById('music-welcome');
const audioMain = document.getElementById('music-main');
const audioRoulette = document.getElementById('roulette-sound');
const audioDropRare = document.getElementById('drop-rare-sound');

// Jouer la musique d'accueil après une interaction user (obligé sur navigateur)
let introLaunched = false;
function playIntroMusicOnce() {
  if (!introLaunched) {
    audioIntro.volume = 0.4;
    audioIntro.play();
    introLaunched = true;
  }
}

// Tap2Enter au clic partout sur l'écran (plus de bouton)
welcomeScreen.addEventListener('click', function(){
  playIntroMusicOnce();
  launchRoulette();
});

// Animation roulette
function launchRoulette() {
  welcomeScreen.style.opacity = 0;
  setTimeout(()=>{ welcomeScreen.style.display = 'none'; }, 800);

  rouletteScreen.style.display = 'flex';

  // Set up visuels
  const BLANK = "assets/case_blank.png";
  const GOLD = "assets/onetap_gold.png";
  const NB_CASES = 12, GOLD_IDX = 8;
  let current = [];
  for(let i=0;i<NB_CASES;i++) current.push(BLANK);

  // Génère visuel initial
  const strip = document.getElementById('roulette-strip');
  strip.innerHTML = '';
  for(let i=0;i<NB_CASES;i++) {
    const img = document.createElement('img');
    img.src = BLANK;
    img.alt = 'Case';
    strip.appendChild(img);
  }

  // Roue animée
  let tick = 0, tMax = 90;
  audioIntro.pause();
  audioRoulette.currentTime = 0;
  audioRoulette.volume = 0.6;
  audioRoulette.play();

  let anim = setInterval(()=>{
    // Remplit toutes les cases en blanc SAUF la dernière (après 2.2s)
    for(let i=0;i<NB_CASES;i++) {
      strip.children[i].src = BLANK;
    }
    if (tick > tMax-5) { // 5 derniers ticks = gold apparait
      strip.children[GOLD_IDX].src = GOLD;
    }
    tick++;
    if (tick >= tMax) {
      clearInterval(anim);
      audioRoulette.pause();
      showDrop();
    }
  }, 38);
}

// Drop animation gold rare
function showDrop() {
  rouletteScreen.style.display = 'none';
  dropScreen.style.display = 'flex';

  audioDropRare.currentTime = 0;
  audioDropRare.volume = 1;
  audioDropRare.play();

  setTimeout(()=>{
    dropScreen.style.display = 'none';
    audioMain.currentTime = 0;
    audioMain.volume = 0.55;
    audioMain.play();
    mainInventory.style.display = 'flex';
  }, 3400); // 3.4s pour profiter du drop gold
}
