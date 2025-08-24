/* ========= $ONETAP v4.3 – script.js ========= */

/* ====== CONFIG central ====== */
const CONFIG = {
  CONTRACT:      '0x1234567890abcdef1234567890abcdef12345678', // REPLACE
  SUPPLY:        100_000_000,
  TAX_TOTAL:     3, // %
  TAX_BREAKDOWN: { dev:1, marketing:1, lp:1 },
  LP_LOCK_TEXT:  '3 months',

  // Liens (fonctionnels par défaut, remplacent automatiquement le contrat)
  BUY_URL:      null, // auto construit si null
  CHART_URL:    'https://dexscreener.com/base/0x0000000000000000000000000000000000000000', // REPLACE pool si connu
  AUDIT_URL:    'legal/audit-placeholder.pdf',
  LP_PROOF_URL: 'https://basescan.org/tx/0xLOCKTX',
  BASESCAN_ADDR:null, // auto si null

  // Allocation Donut/Bar (total 100)
  DISTRIBUTION: [
    { label:'Liquidity',    value:60, color:'#ffd54d' },
    { label:'Marketing',    value:18, color:'#60a5fa' },
    { label:'CEX & Growth', value:12, color:'#34d399' },
    { label:'Community',    value:10, color:'#f472b6' }
  ],

  // Dexscreener embed (auto construit si CHART_URL contient une pool)
  DEX_EMBED: null
};
(function ensureLinks(){
  const ca = CONFIG.CONTRACT;
  if (!CONFIG.BUY_URL)
    CONFIG.BUY_URL = `https://app.uniswap.org/swap?outputCurrency=${ca}&chain=base`;
  if (!CONFIG.BASESCAN_ADDR)
    CONFIG.BASESCAN_ADDR = `https://basescan.org/token/${ca}`;
  // Essaye d’extraire l’identifiant Dex pool pour embed
  const m = CONFIG.CHART_URL.match(/dexscreener\.com\/base\/([a-zA-Z0-9x]+)/i);
  if (m) CONFIG.DEX_EMBED = `https://dexscreener.com/base/${m[1]}?embed=1&theme=dark`;
})();

/* ====== Audio refs ====== */
const musicWelcome = document.getElementById('music-welcome');
const musicMain    = document.getElementById('music-main');
const musicEpic    = document.getElementById('music-epic');
const headshot     = document.getElementById('headshot-sound');
const rouletteSfx  = document.getElementById('roulette-sound');
const dropRareSfx  = document.getElementById('drop-rare-sound');

/* ====== Stages ====== */
const welcome      = document.getElementById('welcome-screen');
const loader       = document.getElementById('loader');
const rouletteScr  = document.getElementById('roulette-screen');
const rouletteBox  = document.getElementById('roulette-container');
const goldDropScr  = document.getElementById('gold-drop-screen');
const onetapScr    = document.getElementById('onetap-drop-screen');
const mainInv      = document.getElementById('main-inventory');

/* ====== Tokenomics modal ====== */
const openTokBtn   = document.getElementById('open-tokenomics');
const tokOverlay   = document.getElementById('tokenomics-overlay');
const closeTokBtn  = document.getElementById('close-tokenomics');

/* ====== Mute / Volume ====== */
const muteBtn   = document.getElementById('mute-btn');
const muteIco   = document.getElementById('mute-ico');
const volSlider = document.getElementById('volume-slider');
let muted = false;

// liste audio
const AUDIO_IDS = ['music-welcome','music-main','music-epic','headshot-sound','roulette-sound','drop-rare-sound'];
const audios = AUDIO_IDS.map(id => document.getElementById(id)).filter(Boolean);

// volume mixer
volSlider?.addEventListener('input', e=>{
  const v = parseFloat(e.target.value);
  audios.forEach(a => a.volume = v);
  localStorage.setItem('onetap_volume', String(v));
});
window.addEventListener('load', ()=>{
  const v = parseFloat(localStorage.getItem('onetap_volume') ?? '1');
  if (!isNaN(v)) {
    volSlider.value = String(v);
    audios.forEach(a => a.volume = v);
  }
});

/* ====== Particules + Welcome ====== */
window.addEventListener('DOMContentLoaded', () => {
  try { musicWelcome.volume = 0.7; musicWelcome.play().catch(()=>{}); } catch{}
  initParticles();
});

let tapHandled = false;
function handleTapStart(){
  if (tapHandled) return; tapHandled = true;
  if (navigator.vibrate) navigator.vibrate(60);
  try { headshot.currentTime = 0; headshot.play(); } catch{}
  setTimeout(() => {
    try { musicWelcome.pause(); } catch{}
    welcome.style.opacity = 0;
    setTimeout(() => {
      welcome.style.display = 'none';
      loader.style.display = 'flex';
      setTimeout(() => { loader.style.display = 'none'; startRoulette(); }, 1200);
    }, 750);
  }, 850);
}
welcome.addEventListener('click', handleTapStart, {passive:true});
welcome.addEventListener('touchstart', handleTapStart, {passive:true});

/* ====== Roulette ====== */
const NB_CASES_VISIBLE = 9;
const NB_CASES_TOTAL   = 38;
const SPIN_DURATION    = 7000;

function startRoulette(){
  try { musicMain.volume = 0.58; musicMain.play().catch(()=>{}); } catch{}
  rouletteScr.style.display = 'flex';
  rouletteBox.innerHTML = '';

  const pool = [];
  for (let i=0;i<NB_CASES_TOTAL-1;i++) pool.push('assets/case_blank.png');
  pool.push('assets/onetap_gold.png');

  const totalScroll = pool.length * 8;
  const finalPos = (pool.length - 1) - Math.floor(NB_CASES_VISIBLE/2);

  try { rouletteSfx.currentTime = 0; rouletteSfx.volume = 0.4; rouletteSfx.play(); } catch{}
  const t0 = Date.now();

  function render(pos, blur=false){
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
  function animate(){
    const elapsed = Date.now() - t0;
    const p = Math.min(elapsed / SPIN_DURATION, 1);
    const ease = 1 - Math.pow(1 - p, 2.2);
    const pos = Math.floor(totalScroll * ease);
    const cur = (pos + finalPos) % pool.length;
    render(cur, p < 0.8);
    if (p < 1) requestAnimationFrame(animate);
    else {
      try { rouletteSfx.pause(); } catch{}
      try { dropRareSfx.currentTime = 0; dropRareSfx.play(); } catch{}
      setTimeout(showGoldDrop, 1200);
    }
  }
  animate();
}

/* ====== Gold Drop ====== */
function showGoldDrop(){
  rouletteScr.style.display = 'none';
  goldDropScr.style.display = 'flex';
  launchConfetti();

  setTimeout(() => {
    if (navigator.vibrate) navigator.vibrate(60);
    goldDropScr.addEventListener('click', showOnetapDrop, { once:true });
    goldDropScr.addEventListener('touchstart', showOnetapDrop, { once:true, passive:true });
    const hint = document.createElement('span');
    hint.textContent = 'Tap to continue';
    hint.style.cssText = 'color:#fff;font-size:1rem;opacity:.7;margin-top:2vw;animation:pulseText 1s infinite alternate;';
    goldDropScr.appendChild(hint);
  }, 900);
}

/* ====== ONETAP final ====== */
function showOnetapDrop(){
  goldDropScr.style.opacity = 0;
  setTimeout(() => {
    goldDropScr.style.display = 'none';
    onetapScr.style.display = 'flex';
    try { musicMain.pause(); } catch{}
    try { musicEpic.pause(); musicEpic.currentTime = 0; musicEpic.loop = true; musicEpic.volume = 0.7; musicEpic.play().catch(()=>{}); } catch{}
    if (navigator.vibrate) navigator.vibrate(70);
    setTimeout(() => {
      const share = document.getElementById('share-btn');
      share.style.display = 'inline-block';
      onetapScr.addEventListener('click', showMainInventory, { once:true });
      onetapScr.addEventListener('touchstart', showMainInventory, { once:true, passive:true });
    }, 2000);
  }, 650);
}

/* ====== Inventory ====== */
function showMainInventory(){
  onetapScr.style.display = 'none';
  mainInv.style.display = 'flex';
  if (navigator.vibrate) navigator.vibrate(50);
  openTokBtn.style.display = 'inline-flex';
  pushKill('Welcome to your $ONETAP inventory!');
}

/* ====== Tokenomics modal ====== */
openTokBtn?.addEventListener('click', () => {
  tokOverlay.classList.add('open');
  populateTokenomicsUI();
  // Lazy Dexscreener
  if (CONFIG.DEX_EMBED) {
    const wrap = document.getElementById('dexscreener-wrap');
    const ifr  = document.getElementById('dexscreener-embed');
    ifr.src = CONFIG.DEX_EMBED;
    wrap.style.display = 'block';
  }
});
closeTokBtn?.addEventListener('click', () => tokOverlay.classList.remove('open'));
tokOverlay?.addEventListener('click', (e) => { if (e.target === tokOverlay) tokOverlay.classList.remove('open'); });

/* ====== Copy Contract ====== */
document.getElementById('copy-contract-btn')?.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(CONFIG.CONTRACT); pushKill('Contract copied!'); }
  catch { pushKill('Copy failed'); }
});

/* ====== Killfeed ====== */
function pushKill(text){
  const feed = document.getElementById('killfeed');
  const msg = document.createElement('div');
  msg.className = 'kill-msg'; msg.textContent = text;
  feed.appendChild(msg);
  setTimeout(() => { msg.remove(); }, 3600);
}

/* ====== Mute ====== */
muteBtn?.addEventListener('click', () => {
  muted = !muted;
  audios.forEach(a => a.muted = muted);
  muteIco.textContent = muted ? '🔈' : '🔊';
  muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
  muteBtn.style.opacity = muted ? .35 : .7;
});

/* ====== Particles ====== */
function initParticles(){
  const canvas = document.getElementById('background-canvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  const COUNT = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ? 18 : 38;
  const P = [];
  for(let i=0;i<COUNT;i++){
    const r = 1 + Math.random()*2;
    P.push({ x:Math.random()*W, y:Math.random()*H, r, col: Math.random() < .6 ? '#ffe066aa' : '#ffffff99', dx:-0.3+Math.random()*0.6, dy:0.2+Math.random()*0.5 });
  }
  function step(){
    ctx.clearRect(0,0,W,H);
    for(const p of P){
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = p.col; ctx.globalAlpha = 0.65; ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.y > H) p.y = 0; if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(step);
  }
  step();
  window.addEventListener('resize', () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; });
}

/* ====== Confetti ====== */
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

/* ====== Tokenomics populate/draw ====== */
function populateTokenomicsUI(){
  const pretty = n => n.toLocaleString('en-US');
  const supplyEl = document.getElementById('tok-supply');
  const taxEl    = document.getElementById('tok-tax');
  const lockEl   = document.getElementById('tok-lock');
  const lockFoot = document.getElementById('tok-lock-foot');

  supplyEl && (supplyEl.textContent = pretty(CONFIG.SUPPLY));
  taxEl    && (taxEl.textContent    = CONFIG.TAX_TOTAL + '%');
  lockEl   && (lockEl.textContent   = 'Locked');
  lockFoot && (lockFoot.textContent = CONFIG.LP_LOCK_TEXT);

  // Contract visible + liens
  const caShort = CONFIG.CONTRACT.slice(0,6)+'…'+CONFIG.CONTRACT.slice(-4);
  const caEl = document.getElementById('contract-address');
  if (caEl) caEl.textContent = caShort;

  const bscan = document.getElementById('basescan-link'); if (bscan)  bscan.href  = CONFIG.BASESCAN_ADDR;
  const buy   = document.getElementById('buy-link');      if (buy)    buy.href    = CONFIG.BUY_URL;
  const chart = document.getElementById('chart-link');    if (chart)  chart.href  = CONFIG.CHART_URL;
  const audit = document.getElementById('audit-link');    if (audit)  audit.href  = CONFIG.AUDIT_URL;
  const lp    = document.getElementById('lp-proof-link'); if (lp)     lp.href     = CONFIG.LP_PROOF_URL;

  document.getElementById('add-wallet-btn')?.addEventListener('click', ()=> addTokenToWallet(CONFIG.CONTRACT,'ONETAP',18));

  // Distribution rows + legend + donut
  const distWrap = document.getElementById('tok-dist');
  const legend   = document.getElementById('tok-legend');
  if (distWrap && legend){
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
      requestAnimationFrame(()=> row.querySelector('.bar').style.width = seg.value + '%');
    });
    drawDonut('tok-donut', CONFIG.DISTRIBUTION);
  }
}

function drawDonut(canvasId, data){
  const c = document.getElementById(canvasId); if(!c) return;
  const ctx = c.getContext('2d'); const W=c.width, H=c.height; const cx=W/2, cy=H/2;
  const r = Math.min(W,H)/2 - 6, inner = r*0.62;
  ctx.clearRect(0,0,W,H);
  const total = data.reduce((a,b)=>a+b.value,0);
  let start = -Math.PI/2;
  data.forEach(seg=>{
    const ang = (seg.value/total)*Math.PI*2;
    ctx.beginPath(); ctx.arc(cx,cy,r,start,start+ang); ctx.arc(cx,cy,inner,start+ang,start,true); ctx.closePath();
    ctx.fillStyle = seg.color; ctx.fill(); start += ang;
  });
  ctx.fillStyle = '#fff'; ctx.font = '700 18px Montserrat, Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('Allocation', cx, cy-8);
  ctx.fillStyle = '#ffe066'; ctx.font = '700 16px Montserrat, Arial'; ctx.fillText('100%', cx, cy+14);
}

/* ====== Minimal EIP-1193 (Base) ====== */
const BASE = {
  chainId:'0x2105', chainName:'Base',
  nativeCurrency:{ name:'Ether', symbol:'ETH', decimals:18 },
  rpcUrls:['https://mainnet.base.org'], blockExplorerUrls:['https://basescan.org']
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
