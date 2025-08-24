// Minimal smoke tests (no deps)
const fs = require('fs');

function mustContain(path, needles){
  const s = fs.readFileSync(path,'utf8');
  for(const n of needles){
    if(!s.includes(n)){
      console.error(`❌ Missing "${n}" in ${path}`);
      process.exit(1);
    }
  }
  console.log(`✅ ${path} ok`);
}

mustContain('index.html', [
  '<canvas id="background-canvas"',
  'id="welcome-screen"',
  'id="roulette-screen"',
  'id="gold-drop-screen"',
  'id="onetap-drop-screen"',
  'id="main-inventory"',
  'id="open-tokenomics"',
  'id="tokenomics-overlay"',
  'id="mixer-panel"',
  '<script src="script.js"></script>'
]);

mustContain('style.css', [
  ':root',
  '#roulette-container',
  '.tokenomics-modal',
  '#mixer-panel',
  '.confetti canvas'
]);

mustContain('script.js', [
  'const CONFIG = {',
  'function startRoulette(',
  'function launchConfetti(',
  'function populateTokenomicsUI(',
  "navigator.serviceWorker.register('./sw.js')"
]);

console.log('✅ smoke tests passed');
