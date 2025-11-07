// p5.js (WEBGL)
// - Red pixel-art hearts
// - Colorful changing background
// - Hearts move by themselves in 3D and bounce
// - Mouse click: hearts spin fast at first, then slow down (decay)
// - Slider controls number of hearts

let countSlider, countLabel;
let hearts = [];
let spinSpeed = 0;       // angular velocity applied to all hearts
let spinAngle = 0;       // accumulated rotation
const SPIN_IMPULSE = 0.5; // strong initial spin on click
const SPIN_DAMPING = 0.965; // exponential slowdown per frame

// 10x9 pixel-art heart pattern (1 = filled, 0 = empty)
const HEART_PIXELS = [
  "0011000110",
  "0111101111",
  "1111111111",
  "1111111111",
  "0111111110",
  "0011111100",
  "0001111000",
  "0000110000",
  "0000010000",
];

const margin = 60;  // keep hearts away from walls a bit
let bounds = { x: 0, y: 0, z: 0 };

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);   // crisper pixel look
  noSmooth();        // avoid interpolation for pixel art
  noStroke();
  colorMode(HSB, 360, 100, 100, 255);

  // UI
  countSlider = createSlider(1, 200, 50, 1);
  countSlider.position(16, 16);
  countSlider.input(() => { updateCountLabel(); regenerate(); });

  countLabel = createDiv('');
  countLabel.position(16, 44);
  countLabel.style('color', '#fff');
  countLabel.style('font-family', 'monospace');
  updateCountLabel();

  // 3D bounds: use canvas size as box, with a comfortable depth
  bounds.x = () => width / 2 - margin;
  bounds.y = () => height / 2 - margin;
  bounds.z = () => min(width, height) * 0.5; // depth range

  regenerate();
}

function draw() {
  // Super colorful background cycling
  const hue = (frameCount * 2) % 360;
  background(hue, 90, 95);

  // Update hearts motion and draw
  for (const h of hearts) {
    h.update();
  }

  // Global spin: fast at first, then slows down
  spinAngle += spinSpeed;
  spinSpeed *= SPIN_DAMPING;
  if (abs(spinSpeed) < 0.0001) spinSpeed = 0;

  for (const h of hearts) {
    push();
    translate(h.x, h.y, h.z);
    rotateY(spinAngle);     // spin around vertical axis
    drawPixelHeart(h.size); // centered pixel art heart
    pop();
  }
}

function mousePressed() {
  // Ignore clicks over the slider area
  const overUI = mouseX >= 0 && mouseX <= 260 && mouseY >= 0 && mouseY <= 80;
  if (overUI) return;
  // Apply a fresh spin impulse (starts fast, then slows)
  spinSpeed = SPIN_IMPULSE;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  regenerate();
}

// -------- Hearts management --------
function regenerate() {
  hearts = [];
  const n = countSlider.value();

  for (let i = 0; i < n; i++) {
    const x = random(-bounds.x(), bounds.x());
    const y = random(-bounds.y(), bounds.y());
    const z = random(-bounds.z(), bounds.z());

    // Heart size in pixels (height). Keep within comfortable range.
    const size = random(22, 64);

    // Random 3D velocity
    const speed = random(0.6, 2.0);
    const dir = p5.Vector.random3D();
    const vx = dir.x * speed;
    const vy = dir.y * speed;
    const vz = dir.z * speed;

    hearts.push(new Heart(x, y, z, vx, vy, vz, size));
  }
}

function updateCountLabel() {
  countLabel.html(`count: ${countSlider.value()}`);
}

// -------- Heart class (3D motion + bouncing) --------
class Heart {
  constructor(x, y, z, vx, vy, vz, size) {
    this.x = x; this.y = y; this.z = z;
    this.vx = vx; this.vy = vy; this.vz = vz;
    this.size = size;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;

    // bounce against a 3D box
    const bx = bounds.x(), by = bounds.y(), bz = bounds.z();

    if (this.x < -bx) { this.x = -bx; this.vx *= -1; }
    if (this.x >  bx) { this.x =  bx; this.vx *= -1; }

    if (this.y < -by) { this.y = -by; this.vy *= -1; }
    if (this.y >  by) { this.y =  by; this.vy *= -1; }

    if (this.z < -bz) { this.z = -bz; this.vz *= -1; }
    if (this.z >  bz) { this.z =  bz; this.vz *= -1; }
  }
}

// -------- Pixel-art heart drawing --------
function drawPixelHeart(size) {
  // Draw a pixel-heart centered at (0,0) in the XY plane facing the camera.
  // HEART_PIXELS height = rows, width = cols.
  const rows = HEART_PIXELS.length;
  const cols = HEART_PIXELS[0].length;

  // Pixel size derived from desired overall height
  const px = floor(size / rows);
  const w = cols * px;
  const h = rows * px;

  // Center the grid: start at (-w/2, -h/2)
  const x0 = -w / 2;
  const y0 = -h / 2;

  // Red color (HSB: hue 0 is red)
  fill(0, 90, 100, 255); // vivid red, fully opaque
  noStroke();

  // Draw filled pixels as small rects (keeps pixelated look with noSmooth)
  for (let r = 0; r < rows; r++) {
    const row = HEART_PIXELS[r];
    for (let c = 0; c < cols; c++) {
      if (row[c] === '1') {
        // align to integer positions to keep sharp pixels
        const rx = x0 + c * px;
        const ry = y0 + r * px;
        rect(rx, ry, px, px);
      }
    }
  }
}
