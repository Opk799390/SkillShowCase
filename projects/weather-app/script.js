// Note: Store API key securely in a backend or environment variable in production
const API_KEY = '620b6d3211b40866e37637f582dfd757';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const cache = new Map();

const elements = {
  form: document.getElementById('weather-form'),
  cityInput: document.getElementById('city'),
  result: document.getElementById('result'),
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  geoBtn: document.getElementById('geo-btn'),
  celsiusBtn: document.getElementById('celsius-btn'),
  fahrenheitBtn: document.getElementById('fahrenheit-btn'),
  toggleDark: document.getElementById('toggle-dark')
};

let state = {
  isCelsius: true,
  lastData: null,
  lastQuery: null,
  lastFetchTime: 0
};

// Theme handling
const isDark = localStorage.getItem('dark-mode-weather') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches;
if (isDark) document.body.classList.add('dark-mode');

elements.toggleDark.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('dark-mode-weather', document.body.classList.contains('dark-mode'));
});

// Unit toggle
function toggleUnits(isCelsius) {
  state.isCelsius = isCelsius;
  elements.celsiusBtn.classList.toggle('active', isCelsius);
  elements.fahrenheitBtn.classList.toggle('active', !isCelsius);
  elements.celsiusBtn.setAttribute('aria-checked', isCelsius);
  elements.fahrenheitBtn.setAttribute('aria-checked', !isCelsius);
  if (state.lastData) displayWeather(state.lastData);
}

elements.celsiusBtn.addEventListener('click', () => toggleUnits(true));
elements.fahrenheitBtn.addEventListener('click', () => toggleUnits(false));

// Utility functions
function showLoading() {
  elements.loading.classList.remove('hidden');
  elements.result.classList.remove('show');
  elements.error.classList.add('hidden');
}

function showError(msg) {
  elements.error.textContent = msg;
  elements.error.classList.remove('hidden');
  elements.loading.classList.add('hidden');
  elements.result.classList.remove('show');
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

function displayWeather(data) {
  state.lastData = data;
  const temp = state.isCelsius ? Math.round(data.main.temp) : Math.round(data.main.temp * 9 / 5 + 32);
  const feels = state.isCelsius ? Math.round(data.main.feels_like) : Math.round(data.main.feels_like * 9 / 5 + 32);
  const unit = state.isCelsius ? '°C' : '°F';

  document.getElementById('city-name').textContent = `${capitalizeWords(data.name)}, ${data.sys.country}`;
  document.getElementById('description').textContent = capitalizeWords(data.weather[0].description);
  document.getElementById('temp-value').textContent = temp;
  document.getElementById('temp-unit').textContent = unit;
  document.getElementById('feels-like').textContent = `${feels}${unit}`;
  document.getElementById('humidity').textContent = `${data.main.humidity}%`;
  document.getElementById('wind').textContent = `${Math.round(data.wind.speed)} m/s`;
  document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
  document.getElementById('updated').textContent = `Updated: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  elements.loading.classList.add('hidden');
  elements.error.classList.add('hidden');
  elements.result.classList.add('show');
  gsap.fromTo(elements.result, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });
}

// API fetching
async function fetchWeather(city) {
  if (!API_KEY) {
    showError('⚠️ API key not configured');
    return;
  }

  const cacheKey = `city:${city.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    displayWeather(cached.data);
    return;
  }

  showLoading();
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status === 404 ? 'City not found' : 'Failed to fetch weather data');
    const data = await res.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    displayWeather(data);
  } catch (err) {
    showError(`❌ ${err.message}`);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  if (!API_KEY) {
    showError('⚠️ API key not configured');
    return;
  }

  const cacheKey = `coords:${lat},${lon}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    displayWeather(cached.data);
    return;
  }

  showLoading();
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch weather data');
    const data = await res.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    displayWeather(data);
  } catch (err) {
    showError(`❌ ${err.message}`);
  }
}

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Event listeners
elements.form.addEventListener('submit', e => {
  e.preventDefault();
  const city = elements.cityInput.value.trim();
  if (!city) return;
  state.lastQuery = city;
  fetchWeather(city);
  elements.cityInput.value = '';
});

elements.geoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showError('Geolocation not supported by your browser');
    return;
  }
  showLoading();
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    () => showError('❌ Unable to access your location')
  );
});

// Keyboard accessibility
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement === elements.cityInput) {
    elements.form.dispatchEvent(new Event('submit'));
  }
  if (e.key === 'Escape') {
    elements.cityInput.value = '';
    elements.cityInput.focus();
  }
});

// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.error('Service Worker registration failed:', err));
  });
}

// Initialize
elements.cityInput.focus();
