function dropLogo() {
  const logo = document.createElement('img');
  logo.src = "assets/onetap_logo.png";
  logo.className = "falling-logo";
  logo.style.left = `${Math.random()*90+2}vw`;
  logo.style.width = `${36+Math.random()*26}px`;
  document.getElementById('falling-logos').appendChild(logo);
  setTimeout(()=>logo.remove(), 2100);
}

function launchTransition() {
  // Pluie de logos pendant la transition
  for (let i=0; i<22; i++) setTimeout(dropLogo, 120*i+Math.random()*80);
  // Transition smooth (fade accueil → fade inventaire)
  setTimeout(() => {
    document.getElementById('welcome-screen').style.opacity = 0;
    setTimeout(() => {
      document.getElementById('welcome-screen').style.display = 'none';
      const inv = document.getElementById('main-inventory');
      inv.style.display = 'flex';
      setTimeout(() => inv.style.opacity = 1, 50);
    }, 700);
  }, 1200);
}

// Détecte mobile ou PC pour lancer le bon GIF
function isMobile() {
  return window.matchMedia("(max-width: 700px)").matches;
}

// Lancer le bon GIF au clic
document.getElementById("main-welcome-gif").addEventListener("click", function() {
  if(isMobile()) {
    this.src = "assets/tap2enter_mobile.gif";
  } else {
    this.src = "assets/tap2enter_pc.gif";
  }
  document.getElementById("headshot-sound").play();
  launchTransition();
});
