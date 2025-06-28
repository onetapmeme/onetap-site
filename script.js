// ACCUEIL IMMERSIF + SON
const welcomeScreen = document.getElementById('welcome-screen');
const fadeOverlay = document.getElementById('fade-overlay');
const mainInventory = document.getElementById('main-inventory');
const introSound = document.getElementById('intro-sound');

// Par défaut, afficher seulement accueil, cacher sections
document.querySelectorAll('.section').forEach(s => s.style.display = 'none');

function openInventory() {
  // Son
  introSound.currentTime = 0;
  introSound.play();

  // Fade
  fadeOverlay.style.opacity = '1';
  setTimeout(() => {
    welcomeScreen.style.display = 'none';
    fadeOverlay.style.opacity = '0';
    mainInventory.style.display = 'flex';
    // Scroll top, affiche inventaire, cache tout le reste sauf sections
    window.scrollTo({top:0, behavior:'smooth'});
  }, 850);

  // Affiche la première section (About/Lore)
  showSection('about');
}

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  if (sectionId && document.getElementById(sectionId)) {
    document.getElementById(sectionId).classList.add('active');
    setTimeout(()=>window.scrollTo({top:document.getElementById(sectionId).offsetTop-60,behavior:'smooth'}), 150);
  }
}

welcomeScreen.addEventListener('click', openInventory);
window.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter' || e.key === ' ') openInventory();
});

// INVENTAIRE INTERACTIF
document.querySelectorAll('.inventory-slot').forEach(slot => {
  slot.addEventListener