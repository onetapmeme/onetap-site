/* ===========================
   $ONETAP v3.2 – script.js
   =========================== */

/* ---------- Helpers ---------- */
const $$ = (sel, ctx = document) => ctx.querySelector(sel);
const on = (el, evt, fn, opts) => el && el.addEventListener(evt, fn, opts);
const haptics = (ms=40) => { if (navigator.vibrate) navigator.vibrate(ms); };

/* ---------- Audio ---------- */
const musicWelcome = $('#music-welcome');
const musicMain    = $('#music-main');
const musicEpic    = $('#music-epic');
const rouletteSfx  = $('#roulette-sound');
const dropSfx      = $('#drop-rare-sound');
const headshotSfx  = $('#headshot-sound');

const allAudios = [musicWelcome, musicMain, musicEpic, rouletteSfx, dropSfx, headshotSfx].filter(Boolean);
let isMuted = false;

function playSafe(audio, {volume=0.7, loop=false, reset=false} = {}) {
  if (!audio) return;
  audio.volume = volume;
  audio.loop = loop;
  if (reset) audio.currentTime = 0;
  audio.play().catch(()=>{ /* autoplay may be blocked on some browsers until user gesture */});
}
function pauseSafe(audio) { if (audio) audio.pause(); }

/* ---------- Particles BG ---------- */
function initParticles() {
  const canvas = $('#background-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  const particles = Array.from({length: 42}).map(() => ({
    x: Math.random()*W,
    y: Math.random()*H,
    r: 1 + Math.random()*2,
    col: Math.random() < 0.6 ? "#ffe066aa" : "#ffffff66",
    dx: -0.25 + Math.random()*0.5,
    dy: 0.2 + Math.random()*0.6
  }));
  function loop() {
    ctx.clearRect(0,0,W,H);
    for (const p of particles) {
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = p.col; ctx.globalAlpha = 0.7; ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.y>H) p.y=0; if (p.x>W) p.x=0; if (p.x<0) p.x=W;
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }
  loop();
  addEventListener('resize', () => {
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
  });
}

/* ---------- Welcome ---------- */
const welcome = $('#welcome-screen');
const tapImg  = $('#tap2enter-img');
let started = false;

function startFlow() {
  if (started) return;
  started = true;
  haptics(60);
  headshotSfx && headshotSfx.play();
  setTimeout(() => {
    pauseSafe(musicWelcome);
    welcome.style.opacity = 0;
    setTimeout(() => {
      welcome.style.display = 'none';
      // mini loader
      const loader = $('#loader');
      loader.style.display = 'flex';
      setTimeout(() => {
        loader.style.display = 'none';
        startRoulette();
      }, 1000);
    }, 600);
  }, 700);
}

// autoplay welcome music as soon as possible
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  playSafe(musicWelcome, {volume:0.7, loop:true});
});

// user gesture (tap anywhere)
on(welcome, 'click', startFlow);
on(welcome, 'touchstart', startFlow);
on(tapImg,  'click', startFlow);
on(tapImg,  'touchstart', startFlow);

/* ---------- Roulette ---------- */
const NB_VISIBLE   = 9;     // Must be odd, center stops on gold
const NB_TOTAL     = 38;
const SPIN_MS      = 7000;  // 7s
const container    = $('#roulette-container');
const rouletteWrap = $('#roulette-screen');

function renderCases(pool, startIndex, blurred=false) {
  if (!container) return;
  container.innerHTML = '';
  container.classList.toggle('blurred', !!blurred);
  for (let i=0;i<NB_VISIBLE;i++) {
    const idx = (startIndex + i) % pool.length;
    const isCenter = i === Math.floor(NB_VISIBLE/2);
    const isGold = (idx === pool.length-1) && isCenter;
    const div = document.createElement('div');
    div.className = `roulette-case${isGold ? ' gold' : ''}`;
    const img = document.createElement('img');
    img.src = pool[idx];
    img.alt = isGold ? 'GOLD' : 'Common';
    div.appendChild(img);
    container.appendChild(div);
  }
}

function startRoulette() {
  rouletteWrap.style.display = 'flex';
  // music main + roulette sfx
  playSafe(musicMain, {volume:0.58, loop:true});
  playSafe(rouletteSfx, {volume:0.4, loop:false, reset:true});

  // pool: many blanks + last is gold
  const pool = Array.from({length: NB_TOTAL-1}, ()=>'assets/case_blank.png');
  pool.push('assets/onetap_gold.png');

  const totalScroll = pool.length * 8; // arbitrary cycles
  const finalPos = (pool.length - 1) - Math.floor(NB_VISIBLE/2); // gold center
  const t0 = performance.now();

  function tick(now) {
    const elapsed = now - t0;
    const progress = Math.min(elapsed / SPIN_MS, 1);
    const ease = 1 - Math.pow(1 - progress, 2.2); // smooth out
    const pos = Math.floor(totalScroll * ease);
    const currentPos = (pos + finalPos) % pool.length;
    renderCases(pool, currentPos, progress < 0.8);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      pauseSafe(rouletteSfx);
      playSafe(dropSfx, {volume:0.85, reset:true});
      setTimeout(showGoldDrop, 1000);
    }
  }
  requestAnimationFrame(tick);
}

/* ---------- Gold Drop ---------- */
function launchConfetti() {
  const container = $('.confetti', $('#gold-drop-screen'));
  if (!container) return;
  container.innerHTML = '';
  for (let i=0;i<28;i++){
    const d = document.createElement('div');
    d.className = 'confetti-piece';
    d.style.cssText = `
      position:absolute;width:11px;height:15px;
      left:${Math.random()*98}%;top:${Math.random()*44+20}%;
      background:${['gold','#ffe066','#fff','#f6c62b','#ead044'][Math|0(Math.random()*5)]};
      opacity:${0.75+Math.random()*0.23};
      transform:rotate(${Math.random()*360}deg) scale(${0.7+Math.random()*0.4});
      border-radius:2px;z-index:7;
    `;
    container.appendChild(d);
  }
  setTimeout(()=>{ container.innerHTML=''; }, 1800);
}

function showGoldDrop() {
  rouletteWrap.style.display = 'none';
  const gold = $('#gold-drop-screen');
  gold.style.display = 'flex';
  launchConfetti();
  haptics(60);

  // allow user to continue
  const proceed = () => {
    gold.removeEventListener('click', proceed);
    gold.removeEventListener('touchstart', proceed);
    gold.style.opacity = 0;
    setTimeout(() => {
      gold.style.display = 'none';
      showOnetapDrop();
    }, 600);
  };
  setTimeout(() => {
    gold.addEventListener('click', proceed, {once:true});
    gold.addEventListener('touchstart', proceed, {once:true});
  }, 800);
}

/* ---------- $ONETAP Final Drop ---------- */
function showOnetapDrop() {
  const screen = $('#onetap-drop-screen');
  screen.style.display = 'flex';

  // cross-fade musics
  pauseSafe(musicMain);
  playSafe(musicEpic, {volume:0.7, loop:true, reset:true});
  haptics(70);

  // show share after anim
  setTimeout(()=> {
    const shareBtn = $('#share-btn');
    if (!shareBtn) return;
    shareBtn.style.display = 'inline-block';
    on(screen, 'click', showInventory, {once:true});
    on(screen, 'touchstart', showInventory, {once:true});
  }, 1600);
}

function showInventory() {
  $('#onetap-drop-screen').style.display = 'none';
  const inv = $('#main-inventory');
  inv.style.display = 'flex';

  // show tokenomics button now
  $('#open-tokenomics').style.display = 'inline-block';

  // killfeed sample (just for flair)
  pushKill('You obtained: $ONETAP • GOLD');
}

/* ---------- Tokenomics Modal ---------- */
const tokenomicsOverlay = $('#tokenomics-overlay');
const openTokenomicsBtn = $('#open-tokenomics');
const closeTokenomicsBtn = $('#close-tokenomics');

on(openTokenomicsBtn, 'click', () => {
  tokenomicsOverlay.classList.add('open');
  tokenomicsOverlay.setAttribute('aria-hidden', 'false');
});
on(closeTokenomicsBtn, 'click', () => {
  tokenomicsOverlay.classList.remove('open');
  tokenomicsOverlay.setAttribute('aria-hidden', 'true');
});
on(tokenomicsOverlay, 'click', (e) => {
  if (e.target === tokenomicsOverlay) {
    tokenomicsOverlay.classList.remove('open');
    tokenomicsOverlay.setAttribute('aria-hidden', 'true');
  }
});

/* Copy contract */
on($('#copy-contract-btn'), 'click', async () => {
  const addr = $('#contract-address')?.textContent?.trim() || '';
  try {
    await navigator.clipboard.writeText(addr);
    pushKill('Contract copied!');
  } catch {
    pushKill('Copy failed');
  }
});

/* Fake chart (placeholder) */
function drawFakeChart() {
  const c = $('#fakeChart');
  if (!c) return;
  const ctx = c.getContext('2d');
  const w = c.width, h = c.height;
  ctx.clearRect(0,0,w,h);
  // bg
  ctx.fillStyle = '#0e1322';
  ctx.fillRect(0,0,w,h);
  // grid
  ctx.strokeStyle = '#223';
  ctx.lineWidth = 1;
  for (let x=0; x<w; x+=35) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for (let y=0; y<h; y+=28) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
  // line
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffe066';
  const points = 40;
  for (let i=0;i<=points;i++){
    const px = (i/points)*w;
    const py = h - (Math.sin(i/3)+1)/2*h*0.7 - h*0.1 - (i>28? (i-28)*2 : 0);
    i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
  }
  ctx.stroke();
}

/* ---------- Killfeed ---------- */
function pushKill(text='Action') {
  const feed = $('#killfeed');
  if (!feed) return;
  const item = document.createElement('div');
  item.className = 'kill-msg';
  item.textContent = text;
  feed.appendChild(item);
  setTimeout(()=>{ item.remove(); }, 3800);
}

/* ---------- Mute Button ---------- */
const muteBtn = $('#mute-btn');
const muteIco = $('#mute-ico');
on(muteBtn, 'click', () => {
  isMuted = !isMuted;
  allAudios.forEach(a => a.muted = isMuted);
  muteBtn.setAttribute('aria-pressed', isMuted ? 'true' : 'false');
  muteIco.textContent = isMuted ? '🔈' : '🔊';
  muteBtn.style.opacity = isMuted ? 0.35 : 0.7;
  haptics(30);
});

/* ---------- Init after load ---------- */
window.addEventListener('load', () => {
  // try draw placeholder chart early (will only be visible inside modal)
  drawFakeChart();
});

/* ---------- Small util for selectors ---------- */
function $(sel, ctx = document){ return ctx.querySelector(sel); }
