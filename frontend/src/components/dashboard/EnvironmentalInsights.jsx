import React, { useState, useEffect } from 'react';
import { Cloud, Thermometer, Droplets, Sun, Wind, AlertCircle, RefreshCw, MapPin } from 'lucide-react';

// Default coordinates (Nashik, India) — can be overridden by geolocation
const DEFAULT_LAT = 19.9973;
const DEFAULT_LON = 73.791;

// Build API URLs with coordinates
function weatherUrl(lat, lon) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
}

function aqiUrl(lat, lon) {
  return `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=carbon_monoxide,nitrogen_dioxide,uv_index,uv_index_clear_sky,dust,sulphur_dioxide,ozone&domains=cams_global`;
}

// Compute a simple AQI-like index from pollutant concentrations
function computeAQI(data) {
  if (!data) return null;
  // Simplified AQI based on PM-like dust and other pollutants
  // Using a weighted approach with WHO guideline thresholds
  const dust = data.dust || 0;
  const no2 = data.nitrogen_dioxide || 0;
  const o3 = data.ozone || 0;
  const so2 = data.sulphur_dioxide || 0;
  const co = data.carbon_monoxide || 0;

  // Normalize each to a 0-500 scale based on rough breakpoints
  const dustIdx = Math.min(500, (dust / 150) * 100);
  const no2Idx = Math.min(500, (no2 / 200) * 100);
  const o3Idx = Math.min(500, (o3 / 180) * 100);
  const so2Idx = Math.min(500, (so2 / 350) * 100);
  const coIdx = Math.min(500, (co / 10000) * 100);

  // AQI = max of individual indices (standard approach)
  return Math.round(Math.max(dustIdx, no2Idx, o3Idx, so2Idx, coIdx));
}

function getAqiStatus(aqi) {
  if (aqi <= 50) return { label: 'Good', color: 'var(--color-success)', bg: 'rgba(16,185,129,0.08)' };
  if (aqi <= 100) return { label: 'Moderate', color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.08)' };
  if (aqi <= 150) return { label: 'Unhealthy (Sensitive)', color: '#F97316', bg: 'rgba(249,115,22,0.08)' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'var(--color-danger)', bg: 'rgba(239,68,68,0.08)' };
  return { label: 'Hazardous', color: '#7C2D12', bg: 'rgba(124,45,18,0.08)' };
}

function getTempStatus(temp) {
  if (temp < 10) return { label: 'Cold', color: '#0EA5E9' };
  if (temp < 20) return { label: 'Cool', color: 'var(--color-accent)' };
  if (temp <= 30) return { label: 'Comfortable', color: 'var(--color-success)' };
  if (temp <= 38) return { label: 'Warm', color: 'var(--color-warning)' };
  return { label: 'Hot', color: 'var(--color-danger)' };
}

function getHumidityStatus(hum) {
  if (hum < 30) return { label: 'Dry', color: 'var(--color-warning)' };
  if (hum <= 60) return { label: 'Comfortable', color: 'var(--color-success)' };
  return { label: 'Humid', color: 'var(--color-accent)' };
}

function getUVStatus(uv) {
  if (uv <= 2) return { label: 'Low', color: 'var(--color-success)' };
  if (uv <= 5) return { label: 'Moderate', color: 'var(--color-warning)' };
  if (uv <= 7) return { label: 'High', color: '#F97316' };
  return { label: 'Very High', color: 'var(--color-danger)' };
}

function generateInsight(aqi, temp, humidity, uv) {
  const parts = [];
  
  if (aqi !== null) {
    if (aqi <= 50) parts.push("Air quality is excellent — great for outdoor exercise.");
    else if (aqi <= 100) parts.push("Air quality is moderate. Sensitive individuals should limit prolonged outdoor exertion.");
    else parts.push("Air quality is poor. Consider indoor activities and wear a mask if going outdoors.");
  }
  
  if (temp !== null) {
    if (temp > 35) parts.push("High temperature — stay hydrated and avoid peak sun hours.");
    else if (temp < 10) parts.push("Cold conditions — dress in layers and warm up before exercising.");
  }
  
  if (humidity !== null) {
    if (humidity > 70) parts.push("High humidity may make exercise feel harder. Hydrate frequently.");
    else if (humidity < 30) parts.push("Low humidity — drink extra water to stay hydrated.");
  }
  
  if (uv !== null && uv > 5) {
    parts.push(`UV index is ${uv > 7 ? 'very high' : 'high'} — apply sunscreen if going outdoors.`);
  }
  
  return parts.length > 0 ? parts.join(" ") : "Environmental conditions are favorable for outdoor activities today.";
}

export default function EnvironmentalInsights() {
  const [weather, setWeather] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const [weatherRes, aqiRes] = await Promise.all([
        fetch(weatherUrl(lat, lon)),
        fetch(aqiUrl(lat, lon))
      ]);
      
      if (!weatherRes.ok || !aqiRes.ok) throw new Error("API request failed");

      const wData = await weatherRes.json();
      const aData = await aqiRes.json();
      
      setWeather(wData);
      setAirQuality(aData);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load environmental data");
      console.error("Environmental API error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get user location + fetch data
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(4);
          const lon = pos.coords.longitude.toFixed(4);
          setCoords({ lat, lon });
          fetchData(lat, lon);
        },
        () => {
          // Geolocation denied — use defaults
          fetchData(DEFAULT_LAT, DEFAULT_LON);
        },
        { timeout: 5000 }
      );
    } else {
      fetchData(DEFAULT_LAT, DEFAULT_LON);
    }
  }, []);

  // Extract values
  const temp = weather?.current?.temperature_2m ?? null;
  const humidity = weather?.current?.relative_humidity_2m ?? null;
  const tempMax = weather?.daily?.temperature_2m_max?.[0] ?? null;
  const tempMin = weather?.daily?.temperature_2m_min?.[0] ?? null;
  const uv = airQuality?.current?.uv_index ?? null;
  const aqiData = airQuality?.current || null;
  const aqi = computeAQI(aqiData);

  const aqiStatus = aqi !== null ? getAqiStatus(aqi) : null;
  const tempStatus = temp !== null ? getTempStatus(temp) : null;
  const humStatus = humidity !== null ? getHumidityStatus(humidity) : null;
  const uvStatus = uv !== null ? getUVStatus(uv) : null;

  // Loading state
  if (loading) {
    return (
      <div className="card fade-in" style={{ minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
          <p style={{ fontSize: 12, fontWeight: 500 }}>Loading environmental data...</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="card fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-warning)', fontSize: 13, fontWeight: 500 }}>
          <AlertCircle size={16} />
          {error}
          <button onClick={() => fetchData(coords.lat, coords.lon)}
            style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Environmental Context</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={10} /> Live data
            {lastUpdated && <> · Updated {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</>}
          </p>
        </div>
        <button onClick={() => fetchData(coords.lat, coords.lon)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
          title="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Main metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        {/* AQI */}
        <div className="pill-card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
            <Cloud size={14} />
            <span style={{ fontSize: 11, fontWeight: 600 }}>Air Quality</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: aqiStatus?.color || 'var(--text-primary)', lineHeight: 1 }}>
              {aqi ?? '—'}
            </span>
            {aqiStatus && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                background: aqiStatus.bg, color: aqiStatus.color
              }}>
                {aqiStatus.label}
              </span>
            )}
          </div>
        </div>

        {/* Temperature */}
        <div className="pill-card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
            <Thermometer size={14} />
            <span style={{ fontSize: 11, fontWeight: 600 }}>Temperature</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: tempStatus?.color || 'var(--text-primary)', lineHeight: 1 }}>
              {temp !== null ? `${Math.round(temp)}°` : '—'}
            </span>
            {tempMax !== null && tempMin !== null && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                {Math.round(tempMin)}° / {Math.round(tempMax)}°
              </span>
            )}
          </div>
          {tempStatus && <span style={{ fontSize: 10, fontWeight: 600, color: tempStatus.color }}>{tempStatus.label}</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Humidity */}
        <div className="pill-card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
            <Droplets size={14} />
            <span style={{ fontSize: 11, fontWeight: 600 }}>Humidity</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: humStatus?.color || 'var(--text-primary)', lineHeight: 1 }}>
              {humidity !== null ? `${humidity}%` : '—'}
            </span>
          </div>
          {humStatus && <span style={{ fontSize: 10, fontWeight: 600, color: humStatus.color }}>{humStatus.label}</span>}
        </div>

        {/* UV Index */}
        <div className="pill-card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
            <Sun size={14} />
            <span style={{ fontSize: 11, fontWeight: 600 }}>UV Index</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: uvStatus?.color || 'var(--text-primary)', lineHeight: 1 }}>
              {uv !== null ? uv.toFixed(1) : '—'}
            </span>
          </div>
          {uvStatus && <span style={{ fontSize: 10, fontWeight: 600, color: uvStatus.color }}>{uvStatus.label}</span>}
        </div>
      </div>

      {/* Pollutant details (compact) */}
      {aqiData && (
        <div style={{
          marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap'
        }}>
          {[
            { label: 'CO', val: aqiData.carbon_monoxide, unit: 'μg/m³' },
            { label: 'NO₂', val: aqiData.nitrogen_dioxide, unit: 'μg/m³' },
            { label: 'O₃', val: aqiData.ozone, unit: 'μg/m³' },
            { label: 'SO₂', val: aqiData.sulphur_dioxide, unit: 'μg/m³' },
            { label: 'Dust', val: aqiData.dust, unit: 'μg/m³' },
          ].filter(p => p.val !== undefined).map(p => (
            <span key={p.label} style={{
              fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
              background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)'
            }}>
              {p.label}: {typeof p.val === 'number' ? p.val.toFixed(1) : p.val}
            </span>
          ))}
        </div>
      )}

      {/* AI Insight */}
      <div style={{
        marginTop: 12, padding: '10px 12px', background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5
      }}>
        <strong>Insight:</strong> {generateInsight(aqi, temp, humidity, uv)}
      </div>
    </div>
  );
}
