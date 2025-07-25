// --------- Welcome Music & Canvas Anim ----------
const musicWelcome = document.getElementById('music-welcome');
const musicMain = document.getElementById('music-main');
const musicEpic = document.getElementById('music-epic');
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
    if (window.navigator.vibrate) window.navigator.vibrate(60);
    goldDropScreen.addEventListener("click", showOnetapDrop, { once: true });
    goldDropScreen.addEventListener("touchstart", showOnetapDrop, { once: true });
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
    // Musique épique propre et en boucle
    if (musicMain) musicMain.pause();
    if (musicEpic) {
      musicEpic.pause();
      musicEpic.currentTime = 0;
      musicEpic.loop = true;
      musicEpic.volume = 0.7;
      musicEpic.play().catch(()=>{});
    }
    if (window.navigator.vibrate) window.navigator.vibrate(70);
    setTimeout(() => {
      document.getElementById('share-btn').style.display = "inline-block";
      document.getElementById('onetap-drop-screen').addEventListener("click", showMainInventory, { once: true });
      document.getElementById('onetap-drop-screen').addEventListener("touchstart", showMainInventory, { once: true });
    }, 2000);
  }, 650);
}

// --------- INVENTORY FINAL ---------
function showMainInventory() {
  document.getElementById('onetap-drop-screen').style.display = "none";
  document.getElementById('main-inventory').style.display = "flex";
  if (window.navigator.vibrate) window.navigator.vibrate(50);
  document.getElementById('open-tokenomics').style.display = "block";
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

// ----- Gestion bouton Mute/Unmute -----
const allAudios = [
  musicWelcome, musicMain, musicEpic,
  document.getElementById('roulette-sound'),
  document.getElementById('drop-rare-sound'),
  document.getElementById('headshot-sound')
];
let muted = false;
const muteBtn = document.getElementById('mute-btn');
const icoUnmuted = document.getElementById('ico-unmuted');
const icoMuted = document.getElementById('ico-muted');
muteBtn.addEventListener('click', () => {
  muted = !muted;
  allAudios.forEach(a => { if(a) a.muted = muted; });
  if (muted) {
    icoUnmuted.style.display = 'none';
    icoMuted.style.display = '';
  } else {
    icoUnmuted.style.display = '';
    icoMuted.style.display = 'none';
  }
  muteBtn.style.opacity = muted ? 0.33 : 0.62;
});

// ==== TOKENOMICS - Copy Contract ====
document.getElementById('copy-contract-btn').addEventListener('click', function() {
  const addr = document.getElementById('contract-address').innerText;
  navigator.clipboard.writeText(addr);
  this.textContent = "✅";
  setTimeout(() => { this.textContent = "📋"; }, 1200);
});

// ==== FAKE CHART ====
function drawFakeChart() {
  const c = document.getElementById('fakeChart');
  if (!c) return;
  // adapt width/height to container
  c.width = c.offsetWidth; c.height = c.offsetHeight;
  const ctx = c.getContext('2d');
  const w = c.width, h = c.height;
  // Fake data
  const pts = [0.23,0.41,0.25,0.52,0.66,0.42,0.81,0.71,0.95,0.78,1.18,1.05,0.91,1.43,2.08,1.77,2.7,2.58,2.35,2.9,3.1];
  ctx.clearRect(0,0,w,h);
  // Axis
  ctx.strokeStyle = "#ffe06644";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(30,h-22); ctx.lineTo(w-14,h-22); ctx.stroke();
  ctx.moveTo(30,h-22); ctx.lineTo(30,14); ctx.stroke();
  // Line
  ctx.strokeStyle = "#ffe066";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for(let i=0;i<pts.length;i++){
    let x = 30 + i*((w-50)/pts.length);
    let y = h-22 - (pts[i]*((h-60)/3.5));
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();
  // Dots
  ctx.fillStyle = "#ffe066";
  for(let i=0;i<pts.length;i++){
    let x = 30 + i*((w-50)/pts.length);
    let y = h-22 - (pts[i]*((h-60)/3.5));
    ctx.beginPath(); ctx.arc(x,y,2.5,0,2*Math.PI); ctx.fill();
  }
  // Label
  ctx.font = "bold 1.1rem Arial"; ctx.fillStyle="#ffe066b9";
  ctx.fillText("ATH", w-55, 22);
}
window.addEventListener('DOMContentLoaded', drawFakeChart);
window.addEventListener('resize', drawFakeChart);

// ==== KILLFEED ====
function showKillFeed(msg) {
  const feed = document.getElementById('killfeed');
  const el = document.createElement('div');
  el.className = "kill-msg";
  el.textContent = msg;
  feed.appendChild(el);
  setTimeout(()=>{ el.remove(); }, 3400);
}
// Exemple d'appel à placer dans les scripts (drop gold, etc)
// showKillFeed("0x9C...53 just dropped a GOLD! 💥");

// --- Tokenomics Overlay ---
const tokenomicsOverlay = document.getElementById('tokenomics-overlay');
const openTokenomics = document.getElementById('open-tokenomics');
const closeTokenomics = document.getElementById('close-tokenomics');

if (openTokenomics && closeTokenomics && tokenomicsOverlay) {
  openTokenomics.addEventListener('click', () => {
    tokenomicsOverlay.classList.add('open');
    document.body.style.overflow = "hidden"; // évite le scroll derrière
  });
  closeTokenomics.addEventListener('click', () => {
    tokenomicsOverlay.classList.remove('open');
    document.body.style.overflow = "";
  });
  // Fermer si clic sur fond overlay hors modal
  tokenomicsOverlay.addEventListener('click', (e) => {
    if (e.target === tokenomicsOverlay) {
      tokenomicsOverlay.classList.remove('open');
      document.body.style.overflow = "";
    }
  });
}
