let isCelsius = true;
let currentLat, currentLon;

document.getElementById("celsius").onclick = () => setUnit(true);
document.getElementById("fahrenheit").onclick = () => setUnit(false);

function setUnit(celsius) {
  isCelsius = celsius;
  document.getElementById("celsius").classList.toggle("active", celsius);
  document.getElementById("fahrenheit").classList.toggle("active", !celsius);
  if (currentLat && currentLon) {
    fetchWeather(currentLat, currentLon);
  }
}

async function searchWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) return;

  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();

  if (!geoData.results) {
    alert("City not found!");
    return;
  }

  const { latitude, longitude, name, country } = geoData.results[0];
  currentLat = latitude;
  currentLon = longitude;

  document.getElementById("location").innerText = `${name}, ${country}`;
  fetchWeather(latitude, longitude);
}

async function fetchWeather(lat, lon) {
  const unit = isCelsius ? "celsius" : "fahrenheit";
  const windUnit = isCelsius ? "kmh" : "mph";

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=${unit}&windspeed_unit=${windUnit}`;

  const res = await fetch(url);
  const data = await res.json();

  displayCurrent(data);
  displayHourly(data);
  displayDaily(data);
}

function displayCurrent(data) {
  const current = data.current_weather;
  document.getElementById("temperature").innerText = `${current.temperature}°`;
  document.getElementById("wind").innerText = current.windspeed;
  document.getElementById("humidity").innerText = "--";
  document.getElementById("description").innerText = "Current Weather";
}

function displayHourly(data) {
  const hourlyDiv = document.getElementById("hourly");
  hourlyDiv.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    const box = document.createElement("div");
    box.className = "hour-box";
    box.innerHTML = `
      <div>${data.hourly.time[i].slice(11,16)}</div>
      <div>${data.hourly.temperature_2m[i]}°</div>
    `;
    hourlyDiv.appendChild(box);
  }
}

function displayDaily(data) {
  const dailyDiv = document.getElementById("daily");
  dailyDiv.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const box = document.createElement("div");
    box.className = "day-box";
    box.innerHTML = `
      <div>${new Date(data.daily.time[i]).toLocaleDateString("en-US",{weekday:"short"})}</div>
      <div>${data.daily.temperature_2m_max[i]}°</div>
      <div>${data.daily.temperature_2m_min[i]}°</div>
    `;
    dailyDiv.appendChild(box);
  }
}