// p5.js — Pixel-art "PAUSA" cigarette with puffs on spacebar (Leertaste)
// Press SPACE to take a puff. The break ends when the cigarette is smoked up.

let PX = 6;                    // pixel size for the whole scene
let cig = {
  x: 0,
  y: 0,
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
  createCanvas(windowWidth, windowHeight);
  noStroke();

  // Make things crisp, “pixel art”-style
  pixelDensity(1);
  drawingContext.imageSmoothingEnabled = false;
  textFont('monospace');
}

function draw() {
  updateCigarettePosition();   // <-- keep cigarette centered dynamically

  background(28); // dark background

  // Title "PAUSA" above
  push();
  fill(230);
  textAlign(CENTER, CENTER);
  textSize(10 * PX);
  text("PAUSA", width / 2, 15 * PX);
  pop();

  if (finished) {
    drawCigarette();
    updateSmoke();
    drawSmoke();
    drawOverMessage();
    return;
  }

  // Passive slow burn
  cig.burnPx = min(cig.lengthPx, cig.burnPx + cig.slowBurnRate);

  // Idle smoke
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
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// --- CENTERING LOGIC -------------------------------------------------------

function updateCigarettePosition() {
  const totalLength = cig.lengthPx * PX;
  const heightPx = cig.heightPx * PX;

  cig.x = snap(width / 2 - totalLength / 2);
  cig.y = snap(height / 2 - heightPx / 2);
}

// --- INPUT -----------------------------------------------------------------

function touchStarted() {
  if (!finished) takePuff();
  return false;
}

function takePuff() {
  lastPuffFrame = frameCount;

  // Burn faster during puff
  cig.burnPx = min(cig.lengthPx, cig.burnPx + cig.puffBurn);

  // Puff smoke + embers
  spawnSmoke(14, 1.0);
  spawnEmber(8);
}

// --- PARTICLES -------------------------------------------------------------

function spawnSmoke(n, vigor = 1) {
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
    size: int(random(2, 4)), // logical size
  };
}

function updateSmoke() {
  for (let p of particles) {
    p.age++;

    if (p.type === 'smoke') {
      const sway = sin((p.age + p.drift) * 0.07) * 0.4 * PX;
      p.x = snap(p.x + p.vx + sway * 0.05);
      p.y = snap(p.y + p.vy);
    }

    if (p.type === 'ember') {
      p.x = snap(p.x + p.vx);
      p.y = snap(p.y + p.vy);
      p.vy += 0.02 * PX;  // tiny gravity
    }
  }

  particles = particles.filter(p => p.age < p.life);
}

function drawSmoke() {
  for (let p of particles) {
    if (p.type === 'smoke') {
      const a = map(p.age, 0, p.life, 200, 0);
      fill(220, a);
      const s = p.size * PX;
      rect(p.x, p.y, s, s);
    }

    if (p.type === 'ember') {
      const a = map(p.age, 0, p.life, 255, 0);
      fill(255, 140, 0, a);
      rect(p.x, p.y, 1 * PX, 1 * PX);
    }
  }
}

// --- CIGARETTE -------------------------------------------------------------

function drawCigarette() {
  const x = snap(cig.x);
  const y = snap(cig.y);
  const h = snap(cig.heightPx * PX);

  const totalL = cig.lengthPx * PX;
  const burnedL = snap(min(cig.burnPx * PX, totalL));
  const remainL = max(0, totalL - burnedL);

  const ashWidth = PX * 2; // thin ash front
  const tipX = x + burnedL;

  // Ash
  fill(120);
  rect(tipX - ashWidth, y, ashWidth, h);

  // Ember
  fill(255, 70, 30);
  rect(tipX - PX, y, PX, h);

  // Paper
  const paperLen = max(0, remainL - 12 * PX);
  if (paperLen > 0) {
    fill(245);
    rect(tipX, y, paperLen, h);

    fill(230);
    for (let i = 0; i < int(paperLen / (4 * PX)); i++)
      rect(tipX + i * 4 * PX, y + h - PX, 2, 1);
  }

  // Filter
  const filterLen = min(remainL, 12 * PX);
  if (filterLen > 0) {
    const fx = tipX + paperLen;
    fill(232, 150, 75);
    rect(fx, y, filterLen, h);

    fill(210, 120, 50);
    for (let i = 0; i < 10; i++)
      rect(
        fx + int(random(filterLen / PX)) * PX,
        y + int(random(h / PX)) * PX,
        PX,
        PX
      );
  }

  // Shadow line
  fill(0, 40);
  rect(x - 2 * PX, y + h + 2 * PX, (cig.lengthPx + 10) * PX, PX);
}

// --- UI ---------------------------------------------------------------------

function drawOverMessage() {
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(7 * PX);
  text("PAUSA FINITA", width / 2, height / 2 - 8 * PX);

  textSize(3.2 * PX);
  fill(200);
  //text("Premi SPAZIO per ricominciare", width / 2, height / 2 + 4 * PX);
  pop();
}

// --- HELPERS ----------------------------------------------------------------

function burningTipScreenXY() {
  const burnedL = min(cig.burnPx * PX, cig.lengthPx * PX);
  const tipX = snap(cig.x + burnedL);
  const tipY = snap(cig.y + cig.heightPx * PX / 2 - 2 * PX);
  return { x: tipX, y: tipY };
}

function snap(v) {
  return Math.round(v / PX) * PX;
}

// Restart
function keyPressed() {
  // Leertaste (space)
  if (keyCode === 32 && !finished) {
    takePuff();
  }
  
}


