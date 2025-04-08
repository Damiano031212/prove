const carousel = document.getElementById('carousel');
const selectedValue = document.getElementById('selectedValue');

// Crea gli elementi da 0 a 500 kg
for (let i = 0; i <= 500; i++) {
  const div = document.createElement('div');
  div.classList.add('weight');
  div.textContent = `${i}kg`;
  carousel.appendChild(div);
}

// Funzione per evidenziare il peso centrato
function highlightCenteredWeight() {
  const items = document.querySelectorAll('.weight');
  const containerRect = carousel.getBoundingClientRect();
  let minDistance = Infinity;
  let selectedItem = null;

  items.forEach(item => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.left + rect.width / 2;
    const containerCenter = containerRect.left + containerRect.width / 2;
    const distance = Math.abs(containerCenter - itemCenter);

    item.classList.remove('selected');

    if (distance < minDistance) {
      minDistance = distance;
      selectedItem = item;
    }
  });

  if (selectedItem) {
    selectedItem.classList.add('selected');
    selectedValue.textContent = `Peso selezionato: ${selectedItem.textContent}`;
    localStorage.setItem('pesoSelezionato', selectedItem.textContent);
  }
}

// Evidenzia quando si scrolla
carousel.addEventListener('scroll', () => {
  window.requestAnimationFrame(highlightCenteredWeight);
});

// Scroll iniziale al valore salvato (se esiste)
window.addEventListener('load', () => {
  const saved = localStorage.getItem('pesoSelezionato');
  if (saved) {
    const index = parseInt(saved);
    const itemWidth = carousel.children[0].offsetWidth;
    const scrollLeft = itemWidth * index - (carousel.offsetWidth - itemWidth) / 2;
    carousel.scrollLeft = scrollLeft;
    highlightCenteredWeight();
  } else {
    highlightCenteredWeight();
  }
});
