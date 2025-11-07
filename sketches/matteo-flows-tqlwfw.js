// Flowing word flock with magnetic attraction on mouse press.

const COUNT = 120;
const MAX_SPEED = 3.0;
const MAX_FORCE = 0.06;

let agents = [];
let zoff = 0;

const WORDS = [
  "river","spark","dream","orbit","cloud","echo","pulse","light",
  "breeze","shift","flare","wander","glow","whisper","drift","trace",
  "ripple","bloom","north","ember","wave","story","future","motion"
];

function setup() {
  createCanvas(900, 520);
  textFont('Helvetica, Arial, sans-serif');
  textAlign(CENTER, CENTER);
  noStroke();

  for (let i = 0; i < COUNT; i++) {
    agents.push(new WordBoid(random(width), random(height)));
  }
}

function draw() {
  background(18, 20, 26);
  zoff += 0.005;

  for (let b of agents) {
    // Flow force (gentle nudge from noise field)
    b.applyForce(flowForceAt(b.pos.x, b.pos.y, zoff));

    // Magnetic attraction while mouse is pressed
    if (mouseIsPressed) {
      b.applyForce(b.magnetic(createVector(mouseX, mouseY)));
    }

    b.update();
    b.wrapEdges();
    b.render();
  }

  // Visual hint when magnet is active
  if (mouseIsPressed) {
    noFill();
    stroke(255, 40);
    circle(mouseX, mouseY, 140);
    noStroke();
  }
}

// -------- Word Agent --------

class WordBoid {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.fromAngle(random(TWO_PI)).mult(random(0.5, 2));
    this.acc = createVector(0, 0);

    this.text = random(WORDS);
    this.size = random(14, 34);
    this.col = color(255, random(160, 220), 90, 230);
  }

  applyForce(f) {
    this.acc.add(f);
  }

  magnetic(target) {
    const dir = p5.Vector.sub(target, this.pos);
    const d = constrain(dir.mag(), 1, 300);
    dir.normalize();

    const strength = map(d, 1, 300, 0.28, 0.0); // strong when close
    dir.mult(strength);
    return dir.limit(MAX_FORCE * 1.6);
  }

  update() {
    this.vel.add(this.acc).limit(MAX_SPEED);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  wrapEdges() {
    const m = 40;
    if (this.pos.x < -m) this.pos.x = width + m;
    if (this.pos.x > width + m) this.pos.x = -m;
    if (this.pos.y < -m) this.pos.y = height + m;
    if (this.pos.y > height + m) this.pos.y = -m;
  }

  render() {
    const ang = this.vel.heading();
    const speed = this.vel.mag();
    const a = map(speed, 0, MAX_SPEED, 150, 255);

    push();
    translate(this.pos.x, this.pos.y);
    rotate(ang); // orient along motion
    fill(red(this.col), green(this.col), blue(this.col), a);
    textSize(this.size);
    // Draw text centered; slight forward offset so the word "points" forward
    text(this.text, this.size * 0.3, 0);
    pop();
  }
}

// -------- Flow field steering --------

function flowForceAt(x, y, t) {
  const scale = 0.0035; // spatial frequency
  const ang = noise(x * scale, y * scale, t) * TAU;
  // Gentle push toward local flow direction
  return p5.Vector.fromAngle(ang).setMag(MAX_FORCE * 0.9);
}