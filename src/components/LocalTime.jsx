import { useEffect, useState } from "react";

const HOME_TZ = "Pacific/Auckland";

function fmt(tz, h12) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", hour12: h12, timeZone: tz }).format(new Date());
}
function zoneShort(tz) {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
    .formatToParts(new Date()).find((x) => x.type === "timeZoneName");
  return p ? p.value : tz.split("/").pop();
}
function minutesIn(tz) {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  return d.getHours() * 60 + d.getMinutes();
}
function offset(home, you) {
  let diff = minutesIn(home) - minutesIn(you);
  if (diff > 720) diff -= 1440;
  if (diff < -720) diff += 1440;
  if (diff === 0) return "same time as you";
  const ah = Math.floor(Math.abs(diff) / 60), am = Math.abs(diff) % 60;
  const span = am ? `${ah}h ${am}m` : `${ah}h`;
  return `${span} ${diff > 0 ? "ahead of you" : "behind you"}`;
}

export default function LocalTime() {
  const [, tick] = useState(0);
  const [h12, setH12] = useState(true);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);
  const you = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <div className="tz">
      <button className="fmt" onClick={() => setH12((v) => !v)} aria-label="Toggle 12/24 hour">{h12 ? "12h" : "24h"}</button>
      <div className="tz-col"><span className="tz-time">{fmt(HOME_TZ, h12)}</span><span className="tz-sub">my time · Auckland</span></div>
      <span className="dash">·</span>
      <div className="tz-col"><span className="tz-time">{fmt(you, h12)}</span><span className="tz-sub">your time · {zoneShort(you)}</span></div>
      <span className="dash">·</span>
      <span className="muted">{offset(HOME_TZ, you)}</span>
    </div>
  );
}
