const welcomeScreen = document.getElementById('welcome-screen');
const tap2enterImg = document.getElementById('tap2enter-img');
const headshotGif = document.getElementById('headshot-gif');
const headshotSound = document.getElementById('headshot-sound');
const mainInventory = document.getElementById('main-inventory');

function playHeadshot() {
  tap2enterImg.style.display = 'none';
  headshotGif.style.display = 'block';
  if (headshotSound) {
    headshotSound.currentTime = 0;
    headshotSound.play();
  }
  setTimeout(() => {
    welcomeScreen.style.display = 'none';
    if(mainInventory) mainInventory.style.display = 'flex';
    window.scrollTo({top:0, behavior:'smooth'});
  }, 1300);
}

welcomeScreen.addEventListener('click', playHeadshot);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') playHeadshot();
});
