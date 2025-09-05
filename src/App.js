// WeatherNow – React (Tailwind styled, polished UI)
// -----------------------------------------------
// Copy into `App.jsx` inside a React + Vite + Tailwind project.

import React, { useEffect, useState } from "react";

const API_URL = "https://api.open-meteo.com/v1/forecast";
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";

function WeatherNow() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("C");

  // Fetch city suggestions
  useEffect(() => {
    if (query.length < 2) return;
    const timeout = setTimeout(async () => {
      const res = await fetch(
        `${GEO_URL}?name=${query}&count=5&language=en&format=json`
      );
      const data = await res.json();
      setSuggestions(data.results || []);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  // Fetch weather data
  const fetchWeather = async (lat, lon, name) => {
    setLoading(true);
    setWeather(null);
    try {
      const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current_weather: true,
        hourly: "temperature_2m,weathercode",
        daily: "temperature_2m_max,temperature_2m_min,weathercode",
        timezone: "auto",
      });
      const res = await fetch(`${API_URL}?${params.toString()}`);
      const data = await res.json();
      setWeather({ ...data, city: name });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Convert temperature
  const formatTemp = (t) =>
    unit === "C" ? `${t}°C` : `${Math.round((t * 9) / 5 + 32)}°F`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 to-blue-500 flex flex-col items-center p-6 text-slate-900">
      <h1 className="text-3xl font-bold mb-6 drop-shadow">🌤️ WeatherNow</h1>

      {/* Search box */}
      <div className="w-full max-w-md relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city..."
          className="w-full p-3 rounded-xl border shadow focus:ring-2 focus:ring-sky-400"
        />
        {suggestions.length > 0 && (
          <div className="absolute mt-2 w-full bg-white rounded-xl shadow-lg overflow-hidden z-10">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  fetchWeather(s.latitude, s.longitude, s.name);
                  setSuggestions([]);
                  setQuery(s.name);
                }}
                className="w-full text-left px-4 py-2 hover:bg-sky-100"
              >
                {s.name}, {s.country}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Unit toggle */}
      <button
        onClick={() => setUnit(unit === "C" ? "F" : "C")}
        className="mb-6 px-4 py-2 rounded-full bg-white shadow hover:bg-slate-100"
      >
        Toggle °{unit}
      </button>

      {/* Weather card */}
      {loading && <div className="text-lg">Loading...</div>}

      {weather && !loading && (
        <div className="w-full max-w-2xl space-y-6">
          {/* Current */}
          <div className="p-6 rounded-2xl bg-white/80 shadow">
            <h2 className="text-xl font-semibold mb-2">{weather.city}</h2>
            <p className="text-4xl font-bold">
              {formatTemp(weather.current_weather.temperature)}
            </p>
            <p className="mt-2 opacity-70">
              {weather.current_weather.weathercode} ·{" "}
              {weather.current_weather.windspeed} km/h wind
            </p>
          </div>

          {/* Hourly */}
          <div className="p-6 rounded-2xl bg-white/80 shadow">
            <h3 className="text-lg font-semibold mb-2">Next Hours</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {weather.hourly.time.slice(0, 12).map((t, i) => (
                <div
                  key={i}
                  className="min-w-[80px] p-3 rounded-xl bg-sky-50 text-center"
                >
                  <div className="text-sm opacity-70">
                    {new Date(t).getHours()}:00
                  </div>
                  <div className="text-lg font-bold">
                    {formatTemp(weather.hourly.temperature_2m[i])}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily */}
          <div className="p-6 rounded-2xl bg-white/80 shadow">
            <h3 className="text-lg font-semibold mb-2">7-Day Forecast</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {weather.daily.time.map((d, i) => (
                <div key={i} className="p-3 rounded-xl bg-sky-50 text-center">
                  <div className="text-sm opacity-70">
                    {new Date(d).toLocaleDateString([], { weekday: "short" })}
                  </div>
                  <div className="text-lg font-bold">
                    {formatTemp(weather.daily.temperature_2m_max[i])}
                  </div>
                  <div className="text-sm opacity-70">
                    {formatTemp(weather.daily.temperature_2m_min[i])}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherNow;
