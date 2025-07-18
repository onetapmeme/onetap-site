// --------- Welcome Music & Canvas Anim ----------
const musicWelcome = document.getElementById('music-welcome');
const musicMain = document.getElementById('music-main');
const musicEpic = document.getElementById('music-epic'); // <-- epic music
window.addEventListener('DOMContentLoaded', () => {
  musicWelcome.volume = 0.7;
  musicWelcome.play().catch(()=>{});
  initParticles();
});

// Tap anywhere to begin
const welcome = document.getElementById('welcome-screen');
let tapHandled = false;
function handleTap() {
  if (tapHandled) return;
  tapHandled = true;
  // Haptique mobile
  if (window.navigator.vibrate) window.navigator.vibrate(60);
  document.getElementById('press-anywhere-text').style.opacity = 0;
  document.getElementById('headshot-sound').play();
  setTimeout(() => {
    musicWelcome.pause();
    welcome.style.opacity = 0;
    setTimeout(() => {
      welcome.style.display = "none";
      document.getElementById('loader').style.display = "flex";
      setTimeout(() => {
        document.getElementById('loader').style.display = "none";
        startRoulette();
      }, 1200);
    }, 750);
  }, 850);
}
welcome.addEventListener("click", handleTap);
welcome.addEventListener("touchstart", handleTap);

// ----------- Roulette -----------
// (config)
const NB_CASES_VISIBLE = 9;
const NB_CASES_TOTAL = 38;
const SPIN_DURATION = 7000;

function startRoulette() {
  musicMain.volume = 0.58;
  musicMain.play().catch(()=>{});
  document.getElementById('roulette-screen').style.display = "flex";
  let rouletteContainer = document.getElementById("roulette-container");
  let rouletteSound = document.getElementById("roulette-sound");
  let dropRareSound = document.getElementById("drop-rare-sound");

  let casesPool = [];
  for (let i = 0; i < NB_CASES_TOTAL - 1; i++) casesPool.push("assets/case_blank.png");
  casesPool.push("assets/onetap_gold.png");

  let totalScroll = casesPool.length * 8;
  let finalPos = (casesPool.length - 1) - Math.floor(NB_CASES_VISIBLE / 2);

  rouletteSound.currentTime = 0;
  rouletteSound.volume = 0.40;
  rouletteSound.play();

  let t0 = Date.now();

  function renderCases(pos, blur = false) {
    rouletteContainer.innerHTML = "";
    if (blur) rouletteContainer.classList.add("blurred");
    else rouletteContainer.classList.remove("blurred");
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
  }

  function animate() {
    let elapsed = Date.now() - t0;
    let progress = Math.min(elapsed / SPIN_DURATION, 1);
    let ease = 1 - Math.pow(1 - progress, 2.2);
    let pos = Math.floor(totalScroll * ease);
    let currentPos = (pos + finalPos) % casesPool.length;
    // Blur sur la première partie du spin
    renderCases(currentPos, progress < 0.8);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      rouletteSound.pause();
      dropRareSound.currentTime = 0;
      dropRareSound.play();
      setTimeout(showGoldDrop, 1200);
    }
  }
  animate();
}

// -------- GOLD DROP ----------- 
function showGoldDrop() {
  document.getElementById('roulette-screen').style.display = "none";
  let goldDropScreen = document.getElementById('gold-drop-screen');
  goldDropScreen.style.display = "flex";
  launchConfetti();
  setTimeout(() => {
    // Haptique mobile
    if (window.navigator.vibrate) window.navigator.vibrate(60);
    goldDropScreen.addEventListener("click", showOnetapDrop);
    goldDropScreen.addEventListener("touchstart", showOnetapDrop);
    let txt = document.createElement("span");
    txt.innerText = "Tap to continue";
    txt.style.cssText = "color:#fff;font-size:1rem;opacity:0.7;margin-top:2vw;animation:pulseText 1s infinite alternate;";
    goldDropScreen.appendChild(txt);
  }, 1000);
}

// -------- FINAL DROP $ONETAP ----------- 
function showOnetapDrop() {
  let goldDropScreen = document.getElementById('gold-drop-screen');
  goldDropScreen.style.opacity = 0;
  setTimeout(() => {
    goldDropScreen.style.display = "none";
    document.getElementById('onetap-drop-screen').style.display = "flex";
    // Musique épique : propre, jamais en double
    if (musicMain) musicMain.pause();
    if (musicEpic && musicEpic.paused) {
      musicEpic.currentTime = 0;
      musicEpic.volume = 0.7;
      musicEpic.play().catch(()=>{});
    }
    // Haptique mobile
    if (window.navigator.vibrate) window.navigator.vibrate(70);
    setTimeout(() => {
      document.getElementById('share-btn').style.display = "inline-block";
      document.getElementById('onetap-drop-screen').addEventListener("click", showMainInventory);
      document.getElementById('onetap-drop-screen').addEventListener("touchstart", showMainInventory);
    }, 2000);
  }, 650);
}

// --------- INVENTORY FINAL ---------
function showMainInventory() {
  document.getElementById('onetap-drop-screen').style.display = "none";
  document.getElementById('main-inventory').style.display = "flex";
  // Haptique
  if (window.navigator.vibrate) window.navigator.vibrate(50);
}

// ---------- Confetti Animation (Gold Drop) ----------
function launchConfetti() {
  let container = document.querySelector('.confetti');
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < 26; i++) {
    let conf = document.createElement('div');
    conf.className = "confetti-piece";
    conf.style.cssText =
      `position:absolute;width:11px;height:15px;
      left:${Math.random()*98}%;top:${Math.random()*44+20}% ;
      background:${['gold','#ffe066','#fff','#f6c62b','#ead044'][Math.floor(Math.random()*5)]};
      opacity:${0.75+Math.random()*0.23};transform:rotate(${Math.random()*360}deg) scale(${0.7+Math.random()*0.4});
      border-radius:2px;z-index:7;`;
    container.appendChild(conf);
  }
  setTimeout(()=>{ if(container)container.innerHTML=""; },2000);
}

// --------- Animated Canvas Background (Particles) ---------
function initParticles() {
  const canvas = document.getElementById('background-canvas');
  const ctx = canvas.getContext('2d');
  let W = window.innerWidth, H = window.innerHeight;
  canvas.width = W; canvas.height = H;

  let particles = [];
  for(let i=0;i<38;i++) {
    let r = 1+Math.random()*2;
    let col = Math.random()<0.6 ? "#ffe066aa":"#fff6";
    particles.push({
      x: Math.random()*W,
      y: Math.random()*H,
      r,
      col,
      dx: -0.3 + Math.random()*0.6,
      dy: 0.2 + Math.random()*0.5
    });
  }
  function animate() {
    ctx.clearRect(0,0,W,H);
    for(let p of particles) {
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,2*Math.PI);
      ctx.fillStyle = p.col;
      ctx.globalAlpha = 0.65;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if(p.y>H) p.y=0;
      if(p.x>W) p.x=0;
      if(p.x<0) p.x=W;
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }
  animate();
  window.addEventListener('resize',()=>{
    W=window.innerWidth; H=window.innerHeight;
    canvas.width=W; canvas.height=H;
  });
}
