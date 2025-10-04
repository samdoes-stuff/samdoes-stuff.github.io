// Helper: Format today's date as yyyy-mm-dd
function todayStr() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

// Theme toggle
const body = document.body;
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

function setTheme(theme) {
  if (theme === "light") {
    body.classList.add("light");
    themeIcon.textContent = "☀️";
    localStorage.setItem("theme", "light");
  } else {
    body.classList.remove("light");
    themeIcon.textContent = "🌙";
    localStorage.setItem("theme", "dark");
  }
}
setTheme(localStorage.getItem("theme") || "dark");

themeToggle.onclick = () =>
  setTheme(body.classList.contains("light") ? "dark" : "light");

// Set max date for input
const bdayInput = document.getElementById("birthday-input");
bdayInput.max = todayStr();
bdayInput.value = todayStr();

// Option toggles
const optBirths = document.getElementById("opt-births");
const optDeaths = document.getElementById("opt-deaths");
const optMovies = document.getElementById("opt-movies");
const optAnime = document.getElementById("opt-anime");

// Results containers
const birthsDiv = document.getElementById("births");
const deathsDiv = document.getElementById("deaths");
const moviesDiv = document.getElementById("movies");
const animeDiv = document.getElementById("anime");

// API fetchers
async function fetchWikipediaOnThisDay(month, day) {
  // Wikipedia API for births, deaths, events
  const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${month}/${day}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Bad response");
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function fetchTMDbMovies(month, day) {
  // TMDb API requires API key; fallback to demo if not available
  // We'll use Demo API for "discover" endpoint and filter by release_date
  // WARNING: Limited by CORS and API key, so fallback to empty on error
  // Suggest user add their API key below for full results
  const API_KEY = ""; // Optional: Add your TMDb API key here
  if (!API_KEY) return []; // No API key, can't fetch actual
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&primary_release_date.gte=2000-${String(
    month
  ).padStart(2, "0")}-${String(day).padStart(2, "0")}&primary_release_date.lte=2025-${String(
    month
  ).padStart(2, "0")}-${String(day).padStart(2, "0")}&sort_by=popularity.desc`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Bad response");
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

async function fetchJikanAnime(month, day) {
  // Jikan public API for anime released on this day (MM-DD format)
  // https://api.jikan.moe/v4/anime?start_date=YYYY-MM-DD
  // We'll just use year-agnostic search for demo
  try {
    // Get all anime and filter by month/day (limited to popular entries)
    const res = await fetch(
      `https://api.jikan.moe/v4/seasons/now?limit=25`
    );
    const data = await res.json();
    if (!data.data) return [];
    // Filter anime where aired.from matches the month/day
    return data.data.filter((anime) => {
      if (!anime.aired || !anime.aired.from) return false;
      const adate = new Date(anime.aired.from);
      return (
        adate.getUTCMonth() + 1 === month && adate.getUTCDate() === day
      );
    });
  } catch (e) {
    return [];
  }
}

function clearResults() {
  birthsDiv.innerHTML = deathsDiv.innerHTML = moviesDiv.innerHTML = animeDiv.innerHTML = "";
}

function cardHTML({ title, subtitle, desc, link }) {
  return `<div class="card">
    <div class="card-title">${title}</div>
    ${subtitle ? `<div class="card-subtitle">${subtitle}</div>` : ""}
    <div class="card-desc">${desc || ""}</div>
    ${
      link
        ? `<a class="card-link" href="${link}" target="_blank" rel="noopener">Read more &rarr;</a>`
        : ""
    }
  </div>`;
}

// Main loader
async function loadData(date) {
  clearResults();
  const d = new Date(date);
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  // Wikipedia
  let wikiData = await fetchWikipediaOnThisDay(month, day);

  // Births
  if (optBirths.checked) {
    if (wikiData && wikiData.births && wikiData.births.length) {
      birthsDiv.innerHTML =
        "<h2>🎉 Famous Birthdays</h2>" +
        wikiData.births
          .slice(0, 8)
          .map((b) =>
            cardHTML({
              title: b.text,
              subtitle: b.year,
              desc: b.pages && b.pages[0]?.extract,
              link: b.pages && b.pages[0]?.content_urls?.desktop?.page,
            })
          )
          .join("");
    } else {
      birthsDiv.innerHTML =
        "<h2>🎉 Famous Birthdays</h2><div>No data found.</div>";
    }
  }
  // Deaths
  if (optDeaths.checked) {
    if (wikiData && wikiData.deaths && wikiData.deaths.length) {
      deathsDiv.innerHTML =
        "<h2>🪦 Famous Deaths</h2>" +
        wikiData.deaths
          .slice(0, 8)
          .map((d) =>
            cardHTML({
              title: d.text,
              subtitle: d.year,
              desc: d.pages && d.pages[0]?.extract,
              link: d.pages && d.pages[0]?.content_urls?.desktop?.page,
            })
          )
          .join("");
    } else {
      deathsDiv.innerHTML =
        "<h2>🪦 Famous Deaths</h2><div>No data found.</div>";
    }
  }
  // Movies
  if (optMovies.checked) {
    // Try TMDb, fallback to Wikipedia events for movies
    let movies = [];
    if ((await fetchTMDbMovies(month, day)).length) {
      movies = await fetchTMDbMovies(month, day);
    } else if (wikiData && wikiData.events) {
      movies = wikiData.events.filter((ev) =>
        /film|movie/i.test(ev.text)
      );
    }
    if (movies.length) {
      moviesDiv.innerHTML =
        "<h2>🎬 Movies Released</h2>" +
        movies
          .slice(0, 8)
          .map((m) =>
            cardHTML({
              title: m.title || m.text,
              subtitle: m.release_date || m.year,
              desc: m.overview || m.pages?.[0]?.extract || "",
              link:
                m.pages?.[0]?.content_urls?.desktop?.page ||
                (m.id
                  ? `https://www.themoviedb.org/movie/${m.id}`
                  : ""),
            })
          )
          .join("");
    } else {
      moviesDiv.innerHTML =
        "<h2>🎬 Movies Released</h2><div>No data found.</div>";
    }
  }
  // Anime
  if (optAnime.checked) {
    let anime = await fetchJikanAnime(month, day);
    if (anime.length) {
      animeDiv.innerHTML =
        "<h2>🍥 Anime Released</h2>" +
        anime
          .slice(0, 8)
          .map((a) =>
            cardHTML({
              title: a.title,
              subtitle: (a.aired && a.aired.from && a.aired.from.slice(0, 10)) || "",
              desc: a.synopsis || "",
              link: a.url,
            })
          )
          .join("");
    } else {
      animeDiv.innerHTML =
        "<h2>🍥 Anime Released</h2><div>No data found.</div>";
    }
  }
}

// On form submit
document.getElementById("birthday-form").onsubmit = (e) => {
  e.preventDefault();
  const date = bdayInput.value || todayStr();
  loadData(date);
};

[optBirths, optDeaths, optMovies, optAnime].forEach((opt) =>
  opt.addEventListener("change", () => {
    loadData(bdayInput.value || todayStr());
  })
);

// Load on start
window.onload = () => {
  loadData(bdayInput.value || todayStr());
};