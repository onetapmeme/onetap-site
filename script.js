/* ========= $ONETAP v3.2 – script.js ========= */

// Audio refs
const musicWelcome = document.getElementById('music-welcome');
const musicMain    = document.getElementById('music-main');
const musicEpic    = document.getElementById('music-epic');
const headshot     = document.getElementById('headshot-sound');
const rouletteSfx  = document.getElementById('roulette-sound');
const dropRareSfx  = document.getElementById('drop-rare-sound');

// Stages
const welcome      = document.getElementById('welcome-screen');
const loader       = document.getElementById('loader');
const rouletteScr  = document.getElementById('roulette-screen');
const rouletteBox  = document.getElementById('roulette-container');
const goldDropScr  = document.getElementById('gold-drop-screen');
const onetapScr    = document.getElementById('onetap-drop-screen');
const mainInv      = document.getElementById('main-inventory');

// Tokenomics modal
const openTokBtn   = document.getElementById('open-tokenomics');
const tokOverlay   = document.getElementById('tokenomics-overlay');
const closeTokBtn  = document.getElementById('close-tokenomics');

// Mute
const muteBtn      = document.getElementById('mute-btn');
const muteIco      = document.getElementById('mute-ico');
let muted = false;

// Constants roulette
const NB_CASES_VISIBLE = 9;     // gold centré
const NB_CASES_TOTAL   = 38;
const SPIN_DURATION    = 7000;  // 7s

// Particles background
window.addEventListener('DOMContentLoaded', () => {
  // Welcome music (tentative auto-play; mobile requiert parfois un user gesture)
  try { musicWelcome.volume = 0.7; musicWelcome.play().catch(()=>{}); } catch{}
  initParticles();
});

// Tap to start
let tapHandled = false;
function handleTapStart(){
  if (tapHandled) return;
  tapHandled = true;

  // Haptique mobile
  if (navigator.vibrate) navigator.vibrate(60);

  // Headshot + fade out welcome
  try { headshot.currentTime = 0; headshot.play(); } catch{}
  setTimeout(() => {
    try { musicWelcome.pause(); } catch{}
    welcome.style.opacity = 0;
    setTimeout(() => {
      welcome.style.display = 'none';
      loader.style.display = 'flex';
      setTimeout(() => {
        loader.style.display = 'none';
        startRoulette();
      }, 1200);
    }, 750);
  }, 850);
}
welcome.addEventListener('click', handleTapStart, {passive:true});
welcome.addEventListener('touchstart', handleTapStart, {passive:true});

// Roulette logic
function startRoulette(){
  // Main music
  try { musicMain.volume = 0.58; musicMain.play().catch(()=>{}); } catch{}
  rouletteScr.style.display = 'flex';
  rouletteBox.innerHTML = '';

  // Pool (toutes blanches sauf une gold)
  const pool = [];
  for (let i=0;i<NB_CASES_TOTAL-1;i++) pool.push('assets/case_blank.png');
  pool.push('assets/onetap_gold.png');

  const totalScroll = pool.length * 8;
  const finalPos = (pool.length - 1) - Math.floor(NB_CASES_VISIBLE/2);

  try { rouletteSfx.currentTime = 0; rouletteSfx.volume = 0.4; rouletteSfx.play(); } catch{}

  const t0 = Date.now();

  function render(pos, blur=false){
    rouletteBox.innerHTML = '';
    if (blur) rouletteBox.classList.add('blurred'); else rouletteBox.classList.remove('blurred');
    for(let i=0;i<NB_CASES_VISIBLE;i++){
      const idx = (pos + i) % pool.length;
      const isGold = (idx === pool.length-1 && i === Math.floor(NB_CASES_VISIBLE/2));
      const cell = document.createElement('div');
      cell.className = 'roulette-case' + (isGold ? ' gold' : '');
      const img = document.createElement('img');
      img.src = pool[idx];
      img.alt = isGold ? 'Golden case' : 'Blank case';
      cell.appendChild(img);
      rouletteBox.appendChild(cell);
    }
  }

  function animate(){
    const elapsed = Date.now() - t0;
    const progress = Math.min(elapsed / SPIN_DURATION, 1);
    const ease = 1 - Math.pow(1 - progress, 2.2);
    const pos = Math.floor(totalScroll * ease);
    const cur = (pos + finalPos) % pool.length;

    // blur au début, propre à la fin
    render(cur, progress < 0.8);

    if (progress < 1){
      requestAnimationFrame(animate);
    } else {
      try { rouletteSfx.pause(); } catch{}
      try { dropRareSfx.currentTime = 0; dropRareSfx.play(); } catch{}
      setTimeout(showGoldDrop, 1200);
    }
  }
  animate();
}

// Gold Drop
function showGoldDrop(){
  rouletteScr.style.display = 'none';
  goldDropScr.style.display = 'flex';
  launchConfetti();

  setTimeout(() => {
    if (navigator.vibrate) navigator.vibrate(60);
    // Clique pour continuer
    goldDropScr.addEventListener('click', showOnetapDrop, { once:true });
    goldDropScr.addEventListener('touchstart', showOnetapDrop, { once:true, passive:true });

    // Prompt texte
    const hint = document.createElement('span');
    hint.textContent = 'Tap to continue';
    hint.style.cssText = 'color:#fff;font-size:1rem;opacity:.7;margin-top:2vw;animation:pulseText 1s infinite alternate;';
    goldDropScr.appendChild(hint);
  }, 900);
}

// ONETAP final + epic music
function showOnetapDrop(){
  goldDropScr.style.opacity = 0;
  setTimeout(() => {
    goldDropScr.style.display = 'none';
    onetapScr.style.display = 'flex';

    // Swap musiques proprement
    try { musicMain.pause(); } catch{}
    try {
      musicEpic.pause();
      musicEpic.currentTime = 0;
      musicEpic.loop = true;
      musicEpic.volume = 0.7;
      musicEpic.play().catch(()=>{});
    } catch{}

    if (navigator.vibrate) navigator.vibrate(70);

    setTimeout(() => {
      const share = document.getElementById('share-btn');
      share.style.display = 'inline-block';
      onetapScr.addEventListener('click', showMainInventory, { once:true });
      onetapScr.addEventListener('touchstart', showMainInventory, { once:true, passive:true });
    }, 2000);
  }, 650);
}

// Inventory
function showMainInventory(){
  onetapScr.style.display = 'none';
  mainInv.style.display = 'flex';
  if (navigator.vibrate) navigator.vibrate(50);

  // Affiche bouton tokenomics
  openTokBtn.style.display = 'inline-flex';

  // Petit killfeed
  pushKill('Welcome to your $ONETAP inventory!');
}

// Tokenomics modal
openTokBtn.addEventListener('click', () => {
  tokOverlay.classList.add('open');
});
closeTokBtn.addEventListener('click', () => {
  tokOverlay.classList.remove('open');
});
tokOverlay.addEventListener('click', (e) => {
  if (e.target === tokOverlay) tokOverlay.classList.remove('open');
});

// Copy contract
const copyBtn = document.getElementById('copy-contract-btn');
if (copyBtn){
  copyBtn.addEventListener('click', async () => {
    const addr = document.getElementById('contract-address').textContent.trim();
    try { await navigator.clipboard.writeText(addr); pushKill('Contract copied!'); }
    catch { pushKill('Copy failed'); }
  });
}

// Killfeed helpers
function pushKill(text){
  const feed = document.getElementById('killfeed');
  const msg = document.createElement('div');
  msg.className = 'kill-msg';
  msg.textContent = text;
  feed.appendChild(msg);
  setTimeout(() => { msg.remove(); }, 3600);
}

// Mute
const allAudios = [musicWelcome, musicMain, musicEpic, headshot, rouletteSfx, dropRareSfx];
muteBtn.addEventListener('click', () => {
  muted = !muted;
  allAudios.forEach(a => { try{ a.muted = muted; }catch{} });
  muteIco.textContent = muted ? '🔈' : '🔊';
  muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
  muteBtn.style.opacity = muted ? .35 : .7;
});

// Particles
function initParticles(){
  const canvas = document.getElementById('background-canvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  const P = [];
  for(let i=0;i<38;i++){
    const r = 1 + Math.random()*2;
    P.push({
      x: Math.random()*W, y: Math.random()*H, r,
      col: Math.random() < .6 ? '#ffe066aa' : '#ffffff99',
      dx: -0.3 + Math.random()*0.6, dy: 0.2 + Math.random()*0.5
    });
  }

  function step(){
    ctx.clearRect(0,0,W,H);
    for(const p of P){
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = p.col;
      ctx.globalAlpha = 0.65;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.y > H) p.y = 0;
      if (p.x > W) p.x = 0;
      if (p.x < 0) p.x = W;
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(step);
  }
  step();

  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });
}

// Confetti
function launchConfetti(){
  const container = document.querySelector('.confetti');
  if (!container) return;
  container.innerHTML = '';
  for (let i=0;i<26;i++){
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      position:absolute;width:11px;height:15px;left:${Math.random()*98}%;
      top:${Math.random()*44+20}%;background:${['gold','#ffe066','#fff','#f6c62b','#ead044'][Math.floor(Math.random()*5)]};
      opacity:${0.75 + Math.random()*0.23};transform:rotate(${Math.random()*360}deg) scale(${0.7+Math.random()*0.4});
      border-radius:2px;z-index:7;
    `;
    container.appendChild(el);
  }
  setTimeout(() => { container.innerHTML = ''; }, 2000);
}

/* Fin */
