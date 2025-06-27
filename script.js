// INVENTAIRE INTERACTIF : scroll vers section au clic
document.querySelectorAll('.inventory-slot').forEach(slot => {
  slot.addEventListener('click', function() {
    const target = slot.getAttribute('data-target');
    if (target && document.querySelector(target)) {
      document.querySelector(target).scrollIntoView({behavior: 'smooth'});
    }
  });
  slot.setAttribute('tabindex','0');
});
