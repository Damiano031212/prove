const carousel = document.getElementById("carousel");

// Flag per abilitare il carosello dopo il primo tocco/click
let isCarouselActive = false;

// Funzione per iniziare il carosello dopo il primo tocco
function activateCarousel() {
  if (!isCarouselActive) {
    isCarouselActive = true;

    // Aggiungi l'eventListener per lo scroll solo dopo l'attivazione
    carousel.addEventListener("scroll", handleCenterDetection);

    // Prima rilevazione
    setTimeout(handleCenterDetection, 100);

    console.log("Carosello attivato.");
  }
}

// Genera i pesi da 0 a 500
for (let i = 0; i <= 500; i++) {
  const item = document.createElement("div");
  item.classList.add("carousel-item");
  item.textContent = `${i} kg`;
  carousel.appendChild(item);
}

// Rilevazione dell'elemento centrato
let currentCentered = null;
let centerTimer = null;

function getCenteredItem() {
  const items = document.querySelectorAll(".carousel-item");
  const containerRect = carousel.getBoundingClientRect();
  const containerCenter = containerRect.left + containerRect.width / 2;

  let closestItem = null;
  let closestDistance = Infinity;

  items.forEach(item => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.left + rect.width / 2;
    const distance = Math.abs(containerCenter - itemCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestItem = item;
    }
  });

  return closestItem;
}

function handleCenterDetection() {
  if (!isCarouselActive) return; // Non fare nulla se il carosello non è attivo

  const centered = getCenteredItem();

  if (centered !== currentCentered) {
    clearTimeout(centerTimer);
    if (currentCentered) {
      currentCentered.classList.remove("selected");
    }
    currentCentered = centered;

    centerTimer = setTimeout(() => {
      centered.classList.add("selected");
      console.log("Peso selezionato:", centered.textContent);
      // Salva nel localStorage
      localStorage.setItem("pesoSelezionato", centered.textContent);
    }, 500); // Tempo di attesa aggiornato a 1500 ms (1,5 secondi)
  }
}

// Aggiungi l'eventListener per il primo tocco/click sul carosello
carousel.addEventListener("click", activateCarousel);

// Ripristina peso salvato all'avvio della pagina
window.addEventListener("DOMContentLoaded", () => {
  const pesoSalvato = localStorage.getItem("pesoSelezionato");

  if (pesoSalvato) {
    const items = document.querySelectorAll(".carousel-item");
    items.forEach(item => {
      if (item.textContent === pesoSalvato) {
        item.scrollIntoView({ behavior: "smooth", inline: "center" });
      }
    });
  }
});

