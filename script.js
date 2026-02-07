const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherContainer = document.getElementById('weather-container');
const errorMessage = document.getElementById('error-message');
const loadingIndicator = document.getElementById('loading');

// DOM Elements for fetching data
const cityNameEl = document.getElementById('city-name');
const tempEl = document.getElementById('temperature');
const descriptionEl = document.getElementById('description');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const weatherIconEl = document.getElementById('weather-icon');

// WMO Weather interpretation codes (WW)
function getWeatherDescription(code) {
    const codes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };
    return codes[code] || 'Unknown';
}

// Function to get icon based on code (using simple logic for demo)
// In a real app, mapping to specific icon assets would be better
function getWeatherIcon(code) {
    // You can replace these with local assets or another icon service
    // Using OpenWeatherMap icons as placeholders for convenience if available, 
    // or just return emoji/text if no images. 
    // For this demo, I will use a generic placeholder service or emojis if images fail.
    // Let's use a free icon set logic or simple condition.

    // Simple mapping to Emoji or generic icons for this standalone demo
    // If you want actual images, we can fetch from a CDN like OpenWeatherMap's
    // 0: Clear -> 01d
    // 1-3: Clouds -> 02d, 03d, 04d
    // etc.

    // Mapping to an open icon CDN for better visuals
    if (code === 0) return 'https://openweathermap.org/img/wn/01d@4x.png';
    if (code >= 1 && code <= 3) return 'https://openweathermap.org/img/wn/03d@4x.png';
    if (code >= 45 && code <= 48) return 'https://openweathermap.org/img/wn/50d@4x.png'; // Fog
    if (code >= 51 && code <= 67) return 'https://openweathermap.org/img/wn/09d@4x.png'; // Rain
    if (code >= 71 && code <= 77) return 'https://openweathermap.org/img/wn/13d@4x.png'; // Snow
    if (code >= 80 && code <= 82) return 'https://openweathermap.org/img/wn/09d@4x.png'; // Showers
    if (code >= 95) return 'https://openweathermap.org/img/wn/11d@4x.png'; // Thunderstorm

    return 'https://openweathermap.org/img/wn/01d@4x.png';
}

async function getCoordinates(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
        throw new Error('City not found');
    }
    return data.results[0];
}

async function getWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather data fetch failed');
    return await response.json();
}

async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) return;

    // Reset UI
    errorMessage.classList.add('hidden');
    weatherContainer.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');

    try {
        const locationData = await getCoordinates(city);
        if (!locationData) throw new Error('City not found');
        const { latitude, longitude, name, country } = locationData;

        const weatherData = await getWeather(latitude, longitude);

        // Update UI
        updateUI(name, country, weatherData);

    } catch (error) {
        console.error(error);
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

function updateUI(city, country, data) {
    const current = data.current;

    cityNameEl.textContent = `${city}, ${country}`;
    tempEl.textContent = `${Math.round(current.temperature_2m)}°C`;
    descriptionEl.textContent = getWeatherDescription(current.weather_code);
    weatherIconEl.src = getWeatherIcon(current.weather_code);

    humidityEl.textContent = `${current.relative_humidity_2m}%`;
    windSpeedEl.textContent = `${current.wind_speed_10m} km/h`;

    weatherContainer.classList.remove('hidden');
}

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
