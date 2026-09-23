import { useEffect, useRef, useState } from "react";
import { createGame, aimVelocity, previewPath, BALL_R, START, HOOP, BOARD } from "../lib/hoopsPhysics.js";

/* ---------------------------------------------------------------------------
   Hoops: slingshot basketball, aimed the way Angry Birds is aimed.
   Pull the ball back against the bands, watch the dotted arc, let go. Physics
   lives in lib/hoopsPhysics.js (metres, gravity, rim, backboard); this file
   projects that world onto the canvas with a pinhole camera, so the ball
   shrinks as it flies toward the hoop and drops a shadow on a perspective
   floor. Colours are the CSS theme tokens, so light and dark both work.
--------------------------------------------------------------------------- */

const CAM_Y = 1.5;   // camera height, metres
const CAM_D = 3;     // camera sits this far behind the ball
const FOCAL = 5;
const BALL_COLOR = "#f28c28";
const BALL_SEAM = "rgba(60, 25, 5, 0.55)";
const SWEET_FRAC = 0.26;  // a pull this share of the canvas height is the swish
const MAX_FRAC = 0.36;    // the bands stop stretching here
const FORK = { x: 0.48, y: 1.2, z: -0.35 };   // slingshot arms, metres

function readTheme() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n) => cs.getPropertyValue(n).trim();
  return { accent: v("--accent"), ink: v("--ink"), bg: v("--bg"), bg2: v("--bg-2"), line: v("--line"), muted: v("--muted"), card: v("--card") };
}

function loadBest() {
  try { return Number(localStorage.getItem("hoops-best")) || 0; } catch { return 0; }
}
function saveBest(n) {
  try { localStorage.setItem("hoops-best", String(n)); } catch { /* private mode */ }
}

export default function Hoops() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(loadBest);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas.getContext("2d");
    const game = createGame();
    const { ball } = game;
    let W = 320, H = 416, dpr = 1;

    // Projection. K = pixels per metre at the camera's focal distance.
    const K = () => W * 0.62;
    const horizon = () => H * 0.40;   // scene sits high so the pull has room below
    const scaleAt = (z) => FOCAL / (FOCAL + CAM_D + z);
    const project = (x, y, z) => {
      const s = scaleAt(z);
      return { sx: W / 2 + x * K() * s, sy: horizon() - (y - CAM_Y) * K() * s, s };
    };
    const sweetLen = () => H * SWEET_FRAC;
    const maxLen = () => H * MAX_FRAC;

    let pull = null;      // { dx, dy } current stretch, pixels, dy down = pulled back
    let aim = null;       // velocity the current pull would launch with
    let trail = [];       // world points of the shot in flight
    let doneAt = 0, swish = 0, tallied = false;
    let pts = 0, run = 0, bestLocal = loadBest();

    const resize = () => {
      const w = Math.max(240, Math.round(wrap.clientWidth));
      // Tall enough that a full pull straight down still fits under the ball.
      W = w; H = Math.round(w * 1.45); dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Where the ball sits while the bands are stretched.
    const nockedAt = () => {
      const p = project(START.x, START.y, START.z);
      return pull ? { sx: p.sx + pull.dx, sy: p.sy + pull.dy, s: p.s } : p;
    };

    // ---- drawing -------------------------------------------------------
    const ellipse = (cx, cy, rx, ry) => { ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(rx, 0.1), Math.max(ry, 0.1), 0, 0, Math.PI * 2); };

    const drawCourt = (t) => {
      ctx.fillStyle = t.card; ctx.fillRect(0, 0, W, H);
      const back = project(0, 0, 9.2).sy;
      const wall = ctx.createLinearGradient(0, 0, 0, back);
      wall.addColorStop(0, t.bg2); wall.addColorStop(1, t.card);
      ctx.fillStyle = wall; ctx.fillRect(0, 0, W, back);
      const floor = ctx.createLinearGradient(0, back, 0, H);
      floor.addColorStop(0, t.bg2); floor.addColorStop(1, t.bg);
      ctx.fillStyle = floor; ctx.fillRect(0, back, W, H - back);
      ctx.strokeStyle = t.line; ctx.lineWidth = 1;
      for (let x = -3; x <= 3; x += 1) {
        const a = project(x, 0, -1), b = project(x, 0, 9.2);
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
      }
      for (let z = 1; z <= 9; z += 2) {
        const y = project(0, 0, z).sy;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(0, back); ctx.lineTo(W, back); ctx.stroke();
      const k = [project(-0.9, 0, 5.2), project(0.9, 0, 5.2), project(0.9, 0, 9.2), project(-0.9, 0, 9.2)];
      ctx.strokeStyle = t.accent; ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.moveTo(k[0].sx, k[0].sy); k.slice(1).forEach((q) => ctx.lineTo(q.sx, q.sy)); ctx.closePath(); ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const drawBoard = (t) => {
      const a = project(-BOARD.halfW, BOARD.y1, BOARD.z), b = project(BOARD.halfW, BOARD.y0, BOARD.z);
      const x = a.sx, y = a.sy, w = b.sx - a.sx, h = b.sy - a.sy;
      const foot = project(0, 0, BOARD.z + 0.3);
      ctx.strokeStyle = t.line; ctx.lineWidth = Math.max(2, w * 0.03);
      ctx.beginPath(); ctx.moveTo(W / 2, y + h); ctx.lineTo(foot.sx, foot.sy); ctx.stroke();
      ctx.fillStyle = t.line; ctx.fillRect(x + w * 0.02, y + h * 0.04, w, h); // depth edge
      ctx.fillStyle = t.bg; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = t.ink; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.7;
      ctx.strokeRect(x, y, w, h);
      ctx.strokeRect(x + w * 0.3, y + h * 0.28, w * 0.4, h * 0.5);
      ctx.globalAlpha = 1;
    };

    const rimGeom = () => {
      const c = project(HOOP.x, HOOP.y, HOOP.z);
      const rx = HOOP.r * K() * c.s;
      return { cx: c.sx, cy: c.sy, rx, ry: rx * 0.38 };
    };

    const drawRimBack = (t) => {
      const { cx, cy, rx, ry } = rimGeom();
      ctx.strokeStyle = t.accent; ctx.lineWidth = Math.max(2.5, rx * 0.11);
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, Math.PI * 2); ctx.stroke();
    };

    const drawNetAndRimFront = (t, now) => {
      const { cx, cy, rx, ry } = rimGeom();
      const sw = swish && now - swish < 320 ? 1 + 0.25 * Math.sin(((now - swish) / 320) * Math.PI) : 1;
      const depth = rx * 1.15 * sw, rx2 = rx * 0.62;
      ctx.strokeStyle = t.muted; ctx.lineWidth = 1; ctx.globalAlpha = 0.9;
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
        ctx.lineTo(cx + Math.cos(a + 0.35) * rx2, cy + depth + Math.sin(a + 0.35) * ry * 0.6);
        ctx.stroke();
      }
      ellipse(cx, cy + depth * 0.5, rx * 0.8, ry * 0.75); ctx.stroke();
      ellipse(cx, cy + depth, rx2, ry * 0.6); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = t.accent; ctx.lineWidth = Math.max(2.5, rx * 0.11);
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI); ctx.stroke();
    };

    // Slingshot. The far band is drawn before the ball, the near band after,
    // so the ball sits inside the bands the way it does in a real sling.
    const forkTips = () => ({
      left: project(-FORK.x, FORK.y, FORK.z),
      right: project(FORK.x, FORK.y, FORK.z),
    });

    const drawSlingBase = (t) => {
      const { left, right } = forkTips();
      const foot = project(0, 0, FORK.z);
      const crotch = project(0, FORK.y * 0.42, FORK.z);
      ctx.strokeStyle = t.ink; ctx.globalAlpha = 0.75;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(4, W * 0.018);
      ctx.beginPath(); ctx.moveTo(foot.sx, foot.sy); ctx.lineTo(crotch.sx, crotch.sy); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(left.sx, left.sy); ctx.lineTo(crotch.sx, crotch.sy); ctx.lineTo(right.sx, right.sy);
      ctx.stroke();
      ctx.globalAlpha = 1; ctx.lineCap = "butt";
    };

    // Pulled: a straight band from one fork tip to the ball. At rest: one band
    // draped across the fork, sagging over the ball the way slack rubber does.
    const drawBand = (t, tip, ballPos, r) => {
      ctx.strokeStyle = t.accent; ctx.globalAlpha = 0.85;
      ctx.lineCap = "round"; ctx.lineWidth = Math.max(2.5, W * 0.011);
      ctx.beginPath(); ctx.moveTo(tip.sx, tip.sy); ctx.lineTo(ballPos.sx, ballPos.sy + r * 0.1); ctx.stroke();
      ctx.globalAlpha = 1; ctx.lineCap = "butt";
    };

    const drawSlackBand = (t, ballPos, r) => {
      const { left, right } = forkTips();
      ctx.strokeStyle = t.accent; ctx.globalAlpha = 0.85;
      ctx.lineCap = "round"; ctx.lineWidth = Math.max(2.5, W * 0.011);
      ctx.beginPath();
      ctx.moveTo(left.sx, left.sy);
      ctx.quadraticCurveTo(ballPos.sx, ballPos.sy + r * 0.55, right.sx, right.sy);
      ctx.stroke();
      ctx.globalAlpha = 1; ctx.lineCap = "butt";
    };

    const drawAim = (t) => {
      if (!aim) return;
      const path = previewPath(aim);
      ctx.fillStyle = t.ink;
      path.forEach((q, i) => {
        const p = project(q.x, q.y, q.z);
        ctx.globalAlpha = Math.max(0.12, 0.5 - i * 0.015);
        ellipse(p.sx, p.sy, Math.max(1.4, 3.2 * p.s), Math.max(1.4, 3.2 * p.s)); ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const drawTrail = (t) => {
      if (trail.length < 2) return;
      ctx.fillStyle = t.muted;
      trail.forEach((q, i) => {
        const p = project(q.x, q.y, q.z);
        ctx.globalAlpha = 0.1 + 0.25 * (i / trail.length);
        ellipse(p.sx, p.sy, Math.max(1, 2.4 * p.s), Math.max(1, 2.4 * p.s)); ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const drawBall = (screen) => {
      const p = screen || project(ball.x, ball.y, ball.z);
      const r = BALL_R * K() * p.s;
      if (!screen) {
        const sh = project(ball.x, 0, ball.z);
        const h = Math.max(0, ball.y - BALL_R);
        ctx.fillStyle = "rgba(0,0,0,0.28)"; ctx.globalAlpha = Math.max(0.15, 1 - h / 4);
        ellipse(sh.sx, sh.sy, r * (1 + h * 0.08), r * 0.32 * (1 + h * 0.08)); ctx.fill();
        ctx.globalAlpha = 1;
      }
      const g = ctx.createRadialGradient(p.sx - r * 0.35, p.sy - r * 0.4, r * 0.1, p.sx, p.sy, r);
      g.addColorStop(0, "#ffb15c"); g.addColorStop(0.6, BALL_COLOR); g.addColorStop(1, "#b85e12");
      ctx.fillStyle = g; ellipse(p.sx, p.sy, r, r); ctx.fill();
      ctx.strokeStyle = BALL_SEAM; ctx.lineWidth = Math.max(1, r * 0.07);
      ctx.beginPath(); ctx.moveTo(p.sx - r, p.sy); ctx.lineTo(p.sx + r, p.sy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.sx, p.sy - r); ctx.lineTo(p.sx, p.sy + r); ctx.stroke();
      ctx.beginPath(); ctx.arc(p.sx - r * 1.05, p.sy, r * 0.95, -0.9, 0.9); ctx.stroke();
      ctx.beginPath(); ctx.arc(p.sx + r * 1.05, p.sy, r * 0.95, Math.PI - 0.9, Math.PI + 0.9); ctx.stroke();
      return r;
    };

    const drawHint = (t) => {
      if (game.mode !== "idle" || pts > 0) return;
      const p = project(START.x, START.y, START.z);
      ctx.fillStyle = t.muted; ctx.font = `600 12px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = "center";
      ctx.fillText("pull back and let go", p.sx, H - 12);
    };

    const draw = (now) => {
      const t = readTheme();
      drawCourt(t); drawBoard(t); drawRimBack(t);
      drawTrail(t);
      const { left, right } = forkTips();
      const nocked = game.mode === "drag" || game.mode === "idle";
      const p = nocked ? nockedAt() : project(ball.x, ball.y, ball.z);
      const r = BALL_R * K() * p.s;
      drawSlingBase(t);
      if (nocked && pull) drawBand(t, right, p, r);            // far band, stretched
      drawAim(t);
      // Once the ball is past the front of the rim the net goes over it.
      if (!nocked && ball.z > HOOP.z - HOOP.r * 0.4) {
        drawBall(); drawNetAndRimFront(t, now);
      } else {
        drawNetAndRimFront(t, now);
        drawBall(nocked ? p : null);
        if (nocked && pull) drawBand(t, left, p, r);           // near band, stretched
        else if (nocked) drawSlackBand(t, p, r);               // slack across the fork
      }
      drawHint(t);
    };

    // ---- loop ----------------------------------------------------------
    let raf = 0, last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const flying = game.mode === "fly";
      for (let i = 0; i < 3; i++) game.step(dt / 3); // substeps keep the rim test reliable
      if (flying) trail.push({ x: ball.x, y: ball.y, z: ball.z });
      if (trail.length > 90) trail.shift();
      if (game.scored && !tallied) {
        tallied = true; swish = now; pts += 1; run += 1;
        setScore(pts); setStreak(run);
        if (pts > bestLocal) { bestLocal = pts; setBest(pts); saveBest(pts); }
      }
      if (game.mode === "done") {
        if (!doneAt) { doneAt = now; if (!game.scored) { run = 0; setStreak(0); } }
        if (now - doneAt > 700) { game.reset(); doneAt = 0; tallied = false; trail = []; }
      }
      draw(now);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    if (import.meta.env.DEV) window.__hoops = { game, aimVelocity, sweetLen, tick: (dt) => { game.step(dt); draw(performance.now()); } };

    // ---- input: pull back, release -------------------------------------
    const pos = (e) => { const b = canvas.getBoundingClientRect(); return { sx: e.clientX - b.left, sy: e.clientY - b.top }; };
    const setPull = (sx, sy) => {
      const p = project(START.x, START.y, START.z);
      let dx = sx - p.sx, dy = sy - p.sy;
      const len = Math.hypot(dx, dy), cap = maxLen();
      if (len > cap) { dx *= cap / len; dy *= cap / len; }
      pull = { dx, dy };
      // Only a backward pull (downward on screen) arms the sling.
      aim = dy > 6 ? aimVelocity(dx, dy, sweetLen()) : null;
    };
    const onDown = (e) => {
      if (game.mode !== "idle") return;
      game.mode = "drag";
      const { sx, sy } = pos(e);
      setPull(sx, sy);
      canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    const onMove = (e) => {
      if (game.mode !== "drag") return;
      const { sx, sy } = pos(e);
      setPull(sx, sy);
    };
    const onUp = () => {
      if (game.mode !== "drag") return;
      const shot = aim;
      pull = null; aim = null;
      if (!shot) { game.reset(); return; }
      trail = [];
      game.launch(shot);
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div className="hoops-card" ref={wrapRef}>
      <div className="hoops-head">
        <span className="label">Shoot some hoops</span>
        <span className="hoops-score" aria-live="polite">
          <b>{score}</b> made{streak > 1 ? ` · ${streak} in a row` : ""}{best > 0 ? ` · best ${best}` : ""}
        </span>
      </div>
      <canvas ref={canvasRef} className="hoops-canvas" aria-label="Basketball slingshot game: pull the ball back and release to shoot" />
    </div>
  );
}
