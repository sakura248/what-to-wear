import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import MediaQuery from "react-responsive";
import "./App.css";
import CurrentInfo from "./components/CurrentInfo/CurrentInfo";
import CurrentWeatherDetails from "./components/CurrentWeather/CurrentWeatherDetails";
import HourlyWeatherList from "./components/HourlyWeather/HourlyWeatherList";
import SearchCityForm from "./components/Search/SearchCityForm";
import WeeklyWeatherList from "./components/WeeklyWeather/WeeklyWeatherList";

export const GeoContext = createContext();

export function App() {
  const [location, setLocation] = useState({});
  const [searchedData, setSearchedData] = useState([]);
  const [city, setCity] = useState("");

  useEffect(() => {
    const firstGetCity = async () => {
      navigator.geolocation.getCurrentPosition((position) => {
        const currentLat = position.coords.latitude;
        const currentLong = position.coords.longitude;
        setLocation({ ...location, lat: currentLat, long: currentLong });
        // setLat(currentLat);
        // setLong(currentLong);
        console.log("location info", location.lat, location.long);
      });
      const url = `${process.env.REACT_APP_API_URL}/weather/?lat=${location.lat}&lon=${location.long}&units=metric&APPID=${process.env.REACT_APP_API_KEY}`;
      const result = await fetch(url);
      try {
        const json = await result.json();
        if (json.cod === "404") {
          alert("City Not Found!");
        }
        if (json.cod === 200) {
          setSearchedData(json);
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (location) {
      firstGetCity();
    }
  }, []);

  const searchSetCity = async (e) => {
    e.preventDefault();
    const newCity = document.querySelector("#cityName").value;
    setCity(newCity);
    console.log("newCity : ", newCity);

    await axios
      .get(
        `${process.env.REACT_APP_API_URL}/weather/?q=${city}&units=metric&APPID=${process.env.REACT_APP_API_KEY}`
      )
      .then((res) => {
        if (res.cod === "404") {
          alert("City Not Found!");
        }
        if (res.statusText === "OK") {
          setSearchedData(res.data);
          console.log("search city: ", searchedData);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="App">
      <div className="left-side">
        <MediaQuery query="(max-width: 499px)">
          <SearchCityForm
            searchSetCity={searchSetCity}
            className="search-city-info"
          />
          <CurrentInfo weatherData={searchedData} className="current-info" />
        </MediaQuery>
        {typeof searchedData.main !== "undefined" ? (
          <CurrentWeatherDetails weatherData={searchedData} />
        ) : (
          <div>reading error</div>
        )}
        <GeoContext.Provider value={location}>
          {typeof searchedData.main !== "undefined" ? (
            searchedData && (
              <HourlyWeatherList city={searchedData} location={location} />
            )
          ) : (
            <div>reading error</div>
          )}
        </GeoContext.Provider>
      </div>
      <div className="right-side">
        <MediaQuery query="(min-width: 500px)">
          <CurrentInfo weatherData={searchedData} className="current-info" />
          <SearchCityForm
            searchSetCity={searchSetCity}
            className="search-city-info"
          />
          <WeeklyWeatherList location={location} />
        </MediaQuery>
      </div>
    </div>
  );
}

export default App;