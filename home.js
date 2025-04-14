const giorniSettimana = ["Lun", "Mart", "Merc", "Giov", "Ven"];
const tabBar = document.getElementById("tab-bar");
const underline = tabBar.querySelector(".underline");
const pagesContainer = document.getElementById("pages");
const pages = pagesContainer.querySelectorAll(".page");

// Crea le tab dinamicamente
giorniSettimana.forEach((giorno, i) => {
  const tab = document.createElement("div");
  tab.className = "tab";
  tab.textContent = giorno;
  tab.addEventListener("click", () => scrollToPage(i));
  tabBar.appendChild(tab);
});

const tabs = document.querySelectorAll(".tab");

function scrollToPage(index) {
  const pageWidth = pagesContainer.offsetWidth;
  pagesContainer.scrollTo({
    left: index * pageWidth,
    behavior: "smooth"
  });
}

function updateUnderlinePosition() {
  const scrollX = pagesContainer.scrollLeft;
  const pageWidth = pagesContainer.offsetWidth;
  const index = scrollX / pageWidth;
  const activeTabIndex = Math.round(index);
  const activeTab = tabs[activeTabIndex];

  if (activeTab) {
    const tabRect = activeTab.getBoundingClientRect();
    const barRect = tabBar.getBoundingClientRect();
    const offsetLeft = tabRect.left - barRect.left;
    const tabWidth = tabRect.width;
    underline.style.left = `${offsetLeft + (tabWidth / 2) - (underline.offsetWidth / 2)}px`;
  }

  tabs.forEach((tab, i) => {
    tab.classList.toggle("active", i === activeTabIndex);
  });
}

pagesContainer.addEventListener("scroll", () => {
  updateUnderlinePosition();

  const scrollX = pagesContainer.scrollLeft;
  const pageWidth = pagesContainer.offsetWidth;
  const index = Math.round(scrollX / pageWidth);

  tabs.forEach((tab, i) => {
    tab.classList.toggle("active", i === index);
  });
});

window.addEventListener("DOMContentLoaded", () => {
  const oggi = new Date();
  let giorno = oggi.getDay();
  if (giorno === 0 || giorno === 6) {
    giorno = 2;
  }
  const index = giorno === 0 ? 6 : giorno - 1;
  scrollToPage(index);
  setTimeout(updateUnderlinePosition, 50);
});
