/* ========= $ONETAP v3.3 – script.js ========= */

// --------- Helpers ---------
function $(id){ return document.getElementById(id); }

// --------- Audio refs ---------
const musicWelcome = $('music-welcome');
const musicMain    = $('music-main');
const musicEpic    = $('music-epic');
const headshot     = $('headshot-sound');
const rouletteSfx  = $('roulette-sound');
const dropRareSfx  = $('drop-rare-sound');

// --------- Stage refs ---------
const welcome      = $('welcome-screen');
const loader       = $('loader');
const rouletteScr  = $('roulette-screen');
const rouletteBox  = $('roulette-container');
const goldDropScr  = $('gold-drop-screen');
const onetapScr    = $('onetap-drop-screen');
const mainInv      = $('main-inventory');

// --------- Tokenomics modal ---------
const openTokBtn   = $('open-tokenomics');   // affiché après inventaire
const tokOverlay   = $('tokenomics-overlay');
const closeTokBtn  = $('close-tokenomics');

// --------- Mute & Volume ---------
const muteBtn      = $('mute-btn');
const muteIco      = $('mute-ico');
const volSlider    = $('volume-slider');

let muted = false;
const audioIds = [
  'music-welcome','music-main','music-epic',
  'headshot-sound','roulette-sound','drop-rare-sound'
];
const audios = audioIds.map(id => $(id));
const allAudios = [musicWelcome, musicMain, musicEpic, headshot, rouletteSfx, dropRareSfx];

// --------- Roulette constants ---------
const NB_CASES_VISIBLE = 9;
const NB_CASES_TOTAL   = 38;
const SPIN_DURATION    = 7000;

// --------- Particles boot ---------
window.addEventListener('DOMContentLoaded', () => {
  // tentative auto-play (mobile req. user gesture)
  try { if (musicWelcome){ musicWelcome.volume = 0.7; musicWelcome.play().catch(()=>{}); } } catch {}
  initParticles();
});

// --------- Tap to start ---------
let tapHandled = false;
function handleTapStart(){
  if (tapHandled) return;
  tapHandled = true;

  if (navigator.vibrate) navigator.vibrate(60);
  try { headshot.currentTime = 0; headshot.play(); } catch {}

  setTimeout(() => {
    try { musicWelcome?.pause(); } catch {}
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
welcome?.addEventListener('click', handleTapStart, {passive:true});
welcome?.addEventListener('touchstart', handleTapStart, {passive:true});

// --------- Roulette ---------
function startRoulette(){
  try { if (musicMain){ musicMain.volume = 0.58; musicMain.play().catch(()=>{}); } } catch {}
  rouletteScr.style.display = 'flex';
  rouletteBox.innerHTML = '';

  const pool = [];
  for (let i=0;i<NB_CASES_TOTAL-1;i++) pool.push('assets/case_blank.png');
  pool.push('assets/onetap_gold.png');

  const totalScroll = pool.length * 8;
  const finalPos = (pool.length - 1) - Math.floor(NB_CASES_VISIBLE/2);

  try { rouletteSfx.currentTime = 0; rouletteSfx.volume = 0.4; rouletteSfx.play(); } catch {}

  const t0 = Date.now();

  function render(pos, blur=false){
    rouletteBox.innerHTML = '';
    if (blur) rouletteBox.classList.add('blurred'); else rouletteBox.classList.remove('blurred');

    for (let i=0;i<NB_CASES_VISIBLE;i++){
      const idx = (pos + i) % pool.length;
      const isGold = (idx === pool.length - 1 && i === Math.floor(NB_CASES_VISIBLE/2));
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
    const elapsed  = Date.now() - t0;
    const progress = Math.min(elapsed / SPIN_DURATION, 1);
    const ease     = 1 - Math.pow(1 - progress, 2.2); // easing out
    const pos      = Math.floor(totalScroll * ease);
    const cur      = (pos + finalPos) % pool.length;

    render(cur, progress < 0.8);

    if (progress < 1) requestAnimationFrame(animate);
    else {
      try { rouletteSfx.pause(); } catch {}
      try { dropRareSfx.currentTime = 0; dropRareSfx.play(); } catch {}
      setTimeout(showGoldDrop, 1200);
    }
  }
  animate();
}

// --------- Gold Drop ---------
function showGoldDrop(){
  rouletteScr.style.display = 'none';
  goldDropScr.style.display = 'flex';
  launchConfetti();

  setTimeout(() => {
    if (navigator.vibrate) navigator.vibrate(60);

    goldDropScr.addEventListener('click',       showOnetapDrop, { once:true });
    goldDropScr.addEventListener('touchstart',  showOnetapDrop, { once:true, passive:true });

    const hint = document.createElement('span');
    hint.textContent = 'Tap to continue';
    hint.style.cssText = 'color:#fff;font-size:1rem;opacity:.7;margin-top:2vw;animation:pulseText 1s infinite alternate;';
    goldDropScr.appendChild(hint);
  }, 900);
}

// --------- Final $ONETAP + epic music ---------
function showOnetapDrop(){
  goldDropScr.style.opacity = 0;

  setTimeout(() => {
    goldDropScr.style.display = 'none';
    onetapScr.style.display = 'flex';

    try { musicMain?.pause(); } catch {}
    try {
      musicEpic?.pause();
      if (musicEpic){
        musicEpic.currentTime = 0;
        musicEpic.loop = true;
        musicEpic.volume = 0.7;
        musicEpic.play().catch(()=>{});
      }
    } catch {}

    if (navigator.vibrate) navigator.vibrate(70);

    setTimeout(() => {
      const share = $('share-btn');
      if (share){
        share.style.display = 'inline-block';
      }
      onetapScr.addEventListener('click',      showMainInventory, { once:true });
      onetapScr.addEventListener('touchstart', showMainInventory, { once:true, passive:true });
    }, 2000);
  }, 650);
}

// --------- Inventory ---------
function showMainInventory(){
  onetapScr.style.display = 'none';
  mainInv.style.display   = 'flex';
  if (navigator.vibrate) navigator.vibrate(50);

  if (openTokBtn){ openTokBtn.style.display = 'inline-flex'; }
  pushKill('Welcome to your $ONETAP inventory!');
}

// --------- Tokenomics modal (A11y + ESC) ---------
openTokBtn?.addEventListener('click', () => {
  tokOverlay?.classList.add('open');
  openTokBtn.setAttribute('aria-expanded','true');
  // Focus trap (optionnel) :
  // tokOverlay?.querySelector('.tokenomics-modal button, .tokenomics-modal a, .tokenomics-modal [tabindex]')
  //   ?.focus();
});

function closeTok(){
  tokOverlay?.classList.remove('open');
  openTokBtn?.setAttribute('aria-expanded','false');
  openTokBtn?.focus?.();
}

closeTokBtn?.addEventListener('click', closeTok);

tokOverlay?.addEventListener('click', (e) => {
  if (e.target === tokOverlay) closeTok();
});

document.addEventListener('keydown', (e) => {
  if (tokOverlay?.classList.contains('open') && e.key === 'Escape') closeTok();
});

// --------- Copy contract ---------
$('copy-contract-btn')?.addEventListener('click', async () => {
  const addr = $('contract-address')?.textContent.trim();
  if (!addr) return pushKill('No contract found');
  try { await navigator.clipboard.writeText(addr); pushKill('Contract copied!'); }
  catch { pushKill('Copy failed'); }
});

// --------- Killfeed ---------
function pushKill(text){
  const feed = $('killfeed'); if (!feed) return;
  const msg = document.createElement('div');
  msg.className = 'kill-msg';
  msg.textContent = text;
  feed.appendChild(msg);
  setTimeout(() => { msg.remove(); }, 3600);
}

// --------- Mute / Volume (persist) ---------
(function initAudioPrefs(){
  // volume
  const savedVolume = localStorage.getItem('onetap_volume');
  if (savedVolume !== null && volSlider){
    volSlider.value = savedVolume;
    audios.forEach(a => { if (a) a.volume = parseFloat(savedVolume); });
  }
  // muted
  const savedMuted = localStorage.getItem('onetap_muted') === 'true';
  if (savedMuted){
    muted = true;
    allAudios.forEach(a => { try{ a.muted = true; }catch{} });
    if (muteIco) muteIco.textContent = '🔈';
    muteBtn?.setAttribute('aria-pressed','true');
    if (muteBtn) muteBtn.style.opacity = .35;
  }
})();

if (volSlider){
  volSlider.addEventListener('input', e => {
    const volume = parseFloat(e.target.value);
    audios.forEach(a => { if (a) a.volume = volume; });
    localStorage.setItem('onetap_volume', volume);

    // auto sync mute UI if volume=0
    const shouldMute = (volume === 0);
    if (shouldMute !== muted){
      muted = shouldMute;
      allAudios.forEach(a => { try{ a.muted = muted; }catch{} });
      if (muteIco) muteIco.textContent = muted ? '🔈' : '🔊';
      muteBtn?.setAttribute('aria-pressed', muted ? 'true' : 'false');
      if (muteBtn) muteBtn.style.opacity = muted ? .35 : .7;
      localStorage.setItem('onetap_muted', String(muted));
    }
  });
}

muteBtn?.addEventListener('click', () => {
  muted = !muted;
  allAudios.forEach(a => { try{ a.muted = muted; }catch{} });
  if (muteIco) muteIco.textContent = muted ? '🔈' : '🔊';
  muteBtn?.setAttribute('aria-pressed', muted ? 'true' : 'false');
  if (muteBtn) muteBtn.style.opacity = muted ? .35 : .7;
  localStorage.setItem('onetap_muted', String(muted));
});

// --------- iOS visibility: reprise audio si non muté ---------
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !muted){
    if (onetapScr?.style.display === 'flex') { musicEpic?.play().catch(()=>{}); }
    else if (rouletteScr?.style.display === 'flex') { musicMain?.play().catch(()=>{}); }
  }
}, {passive:true});

// --------- Particles ---------
function initParticles(){
  const canvas = $('background-canvas'); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  const P = [];
  const lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const COUNT = lowPower ? 22 : 38;

  for (let i=0;i<COUNT;i++){
    const r = 1 + Math.random()*2;
    P.push({
      x: Math.random()*W, y: Math.random()*H, r,
      col: Math.random() < .6 ? '#ffe066aa' : '#ffffff99',
      dx: -0.3 + Math.random()*0.6, dy: 0.2 + Math.random()*0.5
    });
  }

  function step(){
    ctx.clearRect(0,0,W,H);
    for (const p of P){
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

// --------- Confetti ---------
function launchConfetti(){
  const container = document.querySelector('.confetti');
  if (!container) return;
  container.innerHTML = '';
  for (let i=0;i<26;i++){
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      position:absolute;width:11px;height:15px;left:${Math.random()*98}%;
      top:${Math.random()*44+20}%;
      background:${['gold','#ffe066','#fff','#f6c62b','#ead044'][Math.floor(Math.random()*5)]};
      opacity:${0.75 + Math.random()*0.23};
      transform:rotate(${Math.random()*360}deg) scale(${0.7+Math.random()*0.4});
      border-radius:2px;z-index:7;
    `;
    container.appendChild(el);
  }
  setTimeout(() => { container.innerHTML = ''; }, 2000);
}

// --------- Minimal EIP-1193 helpers (Base) ---------
const BASE = {
  chainId: '0x2105', // 8453
  chainName: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org']
};

async function web3EnsureBase(){
  if (!window.ethereum) return false;
  try{
    const chainId = await window.ethereum.request({ method:'eth_chainId' });
    if (chainId !== BASE.chainId){
      try{
        await window.ethereum.request({
          method:'wallet_switchEthereumChain',
          params:[{ chainId: BASE.chainId }]
        });
      }catch(switchErr){
        if (switchErr.code === 4902){
          await window.ethereum.request({ method:'wallet_addEthereumChain', params:[BASE] });
        }else{
          throw switchErr;
        }
      }
    }
    return true;
  }catch(e){ return false; }
}

// Ajouter le token au wallet (EIP-747)
async function addTokenToWallet(address, symbol='ONETAP', decimals=18, imagePath='/assets/onetap_logo.png'){
  if (!window.ethereum) return false;
  try{
    await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: { type: 'ERC20', options: {
        address, symbol, decimals, image: location.origin + imagePath
      }}
    });
    pushKill('Token added to wallet!');
    return true;
  }catch(e){
    pushKill('Add token refused');
    return false;
  }
}

// (expose handler si tu ajoutes un bouton dans la modale)
$('btn-add-wallet')?.addEventListener('click', async () => {
  const addr = $('contract-address')?.textContent.trim() || '';
  if (!addr) return pushKill('No contract found');
  await addTokenToWallet(addr, 'ONETAP', 18);
});

// (optionnel) s’assurer d’être sur Base avant Buy (si tu as un lien #buy-link)
$('buy-link')?.addEventListener('click', async () => {
  await web3EnsureBase();
});

/* ========= Fin ========= */
