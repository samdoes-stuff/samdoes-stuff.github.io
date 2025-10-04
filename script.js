const input = document.getElementById('birthday-input');
const results = document.getElementById('results');
const loader = document.getElementById('loader');
const darkToggle = document.getElementById('darkToggle');

// Dark mode toggle
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  // Icon swap
  const icon = darkToggle.querySelector('i');
  if(document.body.classList.contains('dark')) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
});

function clearResults() {
  results.innerHTML = '';
}

function showMessage(msg, emoji='🎈') {
  clearResults();
  const div = document.createElement('div');
  div.className = 'placeholder';
  div.innerHTML = `<div class="emoji-bounce">${emoji}</div><p>${msg}</p>`;
  results.appendChild(div);
}

function createCard(type, entry) {
  let title = "";
  let desc = "";
  if (type === "birth") {
    const parts = entry.text.split("–");
    title = parts[1] ? parts[1].trim().split(',')[0] : entry.text;
    desc = entry.text.trim();
  } else if (type === "event") {
    const parts = entry.text.split("–");
    title = parts[1] ? parts[1].trim().split(',')[0] : entry.text;
    desc = entry.text.trim();
  }
  let wiki = "";
  if (entry.pages && Array.isArray(entry.pages) && entry.pages[0] && entry.pages[0].content_urls) {
    wiki = entry.pages[0].content_urls.desktop.page;
  }
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h2>${title} <span class="year">(${entry.year})</span></h2>
    <div class="desc">${desc}</div>
    ${wiki ? `<a href="${wiki}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-wikipedia-w"></i> Wikipedia</a>` : ''}
  `;
  return card;
}

function revealOnScroll() {
  const cards = document.querySelectorAll('.card');
  if (!('IntersectionObserver' in window)) {
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
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
    title.className = 'card visible';
    title.innerHTML = '<h2>🎂 Famous Birthdays</h2>';
    results.appendChild(title);
    data.births.slice(0, 7).forEach(birth => {
      results.appendChild(createCard("birth", birth));
    });
  }
  // Events
  if (data.events && data.events.length) {
    any = true;
    const title = document.createElement('div');
    title.className = 'card visible';
    title.innerHTML = '<h2>📜 Notable Events</h2>';
    results.appendChild(title);
    data.events.slice(0, 7).forEach(event => {
      results.appendChild(createCard("event", event));
    });
  }
  if (!any) showMessage("No events or birthdays found for this day!", '🫥');
  revealOnScroll();
}

function showLoader(show) {
  loader.style.display = show ? 'block' : 'none';
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
    showMessage("Please pick a date!", '📅');
    return;
  }
  const { month, day } = getMonthDay(val);
  showLoader(true);
  try {
    const data = await fetchOnThisDay(month, day);
    showLoader(false);
    renderResults(data);
  } catch (err) {
    showLoader(false);
    showMessage('Sorry, something went wrong. Try again!', '😢');
  }
});

// Optional: Use today's date by default
// input.value = new Date().toISOString().slice(0,10);
