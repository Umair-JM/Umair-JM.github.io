/* ---------------------------------------------------------------------------
   Hoops physics: a ball in metres under gravity, a rim, a backboard, a floor.
   Pure and frame-rate independent so it can be unit tested in Node.
   Coordinates: x across, y up, z into the screen. Ball starts at START and
   the hoop sits at HOOP.

   Aiming is a slingshot, as in Angry Birds: the player pulls the ball back and
   the launch is the reverse of that pull. aimVelocity() turns a pull in screen
   pixels into a velocity, so how far you pull sets the power and the pull's
   angle sets the arc and the sideways drift. A pull straight down of exactly
   the sweet length is the swish.
--------------------------------------------------------------------------- */

export const G = 9.8;
export const BALL_R = 0.3;
// The ball rests on the floor in front of the shooter: there is no sling to
// sit in any more, it is flicked from where it lies.
export const START = { x: 0, y: BALL_R, z: 0 };
export const HOOP = { x: 0, y: 3.05, z: 8, r: 0.65 };
// The board sits back from the ring by the same proportion a real one does
// (face to ring centre is about three ball radii), so a ball dropping
// through the centre passes under it instead of clipping it.
export const BOARD = { z: 9, halfW: 1.5, y0: 2.6, y1: 4.15 };

// Quadratic air drag, in units of 1 / metre: a = -DRAG * |v| * v. At the
// speeds here it takes about a fifth of gravity's bite out of the flight, so
// the arc falls a little steeper than a vacuum parabola.
export const DRAG = 0.02;

// Launch angle of the perfect shot. A flatter arc reaches the ring travelling
// almost sideways and clips its near edge, which is what a line drive does in
// life too. At 54 degrees out the ball comes down at about 42, the angle a
// coached shot arrives at, and clears the near rim by twice its own radius.
export const SWISH_ANGLE = (54 * Math.PI) / 180;

/* Height at the hoop plane for a launch of this speed, drag included. */
function heightAtHoop(speed) {
  let { x, y, z } = START, vy = speed * Math.sin(SWISH_ANGLE), vz = speed * Math.cos(SWISH_ANGLE);
  const dt = 1 / 600;
  for (let i = 0; i < 6000; i++) {
    const prevZ = z, prevY = y;
    const sp = Math.hypot(vy, vz);
    vy += (-G - DRAG * sp * vy) * dt;
    vz += (-DRAG * sp * vz) * dt;
    y += vy * dt; z += vz * dt;
    if (z >= HOOP.z) return prevY + ((HOOP.z - prevZ) / (z - prevZ)) * (y - prevY);
    if (y < 0) break;
  }
  void x;
  return -Infinity;
}

export const SWISH_SPEED = (() => {
  let lo = 5, hi = 25;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (heightAtHoop(mid) < HOOP.y) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
})();
const ANGLE_SPAN = 0.28;   // radians the arc flattens by as the pull turns sideways
const SIDE_MAX = 0.22;     // sideways speed as a fraction of forward speed
const POWER_MIN = 0.4, POWER_MAX = 1.5;
const RIM_BOUNCE = 0.45;   // how much speed the ring gives back
const RIM_GRIP = 0.92;     // sideways drag on contact
// Range goes with speed squared, so raw pull length is far too twitchy on a
// small canvas. Pull length is compressed around the sweet spot instead.
const POWER_GAIN = 0.35;
// The sweet pull is the swish itself: no bias. Pull short and the ball falls
// under the ring, pull long and the backboard is there to save you, which is
// how the shot actually behaves.
const POWER_BIAS = 1;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* Pull (dx, dy) in screen pixels, dy positive downward, against a sweet spot
   length. Pull straight down by `sweet` and the ball swishes. */
export function aimVelocity(dx, dy, sweet) {
  const len = Math.hypot(dx, dy) || 1e-6;
  const vertical = clamp(dy / len, 0, 1);            // 1 = pulled straight down
  const angle = SWISH_ANGLE - (1 - vertical) * ANGLE_SPAN;
  const power = clamp(POWER_BIAS + (len / sweet - 1) * POWER_GAIN, POWER_MIN, POWER_MAX);
  const speed = SWISH_SPEED * power;
  const vz = speed * Math.cos(angle);
  return { vx: vz * (-dx / len) * SIDE_MAX, vy: speed * Math.sin(angle), vz };
}

export function createGame() {
  const ball = { ...START, vx: 0, vy: 0, vz: 0 };
  const fresh = { mode: "idle", bounces: 0, t: 0, scored: false, rimHits: 0, boardHits: 0, pass: null, result: null };
  // hoopX slides once sway is switched on, so the whole backboard travels with
  // it. tSway runs whether or not a ball is in the air.
  const s = { ball, hoopX: 0, sway: 0, swayRate: 0.9, tSway: 0, ...fresh };

  s.reset = () => {
    Object.assign(ball, START, { vx: 0, vy: 0, vz: 0 });
    Object.assign(s, fresh, { pass: null, result: null });
  };

  s.launch = ({ vx, vy, vz }) => {
    Object.assign(ball, START, { vx, vy, vz });
    Object.assign(s, fresh, { mode: "fly", pass: null, result: null });
  };

  /* The hoop keeps moving between shots, so call this every frame. */
  s.advance = (dt) => {
    s.tSway += dt;
    s.hoopX = s.sway ? Math.sin(s.tSway * s.swayRate) * s.sway : 0;
  };

  s.step = (dt) => {
    if (s.mode !== "fly") return;
    s.t += dt;
    const py = ball.y, pz = ball.z;
    const sp = Math.hypot(ball.vx, ball.vy, ball.vz);
    ball.vx += -DRAG * sp * ball.vx * dt;
    ball.vy += (-G - DRAG * sp * ball.vy) * dt;
    ball.vz += -DRAG * sp * ball.vz * dt;
    ball.x += ball.vx * dt; ball.y += ball.vy * dt; ball.z += ball.vz * dt;

    // Backboard: a plane at z = BOARD.z facing the player. A ball that has
    // already dropped through the ring is below it, inside the net, so it
    // cannot touch the board on the way down.
    if (!s.scored && ball.vz > 0 && ball.z + BALL_R >= BOARD.z && Math.abs(ball.x - s.hoopX) <= BOARD.halfW && ball.y >= BOARD.y0 - BALL_R && ball.y <= BOARD.y1 + BALL_R) {
      ball.z = BOARD.z - BALL_R; ball.vz = -ball.vz * 0.55; ball.vx *= 0.9; s.boardHits += 1;
    }

    // Height and offset as the ball passes the ring, kept for the callout.
    if (pz < HOOP.z && ball.z >= HOOP.z) s.pass = { y: ball.y, dx: ball.x - s.hoopX };

    // The rim is a ring of steel, not a funnel. Collide the ball against the
    // nearest point on that circle and reflect it there, so hitting the inner
    // edge drops it in, the outer edge throws it out, and the awkward angles
    // in between rattle.
    const dx = ball.x - s.hoopX, dy = ball.y - HOOP.y, dz = ball.z - HOOP.z;
    const radial = Math.hypot(dx, dz) || 1e-6;
    const ox = dx - (dx / radial) * HOOP.r, oz = dz - (dz / radial) * HOOP.r;
    const dist = Math.hypot(ox, dy, oz) || 1e-6;
    if (dist < BALL_R) {
      const nx = ox / dist, ny = dy / dist, nz = oz / dist;
      const vn = ball.vx * nx + ball.vy * ny + ball.vz * nz;
      if (vn < 0) {
        const e = 1 + RIM_BOUNCE;
        ball.vx -= e * vn * nx; ball.vy -= e * vn * ny; ball.vz -= e * vn * nz;
        ball.vx *= RIM_GRIP; ball.vz *= RIM_GRIP;   // the ring drags sideways
        s.rimHits += 1;
      }
      const push = BALL_R - dist;                    // never let it sink in
      ball.x += nx * push; ball.y += ny * push; ball.z += nz * push;
    }

    // Through the ring: crossing the plane on the way down, clear of the ring.
    if (py > HOOP.y && ball.y <= HOOP.y && ball.vy < 0 && radial < HOOP.r - BALL_R * 0.9) {
      s.scored = true;
    }

    // Floor.
    if (ball.y - BALL_R <= 0 && ball.vy < 0) {
      ball.y = BALL_R; ball.vy = -ball.vy * 0.5; ball.vx *= 0.8; ball.vz *= 0.8; s.bounces += 1;
    }

    if (s.bounces >= 2 || ball.z > 10.5 || ball.z < -0.8 || Math.abs(ball.x) > 3 || s.t > 6) {
      s.mode = "done";
      s.result = classify(s);
    }
  };

  return s;
}

/* What to tell the player about the shot that just finished. */
export function classify(s) {
  if (s.scored) {
    if (s.boardHits) return "glass";
    if (s.rimHits) return "rim";
    return "swish";
  }
  if (!s.pass) return "short";                       // never reached the ring
  if (Math.abs(s.pass.dx) > HOOP.r) return "wide";
  return s.pass.y > HOOP.y ? "long" : "short";
}

/* Flight path for the aiming guide: positions until the ball passes the hoop
   or lands. Gravity only, so the dots show the intent, not the rim bounce. */
export function previewPath(v, steps = 26, dt = 0.06) {
  const p = { ...START }, out = [];
  let { vx, vy, vz } = v;
  for (let i = 0; i < steps; i++) {
    const sp = Math.hypot(vx, vy, vz);
    vx += -DRAG * sp * vx * dt;
    vy += (-G - DRAG * sp * vy) * dt;
    vz += -DRAG * sp * vz * dt;
    p.x += vx * dt; p.y += vy * dt; p.z += vz * dt;
    if (p.y < BALL_R * 0.5 || p.z > BOARD.z) break;
    out.push({ ...p });
  }
  return out;
}

// Self-check: `node src/lib/hoopsPhysics.js`
if (typeof process !== "undefined" && process.argv[1] && /hoopsPhysics\.js$/.test(process.argv[1])) {
  const SWEET = 130; // pixels, stands in for the canvas sweet spot
  const shoot = (dx, dy, len = SWEET) => {
    const g = createGame();
    g.launch(aimVelocity(dx, dy, len));
    for (let i = 0; i < 6000 && g.mode === "fly"; i++) g.step(1 / 600);
    return g;
  };
  const perfect = shoot(0, SWEET);
  console.assert(perfect.scored && perfect.rimHits === 0, "a straight pull of the sweet length should swish", perfect);
  console.assert(!shoot(0, SWEET * 0.6).scored, "a weak pull should fall short");
  const hard = shoot(0, SWEET * 1.8);
  console.assert(!hard.scored && hard.ball.z > HOOP.z, "a hard pull should sail past the hoop", hard.ball);
  console.assert(shoot(0, SWEET * 1.05).scored, "a touch long still rattles in");
  console.assert(shoot(0, SWEET * 0.95).scored, "a touch short still banks in");
  // A full size board is a friendly thing: overcook the flick and the glass
  // usually saves you, which is why the hard end of the range still drops.
  console.assert(shoot(0, SWEET * 1.15).result === "glass", "a hard flick banks off the board");
  console.assert(!shoot(0, SWEET * 0.85).scored, "pulling short drops under the ring");
  console.assert(shoot(SWEET * 0.12, SWEET).scored, "a small sideways error still drops");
  console.assert(!shoot(SWEET * 0.34, SWEET * 0.94).scored, "a 20 degree pull misses to the side");
  const side = aimVelocity(60, 120, SWEET);
  console.assert(side.vx < 0, "pulling right should send the ball left");
  console.assert(previewPath(aimVelocity(0, SWEET, SWEET)).length > 10, "the aim guide should return a path");
  console.assert(perfect.result === "swish", "a clean make reads as a swish", perfect.result);
  console.assert(shoot(0, SWEET * 0.6).result === "short", "a weak pull reads as short");
  console.assert(shoot(0, SWEET * 1.8).result === "long", "a hard pull reads as long", shoot(0, SWEET * 1.8).result);
  console.assert(shoot(SWEET * 0.64, SWEET * 0.77).result === "wide", "a sideways pull reads as wide");
  // The ring carries the backboard with it once it is sliding.
  const moved = createGame();
  moved.hoopX = 1.2;
  moved.launch(aimVelocity(0, SWEET, SWEET));
  for (let i = 0; i < 6000 && moved.mode === "fly"; i++) moved.step(1 / 600);
  console.assert(!moved.scored, "a straight shot misses a hoop that has slid away");
  const swaying = createGame();
  swaying.sway = 0.9;
  swaying.advance(1);
  console.assert(Math.abs(swaying.hoopX) > 0.1, "sway moves the hoop between shots", swaying.hoopX);
  console.assert(Math.abs(heightAtHoop(SWISH_SPEED) - HOOP.y) < 0.02, "the solved swish speed passes through the ring centre");
  console.log("hoops physics ok", { swishSpeed: +SWISH_SPEED.toFixed(2), swishAngleDeg: +((SWISH_ANGLE * 180) / Math.PI).toFixed(1), drag: DRAG });
}
