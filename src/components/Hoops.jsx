import { useEffect, useRef, useState } from "react";
import { createGame, aimVelocity, aimFromFlick, previewPath, BALL_R, HOOP } from "../lib/hoopsPhysics.js";
import { CARDS } from "../lib/aiSecurityCards.js";
import { profile } from "../data.js";

/* ---------------------------------------------------------------------------
   Hoops: flick the ball at the hoop.

   The court, the hoop and the ball are Blender renders (tools/hoops_scene.py)
   made with a camera built from this file's own projection, so a sprite drawn
   at a projected point lands where the physics says the object is. The ball
   sheet holds 24 frames of one turn, so the ball really rotates as it flies.

   Physics lives in lib/hoopsPhysics.js: metres, gravity, air drag, a steel
   ring the ball collides against, a backboard and a floor.
--------------------------------------------------------------------------- */

const CAM_Y = 1.5;        // camera height, metres
const CAM_D = 3;          // camera sits this far behind the ball
const FOCAL = 5;          // with CAM_D this gives f = 3.1 * canvas width
const ASPECT = 1.4;       // canvas height over width, fixed by the renders
const HORIZON = 0.40;     // principal point down the frame, as in the renders
const SWEET_FRAC = 0.26;  // a flick this share of the canvas height is the swish
const MAX_FRAC = 0.36;
const BALL_SPRITE = 0.672;  // metres the ball sprite spans, ball plus its margin
const SHEET = { cols: 6, frames: 24 };
const ART = "/hoops/";

const HOOPS_PER_CARD = 2;
const CARDS_BEFORE_PITCH = 10;
const MAKES_BEFORE_SWAY = 10;
const SWAY = 0.85;
const CALLOUT = {
  swish: "Swish", glass: "Off the glass", rim: "In off the rim",
  short: "Short", long: "Long", wide: "Wide",
};

function loadNum(key) {
  try { return Number(localStorage.getItem(key)) || 0; } catch { return 0; }
}
function saveNum(key, n) {
  try { localStorage.setItem(key, String(n)); } catch { /* private mode */ }
}

function loadArt() {
  const names = ["court.jpg", "hoop0.webp", "hoop1.webp", "hoop2.webp",
                 "kids0.webp", "kids1.webp", "kids2.webp", "ball.webp"];
  return Promise.all(names.map((n) => new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = ART + n;
  }))).then(([court, h0, h1, h2, k0, k1, k2, ball]) => ({ court, hoops: [h0, h1, h2], kids: [k0, k1, k2], ball }));
}

export default function Hoops() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => loadNum("hoops-best"));
  const [made, setMade] = useState(() => loadNum("hoops-made"));
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas.getContext("2d");
    const game = createGame();
    const { ball } = game;
    let art = null;
    let scaled = null;   // art pre-sized to the canvas, so no resampling per frame
    let W = 320, H = Math.round(320 * ASPECT), dpr = 1;

    // The projection the Blender camera was built from.
    const K = () => W * 0.62;
    const horizon = () => H * HORIZON;
    const scaleAt = (z) => FOCAL / (FOCAL + CAM_D + z);
    const project = (x, y, z) => {
      const s = scaleAt(z);
      return { sx: W / 2 + x * K() * s, sy: horizon() - (y - CAM_Y) * K() * s, s };
    };
    const sweetLen = () => H * SWEET_FRAC;
    const maxLen = () => H * MAX_FRAC;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let swipe = null;     // { sx, sy } where the hand went down
    let aim = null;       // the velocity this flick would launch with
    let trail = [];
    let callout = null, flash = 0, kb = null;
    let spin = 0, squash = 0, lastBounces = 0;
    let doneAt = 0, tallied = false;
    let pts = 0, run = 0, bestLocal = loadNum("hoops-best"), madeTotal = loadNum("hoops-made");

    // Full frame art is scaled once into offscreen canvases, then blitted one
    // to one every frame. Rescaling a 720 by 1008 render 60 times a second is
    // the one thing that made this panel expensive.
    const prescale = () => {
      if (!art?.court) { scaled = null; return; }
      const px = (img) => {
        const c = document.createElement("canvas");
        c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
        const cc = c.getContext("2d");
        cc.imageSmoothingEnabled = true; cc.imageSmoothingQuality = "high";
        cc.drawImage(img, 0, 0, c.width, c.height);
        return c;
      };
      scaled = {
        court: px(art.court),
        hoops: art.hoops.map((h) => (h ? px(h) : null)),
        kids: art.kids.map((k) => (k ? px(k) : null)),
      };
    };

    const resize = () => {
      // The art has one fixed aspect, so the canvas keeps that shape and only
      // its width varies. Every distance in the game is a fraction of these.
      // On a short screen the width comes down instead, so the card below the
      // canvas still fits without the picture being cropped.
      const room = Math.max(240, Math.floor((window.innerHeight * 0.62) / ASPECT));
      const w = Math.max(240, Math.min(Math.round(wrap.clientWidth), room));
      W = w; H = Math.round(w * ASPECT);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      prescale();
    };
    resize();

    // ---- drawing --------------------------------------------------------
    const blit = (c, x = 0) => ctx.drawImage(c, 0, 0, c.width, c.height, x, 0, W, H);

    const drawCourt = () => {
      if (scaled?.court) blit(scaled.court);
      else { ctx.fillStyle = "#14161b"; ctx.fillRect(0, 0, W, H); }
    };

    const drawHoop = () => {
      if (!scaled?.hoops[0]) return;
      // How deep the ball sits in the net picks the stretched sprite.
      let state = 0;
      const near = Math.hypot(ball.x - game.hoopX, ball.z - HOOP.z) < HOOP.r * 1.4;
      if (near && ball.y < HOOP.y && ball.y > HOOP.y - 1.2) state = ball.y > HOOP.y - 0.55 ? 1 : 2;
      const img = scaled.hoops[state] || scaled.hoops[0];
      // The sprite is rendered with the hoop centred, so a sliding hoop is the
      // same picture moved by the distance that slide projects to.
      blit(img, game.hoopX * K() * scaleAt(HOOP.z));
    };

    // Kids along the baseline. They watch, and for a moment after a basket
    // they jump and throw their arms up.
    const drawKids = (now) => {
      if (!scaled?.kids[0]) return;
      const cheering = flash && now - flash < 1500;
      const pose = cheering && !reduced ? 1 + (Math.floor((now - flash) / 140) % 2) : (cheering ? 2 : 0);
      blit(scaled.kids[pose] || scaled.kids[0]);
    };

    const drawBall = () => {
      const p = project(ball.x, ball.y, ball.z);
      const size = BALL_SPRITE * K() * p.s;
      const sh = project(ball.x, 0, ball.z);
      const h = Math.max(0, ball.y - BALL_R);
      ctx.save();
      ctx.globalAlpha = Math.max(0.1, 0.5 - h / 8);
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(sh.sx, sh.sy, size * 0.42 * (1 + h * 0.06), size * 0.13 * (1 + h * 0.06), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (!art?.ball) return;
      const n = SHEET.frames;
      const f = ((Math.round((spin / (Math.PI * 2)) * n) % n) + n) % n;
      const tile = art.ball.width / SHEET.cols;
      const sx = (f % SHEET.cols) * tile, sy = Math.floor(f / SHEET.cols) * tile;
      const w = size * (1 + squash * 0.16), hgt = size * (1 - squash * 0.16);
      ctx.drawImage(art.ball, sx, sy, tile, tile, p.sx - w / 2, p.sy - hgt / 2, w, hgt);
    };

    const drawAim = () => {
      if (!aim) return;
      ctx.save();
      ctx.fillStyle = "#fff";
      previewPath(aim).forEach((q, i) => {
        const p = project(q.x, q.y, q.z);
        ctx.globalAlpha = Math.max(0.1, 0.55 - i * 0.018);
        ctx.beginPath(); ctx.arc(p.sx, p.sy, Math.max(1.3, 3 * p.s), 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();
    };

    const drawTrail = () => {
      if (trail.length < 2) return;
      ctx.save();
      ctx.fillStyle = "#ffd9a8";
      trail.forEach((q, i) => {
        const p = project(q.x, q.y, q.z);
        ctx.globalAlpha = 0.04 + 0.16 * (i / trail.length);
        ctx.beginPath(); ctx.arc(p.sx, p.sy, Math.max(1, 2.2 * p.s), 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();
    };

    const drawFlash = (now) => {
      const lit = flash && now - flash < 380 ? 1 - (now - flash) / 380 : 0;
      if (!lit) return;
      const c = project(game.hoopX, HOOP.y, HOOP.z);
      const rx = HOOP.r * K() * c.s;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = lit * 0.45;
      ctx.strokeStyle = "#ffb15c";
      ctx.lineWidth = Math.max(2, rx * 0.12);
      ctx.beginPath(); ctx.ellipse(c.sx, c.sy, rx, rx * 0.38, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    };

    const drawCallout = (now) => {
      if (!callout) return;
      const age = now - callout.at;
      if (age > 1100) { callout = null; return; }
      const c = project(game.hoopX, HOOP.y, HOOP.z);
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - age / 1100);
      ctx.fillStyle = callout.made ? "#ffb15c" : "#e4e7ec";
      ctx.font = `700 ${Math.max(13, W * 0.05)}px ${getComputedStyle(document.body).fontFamily}`;
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.85)"; ctx.shadowBlur = 8;
      ctx.fillText(callout.text, c.sx, c.sy - W * 0.1 - (reduced ? 0 : age * 0.02));
      ctx.restore();
    };

    const drawHint = () => {
      if (game.mode !== "idle" || pts > 0) return;
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = `600 12px ${getComputedStyle(document.body).fontFamily}`;
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 6;
      ctx.fillText(kb ? "arrows to aim, space to shoot" : "flick the ball at the hoop", W / 2, H - 14);
      ctx.restore();
    };

    const draw = (now) => {
      drawCourt();
      drawKids(now);
      drawTrail();
      // Once the ball is at the ring the net hangs in front of it.
      const behindNet = ball.z > HOOP.z - HOOP.r && ball.y < HOOP.y + BALL_R * 1.5;
      if (behindNet) { drawBall(); drawHoop(); } else { drawHoop(); drawBall(); }
      drawAim();
      drawFlash(now);
      drawCallout(now);
      drawHint();
    };

    // ---- world ----------------------------------------------------------
    const update = (dt, now) => {
      const flying = game.mode === "fly";
      const was = { x: ball.x, y: ball.y, z: ball.z };
      for (let i = 0; i < 3; i++) game.step(dt / 3);
      game.advance(dt);
      if (flying) {
        // Backspin: the ball turns through the distance it travels.
        const moved = Math.hypot(ball.x - was.x, ball.y - was.y, ball.z - was.z);
        spin -= (moved / (BALL_R * 2 * Math.PI)) * Math.PI * 2 * 0.55;
        if (game.bounces > lastBounces) { squash = 1; lastBounces = game.bounces; }
        if (!reduced) trail.push({ x: ball.x, y: ball.y, z: ball.z });
      }
      squash = Math.max(0, squash - dt * 6);
      if (trail.length > 80) trail.shift();
      if (game.scored && !tallied) {
        tallied = true; flash = now; pts += 1; run += 1;
        setScore(pts); setStreak(run);
        if (pts > bestLocal) { bestLocal = pts; setBest(pts); saveNum("hoops-best", pts); }
        madeTotal += 1; setMade(madeTotal); saveNum("hoops-made", madeTotal);
        if (madeTotal >= MAKES_BEFORE_SWAY) game.sway = SWAY;
      }
      if (game.mode === "done") {
        if (!doneAt) {
          doneAt = now;
          callout = { text: CALLOUT[game.result] || "", made: game.scored, at: now };
          if (!game.scored) { run = 0; setStreak(0); }
        }
        if (now - doneAt > 750) {
          game.reset(); doneAt = 0; tallied = false; trail = []; spin = 0; squash = 0; lastBounces = 0;
        }
      }
    };

    // ---- loop -----------------------------------------------------------
    let raf = 0, last = performance.now(), running = false;
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      update(dt, now);
      draw(now);
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } };
    const stop = () => { if (running) { running = false; cancelAnimationFrame(raf); } };
    let onScreen = true;
    const sync = () => { if (onScreen && !document.hidden) start(); else stop(); };

    // Resizing clears the canvas, so repaint after it if the loop is paused.
    const ro = new ResizeObserver(() => { resize(); if (!running) draw(performance.now()); });
    ro.observe(wrap);
    window.addEventListener("resize", resize);
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }, { threshold: 0.05 });
    io.observe(wrap);
    document.addEventListener("visibilitychange", sync);
    sync();
    draw(performance.now());

    let alive = true;
    loadArt().then((loaded) => {
      if (!alive) return;
      art = loaded;
      prescale();
      draw(performance.now());   // a still frame even while the loop is paused
    });
    if (import.meta.env.DEV) {
      window.__hoops = { game, aimVelocity, sweetLen, tick: (dt) => { const n = performance.now(); update(dt, n); draw(n); } };
    }

    // ---- input: flick the ball -------------------------------------------
    const pos = (e) => { const b = canvas.getBoundingClientRect(); return { sx: e.clientX - b.left, sy: e.clientY - b.top }; };

    const setAim = (cx, cy) => {
      aim = aimFromFlick(swipe.sx, swipe.sy, cx, cy, sweetLen(), maxLen());
    };
    const onDown = (e) => {
      if (game.mode !== "idle") return;
      const { sx, sy } = pos(e);
      const p = project(ball.x, ball.y, ball.z);
      if (Math.hypot(sx - p.sx, sy - p.sy) > BALL_SPRITE * K() * p.s) return;
      kb = null;
      swipe = { sx, sy };
      game.mode = "drag";
      canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    const onMove = (e) => {
      if (game.mode !== "drag" || !swipe) return;
      const { sx, sy } = pos(e);
      setAim(sx, sy);
    };
    const onUp = () => {
      if (game.mode !== "drag") return;
      const shot = aim;
      swipe = null; aim = null;
      if (!shot) { game.reset(); return; }
      trail = []; spin = 0;
      game.launch(shot);
    };

    // Keyboard play, so the game is not pointer only.
    const applyKb = () => {
      const s = sweetLen();
      aim = aimVelocity(-kb.side * 0.4 * s, kb.power * s, s);
      game.mode = "drag";
    };
    const onKey = (e) => {
      if (game.mode === "fly" || game.mode === "done") return;
      const k = e.key;
      if (k === "ArrowLeft" || k === "ArrowRight" || k === "ArrowUp" || k === "ArrowDown") {
        kb = kb || { power: 1, side: 0 };
        if (k === "ArrowLeft") kb.side = Math.max(-1, kb.side - 0.1);
        if (k === "ArrowRight") kb.side = Math.min(1, kb.side + 0.1);
        if (k === "ArrowUp") kb.power = Math.min(MAX_FRAC / SWEET_FRAC, kb.power + 0.05);
        if (k === "ArrowDown") kb.power = Math.max(0.3, kb.power - 0.05);
        applyKb();
        e.preventDefault();
      } else if (k === " " || k === "Enter") {
        if (!kb) { kb = { power: 1, side: 0 }; applyKb(); }
        const shot = aim;
        aim = null;
        if (shot) { trail = []; spin = 0; game.launch(shot); }
        e.preventDefault();
      }
    };

    canvas.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    return () => {
      alive = false;
      stop(); ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const unlocked = Math.min(Math.floor(made / HOOPS_PER_CARD), CARDS.length);
  const card = unlocked > 0 ? CARDS[unlocked - 1] : null;
  const toNext = HOOPS_PER_CARD - (made % HOOPS_PER_CARD);
  const pitch = unlocked >= CARDS_BEFORE_PITCH;

  return (
    <div className="hoops-card" ref={wrapRef}>
      <div className="hoops-head">
        <span className="label">AI security hoops</span>
        <span className="hoops-score" aria-live="polite">
          <b>{score}</b> made{streak > 1 ? ` · ${streak} in a row` : ""}{best > 0 ? ` · best ${best}` : ""}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="hoops-canvas"
        tabIndex={0}
        role="application"
        aria-label="Basketball game. Flick the ball at the hoop, or use the arrow keys to aim and space to shoot."
      />
      <div className="hoops-learn" aria-live="polite">
        {card ? (
          <>
            <div className="hoops-learn-top">
              <span className="hoops-sect">{card.section}</span>
              <span className="hoops-prog">{card.tag} · {unlocked} of {CARDS.length}</span>
            </div>
            <h4>{card.title}</h4>
            <p>{card.body}</p>
            {pitch ? (
              <p className="hoops-pitch">
                For further information,{" "}
                <a href={`mailto:${profile.email}?subject=AI%20security%20work`}>hire me</a>.
              </p>
            ) : (
              <p className="hoops-next">Next card in {toNext} {toNext === 1 ? "hoop" : "hoops"}.</p>
            )}
          </>
        ) : (
          <p className="hoops-learn-empty">
            Make baskets to learn AI security. {CARDS.length} cards in order over {CARDS.length * HOOPS_PER_CARD} hoops.
          </p>
        )}
      </div>
    </div>
  );
}
