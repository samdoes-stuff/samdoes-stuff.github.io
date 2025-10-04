// ...other code (setup, fun facts, toggles, dark mode, etc.)...

function createBirthdaysCarousel(births) {
  const container = document.createElement('div');
  container.className = 'carousel-container';

  const label = document.createElement('div');
  label.className = 'carousel-label';
  label.innerHTML = '🎂 <span style="color:var(--accent);">Famous Birthdays</span>';
  container.appendChild(label);

  // Outer row with arrows and viewport
  const outer = document.createElement('div');
  outer.className = 'carousel-outer';

  // Arrows
  const leftArrow = document.createElement('button');
  leftArrow.className = 'carousel-arrow left';
  leftArrow.innerHTML = '<i class="fa fa-chevron-left"></i>';
  leftArrow.setAttribute('aria-label', 'Scroll left');
  const rightArrow = document.createElement('button');
  rightArrow.className = 'carousel-arrow right';
  rightArrow.innerHTML = '<i class="fa fa-chevron-right"></i>';
  rightArrow.setAttribute('aria-label', 'Scroll right');

  // Carousel viewport (fixed size, hides overflow)
  const viewport = document.createElement('div');
  viewport.className = 'carousel-viewport';

  // Carousel track
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

  // --- Carousel Logic ---
  let index = 1;
  let cardWidth = 0;
  let gap = 22;
  function updateCardWidth() {
    cardWidth = cards[0].offsetWidth + gap;
  }

  function goTo(idx, animate=true) {
    updateCardWidth();
    index = idx;
    carousel.style.transition = animate ? 'transform 0.5s cubic-bezier(.4,0,.2,1)' : 'none';
    carousel.style.transform = `translateX(${-index * cardWidth}px)`;
  }

  // Initial position
  setTimeout(() => {
    updateCardWidth();
    goTo(index, false);
  }, 120);

  // Left/Right Arrow
  leftArrow.onclick = () => {
    if (index <= 0) return;
    goTo(index-1);
  };
  rightArrow.onclick = () => {
    if (index >= cards.length+1) return;
    goTo(index+1);
  };

  // Looping
  carousel.addEventListener('transitionend', () => {
    if (index === 0) {
      carousel.style.transition = 'none';
      index = cards.length;
      carousel.style.transform = `translateX(${-index * cardWidth}px)`;
    }
    if (index === cards.length+1) {
      carousel.style.transition = 'none';
      index = 1;
      carousel.style.transform = `translateX(${-index * cardWidth}px)`;
    }
  });

  // Auto-rotate
  let autoScroll = setInterval(() => { rightArrow.onclick(); }, 3400);
  outer.addEventListener('mouseenter', () => clearInterval(autoScroll));
  outer.addEventListener('mouseleave', () => {
    autoScroll = setInterval(() => { rightArrow.onclick(); }, 3400);
  });

  // Responsive: recalc on resize
  window.addEventListener("resize", () => goTo(index, false));

  // Compose
  outer.appendChild(leftArrow);
  outer.appendChild(viewport);
  outer.appendChild(rightArrow);
  container.appendChild(outer);
  return container;
}

// ...rest of your JS (fun fact, holidays, deaths, toggles, etc. as before)...
