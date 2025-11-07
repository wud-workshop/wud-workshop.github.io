// p5.js — Pixel-art "PAUSA" cigarette with puffs on spacebar (Leertaste)
// Press SPACE to take a puff. The break ends when the cigarette is smoked up.

let PX = 6;                    // pixel size for the whole scene
let W = 170 * PX, H = 90 * PX; // canvas size scaled by PX
let cig = {
  x: 20 * PX,
  y: 45 * PX,
  lengthPx: 110,     // logical "pixels" (not screen px); rendered with PX scale
  heightPx: 10,
  burnPx: 0,         // how much has burned (in logical pixels)
  slowBurnRate: 0.02, // passive burn per frame
  puffBurn: 6,        // burn per puff (logical pixels)
};
let particles = [];
let finished = false;
let lastPuffFrame = -999;

function setup() {
  createCanvas(W, H);
  noStroke();
  // Make things crisp, “pixel art”-style
  pixelDensity(1);
  drawingContext.imageSmoothingEnabled = false;
  textFont('monospace');
}

function draw() {
  background(28); // dark background

  // Title "PAUSA" above
  push();
  fill(230);
  textAlign(CENTER, CENTER);
  textSize(10 * PX);
  text("PAUSA", width / 2, 15 * PX);
  pop();

  if (finished) {
    drawCigarette(); // show the stub
    updateSmoke();
    drawSmoke();
    drawOverMessage();
    return;
  }

  // Passive slow burn
  cig.burnPx = min(cig.lengthPx, cig.burnPx + cig.slowBurnRate);

  // Spawn a little idle smoke while still burning
  if (frameCount % 10 === 0 && cig.burnPx < cig.lengthPx) {
    spawnSmoke(1, 0.2);
  }

  updateSmoke();
  drawSmoke();
  drawCigarette();

  // End condition
  if (cig.burnPx >= cig.lengthPx) {
    finished = true;
  }

  // UI hint
  if (frameCount - lastPuffFrame > 60 && !finished) {
    push();
    fill(180);
    textAlign(CENTER, CENTER);
    textSize(3 * PX);
    text("", width / 2, height - 8 * PX);
    pop();
  }
}

function keyPressed() {
  // Leertaste (space)
  if (keyCode === 32 && !finished) {
    takePuff();
  }
}

// Mobile-friendly (optional): tap = puff
function touchStarted() {
  if (!finished) takePuff();
  return false;
}

function takePuff() {
  lastPuffFrame = frameCount;
  // Burn faster during a puff
  cig.burnPx = min(cig.lengthPx, cig.burnPx + cig.puffBurn);

  // Spawn a thicker plume of smoke
  spawnSmoke(14, 1.0);

  // Brief ember glow "flash" via extra particles near tip
  spawnEmber(8);
}

function spawnSmoke(n, vigor = 1) {
  // Emitter at burning tip
  const tip = burningTipScreenXY();
  for (let i = 0; i < n; i++) {
    particles.push(makeSmokeParticle(tip.x, tip.y, vigor));
  }
}

function spawnEmber(n) {
  const tip = burningTipScreenXY();
  for (let i = 0; i < n; i++) {
    particles.push({
      type: 'ember',
      x: snap(tip.x + random(-1, 1) * PX),
      y: snap(tip.y + random(-0.5, 0.5) * PX),
      vx: snap(random(0.2, 0.7) * PX),
      vy: snap(random(-0.2, -0.6) * PX),
      life: 18 + int(random(10)),
      age: 0,
    });
  }
}

function makeSmokeParticle(x, y, vigor) {
  return {
    type: 'smoke',
    x: snap(x + random(-PX, PX)),
    y: snap(y),
    vx: snap(random(-0.25, 0.25) * PX * vigor),
    vy: snap(random(-0.9, -0.5) * PX * (0.7 + 0.6 * vigor)),
    drift: random(1000),
    life: 80 + int(random(40) * (0.7 + 0.6 * vigor)),
    age: 0,
    size: int(random(2, 4)), // logical pixel size units
  };
}

function updateSmoke() {
  for (let p of particles) {
    p.age++;
    if (p.type === 'smoke') {
      // gentle side-to-side drift
      const sway = sin((p.age + p.drift) * 0.07) * 0.4 * PX;
      p.x = snap(p.x + p.vx + sway * 0.05);
      p.y = snap(p.y + p.vy);
    } else if (p.type === 'ember') {
      p.x = snap(p.x + p.vx);
      p.y = snap(p.y + p.vy);
      // gravity slightly
      p.vy += 0.02 * PX;
    }
  }
  // remove dead particles
  particles = particles.filter(p => p.age < p.life);
}

function drawSmoke() {
  for (let p of particles) {
    if (p.type === 'smoke') {
      const a = map(p.age, 0, p.life, 200, 0); // fade
      fill(220, a);
      // render as chunky pixel squares
      const s = p.size * PX;
      rect(p.x, p.y, s, s);
    } else if (p.type === 'ember') {
      const a = map(p.age, 0, p.life, 255, 0);
      fill(255, 140, 0, a);
      rect(p.x, p.y, 1 * PX, 1 * PX);
    }
  }
}

function drawCigarette() {
  // Snap all drawing to the pixel grid
  const x = snap(cig.x);
  const y = snap(cig.y);
  const h = snap(cig.heightPx * PX);

  // How much remains (paper + filter)
  const totalL = cig.lengthPx * PX;
  const burnedL = snap(min(cig.burnPx * PX, totalL));
  const remainL = max(0, totalL - burnedL);

  // Segment proportions (from right to left): filter(orange), paper(white), ember+ash(left edge)
  // We'll render from left to right: ash+ember (thin), paper, filter
  const ashWidth = PX * 2; // thin ash front

  // ASH / EMBER at the burning tip
  const tipX = x + burnedL;
  const ashX = tipX - ashWidth;
  fill(120); // ash grey
  rect(ashX, y, ashWidth, h);
  // glowing ember edge
  fill(255, 70, 30);
  rect(tipX - PX, y, PX, h);

  // PAPER (remaining)
  const paperLen = max(0, remainL - 12 * PX); // leave room for filter
  if (paperLen > 0) {
    fill(245); // off-white paper
    rect(tipX, y, paperLen, h);
    // subtle paper seam line
    fill(230);
    for (let i = 0; i < int(paperLen / (4 * PX)); i++) {
      rect(tipX + i * 4 * PX, y + h - 1 * PX, 2, 1); // tiny seam ticks
    }
  }

  // FILTER
  const filterLen = min(remainL, 12 * PX);
  if (filterLen > 0) {
    const fx = tipX + paperLen;
    fill(232, 150, 75); // orange filter
    rect(fx, y, filterLen, h);
    // filter speckles
    fill(210, 120, 50);
    for (let i = 0; i < 10; i++) {
      rect(fx + int(random(filterLen / PX)) * PX, y + int(random(h / PX)) * PX, 1 * PX, 1 * PX);
    }
  }

  // Table/shadow line (for grounding)
  fill(0, 40);
  rect(x - 2 * PX, y + h + 2 * PX, (cig.lengthPx + 10) * PX, 1 * PX);
}

function drawOverMessage() {
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(7 * PX);
  text("PAUSA FINITA", width / 2, height / 2 - 8 * PX);

  textSize(3.2 * PX);
  fill(200);
  text("Premi R per ricominciare", width / 2, height / 2 + 4 * PX);
  pop();
}

function burningTipScreenXY() {
  // Emit smoke slightly above the ember center
  const burnedL = min(cig.burnPx * PX, cig.lengthPx * PX);
  const tipX = snap(cig.x + burnedL);
  const tipY = snap(cig.y + cig.heightPx * PX / 2 - 2 * PX);
  return { x: tipX, y: tipY };
}

function snap(v) {
  // snap to our pixel grid for crispness
  return Math.round(v / PX) * PX;
}

// Restart with 'R'
function keyTyped() {
  if (key === 'r' || key === 'R') {
    particles = [];
    cig.burnPx = 0;
    finished = false;
  }
}
