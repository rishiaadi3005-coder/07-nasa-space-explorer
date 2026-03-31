// ── DOM references ──────────────────────────────────────────────────
const startInput = document.getElementById('startDate');
const endInput   = document.getElementById('endDate');
const btn        = document.querySelector('.filters button');
const gallery    = document.getElementById('gallery');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// − Default to a range of 9 days (from 9 days ago to today)
// − Restrict dates to NASA's APOD image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// ── NASA API Key ─────────────────────────────────────────────────────
const API_KEY = 'DEMO_KEY';

// ── LevelUp: Random Space Fact ───────────────────────────────────────
const spaceFacts = [
  "The Sun accounts for 99.86% of the mass in our solar system.",
  "A day on Venus is longer than a year on Venus.",
  "Neutron stars can spin at 600 rotations per second.",
  "The Milky Way galaxy contains an estimated 100–400 billion stars.",
  "Light from the Sun takes about 8 minutes to reach Earth.",
  "There are more stars in the universe than grains of sand on Earth.",
  "The largest known star, UY Scuti, is 1,700 times wider than our Sun.",
  "A teaspoon of neutron star material would weigh about 10 million tons.",
  "Saturn's rings are made mostly of ice and rock, some particles as large as houses.",
  "The Voyager 1 spacecraft is the most distant human-made object ever."
];

function showSpaceFact() {
  const factBox = document.getElementById('space-fact-box');
  if (!factBox) return;
  const fact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  factBox.textContent = '\u2728 Did You Know? ' + fact;
}
showSpaceFact();

// ── Modal ─────────────────────────────────────────────────────────────
function openModal(item) {
  const overlay = document.getElementById('modal-overlay');
  const modalImg = document.getElementById('modal-img');
  const modalVideo = document.getElementById('modal-video');
  const modalTitle = document.getElementById('modal-title');
  const modalDate = document.getElementById('modal-date');
  const modalExplanation = document.getElementById('modal-explanation');

  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;

  if (item.media_type === 'video') {
    modalImg.style.display = 'none';
    modalVideo.style.display = 'block';
    // Convert YouTube watch URL to embed URL if needed
    let videoSrc = item.url;
    if (videoSrc.includes('youtube.com/watch')) {
      videoSrc = videoSrc.replace('watch?v=', 'embed/');
    } else if (videoSrc.includes('youtu.be/')) {
      videoSrc = videoSrc.replace('youtu.be/', 'youtube.com/embed/');
    }
    modalVideo.src = videoSrc;
  } else {
    modalVideo.style.display = 'none';
    modalVideo.src = '';
    modalImg.style.display = 'block';
    modalImg.src = item.hdurl || item.url;
    modalImg.alt = item.title;
  }

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  const modalVideo = document.getElementById('modal-video');
  overlay.classList.remove('active');
  modalVideo.src = '';
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('modal-close');
  const overlay  = document.getElementById('modal-overlay');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay)  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});

// ── Build gallery item ────────────────────────────────────────────────
function createGalleryItem(item) {
  const card = document.createElement('div');
  card.className = 'gallery-item';

  if (item.media_type === 'video') {
    // LevelUp: Handle APOD video entries
    const thumb = document.createElement('div');
    thumb.className = 'video-thumb';
    thumb.innerHTML = `
      <div class="play-icon">&#9654;</div>
      <p class="video-label">Video Entry</p>
    `;
    card.appendChild(thumb);
  } else {
    const img = document.createElement('img');
    img.src = item.url;
    img.alt = item.title;
    img.loading = 'lazy';
    card.appendChild(img);
  }

  const info = document.createElement('div');
  info.className = 'gallery-info';
  info.innerHTML = `<h3>${item.title}</h3><p>${item.date}</p>`;
  card.appendChild(info);

  card.addEventListener('click', () => openModal(item));
  return card;
}

// ── Fetch and display APOD data ───────────────────────────────────────
btn.addEventListener('click', async () => {
  const start = startInput.value;
  const end   = endInput.value;

  if (!start || !end) {
    alert('Please select both a start and end date.');
    return;
  }

  // Show loading message
  gallery.innerHTML = '<p class="loading-msg">\uD83D\uDD04 Loading space photos\u2026</p>';

  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${start}&end_date=${end}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : [data];

    // Clear gallery and build new items
    gallery.innerHTML = '';
    items.forEach(item => {
      gallery.appendChild(createGalleryItem(item));
    });

    if (items.length === 0) {
      gallery.innerHTML = '<p>No images found for this date range.</p>';
    }
  } catch (err) {
    gallery.innerHTML = `<p class="error-msg">\u274C Error fetching images: ${err.message}</p>`;
    console.error(err);
  }
});
