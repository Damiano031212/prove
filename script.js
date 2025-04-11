// Funzione per salvare uno stato nel localStorage 
function saveState(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Funzione per recuperare uno stato dal localStorage
function loadState(key, defaultValue) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

// Funzione per creare le opzioni del menù a tendina da 0 a 30
function populateReps(selectEl, parentId, containerIndex) {
  selectEl.innerHTML = ''; // pulisce eventuali opzioni preesistenti
  for (let i = 0; i <= 30; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${i} reps`; // Aggiunge la scritta "reps" accanto al numero
    selectEl.appendChild(option);
  }
  // Ripristina il valore salvato
  const savedReps = loadState(`${parentId}_container${containerIndex}_reps`, 0);
  selectEl.value = savedReps;
}

// Funzione per creare gli elementi del carosello (0kg a 500kg)
function populateCarousel(carouselEl, parentId, containerIndex) {
  carouselEl.innerHTML = ''; // pulire eventuali figli
  for (let i = 0; i <= 500; i++) {
    const item = document.createElement('span');
    item.className = 'item';
    item.dataset.value = i;
    item.textContent = `${i}kg`;
    carouselEl.appendChild(item);
  }
  // Verifica se c'è un valore salvato
  const savedWeight = loadState(`${parentId}_container${containerIndex}_weight`, 0);
  // Inizialmente seleziona l'elemento salvato (se presente)
  selectCarouselItem(carouselEl, savedWeight);
}

// Funzione per impostare lo stile dell'elemento selezionato nel carosello
function selectCarouselItem(carouselEl, value) {
  const items = carouselEl.querySelectorAll('.item');
  items.forEach(item => {
    item.classList.remove('selected');
  });
  // Trova l'elemento che corrisponde al valore da selezionare
  const itemToSelect = carouselEl.querySelector(`.item[data-value="${value}"]`);
  if(itemToSelect){
    itemToSelect.classList.add('selected');
    // Scorri in modo che l'elemento sia centrato
    const carouselRect = carouselEl.getBoundingClientRect();
    const itemRect = itemToSelect.getBoundingClientRect();
    // Calcola lo scroll necessario
    const offset = (itemRect.left + itemRect.right) / 2 - (carouselRect.left + carouselRect.right) / 2;
    carouselEl.scrollLeft += offset;
  }
}

// Funzione per gestire il timer per il rilevamento dell'elemento centrale
function setupCarouselListener(carouselEl, parentId, containerIndex) {
  let centerTimer = null;

  // Funzione che controlla quale elemento è al centro
  function checkCenter() {
    const carouselRect = carouselEl.getBoundingClientRect();
    const centerX = carouselRect.left + carouselRect.width / 2;
    let closestItem = null;
    let closestDistance = Infinity;
    carouselEl.querySelectorAll('.item').forEach(item => {
      const itemRect = item.getBoundingClientRect();
      const itemCenter = (itemRect.left + itemRect.right) / 2;
      const distance = Math.abs(centerX - itemCenter);
      if(distance < closestDistance) {
        closestDistance = distance;
        closestItem = item;
      }
    });
    if (closestItem) {
      // Applica la selezione visiva e salva il valore
      selectCarouselItem(carouselEl, closestItem.dataset.value);
      saveState(`${parentId}_container${containerIndex}_weight`, parseInt(closestItem.dataset.value, 10));
    }
  }

  // Quando l'utente scrolla il carosello, imposta (o reimposta) il timer
  carouselEl.addEventListener('scroll', () => {
    if(centerTimer) clearTimeout(centerTimer);
    centerTimer = setTimeout(checkCenter, 500);
  });

  // Doppio click sul carosello: apre un prompt per inserire il peso
  carouselEl.addEventListener('dblclick', () => {
    const input = prompt('Inserisci il peso desiderato (0-500):');
    const num = parseInt(input, 10);
    if (!isNaN(num) && num >= 0 && num <= 500) {
      // Aggiorna il carosello: seleziona l'elemento corrispondente
      selectCarouselItem(carouselEl, num);
      saveState(`${parentId}_container${containerIndex}_weight`, num);
    } else {
      alert("Valore non valido.");
    }
  });

  // Al caricamento iniziale, assicura di aver selezionato l'elemento salvato (o quello predefinito)
  checkCenter();
}

// Funzione che restituisce il prossimo elemento fratello con la classe 'container'
function findNextContainer(elem) {
  let next = elem.nextElementSibling;
  while (next && !next.classList.contains('container')) {
    next = next.nextElementSibling;
  }
  return next;
}

// Funzione per gestire lo sblocco dei container
function setupContainerUnlock(parentEl) {
  const containers = parentEl.querySelectorAll('.container');
  // Disabilita tutti i container tranne il primo
  containers.forEach((container, idx) => {
    if(idx !== 0) {
      container.classList.add('disabled');
    }
  });

  containers.forEach((container, idx) => {
    const checkbox = container.querySelector('.unlock');
    // Ripristina lo stato della checkbox
    const savedUnlock = loadState(`${parentEl.id}_container${idx}_unlock`, false);
    checkbox.checked = savedUnlock;

    checkbox.addEventListener('change', () => {
      // Salva lo stato del checkbox
      saveState(`${parentEl.id}_container${idx}_unlock`, checkbox.checked);
      if(checkbox.checked) {
        // Usa la funzione findNextContainer per saltare eventuali elementi intermedi
        const nextContainer = findNextContainer(container);
        if(nextContainer) {
          nextContainer.classList.remove('disabled');
        }
      } else {
        // Se deselezionato, blocca e resetta i container successivi
        let current = findNextContainer(container);
        while(current) {
          current.classList.add('disabled');
          const cb = current.querySelector('.unlock');
          if (cb) {
            cb.checked = false;
            saveState(`${parentEl.id}_container${current.dataset.index}_unlock`, false);
          }
          current = findNextContainer(current);
        }
      }
    });
  });
}

// Inizializzazione per ogni "div padre" (puoi richiamarlo anche in altri file HTML, senza interferenze)
function initializeParentComponent(parentEl) {
  const parentId = parentEl.id;
  const containers = parentEl.querySelectorAll('.container');
  containers.forEach(container => {
    const index = container.dataset.index;
    // Trova gli elementi interni
    const carouselEl = container.querySelector('.carousel');
    const repsSelect = container.querySelector('.reps');
    
    // Popola il carosello e il menù
    populateCarousel(carouselEl, parentId, index);
    populateReps(repsSelect, parentId, index);

    // Setta il listener del carosello
    setupCarouselListener(carouselEl, parentId, index);

    // Salva il valore del menù a tendina quando cambia
    repsSelect.addEventListener('change', () => {
      saveState(`${parentId}_container${index}_reps`, parseInt(repsSelect.value, 10));
    });
  });

  // Imposta lo sblocco dei container in sequenza
  setupContainerUnlock(parentEl);
}

// Una volta caricato il DOM, inizializza tutti i componenti padre
document.addEventListener('DOMContentLoaded', () => {
  const parents = document.querySelectorAll('.parent');
  parents.forEach(parentEl => {
    initializeParentComponent(parentEl);
  });
});

// Funzione per inizializzare il componente commento in un contenitore specifico
function initializeCommentComponent(parentEl) {
  const storageKey = parentEl.id + "_comment";
  let commentBox = parentEl.querySelector('.comment-box');

  if (!commentBox) {
    commentBox = document.createElement('textarea');
    commentBox.className = 'comment-box';
    commentBox.placeholder = "scrivi un commento...";
    commentBox.style.color = "#000";
    commentBox.setAttribute('rows', 3);
    parentEl.appendChild(commentBox);
  }

  const savedComment = localStorage.getItem(storageKey);
  if (savedComment && savedComment.trim() !== "") {
    commentBox.value = savedComment;
    commentBox.style.color = "#000";
  } else {
    commentBox.value = "";
  }

  commentBox.addEventListener('input', () => {
    localStorage.setItem(storageKey, commentBox.value);
    if (commentBox.value.trim() !== "") {
      commentBox.style.color = "#000";
    }
  });
}

// Inizializzazione automatica per tutti i comment container
document.addEventListener('DOMContentLoaded', () => {
  const commentContainers = document.querySelectorAll('.comment-container');
  commentContainers.forEach(container => {
    // Assicurati che ogni contenitore abbia un id univoco!
    if (!container.id) {
      console.warn("Il contenitore di commento deve avere un id univoco.");
    } else {
      initializeCommentComponent(container);
    }
  });
});
