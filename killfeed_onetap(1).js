
// Killfeed entries
const kills = [
  "$ONETAP 🔫 Deagle 🔫 HEADSHOT 💀 the Market",
  "SatoshiOneTap 🔫 Deagle 🔫 HEADSHOT 💀 FOMO Bot",
  "rektmaster 🔫 Deagle 🔫 HEADSHOT 💀 GasFeeKing",
  "pixelwarrior 🔫 Deagle 🔫 HEADSHOT 💀 RugPullZ",
  "clutchdude 🔫 Deagle 🔫 HEADSHOT 💀 PanicSeller"
];

// Sound effect (optional, can be linked if hosted)
const shotSound = new Audio('https://freesound.org/data/previews/156/156031_2732620-lq.mp3');

// Function to show kill feed
function showKillFeed() {
  const feed = document.querySelector('.killfeed');
  if (!feed) return;

  const kill = document.createElement('p');
  kill.textContent = kills[Math.floor(Math.random() * kills.length)];
  kill.classList.add('shot');

  feed.appendChild(kill);
  if (shotSound) shotSound.play();

  setTimeout(() => {
    kill.remove();
  }, 4000);
}

// Loop every 5 seconds
setInterval(showKillFeed, 5000);
