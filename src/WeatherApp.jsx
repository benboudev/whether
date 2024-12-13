import React, { useState, useEffect, useRef } from 'react';
import './index.css';

const WeatherApp = () => {
  const [weather, setWeather] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [zipCode, setZipCode] = useState('10952');
  const [inputZip, setInputZip] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  const [city, setCity] = useState('');
  const [scrollDirection, setScrollDirection] = useState('right'); // New state for scroll direction
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  console.log(currentTime);
  console.log(isScrolledToEnd);
  const forecastRef = useRef(null);
  const forecast15DayRef = useRef(null);

  const fetchCityName = async (zip) => {
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (!response.ok) throw new Error('Invalid ZIP code');
      const data = await response.json();
      setCity(data.places[0]['place name']);
    } catch (err) {
      setCity('Unknown');
    }
  };

  const fetchWeather = async (zip) => {
    setIsLoading(true);
    setError(null);
    try {
      const API_URL = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${zip}?unitGroup=us&key=ULYNZYXXX5TA9JDH3C7WNWMNQ&contentType=json`;
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Invalid ZIP code');
      const data = await response.json();
      setWeather(data);
      setSelectedDay(data.days[0]);
      fetchCityName(zip); // Fetch city name
    } catch (err) {
      setError('Please enter a valid US ZIP code');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(zipCode);
  }, [zipCode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputZip.length === 5 && !isNaN(inputZip)) {
      setZipCode(inputZip);
      setShowSearch(false);
    }
  };

  const handleScroll = (ref) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      const isEnd = Math.abs(scrollWidth - clientWidth - scrollLeft) < 1;
      setIsScrolledToEnd(isEnd);
    }
  };

  const handleScrollClick = (ref) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      const isEnd = Math.abs(scrollWidth - clientWidth - scrollLeft) < 1;
      setIsScrolledToEnd(isEnd);
      if (isEnd) {
        ref.current.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
        setScrollDirection('left'); // Update scroll direction
      } else {
        ref.current.scrollTo({
          left: scrollWidth,
          behavior: 'smooth'
        });
        setScrollDirection('left'); // Always set to 'left' after click
      }
    }
  };

  useEffect(() => {
    const forecastElement = forecastRef.current;
    const forecast15DayElement = forecast15DayRef.current;

    const handleScrollForecast = () => handleScroll(forecastRef);
    const handleScrollForecast15Day = () => handleScroll(forecast15DayRef);

    if (forecastElement) {
      forecastElement.addEventListener('scroll', handleScrollForecast);
    }
    if (forecast15DayElement) {
      forecast15DayElement.addEventListener('scroll', handleScrollForecast15Day);
    }

    return () => {
      if (forecastElement) {
        forecastElement.removeEventListener('scroll', handleScrollForecast);
      }
      if (forecast15DayElement) {
        forecast15DayElement.removeEventListener('scroll', handleScrollForecast15Day);
      }
    };
  }, []);

  const formatTime = (timeStr) => {
    const date = new Date(`2000-01-01T${timeStr}`);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const isTimePassed = (timeStr) => {
    const now = new Date();
    const time = new Date(`2000-01-01T${timeStr}`);
    return now.getHours() > time.getHours() || (now.getHours() === time.getHours() && now.getMinutes() > time.getMinutes());
  };

  const handleRefresh = () => {
    fetchWeather(zipCode);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading weather data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <form onSubmit={handleSubmit} className="error-form">
          <input
            type="text"
            value={inputZip}
            onChange={(e) => setInputZip(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter ZIP code"
            maxLength="5"
            pattern="[0-9]*"
          />
          <button type="submit">Try Again</button>
        </form>
      </div>
    );
  }

  if (!weather || !selectedDay) return null;

  const current = weather.days[0];
  const currentHour = weather.days[0].hours[new Date().getHours()];

  return (
    <div className="app">
      <div className="glass-container">
        <div className="location-search">
          <div className="search-container">
            <div className="current-location">
              <div className="location-text">
                <div className="current-zip">ZIP: {zipCode}</div>
                <div className="location-name">{city}</div>
              </div>
            </div>
            <button 
              className="change-location-btn"
              onClick={() => setShowSearch(!showSearch)}
            >
              {showSearch ? 'Cancel' : 'Change Location'}
            </button>
            
          </div>
          <button className="refresh-btn" onClick={handleRefresh}>
            Refresh Data
          </button>
          {showSearch && (
            <form onSubmit={handleSubmit} className="search-form">
              <div className="input-group">
                <input
                  type="text"
                  value={inputZip}
                  onChange={(e) => setInputZip(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter ZIP code"
                  maxLength="5"
                  pattern="[0-9]*"
                />
              </div>
              <button 
                type="submit"
                className={inputZip.length === 5 ? 'active' : ''}
                disabled={inputZip.length !== 5}
              >
                Update
              </button>
            </form>
          )}
          
        </div>
        <div className="main-weather">
          <div className="temp-display">
          <span className="current-time">{currentTime}</span> {/* Display current time */}
            <span className="temp">{Math.round(currentHour.temp)}°F</span>
            <span className="condition">{currentHour.conditions}</span>
          </div>

          <div className="sun-times-display">
            <div className="sunrise">
              <span className="sun-time">Sunrise {formatTime(current.sunrise)}</span>
            </div>
            <div className="sunset">
              <span className="sun-time">Sunset {formatTime(current.sunset)}</span>
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Feels Like</span>
              <span className="value">{Math.round(currentHour.feelslike)}°F</span>
            </div>
            <div className="detail-item">
              <span className="label">Humidity</span>
              <span className="value">{Math.round(currentHour.humidity)}%</span>
            </div>
            <div className="detail-item">
              <span className="label">Wind</span>
              <span className="value">{Math.round(currentHour.windspeed)} mph</span>
            </div>
            <div className="detail-item">
              <span className="label">UV Index</span>
              <span className="value">{currentHour.uvindex}</span>
            </div>
          </div>
        </div>

        {selectedDay.hours.some(hour => !isTimePassed(hour.datetime)) && (
          <div className="weekly-forecast">
            <h2>Daily Forecast</h2>
            <div className="forecast-scroll-wrapper">
              <div className="forecast-scroll-container" ref={forecastRef}>
                <div className="weekly-forecast-grid">
                  {selectedDay.hours.map((hour, index) => (
                    !isTimePassed(hour.datetime) && (
                      <div 
                        key={index} 
                        className={`forecast-day ${selectedDay.datetime === hour.datetime ? 'selected' : ''}`}
                      >
                        <span className="hour">{formatTime(hour.datetime)}</span>
                        <span className="condition">{hour.conditions}</span>
                        <span className="temp">{Math.round(hour.temp)}°F</span>
                      </div>
                    )
                  ))}
                </div>
                <button 
                  className={`scroll-indicator ${isScrolledToEnd ? 'scrolled' : ''}`} 
                  onClick={() => handleScrollClick(forecastRef)}
                >
                  <div>{scrollDirection === 'right' ? '← → ' : '← →'}</div>
                  <div className="scroll-text">
                    Scroll
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="weekly-forecast">
          <h2>15-Day Forecast</h2>
          <div className="forecast-scroll-wrapper">
            <div className="forecast-scroll-container" ref={forecast15DayRef}>
              <div className="weekly-forecast-grid">
                {weather.days.map((day, index) => (
                  <div 
                    key={index} 
                    className={`forecast-day ${selectedDay.datetime === day.datetime ? 'selected' : ''}`}
                    onClick={() => setSelectedDay(day)}
                  >
                    <span className="day">
                      {new Date(day.datetime).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div className="forecast-temps">
                      <span className="high">{Math.round(day.tempmax)}°</span>
                      <span className="low">{Math.round(day.tempmin)}°</span>
                    </div>
                    <span className="condition-small">{day.conditions}</span>
                    <div className="sun-times-small">
                      <div className="sunrise-small">
                        <span>{formatTime(day.sunrise)}</span>
                      </div>
                      <div className="sunset-small">
                        <span>{formatTime(day.sunset)}</span>
                      </div>
                    </div>
                    <div className="precipitation">
                      {day.precipprob > 0 && (
                        <span className="precip">{Math.round(day.precipprob)}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className={`scroll-indicator ${isScrolledToEnd ? 'scrolled' : ''}`} 
                onClick={() => handleScrollClick(forecast15DayRef)}
              >
                <div >{scrollDirection === 'right' ? '← → ' : '← →'}</div>
                <div className="scroll-text">
                  Scroll
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
