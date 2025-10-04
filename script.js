function getTodayDateString() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}
function getMonthDay(dateStr) {
  const d = new Date(dateStr);
  return [d.getMonth() + 1, d.getDate()];
}
// Wikipedia On This Day API base
const WIKI_API_BASE = "https://en.wikipedia.org/api/rest_v1/feed/onthisday";

// Fun Facts
function getRandomFunFact() {
  const facts = [
    "You share a birthday with a lot of cool people!",
    "Did you know? Octopuses have three hearts.",
    "Every year, more than 9,000 meteorites hit the Earth.",
    "Bananas are berries, but strawberries are not!",
    "Wombat poop is cube-shaped. Seriously.",
    "The inventor of the frisbee was turned into a frisbee.",
    "A group of flamingos is called a 'flamboyance'.",
    "Honey never spoils.",
    "The Eiffel Tower can be 15 cm taller in summer.",
    "Some cats are allergic to humans."
  ];
  return facts[Math.floor(Math.random() * facts.length)];
}

function fillSection(albumId, dataArr, hoverField = "desc") {
  const el = document.getElementById(albumId);
  el.innerHTML = "";
  if (!dataArr || !dataArr.length) {
    el.innerHTML = `<div style="opacity:0.6; font-size:1.01rem; margin:1.3rem 0;">No data found for this date yet.</div>`;
    return;
  }
  dataArr.forEach(item => {
    el.innerHTML += `
      <div class="album-card">
        <img class="album-image" src="${item.image || "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"}" alt="${item.name}">
        <div class="album-info">
          <div class="album-title">${item.name}</div>
          <div class="album-desc">${item.desc}</div>
        </div>
        <div class="album-hover">${item[hoverField]}</div>
      </div>
    `;
  });
}

function fillFunFact(sectionId, fact) {
  const el = document.getElementById(sectionId);
  el.textContent = fact;
}

function showSection(section, show) {
  document.getElementById(section + "-section").style.display = show ? "" : "none";
}

function setTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
}

function setTodayText(dateStr) {
  const now = new Date();
  const inputDate = new Date(dateStr);
  const todayStr = now.toISOString().slice(0, 10);
  const inputStr = inputDate.toISOString().slice(0, 10);
  const el = document.getElementById("today-text");
  el.textContent = (todayStr === inputStr) ? "(Today!)" : "";
}

async function fetchWikiOnThisDay(type, month, day) {
  const url = `${WIKI_API_BASE}/${type}/${month}/${day}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data[type] || [];
  } catch (e) {
    return [];
  }
}

// Main function to update all sections
async function updateAll(dateStr) {
  const [month, day] = getMonthDay(dateStr);

  // Fetch from Wikipedia API
  const [births, deaths] = await Promise.all([
    fetchWikiOnThisDay("births", month, day),
    fetchWikiOnThisDay("deaths", month, day)
  ]);

  // Map the data into album card format
  const mapWiki = arr => arr.slice(0, 8).map(item => ({
    name: item.text || item.pages?.[0]?.normalizedtitle || item.year,
    image: item.pages?.[0]?.thumbnail?.source || "",
    desc: `Year: ${item.year}`,
    achievements: item.pages?.[0]?.description || ""
  }));

  fillSection("births-album", mapWiki(births), "achievements");
  fillSection("deaths-album", mapWiki(deaths), "achievements");

  // Movies/animes: placeholder (or use Wikidata SPARQL for enhancement)
  fillSection("movies-album", [
    {
      name: "Try the Wikidata Query Service for movie releases!",
      image: "",
      desc: "Movie & anime releases for this day will appear here.",
      awards: "Coming soon"
    }
  ], "awards");

  fillFunFact("funfact-card", getRandomFunFact());
}

window.addEventListener('DOMContentLoaded', () => {
  const birthdayInput = document.getElementById("birthday");
  const themeSwitch = document.getElementById("themeSwitch");
  const sectionToggles = document.querySelectorAll(".section-toggle");

  // Set default date
  const todayStr = getTodayDateString();
  birthdayInput.value = todayStr;
  setTodayText(todayStr);

  // Load for today
  updateAll(todayStr);

  // Handle date change
  birthdayInput.addEventListener("input", (e) => {
    const date = e.target.value;
    setTodayText(date);
    updateAll(date);
  });

  // Theme switching
  themeSwitch.addEventListener("change", (e) => {
    setTheme(e.target.checked);
  });

  // Section filtering
  sectionToggles.forEach(toggle => {
    toggle.addEventListener("change", (e) => {
      showSection(e.target.dataset.section, e.target.checked);
    });
  });
});
