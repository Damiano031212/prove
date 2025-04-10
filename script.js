// =============================
// FUNZIONE PER IL CAROSELLO
// =============================
// La funzione createCarousel incapsula la logica del carosello originale,
// garantendo che il salvataggio in localStorage usi una chiave univoca per ciascuna istanza.
function createCarousel(carouselEl, options = {}) {
  const maxWeight = options.maxWeight || 500;
  // Utilizza la storageKey passata oppure quella presente come attributo dati
  const storageKey = options.storageKey || carouselEl.dataset.storageKey || "pesoSelezionato_default";

  let isCarouselActive = false;
  let currentCentered = null;
  let centerTimer = null;

  // Genera gli elementi (da 0 a maxWeight)
  function buildItems() {
    carouselEl.innerHTML = "";
    for (let i = 0; i <= maxWeight; i++) {
      const item = document.createElement("div");
      item.classList.add("carousel-item");
      item.textContent = `${i} kg`;
      carouselEl.appendChild(item);
    }
  }

  // Rileva l'elemento centrato all'interno del carosello corrente
  function getCenteredItem() {
    const items = carouselEl.querySelectorAll(".carousel-item");
    const containerRect = carouselEl.getBoundingClientRect();
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

  // Handler per rilevare l'elemento centrato (con debounce di 500ms)
  function handleCenterDetection() {
    if (!isCarouselActive) return;
    const centered = getCenteredItem();

    if (centered !== currentCentered) {
      clearTimeout(centerTimer);
      if (currentCentered) {
        currentCentered.classList.remove("selected");
        currentCentered.removeEventListener("dblclick", handleDoubleClickInput);
      }
      currentCentered = centered;
      centerTimer = setTimeout(() => {
        centered.classList.add("selected");
        console.log("Peso selezionato:", centered.textContent);
        localStorage.setItem(storageKey, centered.textContent);
        centered.addEventListener("dblclick", handleDoubleClickInput);
      }, 500);
    }
  }

  // Gestione del doppio click per mostrare l'input manuale
  function handleDoubleClickInput() {
    const inputElement = carouselEl.parentElement.querySelector('.manualWeightInput');
    if (!inputElement) {
      console.error("Input manualWeightInput non trovato nel container padre.");
      return;
    }
    inputElement.style.opacity = "1";
    inputElement.style.pointerEvents = "auto";
    inputElement.focus();
    inputElement.value = "";

    function handleInputConfirm() {
      const value = parseInt(inputElement.value, 10);
      if (!isNaN(value) && value >= 0 && value <= maxWeight) {
        const items = carouselEl.querySelectorAll(".carousel-item");
        const target = Array.from(items).find(item => item.textContent === `${value} kg`);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", inline: "center" });
        }
      } else if (inputElement.value !== "") {
        alert("Inserisci un numero valido tra 0 e " + maxWeight + ".");
      }
      inputElement.blur();
      inputElement.style.opacity = "0";
      inputElement.style.pointerEvents = "none";
      inputElement.removeEventListener("blur", handleInputConfirm);
      inputElement.removeEventListener("keydown", handleKeyDown);
    }

    function handleKeyDown(e) {
      if (e.key === "Enter") {
        handleInputConfirm();
      }
    }

    inputElement.addEventListener("blur", handleInputConfirm);
    inputElement.addEventListener("keydown", handleKeyDown);
  }

  // Attiva il carosello al primo click/tocco
  function activateCarousel() {
    if (!isCarouselActive) {
      isCarouselActive = true;
      carouselEl.addEventListener("scroll", handleCenterDetection);
      setTimeout(handleCenterDetection, 100);
      console.log("Carosello attivato.");
    }
  }

  // Inizializza il carosello
  buildItems();
  carouselEl.addEventListener("click", activateCarousel);

  // Ripristina il peso salvato per questa istanza (se presente)
  const savedWeight = localStorage.getItem(storageKey);
  if (savedWeight) {
    const items = carouselEl.querySelectorAll(".carousel-item");
    items.forEach(item => {
      if (item.textContent === savedWeight) {
        item.scrollIntoView({ behavior: "smooth", inline: "center" });
      }
    });
  }
}

// =============================
// FUNZIONE PER IL MENÙ A TENDINA
// =============================
function createDropdown(dropdownEl, options = {}) {
  const maxReps = options.maxReps || 50;
  const storageKey = options.storageKey || dropdownEl.dataset.storageKey || "selectedReps_default";

  dropdownEl.innerHTML = "";
  for (let i = 1; i <= maxReps; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${i} reps`;
    dropdownEl.appendChild(option);
  }

  const savedValue = localStorage.getItem(storageKey);
  if (savedValue !== null) {
    dropdownEl.value = savedValue;
    dropdownEl.classList.remove("gray-text");
    dropdownEl.classList.add("black-text");
  }

  dropdownEl.addEventListener("change", () => {
    localStorage.setItem(storageKey, dropdownEl.value);
    dropdownEl.classList.remove("gray-text");
    dropdownEl.classList.add("black-text");
  });
}

// =============================
// FUNZIONE PER LA CHECKBOX
// =============================
function createCheckbox(checkboxEl, onChange) {
  checkboxEl.addEventListener("change", function() {
    if (this.checked) {
      console.log("Checkbox selezionata");
    } else {
      console.log("Checkbox deselezionata");
    }
    if (typeof onChange === "function") {
      onChange(this.checked);
    }
  });
}

// =============================
// INIZIALIZZAZIONE DELLE ISTANZE E LOGICA DI ABILITAZIONE
// =============================
document.addEventListener("DOMContentLoaded", () => {
  // Inizializza i caroselli
  const carouselElements = document.querySelectorAll(".carousel-container");
  carouselElements.forEach(carouselEl => {
    createCarousel(carouselEl, { maxWeight: 500 });
  });

  // Inizializza i dropdown
  const dropdownElements = document.querySelectorAll(".custom-select");
  dropdownElements.forEach(dropdownEl => {
    createDropdown(dropdownEl, { maxReps: 50 });
  });

  // Inizializza le checkbox (quelle originali)
  const checkboxElements = document.querySelectorAll('input[type="checkbox"]');
  checkboxElements.forEach(checkboxEl => {
    createCheckbox(checkboxEl);
  });

  // Gestione della logica per abilitare/disabilitare i caroselli
  const checkbox1 = document.getElementById("checkbox1"); // Checkbox del primo carosello
  const checkbox2 = document.getElementById("checkbox2"); // Checkbox del secondo carosello
  const checkbox3 = document.getElementById("checkbox3"); // Checkbox del terzo carosello
  const checkbox4 = document.getElementById("checkbox4"); // Checkbox del quarto carosello
  
  const container2 = document.querySelector(".container_carosello_2");
  const container3 = document.querySelector(".container_carosello_3");
  const container4 = document.querySelector(".container_carosello_4");
  
  // Assicurati che, all'inizio, container2, container3 e container4 siano disabilitati
  container2.classList.add("disabled");
  container3.classList.add("disabled");
  container4.classList.add("disabled");

  // Il primo carosello è sempre attivo (classe 'enabled' già presente nell'HTML)

  // Quando la checkbox del primo carosello viene spuntata, abilita il secondo carosello;
  // se non è spuntata, disabilita il secondo (e di conseguenza anche il terzo e il quarto)
  checkbox1.addEventListener("change", function() {
    if (this.checked) {
      container2.classList.remove("disabled");
      container2.classList.add("enabled");
    } else {
      container2.classList.remove("enabled");
      container2.classList.add("disabled");
      // Disabilita anche il terzo e il quarto se il secondo non è abilitato
      container3.classList.remove("enabled");
      container3.classList.add("disabled");
      container4.classList.remove("enabled");
      container4.classList.add("disabled");
      // Deseleziona le checkbox del secondo e del terzo carosello
      checkbox2.checked = false;
      checkbox3.checked = false;
    }
  });

  // Quando la checkbox del secondo carosello viene spuntata, abilita il terzo carosello;
  // se non è spuntata, disabilita il terzo (e di conseguenza anche il quarto)
  checkbox2.addEventListener("change", function() {
    if (this.checked) {
      container3.classList.remove("disabled");
      container3.classList.add("enabled");
    } else {
      container3.classList.remove("enabled");
      container3.classList.add("disabled");
      container4.classList.remove("enabled");
      container4.classList.add("disabled");
      // Deseleziona la checkbox del terzo carosello
      checkbox3.checked = false;
    }
  });

  // Quando la checkbox del terzo carosello viene spuntata, abilita il quarto carosello;
  // se non è spuntata, disabilita il quarto
  checkbox3.addEventListener("change", function() {
    if (this.checked) {
      container4.classList.remove("disabled");
      container4.classList.add("enabled");
    } else {
      container4.classList.remove("enabled");
      container4.classList.add("disabled");
    }
  });
});




// qui c'è il codice per il commento
document.addEventListener("DOMContentLoaded", () => {
  const commentBox = document.getElementById("commentBox");
  const storageKey = "userComment";

  // Recupera il commento salvato nel localStorage
  const savedComment = localStorage.getItem(storageKey);
  if (savedComment) {
    commentBox.value = savedComment;
  }

  // Salva il commento nel localStorage quando l'utente digita
  commentBox.addEventListener("input", () => {
    localStorage.setItem(storageKey, commentBox.value);
  });
});