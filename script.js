/// --- Tap2Enter transition ---
function showRoulette() {
  document.getElementById("welcome-screen").style.opacity = 0;
  setTimeout(()=>{
    document.getElementById("welcome-screen").style.display = "none";
    document.getElementById("roulette-container").style.display = "flex";
    startRoulette();
  }, 550);
}

// --- Roulette ---
const BLANK = "assets/case_blank.png";
const GOLD = "assets/onetap_gold.png";
const NB_CASES_VISIBLE = 7; // Visible à l'écran (impair!)
const NB_ROLLS = 22; // Longueur du spin (cases totales à afficher)
const ALL_CASES = [];

// Remplis la roulette avec des cases blanches, gold à la fin !
for(let i=0; i<NB_ROLLS; i++) ALL_CASES.push(BLANK);
// La gold sera centrée à la fin
ALL_CASES.push(GOLD);

function startRoulette() {
  const row = document.getElementById('roulette-row');
  row.innerHTML = '';
  // Affiche toutes les cases
  for (let i = 0; i < ALL_CASES.length; i++) {
    let div = document.createElement('div');
    div.className = 'roulette-case';
    div.innerHTML = `<img src="${ALL_CASES[i]}" draggable="false" />`;
    row.appendChild(div);
  }
  // Calcule le scroll pour que la gold arrive au centre !
  setTimeout(()=>{
    playRouletteSound();
    const caseElem = document.querySelector('.roulette-case');
    const caseW = caseElem.offsetWidth + 12; // width + margin
    const totalCases = ALL_CASES.length;
    const targetIndex = totalCases - Math.floor(NB_CASES_VISIBLE/2) - 1;
    const translateX = targetIndex * caseW;
    row.style.transform = `translateX(-${translateX}px)`;
    setTimeout(showDropPopup, 6700); // Temps de l'anim + pop
  }, 320);
}

function playRouletteSound() {
  const audio = document.getElementById("roulette-audio");
  audio.currentTime = 0;
  audio.play();
}

function showDropPopup() {
  document.getElementById('roulette-container').style.display = "none";
  document.getElementById('drop-popup').style.display = "flex";
  playDropRareSound();
}

function playDropRareSound() {
  const audio = document.getElementById("droprare-audio");
  audio.currentTime = 0;
  audio.play();
}
