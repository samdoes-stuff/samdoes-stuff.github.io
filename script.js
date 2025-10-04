const input = document.getElementById('birthday-input');
const results = document.getElementById('results');

function clearResults() {
  results.innerHTML = '';
}

function showMessage(msg) {
  clearResults();
  const div = document.createElement('div');
  div.className = 'placeholder';
  div.innerHTML = `<p>${msg}</p>`;
  results.appendChild(div);
}

function createCard(type, entry) {
  // Try to make title and description as robust as possible
  let title = "";
  let desc = "";
  if (type === "birth") {
    // Format: "1931 – John Smith, American actor (d. 2000)"
    const parts = entry.text.split("–");
    title = parts[1] ? parts[1].trim().split(',')[0] : entry.text;
    desc = entry.text.trim();
  } else if (type === "event") {
    const parts = entry.text.split("–");
    title = parts[1] ? parts[1].trim().split(',')[0] : entry.text;
    desc = entry.text.trim();
  }
  // Try to get a Wikipedia link
  let wiki = "";
  if (entry.pages && Array.isArray(entry.pages) && entry.pages[0] && entry.pages[0].content_urls) {
    wiki = entry.pages[0].content_urls.desktop.page;
  }

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h2>${title} <span class="year">(${entry.year})</span></h2>
    <div class="desc">${desc}</div>
    ${wiki ? `<a href="${wiki}" target="_blank" rel="noopener noreferrer">Wikipedia</a>` : ''}
  `;
  return card;
}

function revealOnScroll() {
  const cards = document.querySelectorAll('.card');
  if (!('IntersectionObserver' in window)) {
    // fallback: show all
    cards.forEach(card => card.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  cards.forEach(card => observer.observe(card));
}

async function fetchOnThisDay(month, day) {
  const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${month}/${day}`;
  // Add a fetch timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!resp.ok) throw new Error('Failed to fetch data');
    return await resp.json();
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

function renderResults(data) {
  clearResults();
  let any = false;

  // Birthdays
  if (data.births && data.births.length) {
    any = true;
    const title = document.createElement('div');
    title.className = 'card';
    title.innerHTML = '<h2>🎂 Famous Birthdays</h2>';
    results.appendChild(title);
    data.births.slice(0, 8).forEach(birth => {
      results.appendChild(createCard("birth", birth));
    });
  }

  // Events
  if (data.events && data.events.length) {
    any = true;
    const title = document.createElement('div');
    title.className = 'card';
    title.innerHTML = '<h2>📜 Notable Events</h2>';
    results.appendChild(title);
    data.events.slice(0, 8).forEach(event => {
      results.appendChild(createCard("event", event));
    });
  }
  if (!any) showMessage("No events or birthdays found for this day!");
  revealOnScroll();
}

// Helper: get mm/dd as strings with leading zeros
function getMonthDay(dateString) {
  const [year, month, day] = dateString.split('-');
  return {
    month: String(Number(month)).padStart(2, '0'),
    day: String(Number(day)).padStart(2, '0')
  };
}

input.addEventListener('change', async (e) => {
  const val = e.target.value;
  if (!val) {
    showMessage("Please pick a date!");
    return;
  }
  const { month, day } = getMonthDay(val);
  showMessage("Loading...");
  try {
    const data = await fetchOnThisDay(month, day);
    renderResults(data);
  } catch (err) {
    showMessage('Sorry, something went wrong. Try again!');
  }
});

// Optionally, pick today's date by default:
// input.value = new Date().toISOString().slice(0,10);