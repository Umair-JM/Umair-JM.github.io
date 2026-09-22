/* ---------------------------------------------------------------------------
   Hoops physics: a ball in metres under gravity, a rim, a backboard, a floor.
   Pure and frame-rate independent so it can be unit tested in Node.
   Coordinates: x across, y up, z into the screen. Ball starts at START and
   the hoop sits at HOOP. Call throwBall(power, side) then step(dt).
--------------------------------------------------------------------------- */

export const G = 9.8;
export const BALL_R = 0.3;
export const START = { x: 0, y: 0.36, z: 0 };
export const HOOP = { x: 0, y: 3.05, z: 8, r: 0.6 };
export const BOARD = { z: 8.6, halfW: 1.1, y0: 2.75, y1: 3.9 };

// Launch speeds for power = 1: chosen so the ball drops through the hoop's
// centre. t = HOOP.z / vz, vy = (dy + g t^2 / 2) / t.
const VZ = 7.2;
const T = HOOP.z / VZ;
const VY = (HOOP.y - START.y + 0.5 * G * T * T) / T;

export function createGame() {
  const ball = { ...START, vx: 0, vy: 0, vz: 0 };
  const s = { ball, mode: "idle", bounces: 0, t: 0, scored: false, rimHits: 0, boardHits: 0 };

  s.reset = () => {
    Object.assign(ball, START, { vx: 0, vy: 0, vz: 0 });
    Object.assign(s, { mode: "idle", bounces: 0, t: 0, scored: false, rimHits: 0, boardHits: 0 });
  };

  // power 1 = swish; side = sideways component as a fraction of forward speed.
  // Power sets the distance only: the arc height stays the same, so a hard
  // flick bangs the backboard instead of sailing over it.
  s.throwBall = (power, side = 0) => {
    Object.assign(ball, START);
    ball.vz = VZ * power;
    ball.vy = VY;
    ball.vx = ball.vz * side;
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
      if (d <= HOOP.r - BALL_R * 0.45) {
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

// Self-check: `node src/lib/hoopsPhysics.js`
if (typeof process !== "undefined" && process.argv[1] && /hoopsPhysics\.js$/.test(process.argv[1])) {
  const run = (power, side = 0) => {
    const g = createGame(); g.throwBall(power, side);
    for (let i = 0; i < 6000 && g.mode === "fly"; i++) g.step(1 / 600);
    return g;
  };
  const perfect = run(1);
  console.assert(perfect.scored && perfect.rimHits === 0, "power 1 should swish", perfect);
  console.assert(!run(0.6).scored, "weak throw should fall short");
  const strong = run(1.35);
  console.assert(strong.boardHits > 0, "strong throw should hit the backboard", strong);
  console.assert(!run(1, 0.3).scored, "a throw aimed well off to the side should miss");
  console.assert(run(1.05).scored && run(0.95).scored, "5% power error should still drop");
  console.assert(!run(0.85).scored, "15% short should miss");
  console.log("hoops physics ok", { VZ, VY: +VY.toFixed(2) });
}
