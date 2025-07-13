const welcomeScreen = document.getElementById('welcome-screen');
const mainWelcomeGif = document.getElementById('main-welcome-gif');
const headshotSound = document.getElementById('headshot-sound');
const mainInventory = document.getElementById('main-inventory');
const fallingLogos = document.getElementById('falling-logos');

// Paramètre : durée de ton gif en ms (ex : 1800 ms)
const GIF_DURATION = 1800; // Mets ici la durée exacte de ton gif

function dropLogo() {
  const logo = document.createElement('img');
  logo.src = "assets/tap2enter_pc.gif"; // tu peux mettre un mini-logo dédié si tu veux
  logo.className = "falling-logo";
  logo.style.left = `${Math.random()*90+2}vw`;
  logo.style.width = `${36+Math.random()*26}px`;
  fallingLogos.appendChild(logo);
  setTimeout(()=>logo.remove(), 2100);
}

function startFallingLogos() {
  let count = 0;
  const interval = setInterval(() => {
    dropLogo();
    count++;
    if(count > 12) clearInterval(interval);
  }, 120);
}

function transitionToSite() {
  // Effet slide-in du contenu
  mainInventory.style.display = 'flex';
  setTimeout(() => {
    mainInventory.style.opacity = 1;
    mainInventory.style.transform = 'translateY(0)';
  }, 50);
  welcomeScreen.style.opacity = 0;
  setTimeout(()=>{ welcomeScreen.style.display='none'; }, 700);
}

function playWelcome() {
  if (headshotSound) {
    headshotSound.currentTime = 0;
    headshotSound.play();
  }
  // Lancer les logos qui tombent
  startFallingLogos();
  // Transition après la durée du gif
  setTimeout(() => {
    transitionToSite();
  }, GIF_DURATION);
}

// Clic ou entrée : lance la séquence
welcomeScreen.addEventListener('click', playWelcome);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') playWelcome();
});
