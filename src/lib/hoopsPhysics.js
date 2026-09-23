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
export const START = { x: 0, y: 0.62, z: 0 };
export const HOOP = { x: 0, y: 3.05, z: 8, r: 0.65 };
export const BOARD = { z: 8.6, halfW: 1.1, y0: 2.75, y1: 3.9 };

// The swish: drop through the hoop's centre. t = HOOP.z / vz, vy from the drop.
const VZ = 7.2;
const T = HOOP.z / VZ;
const VY = (HOOP.y - START.y + 0.5 * G * T * T) / T;

export const SWISH_SPEED = Math.hypot(VZ, VY);
export const SWISH_ANGLE = Math.atan2(VY, VZ);  // elevation of the perfect shot
const ANGLE_SPAN = 0.28;   // radians the arc flattens by as the pull turns sideways
const SIDE_MAX = 0.22;     // sideways speed as a fraction of forward speed
const POWER_MIN = 0.4, POWER_MAX = 1.5;
// Range goes with speed squared, so raw pull length is far too twitchy on a
// small canvas. Pull length is compressed around the sweet spot instead.
const POWER_GAIN = 0.35;
// A ball falling steeply is caught by the ring more often than one dropping
// short, so the scoring window sits slightly long. Aim the sweet pull at its
// middle, not at the exact centre of the ring, and both errors forgive alike.
const POWER_BIAS = 1.02;

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
  const s = { ball, mode: "idle", bounces: 0, t: 0, scored: false, rimHits: 0, boardHits: 0 };

  s.reset = () => {
    Object.assign(ball, START, { vx: 0, vy: 0, vz: 0 });
    Object.assign(s, { mode: "idle", bounces: 0, t: 0, scored: false, rimHits: 0, boardHits: 0 });
  };

  s.launch = ({ vx, vy, vz }) => {
    Object.assign(ball, START, { vx, vy, vz });
    Object.assign(s, { mode: "fly", bounces: 0, t: 0, scored: false, rimHits: 0, boardHits: 0 });
  };

  s.step = (dt) => {
    if (s.mode !== "fly") return;
    s.t += dt;
    const py = ball.y;
    ball.vy -= G * dt;
    ball.x += ball.vx * dt; ball.y += ball.vy * dt; ball.z += ball.vz * dt;

    // Backboard: a plane at z = BOARD.z facing the player.
    if (ball.vz > 0 && ball.z + BALL_R >= BOARD.z && Math.abs(ball.x) <= BOARD.halfW && ball.y >= BOARD.y0 - BALL_R && ball.y <= BOARD.y1 + BALL_R) {
      ball.z = BOARD.z - BALL_R; ball.vz = -ball.vz * 0.55; ball.vx *= 0.9; s.boardHits += 1;
    }

    // Hoop plane, crossed on the way down.
    if (py > HOOP.y && ball.y <= HOOP.y && ball.vy < 0) {
      const dx = ball.x - HOOP.x, dz = ball.z - HOOP.z;
      const d = Math.hypot(dx, dz);
      if (d <= HOOP.r - BALL_R * 0.3) {
        s.scored = true;
      } else if (d < HOOP.r + BALL_R) {
        // Rim: bounce up and push away from the ring.
        const nx = d ? dx / d : 1, nz = d ? dz / d : 0;
        const inside = d < HOOP.r;
        ball.vy = -ball.vy * 0.45;
        ball.vx += (inside ? -nx : nx) * 1.6;
        ball.vz += (inside ? -nz : nz) * 1.6;
        ball.y = HOOP.y + 0.01;
        s.rimHits += 1;
      }
    }

    // Floor.
    if (ball.y - BALL_R <= 0 && ball.vy < 0) {
      ball.y = BALL_R; ball.vy = -ball.vy * 0.5; ball.vx *= 0.8; ball.vz *= 0.8; s.bounces += 1;
    }

    if (s.bounces >= 2 || ball.z > 10.5 || ball.z < -0.8 || Math.abs(ball.x) > 3 || s.t > 6) s.mode = "done";
  };

  return s;
}

/* Flight path for the aiming guide: positions until the ball passes the hoop
   or lands. Gravity only, so the dots show the intent, not the rim bounce. */
export function previewPath(v, steps = 26, dt = 0.06) {
  const p = { ...START }, out = [];
  let { vx, vy, vz } = v;
  for (let i = 0; i < steps; i++) {
    vy -= G * dt;
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
  console.assert(shoot(0, SWEET * 1.1).scored && shoot(0, SWEET * 0.9).scored, "10% pull error should still drop");
  console.assert(shoot(SWEET * 0.26, SWEET).scored, "a 15 degree pull should still drop");
  console.assert(!shoot(SWEET * 0.64, SWEET * 0.77).scored, "a 40 degree pull should miss to the side");
  const side = aimVelocity(60, 120, SWEET);
  console.assert(side.vx < 0, "pulling right should send the ball left");
  console.assert(previewPath(aimVelocity(0, SWEET, SWEET)).length > 10, "the aim guide should return a path");
  console.log("hoops physics ok", { swishSpeed: +SWISH_SPEED.toFixed(2), swishAngleDeg: +((SWISH_ANGLE * 180) / Math.PI).toFixed(1) });
}
