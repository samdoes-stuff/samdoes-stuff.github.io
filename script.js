document.addEventListener("DOMContentLoaded", function() {
  const input = document.getElementById('birthday-input');
  const results = document.getElementById('results');
  const loader = document.getElementById('loader');
  const darkToggle = document.getElementById('darkToggle');
  const optionsForm = document.getElementById('optionsForm');
  const showBirths = document.getElementById('showBirths');
  const showDeaths = document.getElementById('showDeaths');
  const showHolidays = document.getElementById('showHolidays');
  const showFunFact = document.getElementById('showFunFact');

  // Fun facts list
  const funFacts = [
    "Did you know? Almost 17.7 million people around the world have the same birthday as you!",
    "People born on your birthday share a star sign with you.",
    "If you were born today, your birthstone is probably Opal or Tourmaline.",
    "The odds of sharing your birthday with someone in a group of 23 is over 50%.",
    "Some cultures believe your birthday is a lucky day for new beginnings!",
    "You have a unique birthday number in the world’s population.",
    "Famous historical figures may have celebrated just like you.",
    "Having a birthday means you survived another trip around the sun. Congratulations!",
    "On your birthday, it’s statistically likely that 19 million other people are celebrating too.",
    "You share your birthday with at least one famous person, guaranteed!"
  ];

  let lastData = null;

  function randomFact() {
    return funFacts[Math.floor(Math.random() * funFacts.length)];
  }

  if (darkToggle) {
    darkToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const icon = darkToggle.querySelector('i');
      if(document.body.classList.contains('dark')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
    });
  }

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

  function createBirthdaysCarousel(births) {
    const container = document.createElement('div');
    container.className = 'carousel-container';

    const label = document.createElement('div');
    label.className = 'carousel-label';
    label.innerHTML = '🎂 <span style="color:var(--accent);">Famous Birthdays</span>';
    container.appendChild(label);

    const viewport = document.createElement('div');
    viewport.className = 'carousel-viewport';

    const carousel = document.createElement('div');
    carousel.className = 'carousel';

    // Prepare cards
    const cards = births.slice(0, 12).map(birth => {
      const page = (birth.pages && birth.pages[0]) || {};
      const img = page.thumbnail ? page.thumbnail.source : 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';
      const name = (birth.text.split("–")[1] || birth.text).trim().split(',')[0];
      const year = birth.year;
      const works = page.extract || "No summary available.";
      const wiki = page.content_urls ? page.content_urls.desktop.page : null;

      const card = document.createElement('div');
      card.className = 'carousel-card';
      card.tabIndex = 0;

      card.innerHTML = `
        <div class="carousel-img-wrap">
          <img src="${img}" alt="${name}" class="carousel-img">
          <div class="carousel-card-overlay" tabindex="-1">
            <div class="carousel-card-overlay-title">${name}</div>
            <div class="carousel-card-overlay-desc">${works}</div>
          </div>
        </div>
        <div class="carousel-card-content">
          <div class="carousel-card-name">${name}</div>
          <div class="carousel-card-year">${year}</div>
          ${wiki ? `<a class="carousel-card-link" href="${wiki}" target="_blank">Wikipedia</a>` : ""}
        </div>
      `;
      return card;
    });

    // Loop: clone first and last cards
    const firstClone = cards[0].cloneNode(true);
    const lastClone = cards[cards.length-1].cloneNode(true);
    carousel.appendChild(lastClone); // Add last at start
    cards.forEach(card => carousel.appendChild(card));
    carousel.appendChild(firstClone); // Add first at end

    viewport.appendChild(carousel);

    // Arrows
    const leftArrow = document.createElement('button');
    leftArrow.className = 'carousel-arrow left';
    leftArrow.innerHTML = '<i class="fa fa-chevron-left"></i>';
    leftArrow.setAttribute('aria-label', 'Scroll left');
    const rightArrow = document.createElement('button');
    rightArrow.className = 'carousel-arrow right';
    rightArrow.innerHTML = '<i class="fa fa-chevron-right"></i>';
    rightArrow.setAttribute('aria-label', 'Scroll right');

    // Center the carousel on the first “real” card
    function setInitialScroll() {
      const cardWidth = cards[0].offsetWidth + 22;
      carousel.scrollLeft = cardWidth;
    }
    setTimeout(setInitialScroll, 80);

    // Loop behavior
    function handleScroll() {
      const cardWidth = cards[0].offsetWidth + 22;
      if (carousel.scrollLeft <= 0) {
        carousel.scrollLeft = cardWidth * cards.length;
      }
      if (carousel.scrollLeft >= cardWidth * (cards.length + 1)) {
        carousel.scrollLeft = cardWidth;
      }
    }
    carousel.addEventListener('scroll', handleScroll);

    // Both arrow navigation
    leftArrow.onclick = () => {
      const cardWidth = cards[0].offsetWidth + 22;
      carousel.scrollBy({left: -cardWidth, behavior: 'smooth'});
    };
    rightArrow.onclick = () => {
      const cardWidth = cards[0].offsetWidth + 22;
      carousel.scrollBy({left: cardWidth, behavior: 'smooth'});
    };

    // Auto-scroll loop
    let autoScroll = setInterval(() => {
      rightArrow.onclick();
    }, 3300);
    container.addEventListener('mouseenter', () => clearInterval(autoScroll));
    container.addEventListener('mouseleave', () => {
      autoScroll = setInterval(() => {
        rightArrow.onclick();
      }, 3300);
    });

    container.appendChild(leftArrow);
    container.appendChild(viewport);
    container.appendChild(rightArrow);

    return container;
  }

  function createFunFactCard() {
    const card = document.createElement('div');
    card.className = 'card visible';
    card.innerHTML = `
      <h2>🎁 Fun Birthday Fact</h2>
      <div class="desc">${randomFact()}</div>
    `;
    return card;
  }

  function createNoDeathsCard() {
    const card = document.createElement('div');
    card.className = 'card visible';
    card.innerHTML = `
      <h2>🕯️ Notable Deaths</h2>
      <div class="desc">No famous deaths are recorded for this date.<br>
      <em>Sometimes, a day is just for the living! 🎉</em></div>
    `;
    return card;
  }

  function createCard(type, entry) {
    let title = "";
    let desc = "";
    if (type === "death" || type === "holiday") {
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
      <h2>${title} <span class="year">(${entry.year || entry.wikidata || ""})</span></h2>
      <div class="desc">${desc}</div>
      ${wiki ? `<a href="${wiki}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-wikipedia-w"></i> Wikipedia</a>` : ''}
    `;
    return card;
  }

  function revealOnScroll() {
    const cards = document.querySelectorAll('.card:not(.visible)');
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

    // Fun Fact (always random on each render)
    if (showFunFact && showFunFact.checked) {
      results.appendChild(createFunFactCard());
      any = true;
    }

    // Birthdays - as carousel
    if (showBirths && showBirths.checked && Array.isArray(data.births) && data.births.length) {
      results.appendChild(createBirthdaysCarousel(data.births.slice(0, 12)));
      any = true;
    }

    // Deaths (unique message if empty)
    if (showDeaths && showDeaths.checked) {
      const deaths = Array.isArray(data.deaths) ? data.deaths : [];
      const title = document.createElement('div');
      title.className = 'card visible';
      title.innerHTML = '<h2>🕯️ Notable Deaths</h2>';
      results.appendChild(title);

      if (deaths.length) {
        deaths.slice(0, 6).forEach(death => {
          results.appendChild(createCard("death", death));
        });
      } else {
        results.appendChild(createNoDeathsCard());
      }
      any = true;
    }

    // Holidays
    if (showHolidays && showHolidays.checked && Array.isArray(data.holidays) && data.holidays.length) {
      const title = document.createElement('div');
      title.className = 'card visible';
      title.innerHTML = '<h2>🌟 Holidays & Observances</h2>';
      results.appendChild(title);
      data.holidays.slice(0, 4).forEach(holiday => {
        results.appendChild(createCard("holiday", holiday));
      });
      any = true;
    }

    if (!any) showMessage("No info found for this day or all sections are hidden.", '🫥');
    revealOnScroll();
  }

  function showLoader(show) {
    loader.style.display = show ? 'block' : 'none';
  }

  function getMonthDay(dateString) {
    const [year, month, day] = dateString.split('-');
    return {
      month: String(Number(month)).padStart(2, '0'),
      day: String(Number(day)).padStart(2, '0')
    };
  }

  // When a toggle changes, re-render with last data (if any)
  if (optionsForm) {
    optionsForm.addEventListener('change', () => {
      if (input.value && lastData) {
        renderResults(lastData);
      }
    });
  }

  // Fetch and display birthdays for today's date on page load
  function showTodaysBirths() {
    if (showBirths) showBirths.checked = true;
    if (showDeaths) showDeaths.checked = false;
    if (showHolidays) showHolidays.checked = false;
    if (showFunFact) showFunFact.checked = false;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    input.value = `${yyyy}-${mm}-${dd}`;

    showLoader(true);
    fetchOnThisDay(mm, dd).then(data => {
      lastData = data;
      showLoader(false);
      renderResults(data);
    }).catch(() => {
      showLoader(false);
      showMessage('Sorry, something went wrong. Try again!', '😢');
    });
  }

  // Standard change for birthday picker
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
      lastData = data;
      showLoader(false);
      renderResults(data);
    } catch (err) {
      showLoader(false);
      showMessage('Sorry, something went wrong. Try again!', '😢');
    }
  });

  showTodaysBirths();
});
