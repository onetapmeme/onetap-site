// --- ACCUEIL TAP TO ENTER ---
function isMobile() {
  return window.matchMedia("(max-width: 700px)").matches;
}

document.getElementById("main-welcome-gif").addEventListener("click", function() {
  if (isMobile()) {
    this.src = "assets/tap2enter_mobile.gif";
  } else {
    this.src = "assets/tap2enter_pc.gif";
  }
  document.getElementById("headshot-sound").play();
  // Après l'effet, transition vers roulette
  setTimeout(() => {
    document.getElementById('welcome-screen').style.opacity = 0;
    setTimeout(() => {
      document.getElementById('welcome-screen').style.display = 'none';
      document.getElementById('roulette-screen').style.display = 'block';
      launchRoulette();
    }, 700);
  }, 1800);
});

// --- ROULETTE ---
const CASES_COUNT = 14;
const GOLD_POS = 7; // Position du gold
const VISIBLE_CASES = 7; // Nb de cases visibles

function generateRouletteCases() {
  const rouletteCases = [];
  for (let i = 0; i < CASES_COUNT; i++) {
    if (i === GOLD_POS) {
      rouletteCases.push(`<div class="roulette-case gold"><img src="assets/onetap_gold.png" alt="gold"></div>`);
    } else {
      rouletteCases.push(`<div class="roulette-case"><img src="assets/case_blank.png" alt=""></div>`);
    }
  }
  document.getElementById("roulette-cases").innerHTML = rouletteCases.join("");
}
generateRouletteCases();

let interval, position = 0, speed = 41, ticks = 0, stopping = false;
const audioRoulette = document.getElementById("roulette-sound");
const audioDrop = document.getElementById("drop-sound");

function updatePosition(pos) {
  const caseWidth = document.querySelector('.roulette-case').offsetWidth + 16;
  const centerOffset = Math.floor(VISIBLE_CASES/2);
  document.getElementById("roulette-cases").style.transform =
    `translateX(${-((pos-centerOffset)*caseWidth)}px)`;
}

function launchRoulette() {
  position = 0; speed = 41; ticks = 0; stopping = false;
  updatePosition(position);
  audioRoulette.currentTime = 0; audioRoulette.play();
  interval = setInterval(() => {
    updatePosition(position);
    position = (position + 1) % CASES_COUNT;
    ticks++;
    if (!stopping && ticks > 110) {
      stopping = true;
      slowDown();
    }
  }, speed);
}

function slowDown() {
  clearInterval(interval);
  let cur = position, slow = 85;
  function nextStep() {
    updatePosition(cur);
    if (cur === GOLD_POS) return endSpin();
    cur = (cur + 1) % CASES_COUNT;
    slow += 37 + Math.random()*23;
    setTimeout(nextStep, slow);
  }
  nextStep();
}
function endSpin() {
  audioRoulette.pause();
  setTimeout(() => {
    document.getElementById("roulette-screen").style.display = "none";
    document.getElementById("drop-screen").style.display = "flex";
    audioDrop.currentTime = 0; audioDrop.play();
  }, 700);
}

// --- (Optionnel : lancer roulette direct si tu veux test sans accueil)
// window.onload = () => { launchRoulette(); };
