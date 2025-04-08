document.addEventListener("DOMContentLoaded", () => {
    const pesoScroll = document.getElementById("pesoScroll");
    const repSelect = document.getElementById("repSelect");
  
    const pesoSalvato = localStorage.getItem("peso");
    const repSalvato = localStorage.getItem("reps");
  
    // Crea i valori da 0 a 500
    for (let i = 0; i <= 500; i++) {
      const div = document.createElement("div");
      div.className = "peso-item";
      div.textContent = `${i}`;
      div.dataset.value = i;
      pesoScroll.appendChild(div);
    }
  
    // Ripetizioni da 0 a 30
    for (let i = 0; i <= 30; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `${i} Rep`;
      if (repSalvato && parseInt(repSalvato) === i) {
        option.selected = true;
      }
      repSelect.appendChild(option);
    }
  
    // Salva le reps su cambio
    repSelect.addEventListener("change", () => {
      localStorage.setItem("reps", repSelect.value);
    });
  
    // Trova e seleziona l'elemento al centro visibile
    function aggiornaSelezione() {
      const items = document.querySelectorAll(".peso-item");
      const scrollWrapper = pesoScroll.parentElement;
      const center = scrollWrapper.offsetWidth / 2;
  
      let minDiff = Infinity;
      let selectedItem = null;
  
      items.forEach(item => {
        const box = item.getBoundingClientRect();
        const itemCenter = box.left + box.width / 2;
        const diff = Math.abs(itemCenter - center);
  
        if (diff < minDiff) {
          minDiff = diff;
          selectedItem = item;
        }
      });
  
      items.forEach(el => el.classList.remove("selected"));
      if (selectedItem) {
        selectedItem.classList.add("selected");
        localStorage.setItem("peso", selectedItem.dataset.value);
      }
    }
  
    // Trigger quando si scrolla
    pesoScroll.parentElement.addEventListener("scroll", () => {
      window.clearTimeout(pesoScroll._scrollTimeout);
      pesoScroll._scrollTimeout = setTimeout(aggiornaSelezione, 100);
    });
  
    // Al load, scrolla al peso salvato
    window.addEventListener("DOMContentLoaded", () => {
      if (pesoSalvato) {
        const selected = document.querySelector(`.peso-item[data-value="${pesoSalvato}"]`);
        if (selected) {
          selected.scrollIntoView({ inline: "center", behavior: "instant" });
          selected.classList.add("selected");
        }
      }
    });
  });
  