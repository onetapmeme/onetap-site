@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;700&display=swap');

body {
  margin: 0;
  background: #101828;
  color: #fff;
  font-family: 'Inter', Arial, sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
}
#welcome-screen {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: radial-gradient(ellipse at center, #1e2639 0%, #101828 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fadeIn 1.3s;
}
@keyframes fadeIn {
  from { opacity: 0; } to { opacity: 1; }
}
.welcome-logo {
  width: 110px;
  margin-bottom: 2.3rem;
  image-rendering: pixelated;
  filter: drop-shadow(0 0 14px #23B0F9) drop-shadow(0 0 20px #fff3);
}
.welcome-title {
  font-family: 'Press Start 2P', Arial, sans-serif;
  color: #23B0F9;
  font-size: 2.5rem;
  text-shadow: 0 0 22px #23B0F9, 0 0 44px #FF842A44;
  margin-bottom: 2.2rem;
  letter-spacing: 3px;
  animation: glitch-fade 2s infinite alternate;
}
@keyframes glitch-fade {
  0% { opacity: 1; }
  100% { opacity: 0.87; }
}
.welcome-press {
  color: #F8EDC2;
  font-size: 1.2rem;
  font-family: 'Inter', Arial, sans-serif;
  background: #181d27d5;
  padding: 1.2rem 2.3rem;
  border-radius: 18px;
  box-shadow: 0 2px 18px #23B0F966;
  letter-spacing: 1.1px;
}
#fade-overlay {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #101828;
  opacity: 0;
  transition: opacity 1.1s;
}

.hero-inventory {
  min-height: 92vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  text-align: center;
  padding-top: 5.2rem;
  background: none;
  overflow: hidden;
}
#inventory-bg {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  z-index: 0;
  background: linear-gradient(135deg, #132035 0%, #16253B 100%);
  opacity: 0.9;
  pointer-events: none;
  animation: bg-move 14s linear infinite alternate;
}
@keyframes bg-move {
  0% { background-position: 0 0; }
  100% { background-position: 50px 150px; }
}
.hero-title {
  font-family: 'Press Start 2P', Arial, sans-serif;
  font-size: 2.2rem;
  color: #23B0F9;
  margin-bottom: 2rem;
  letter-spacing: 2px;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 2.1rem;
  margin: 1.2rem auto 0 auto;
  padding: 1.9rem 1rem 2.2rem 1rem;
  max-width: 950px;
  z-index: 2;
  background: rgba(25, 35, 53, 0.10);
  border-radius: 22px;
  box-shadow: 0 4px 28px #0002;
}
.inventory-slot {
  background: #181d27f4;
  border: 2.5px solid #23B0F9cc;
  border-radius: 16px;
  padding: 2.1rem 0.7rem 1.6rem 0.7rem;
  text-align: center;
  box-shadow: none;
  cursor: pointer;
  transition: transform 0.14s, box-shadow 0.18s, border-color 0.17s;
  outline: none;
  min-height: 170px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  position: relative;
}
.inventory-slot:active {
  transform: scale(0.96);
}
.inventory-slot:hover,
.inventory-slot:focus {
  border-color: #FF842A;
  box-shadow: 0 0 0 7px #ff842a26;
  background: #181d27f9;
  z-index: 10;
}
.slot-img {
  width: 64px;
  margin-bottom: 1.1rem;
  image-rendering: pixelated;
  border-radius: 12px;
  background: #13203511;
  box-shadow: 0 2px 10px #23B0F930;
}
.slot-label {
  display: block;
  font-family: 'Press Start 2P', Arial, sans-serif;
  font-size: 1.14rem;
  color: #23B0F9;
  letter-spacing: 1.2px;
  margin-top: 0.2rem;
  text-shadow: none;
  background: none;
  padding: 0;
}

.section {
  background: none;
  margin: 0 auto 4.1rem auto;
  padding: 5rem 0 2.7rem 0;
  max-width: 850px;
  text-align: center;
  display: none;
}
.section.active {
  display: block;
  animation: sectionFade 0.7s;
}
@keyframes sectionFade {
  from { opacity: 0; transform: translateY(32px);}
  to   { opacity: 1; transform: translateY(0);}
}
.section h2 {
  color: #23B0F9;
  font-family: 'Press Start 2P', Arial, sans-serif;
  font-size: 2rem;
  letter-spacing: 1.2px;
  margin-bottom: 1.3rem;
}
.section p { font-size: 1.13rem; color: #fff; margin-bottom: 1.4rem; }

footer {
  text-align: center;
  font-size: 1.07rem;
  color: #F8EDC2;
  margin: 2rem 0 2.2rem;
}
.footer-links a {
  color: #23B0F9;
  text-decoration: none;
  margin: 0 0.7rem;
  font-weight: bold;
  transition: color 0.15s;
}
.footer-links a:hover { color: #FF842A; }

/* Responsive */
@media (max-width: 1100px) {
  .inventory-grid { max-width: 99vw; }
  .section { max-width: 99vw; }
}
@media (max-width: 800px) {
  .inventory-grid { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; padding: 1.2rem; }
  .slot-img { width: 40px; }
  .slot-label { font-size: 0.9rem; }
  .hero-title { font-size: 1.2rem; }
  .welcome-title { font-size: 1.2rem; }
}
@media (max-width: 650px) {
  .hero-inventory { padding-top: 2.2rem; }
  .section { padding: 2.4rem 0 1.2rem 0; }
}