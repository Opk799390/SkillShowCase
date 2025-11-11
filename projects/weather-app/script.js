// Add your API key: get one from https://openweathermap.org/api
const API_KEY = '620b6d3211b40866e37637f582dfd757';

const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city');
const result = document.getElementById('result');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const geoBtn = document.getElementById('geo-btn');
const celsiusBtn = document.getElementById('celsius-btn');
const fahrenheitBtn = document.getElementById('fahrenheit-btn');
const toggleDark = document.getElementById('toggle-dark');

let isCelsius = true;
let lastData = null;

// Theme
const isDark = localStorage.getItem('dark-mode-weather') === 'true';
if (isDark) document.body.classList.add('dark-mode');
toggleDark.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('dark-mode-weather', document.body.classList.contains('dark-mode'));
});

// Unit toggle
celsiusBtn.addEventListener('click', () => {
  isCelsius = true;
  celsiusBtn.classList.add('active');
  fahrenheitBtn.classList.remove('active');
  if (lastData) displayWeather(lastData);
});

fahrenheitBtn.addEventListener('click', () => {
  isCelsius = false;
  fahrenheitBtn.classList.add('active');
  celsiusBtn.classList.remove('active');
  if (lastData) displayWeather(lastData);
});

function showLoading() {
  loading.classList.remove('hidden');
  result.classList.add('hidden');
  error.classList.add('hidden');
}

function showError(msg) {
  error.textContent = msg;
  error.classList.remove('hidden');
  loading.classList.add('hidden');
  result.classList.add('hidden');
}

function displayWeather(data) {
  lastData = data;
  const temp = isCelsius ? Math.round(data.main.temp) : Math.round(data.main.temp * 9/5 + 32);
  const feels = isCelsius ? Math.round(data.main.feels_like) : Math.round(data.main.feels_like * 9/5 + 32);
  const unit = isCelsius ? '°C' : '°F';

  document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('description').textContent = data.weather[0].description;
  document.getElementById('temp-value').textContent = temp;
  document.getElementById('temp-unit').textContent = unit;
  document.getElementById('feels-like').textContent = feels + unit;
  document.getElementById('humidity').textContent = data.main.humidity + '%';
  document.getElementById('wind').textContent = Math.round(data.wind.speed) + ' m/s';
  document.getElementById('pressure').textContent = data.main.pressure + ' hPa';

  loading.classList.add('hidden');
  result.classList.remove('hidden');
  error.classList.add('hidden');
}

async function fetchWeather(city) {
  if (!API_KEY) {
    showError('⚠️ No API key configured. Please add your OpenWeatherMap API key to script.js');
    return;
  }

  showLoading();
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('City not found');
    const data = await res.json();
    displayWeather(data);
  } catch (err) {
    showError('❌ ' + err.message);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  if (!API_KEY) {
    showError('⚠️ No API key configured.');
    return;
  }

  showLoading();
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to get weather');
    const data = await res.json();
    displayWeather(data);
  } catch (err) {
    showError('❌ ' + err.message);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  fetchWeather(city);
  cityInput.value = '';
});

geoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showError('Geolocation not supported');
    return;
  }
  showLoading();
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    () => {
      showError('❌ Unable to get your location');
    }
  );
});
