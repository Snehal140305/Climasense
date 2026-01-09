import React, { useEffect, useRef, useState } from "react";
import "./Weather.css";
import search_icon from "../assets/search.png";
import clear_icon from "../assets/clear.png";
import cloud_icon from "../assets/cloud.png";
import drizzle_icon from "../assets/drizzle.png";
import rain_icon from "../assets/rain.png";
import snow_icon from "../assets/snow.png";
import wind_icon from "../assets/wind.png";
import humidity_icon from "../assets/humidity.png";

const Weather = () => {
  const inputRef = useRef();

  const [weatherData, setWeatherData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("C");
  const [history, setHistory] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [advice, setAdvice] = useState("");
  const [graph, setGraph] = useState([]);

  const allIcons = {
    "01d": clear_icon,
    "01n": clear_icon,
    "02d": cloud_icon,
    "02n": cloud_icon,
    "03d": cloud_icon,
    "03n": cloud_icon,
    "04d": drizzle_icon,
    "04n": drizzle_icon,
    "09d": rain_icon,
    "09n": rain_icon,
    "10d": rain_icon,
    "10n": rain_icon,
    "13d": snow_icon,
    "13n": snow_icon,
  };

  const generateGraph = (temp) => {
    const base = temp - 4;
    const points = [];
    for (let i = 0; i < 8; i++) {
      points.push(base + i);
    }
    setGraph(points);
  };

  const search = async (city) => {
    if (!city) return setErrorMsg("Enter city name");

    try {
      setLoading(true);
      setErrorMsg("");

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${
        import.meta.env.VITE_APP_ID
      }`;
      const response = await fetch(url);
      const data = await response.json();
      setLoading(false);

      if (!response.ok) return setErrorMsg(data.message);

      const icon = allIcons[data.weather[0].icon] || clear_icon;

      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temperature: Math.round(data.main.temp),
        location: data.name,
        icon: icon,
      });

      generateGraph(Math.round(data.main.temp));

      const condition = data.weather[0].description.toLowerCase();

      if (
        condition.includes("rain") ||
        condition.includes("drizzle") ||
        condition.includes("thunder")
      )
        setAdvice("Rain expected – carry umbrella ☔");
      else if (data.main.temp < 10)
        setAdvice("Cold weather – keep yourself warm 🧥");
      else if (data.main.temp > 35)
        setAdvice("High heat today – stay hydrated 💧");
      else if (data.wind.speed > 20)
        setAdvice("Strong winds – drive carefully 🌬️");
      else if (data.main.humidity > 80)
        setAdvice("High humidity – expect discomfort 😓");
      else setAdvice("Pleasant climate – enjoy your day 🌤️");

      setHistory((prev) =>
        [city, ...prev.filter((c) => c !== city)].slice(0, 5)
      );
    } catch (err) {
      setLoading(false);

      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to fetch weather");
      }
    }
  };

  useEffect(() => {
    search("Pune");
  }, []);

  const temp =
    unit === "C"
      ? weatherData?.temperature
      : Math.round((weatherData?.temperature * 9) / 5 + 32);

  return (
    <div className="weather">
      <div className="search-bar">
        <input ref={inputRef} type="text" placeholder="Search city" />
        <img src={search_icon} onClick={() => search(inputRef.current.value)} />
      </div>

      <div className="history">
        {history.map((c, i) => (
          <span key={i} onClick={() => search(c)}>
            {c}
          </span>
        ))}
      </div>

      {loading && <p className="loading">Fetching weather...</p>}
      {errorMsg && <p className="error">{errorMsg}</p>}

      {weatherData && !loading && (
        <>
          <img src={weatherData.icon} className="weather-icon" />
          <p className="temperature">
            {temp}° {unit}
          </p>

          <p className="advice">{advice}</p>

          <div className="graph">
            {graph.map((h, i) => (
              <div
                key={i}
                className="bar"
                style={{ height: `${h * 2}px` }}
              ></div>
            ))}
          </div>

          <button
            className="unit-btn"
            onClick={() => setUnit(unit === "C" ? "F" : "C")}
          >
            Switch to °{unit === "C" ? "F" : "C"}
          </button>

          <p className="location">{weatherData.location}</p>

          <div className="weather-data">
            <div className="col">
              <img src={humidity_icon} />
              <div>
                <p>{weatherData.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className="col">
              <img src={wind_icon} />
              <div>
                <p>{weatherData.windSpeed} Km/hr</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Weather;
