// Include p5.sound.js in your HTML
// <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.2/p5.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.2/addons/p5.sound.min.js"></script>

let osc, env, filter, reverb;
let particles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor();
  noStroke();

  // Envelope — soft and natural
  env = new p5.Envelope();
  env.setADSR(0.03, 0.3, 0.4, 0.6);
  env.setRange(0.3, 0);

  // Oscillator — pure sine wave for organic tone
  osc = new p5.Oscillator('sine');
  osc.amp(env);
  osc.start();

  // Low-pass filter for warmth
  filter = new p5.LowPass();
  osc.disconnect();
  osc.connect(filter);
  filter.freq(1200);
  filter.res(1.4);

  // Reverb — spacious but balanced
  reverb = new p5.Reverb();
  reverb.process(filter, 10, 0.7);
}

function draw() {
  // Monochrome gradient background
  for (let y = 0; y < height; y++) {
    let gray = map(y, 0, height, 30, 220);
    stroke(gray);
    line(0, y, width, y);
  }

  // Map mouse to sound
  let freq = map(mouseX, 0, width, 180, 880);
  let cutoff = map(mouseY, 0, height, 1000, 4000);
  osc.freq(freq);
  filter.freq(cutoff);

  // Subtle visual pulse
  let r = 150 + sin(frameCount * 0.05) * 8;
  noStroke();
  fill(255, 40);
  ellipse(mouseX, mouseY, r * 2);

  // Particles fade to white
  for (let p of particles) {
    p.update();
    p.show();
  }
  particles = particles.filter(p => !p.finished());
}

function mousePressed() {
  env.play();
  for (let i = 0; i < 15; i++) {
    particles.push(new Particle(mouseX, mouseY));
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1.2, 1.2);
    this.vy = random(-1.2, 1.2);
    this.alpha = 255;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 3;
  }
  finished() {
    return this.alpha < 0;
  }
  show() {
    noStroke();
    fill(255, this.alpha * 0.5);
    ellipse(this.x, this.y, 6);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}