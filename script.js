/* ========= $ONETAP v5.2.3 – script.js (boot fix + audio) ========= */

/** ====================== CONFIG ====================== **/
const CONFIG = {
  CONTRACT:      '0x0000000000000000000000000000000000000000', // remplace
  BUY_URL:       'https://app.uniswap.org/swap?chain=base',
  CHART_URL:     'https://dexscreener.com/base',
  AUDIT_URL:     'assets/audit.pdf',
  LP_PROOF_URL:  'https://basescan.org',
  BASESCAN_ADDR: 'https://basescan.org',
  SUPPLY:        100000000,              // <— sans séparateur
  TAX_TOTAL:     3,
  TAX_BREAKDOWN: { dev:1, marketing:1, lp:1 },
  LOCK_INFO:     '3 months',
  DISTRIBUTION: [
    { label: 'Liquidity',    value: 60, color: '#ffd54d' },
    { label: 'Marketing',    value: 18, color: '#60a5fa' },
    { label: 'CEX & Growth', value: 12, color: '#34d399' },
    { label: 'Community',    value: 10, color: '#f472b6' }
  ],
  SW_VERSION: 'onetap-v5-3'
};

/** ====================== SELECTORS ====================== **/
const canvasBG = document.getElementById('background-canvas');

const welcome      = document.getElementById('welcome-screen');
const rouletteScr  = document.getElementById('roulette-screen');
const rouletteBox  = document.getElementById('roulette-container');
const goldDropScr  = document.getElementById('gold-drop-screen');
const onetapScr    = document.getElementById('onetap-drop-screen');
const mainInv      = document.getElementById('main-inventory');

const shareBtn     = document.getElementById('share-btn');

const openTokBtn   = document.getElementById('open-tokenomics');
const tokOverlay   = document.getElementById('tokenomics-overlay');
const closeTokBtn  = document.getElementById('close-tokenomics');

const mixerBtn     = document.getElementById('mixer-btn');
const mixerPanel   = document.getElementById('mixer-panel');
const volMaster    = document.getElementById('vol-master');
const volMusic     = document.getElementById('vol-music');
const volSfx       = document.getElementById('vol-sfx');

const muteBtn      = document.getElementById('mute-btn');
const muteIco      = document.getElementById('mute-ico');

/** ====================== AUDIO ====================== **/
const tickEl = document.getElementById('roulette-tick') || document.getElementById('roulette-sound');
const audio = {
  headshot:  document.getElementById('headshot-sound'),
  welcome:   document.getElementById('music-welcome'),
  main:      document.getElementById('music-main'),
  epic:      document.getElementById('music-epic'),
  tick:      tickEl,
  dropRare:  document.getElementById('drop-rare-sound'),
};

let muted = false;

// mixer state
const mixer = {
  master: parseFloat(localStorage.getItem('vol_master') ?? '1'),
  music:  parseFloat(localStorage.getItem('vol_music')  ?? '0.8'),
  sfx:    parseFloat(localStorage.getItem('vol_sfx')    ?? '0.8'),
};

if (volMaster) volMaster.value = mixer.master;
if (volMusic)  volMusic.value  = mixer.music;
if (volSfx)    volSfx.value    = mixer.sfx;

function applyVolumes(){
  const m = mixer.master;
  [audio.welcome, audio.main, audio.epic].forEach(a => { if(a){ a.volume = m * mixer.music; }});
  [audio.headshot, audio.tick, audio.dropRare].forEach(a => { if(a){ a.volume = m * mixer.sfx; }});
  if (mainLoop) mainLoop.volume = m * mixer.music;
}
applyVolumes();

volMaster && volMaster.addEventListener('input', e => {
  mixer.master = parseFloat(e.target.value || '1');
  localStorage.setItem('vol_master', mixer.master);
  applyVolumes();
});
volMusic && volMusic.addEventListener('input', e => {
  mixer.music = parseFloat(e.target.value || '1');
  localStorage.setItem('vol_music', mixer.music);
  applyVolumes();
});
volSfx && volSfx.addEventListener('input', e => {
  mixer.sfx = parseFloat(e.target.value || '1');
  localStorage.setItem('vol_sfx', mixer.sfx);
  applyVolumes();
});

// mute
muteBtn && muteBtn.addEventListener('click', () => {
  muted = !muted;
  Object.values(audio).forEach(a => { try{ if(a) a.muted = muted; }catch{} });
  if (mainLoop) mainLoop.muted = muted;
  if (muteIco) muteIco.textContent = muted ? '🔈' : '🔊';
  muteBtn && muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
  if (muteBtn) muteBtn.style.opacity = muted ? .4 : .8;
});

/* ===== Déverrouillage audio fiable (tap/clic) ===== */
let audioUnlocked = false;
function unlockAudioOnce(){
  if (audioUnlocked) return;
  audioUnlocked = true;
  const els = Object.values(audio).filter(Boolean);
  els.forEach(a=>{
    try{
      a.muted = false;
      const p = a.play();
      if (p && typeof p.then==='function'){ p.then(()=>a.pause()).catch(()=>{}); } else { a.pause(); }
    }catch{}
  });
  try {
    if (audio.main) {
      audio.main.addEventListener('loadedmetadata', ()=>{
        if (audio.main.duration && audio.main.currentTime < 0.05) audio.main.currentTime = 0.05;
      }, { once:true });
    }
  }catch{}
  applyVolumes();
}
['pointerdown','touchstart','click','keydown'].forEach(ev=>{
  window.addEventListener(ev, unlockAudioOnce, { once:true, passive:true });
});

// ambiance welcome si autorisé
document.addEventListener('DOMContentLoaded', () => {
  try { audio.welcome && audio.welcome.play().catch(()=>{}); } catch{}
});

/** ===== Boucle “main” gapless par cross-fade ===== */
class SeamlessLoop {
  constructor(el, fadeMs=160){
    this.fade = fadeMs/1000;
    this.a = el;
    this.b = el ? el.cloneNode(true) : null;
    if (!this.a || !this.b) return;
    this.a.loop = false; this.b.loop = false;
    this.active = this.a; this.passive = this.b;
    this.timer = null; this.started = false;
    this._muted = false; this._vol = this.a.volume || 1;
    [this.a,this.b].forEach(x=>{ x.volume=this._vol; x.muted=this._muted; });
  }
  arm(){
    const left = Math.max((this.active.duration||0) - (this.active.currentTime||0) - this.fade, 0.15);
    clearTimeout(this.timer);
    this.timer = setTimeout(()=>this.sync(), left*1000);
  }
  sync(){
    if (!this.passive) return;
    this.passive.currentTime = 0.05;
    this.passive.volume = 0;
    this.passive.play().catch(()=>{});
    const t0 = performance.now();
    const tick = (now)=>{
      const p = Math.min((now - t0)/ (this.fade*1000), 1);
      this.passive.volume = this._vol * p;
      this.active.volume  = this._vol * (1 - p);
      if (p < 1) requestAnimationFrame(tick); else {
        this.active.pause();
        [this.active, this.passive] = [this.passive, this.active];
        this.arm();
      }
    };
    requestAnimationFrame(tick);
  }
  start(){
    if (!this.a || !this.b || this.started) return;
    this.started = true;
    this.a.currentTime = 0.05;
    this.a.play().then(()=>this.arm()).catch(()=>{});
  }
  pause(){ clearTimeout(this.timer); this.a&&this.a.pause(); this.b&&this.b.pause(); this.started=false; }
  set volume(v){ this._vol=v; if(this.a) this.a.volume=v; if(this.b) this.b.volume=v; }
  set muted(m){ this._muted=m; if(this.a) this.a.muted=m; if(this.b) this.b.muted=m; }
}
const mainLoop = audio.main ? new SeamlessLoop(audio.main, 160) : null;

/** ====================== PARTICLES BG ====================== **/
(function initParticles(){
  if (!canvasBG) return;
  const ctx = canvasBG.getContext('2d');
  let W = canvasBG.width = innerWidth;
  let H = canvasBG.height = innerHeight;
  const P = [];
  const COUNT = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ? 20 : 40;
  for(let i=0;i<COUNT;i++){
    const r = 1+Math.random()*2;
    P.push({x:Math.random()*W,y:Math.random()*H,r, col:Math.random()<.6?'#ffe066aa':'#ffffff99', dx:-0.25+Math.random()*0.5, dy:0.2+Math.random()*0.5});
  }
  (function step(){
    ctx.clearRect(0,0,W,H);
    for(const p of P){
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.col;ctx.globalAlpha=.65;ctx.fill();
      p.x+=p.dx;p.y+=p.dy;if(p.y>H)p.y=0;if(p.x>W)p.x=0;if(p.x<0)p.x=W;
    }
    ctx.globalAlpha=1;requestAnimationFrame(step);
  })();
  addEventListener('resize',()=>{W=canvasBG.width=innerWidth;H=canvasBG.height=innerHeight;});
})();

/** ====================== FLOW ====================== **/
let tapHandled = false;
function handleTapStart(){
  if (tapHandled) return;
  tapHandled = true;
  if (navigator.vibrate) navigator.vibrate(60);
  try { audio.headshot && (audio.headshot.currentTime = 0, audio.headshot.play()); } catch {}
  setTimeout(()=>{
    try { audio.welcome && audio.welcome.pause(); } catch {}
    if (welcome) welcome.style.opacity = 0;
    setTimeout(()=>{
      if (welcome) welcome.style.display='none';
      startRoulette(); // direct
    }, 500);
  }, 420);
}
welcome && welcome.addEventListener('click', handleTapStart, {passive:true});
welcome && welcome.addEventListener('touchstart', handleTapStart, {passive:true});

/** ====================== ROULETTE ====================== **/
const NB_CASES_VISIBLE = 9;
const NB_CASES_TOTAL   = 38;
const SPIN_DURATION    = 7000;

function startRoulette(){
  try {
    if (mainLoop){ mainLoop.volume = mixer.master*mixer.music; mainLoop.start(); }
    else { audio.main && audio.main.play().catch(()=>{}); }
  } catch{}
  if (rouletteScr) rouletteScr.style.display='flex';
  if (rouletteBox) rouletteBox.innerHTML = '';

  const pool = [];
  for (let i=0;i<NB_CASES_TOTAL-1;i++) pool.push('assets/case_blank.png');
  pool.push('assets/onetap_gold.png');

  const totalScroll = pool.length * 8;
  const finalPos = (pool.length - 1) - Math.floor(NB_CASES_VISIBLE/2);

  const t0 = performance.now();

  function render(pos, blur=false){
    if (!rouletteBox) return;
    rouletteBox.innerHTML = '';
    rouletteBox.classList.toggle('blurred', blur);
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

  // tick décéléré (rythme musical jusqu'au stop)
  (function scheduleTicks(){
    if (!audio.tick) return;
    const now = performance.now();
    const progress = Math.min((now - t0) / SPIN_DURATION, 1);
    const speed = 1 - Math.pow(progress, 2.4);
    const delay = 40 + 420 * (1 - speed);
    try { audio.tick.currentTime = 0; audio.tick.play().catch(()=>{}); } catch{}
    if (progress < 1) setTimeout(scheduleTicks, delay);
  })();

  (function animate(){
    const elapsed = performance.now() - t0;
    const progress = Math.min(elapsed / SPIN_DURATION, 1);
    const ease = 1 - Math.pow(1 - progress, 2.3);
    const pos = Math.floor(totalScroll * ease);
    const cur = (pos + finalPos) % pool.length;
    render(cur, progress < .75);
    if (progress < 1){
      requestAnimationFrame(animate);
    } else {
      try { audio.dropRare && (audio.dropRare.currentTime=0, audio.dropRare.play()); } catch{}
      setTimeout(showGoldDrop, 900);
    }
  })();
}

/** ====================== DROPS ====================== **/
function showGoldDrop(){
  if (rouletteScr) rouletteScr.style.display='none';
  if (goldDropScr) goldDropScr.style.display='flex';
  launchConfetti();
  setTimeout(()=>{
    if (navigator.vibrate) navigator.vibrate(60);
    if (goldDropScr){
      const hint = document.createElement('span');
      hint.textContent = 'Tap to continue';
      hint.style.cssText = 'color:#fff;font-size:1rem;opacity:.7;margin-top:2vw;animation:pulseText 1s infinite alternate;';
      goldDropScr.appendChild(hint);
      goldDropScr.addEventListener('click', showOnetapDrop, { once:true });
      goldDropScr.addEventListener('touchstart', showOnetapDrop, { once:true, passive:true });
    }
  }, 700);
}

function showOnetapDrop(){
  if (goldDropScr) goldDropScr.style.opacity=0;
  setTimeout(()=>{
    if (goldDropScr) goldDropScr.style.display='none';
    if (onetapScr) onetapScr.style.display='flex';
    try { mainLoop && mainLoop.pause(); } catch{}
    try { audio.epic && (audio.epic.currentTime=0, audio.epic.play().catch(()=>{})); } catch{}
    if (navigator.vibrate) navigator.vibrate(70);
    setTimeout(()=>{
      if (shareBtn) shareBtn.style.display='inline-block';
      onetapScr && onetapScr.addEventListener('click', showMainInventory, { once:true });
      onetapScr && onetapScr.addEventListener('touchstart', showMainInventory, { once:true, passive:true });
    }, 1800);
  }, 520);
}

function showMainInventory(){
  if (onetapScr) onetapScr.style.display='none';
  if (mainInv) mainInv.style.display='flex';
  if (navigator.vibrate) navigator.vibrate(50);
  if (openTokBtn) openTokBtn.style.display='inline-flex';
  pushKill('Welcome to your $ONETAP inventory!');
}

/** ====================== TOKENOMICS ====================== **/
openTokBtn && openTokBtn.addEventListener('click', () => {
  populateTokenomicsUI();
  tokOverlay && tokOverlay.classList.add('open');
});
closeTokBtn && closeTokBtn.addEventListener('click', () => tokOverlay && tokOverlay.classList.remove('open'));
tokOverlay && tokOverlay.addEventListener('click', (e) => { if (e.target === tokOverlay) tokOverlay.classList.remove('open'); });

function populateTokenomicsUI(){
  const pretty = (n)=> n.toLocaleString('en-US');

  const supplyEl = document.getElementById('tok-supply');
  const taxEl    = document.getElementById('tok-tax');
  const lockEl   = document.getElementById('tok-lock');
  if (supplyEl) supplyEl.textContent = pretty(CONFIG.SUPPLY);
  if (taxEl)    taxEl.textContent    = CONFIG.TAX_TOTAL + '%';
  if (lockEl)   lockEl.textContent   = 'Locked';

  const contractEl = document.getElementById('contract-address');
  if (contractEl) contractEl.textContent = CONFIG.CONTRACT.slice(0,6)+'…'+CONFIG.CONTRACT.slice(-4);
  const copy = document.getElementById('copy-contract-btn');
  copy && copy.addEventListener('click', async ()=>{
    try{ await navigator.clipboard.writeText(CONFIG.CONTRACT); pushKill('Contract copied!'); }
    catch{ pushKill('Copy failed'); }
  });

  const bscan = document.getElementById('basescan-link'); if (bscan) bscan.href = CONFIG.BASESCAN_ADDR;
  const buy   = document.getElementById('buy-link');      if (buy)   buy.href   = CONFIG.BUY_URL;
  const chart = document.getElementById('chart-link');    if (chart) chart.href = CONFIG.CHART_URL;
  const audit = document.getElementById('audit-link');    if (audit) audit.href = CONFIG.AUDIT_URL;
  const lp    = document.getElementById('lp-proof-link'); if (lp)    lp.href    = CONFIG.LP_PROOF_URL;

  const addw = document.getElementById('add-wallet-btn');
  addw && addw.addEventListener('click', ()=> addTokenToWallet(CONFIG.CONTRACT, 'ONETAP', 18));

  const distWrap = document.getElementById('tok-dist');
  const legend   = document.getElementById('tok-legend');
  if (!distWrap || !legend) return;
  distWrap.innerHTML = ''; legend.innerHTML = '';

  CONFIG.DISTRIBUTION.forEach(seg=>{
    const row = document.createElement('div');
    row.className = 'dist-row';
    row.innerHTML = `
      <div class="label">${seg.label}</div>
      <div class="bar-wrap"><div class="bar" style="background:${seg.color}"></div></div>
      <div class="val">${seg.value}%</div>`;
    distWrap.appendChild(row);

    const li = document.createElement('li');
    li.innerHTML = `<span class="legend-dot" style="background:${seg.color}"></span>${seg.label}`;
    legend.appendChild(li);

    requestAnimationFrame(()=>{ row.querySelector('.bar').style.width = seg.value + '%'; });
  });

  drawDonut('tok-donut', CONFIG.DISTRIBUTION);
}

/** Donut (Canvas) **/
function drawDonut(id, data){
  const c = document.getElementById(id); if(!c) return;
  const ctx = c.getContext('2d'); const W=c.width, H=c.height; const cx=W/2, cy=H/2; const r=Math.min(W,H)/2-6; const inner=r*0.62;
  ctx.clearRect(0,0,W,H);
  const total = data.reduce((a,b)=>a+b.value,0);
  let start = -Math.PI/2;
  data.forEach(seg=>{
    const ang = seg.value/total * Math.PI*2;
    ctx.beginPath(); ctx.arc(cx,cy,r,start,start+ang); ctx.arc(cx,cy,inner,start+ang,start,true); ctx.closePath();
    ctx.fillStyle = seg.color; ctx.fill(); start += ang;
  });
  ctx.fillStyle = '#fff'; ctx.font='700 18px Montserrat, Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('Allocation', cx, cy-8); ctx.fillStyle='#ffe066'; ctx.font='700 16px Montserrat, Arial'; ctx.fillText('100%', cx, cy+14);
}

/** ====================== Confetti (Canvas phys.) ====================== **/
function launchConfetti(){
  const host = document.querySelector('.confetti'); if (!host) return;
  host.innerHTML='';
  const cvs = document.createElement('canvas'); host.appendChild(cvs);
  const ctx = cvs.getContext('2d');
  let W = cvs.width = host.clientWidth; let H = cvs.height = host.clientHeight;
  const N = 120;
  const parts = Array.from({length:N},()=>({
    x: Math.random()*W, y: -20 - Math.random()*H*0.5,
    w: 6+Math.random()*8, h: 8+Math.random()*12,
    vx: -1 + Math.random()*2, vy: 2+Math.random()*3,
    rot: Math.random()*Math.PI, vr: -0.2 + Math.random()*0.4,
    col: ['#ffd54d','#ffe066','#fff','#60a5fa','#34d399','#f472b6'][Math.floor(Math.random()*6)],
    life: 0, max: 120 + Math.random()*80
  }));
  let running = true;
  (function step(){
    ctx.clearRect(0,0,W,H);
    for(const p of parts){
      p.life++;
      p.vy += 0.02; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.col; ctx.globalAlpha = Math.max(0, 1 - p.life/p.max);
      ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
    }
    if (parts.every(p=>p.life>=p.max || p.y>H+30)) running=false;
    if (running) requestAnimationFrame(step); else host.innerHTML='';
  })();
  addEventListener('resize',()=>{W=cvs.width=host.clientWidth;H=cvs.height=host.clientHeight;});
}

/** ====================== Killfeed ====================== **/
function pushKill(text){
  const feed = document.getElementById('killfeed');
  if (!feed) return;
  const msg = document.createElement('div');
  msg.className = 'kill-msg'; msg.textContent = text;
  feed.appendChild(msg); setTimeout(()=>msg.remove(), 3600);
}

/** ====================== Web3 Helpers (Base) ====================== **/
const BASE = {
  chainId: '0x2105', chainName: 'Base',
  nativeCurrency: { name:'Ether', symbol:'ETH', decimals:18 },
  rpcUrls: ['https://mainnet.base.org'], blockExplorerUrls: ['https://basescan.org']
};
async function web3EnsureBase(){
  if (!window.ethereum) return false;
  try{
    const c = await window.ethereum.request({ method:'eth_chainId' });
    if (c !== BASE.chainId){
      try{
        await window.ethereum.request({ method:'wallet_switchEthereumChain', params:[{ chainId: BASE.chainId }] });
      }catch(e){
        if (e.code === 4902){
          await window.ethereum.request({ method:'wallet_addEthereumChain', params:[BASE] });
        } else { throw e; }
      }
    }
    return true;
  }catch{ return false; }
}
async function addTokenToWallet(address, symbol='ONETAP', decimals=18){
  if (!window.ethereum) return false;
  try{
    await window.ethereum.request({
      method:'wallet_watchAsset',
      params:{ type:'ERC20', options:{ address, symbol, decimals, image: location.origin + '/assets/onetap_logo.png' } }
    });
    pushKill('Token added to wallet!');
    return true;
  }catch{ pushKill('Add token refused'); return false; }
}

/** ====================== SW register ====================== **/
if ('serviceWorker' in navigator){
  addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  });
}

