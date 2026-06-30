import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/* Live local time plus current weather, for both my city (Auckland) and the
   visitor's, with a small animated weather icon. Weather comes from the free,
   key-less Open-Meteo API; visitor location from ipwho.is with a graceful
   fallback to just my side if it is unavailable. */

const HOME = { tz: "Pacific/Auckland", city: "Auckland", lat: -36.8485, lon: 174.7633 };

function timeIn(tz, h12) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", hour12: h12, timeZone: tz }).format(new Date());
}
function zoneCity(tz) {
  const part = tz.split("/").pop() || tz;
  return part.replace(/_/g, " ");
}

async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day`;
  const r = await fetch(url);
  const j = await r.json();
  return { temp: Math.round(j.current.temperature_2m), code: j.current.weather_code, day: j.current.is_day === 1 };
}
async function getVisitor() {
  const r = await fetch("https://ipwho.is/");
  const j = await r.json();
  if (!j || j.success === false) throw new Error("geo unavailable");
  return { lat: j.latitude, lon: j.longitude, city: j.city };
}

function classify(code, day) {
  if (code === 0) return day ? "clearDay" : "clearNight";
  if (code <= 3) return "clouds";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "thunder";
  return "clouds";
}
const LABEL = { clearDay: "Clear", clearNight: "Clear", clouds: "Cloudy", fog: "Fog", rain: "Rain", snow: "Snow", thunder: "Storm" };

function WeatherIcon({ kind }) {
  const a = "var(--accent)";
  const ink = "var(--ink)";
  if (kind === "clearDay")
    return (
      <svg viewBox="0 0 40 40" width="34" height="34" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round">
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} style={{ originX: "20px", originY: "20px" }}>
          {[...Array(8)].map((_, i) => (<line key={i} x1="20" y1="4" x2="20" y2="9" transform={`rotate(${i * 45} 20 20)`} />))}
        </motion.g>
        <motion.circle cx="20" cy="20" r="6.5" fill={a} stroke="none" animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "20px", originY: "20px" }} />
      </svg>
    );
  if (kind === "clearNight")
    return (
      <svg viewBox="0 0 40 40" width="34" height="34" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round">
        <path d="M26 24a9 9 0 1 1-9-13 7 7 0 0 0 9 13z" fill={a} stroke="none" />
        {[[31, 12], [9, 9], [33, 22]].map(([x, y], i) => (
          <motion.circle key={i} cx={x} cy={y} r="1" fill={ink} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.5 }} />
        ))}
      </svg>
    );
  if (kind === "rain" || kind === "snow")
    return (
      <svg viewBox="0 0 40 40" width="34" height="34" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round">
        <path d="M12 22a6 6 0 0 1 .6-12 8 8 0 0 1 15 2 5 5 0 0 1-1.6 10H13" fill="none" />
        {[14, 20, 26].map((x, i) =>
          kind === "rain" ? (
            <motion.line key={i} x1={x} y1="26" x2={x - 2} y2="32" animate={{ opacity: [0, 1, 0], y: [0, 5, 9] }} transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.25 }} />
          ) : (
            <motion.circle key={i} cx={x} cy="29" r="1.4" fill={a} stroke="none" animate={{ opacity: [0, 1, 0], y: [0, 6, 10] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }} />
          )
        )}
      </svg>
    );
  if (kind === "thunder")
    return (
      <svg viewBox="0 0 40 40" width="34" height="34" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round">
        <path d="M12 22a6 6 0 0 1 .6-12 8 8 0 0 1 15 2 5 5 0 0 1-1.6 10H13" fill="none" />
        <motion.path d="M21 24l-4 6h4l-3 6" fill="none" stroke={a} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity }} />
      </svg>
    );
  if (kind === "fog")
    return (
      <svg viewBox="0 0 40 40" width="34" height="34" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round">
        {[14, 20, 26].map((y, i) => (
          <motion.line key={i} x1="8" y1={y} x2="32" y2={y} animate={{ x: [-3, 3, -3], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }} />
        ))}
      </svg>
    );
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round">
      <motion.path d="M12 26a6 6 0 0 1 .6-13 8 8 0 0 1 15 2 5 5 0 0 1-1.6 11H13" animate={{ x: [-1.5, 1.5, -1.5] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
    </svg>
  );
}

function Side({ label, city, time, weather }) {
  return (
    <div className="ws-side">
      <div className="ws-icon">{weather ? <WeatherIcon kind={weather.kind} /> : <span className="ws-skel" />}</div>
      <div className="ws-text">
        <span className="ws-time">{time}</span>
        <span className="ws-sub">{label} · {city}{weather ? ` · ${weather.temp}° ${LABEL[weather.kind]}` : ""}</span>
      </div>
    </div>
  );
}

export default function WorldStrip() {
  const [, tick] = useState(0);
  const [h12, setH12] = useState(true);
  const [mine, setMine] = useState(null);
  const [yours, setYours] = useState(null);
  const [yourCity, setYourCity] = useState(zoneCity(Intl.DateTimeFormat().resolvedOptions().timeZone));

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 20000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let live = true;
    getWeather(HOME.lat, HOME.lon).then((w) => live && setMine({ ...w, kind: classify(w.code, w.day) })).catch(() => {});
    getVisitor()
      .then(async (v) => {
        if (!live) return;
        if (v.city) setYourCity(v.city);
        const w = await getWeather(v.lat, v.lon);
        if (live) setYours({ ...w, kind: classify(w.code, w.day) });
      })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  const yourTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="worldstrip">
      <Side label="my time" city={HOME.city} time={timeIn(HOME.tz, h12)} weather={mine} />
      <Side label="your time" city={yourCity} time={timeIn(yourTz, h12)} weather={yours} />
      <button className="ws-fmt" onClick={() => setH12((v) => !v)} aria-label="Toggle 12 or 24 hour clock">{h12 ? "12h" : "24h"}</button>
    </div>
  );
}
