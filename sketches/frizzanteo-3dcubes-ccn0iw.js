// sketch.js - p5.js (WEBGL) bouncing & rotating cubes with slider
// Requirements satisfied:
// - WEBGL canvas
// - black background
// - cubes filled black with green stroke
// - cubes bounce inside the view volume and rotate on all 3 axes randomly
// - slider to control number of cubes (live)

let cubes = [];
let countSlider;
let countLabel;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  // Slider: min 1, max 200, initial 30, step 1
  // Place it on top-left (DOM overlay)
  countSlider = createSlider(1, 200, 30, 1);
  countSlider.position(12, 12);
  countSlider.style('width', '180px');

  // Label showing current count
  countLabel = createP();
  countLabel.position(200, 0);
  countLabel.style('color', '#00FF00');
  countLabel.style('margin', '6px 0 0 8px'); // slight alignment

  // initialize cubes to slider's initial value
  for (let i = 0; i < countSlider.value(); i++) {
    cubes.push(new BouncingCube());
  }

  // stroke settings for all cubes
  strokeWeight(2);
  stroke(0, 255, 0); // green stroke
  // The cubes themselves are filled black; since background is black,
  // the stroke will be the visible outline.
  noSmooth();

    background(0); // black background

}

function draw() {

  // update label
  countLabel.html('Cubi: ' + countSlider.value());

  // adjust array length to match slider (add or remove cubes)
  const target = countSlider.value();
  while (cubes.length < target) cubes.push(new BouncingCube());
  while (cubes.length > target) cubes.pop();

  // optional subtle ambient so stroke lighting is consistent (doesn't affect stroke)
  // but we keep lighting minimal to preserve black faces appearance
  ambientLight(40);

  // center of the world is canvas center (WEBGL). We'll define bounds relative to canvas.
  // We'll also allow a depth volume proportional to width.
  const bounds = {
    x: width / 2,
    y: height / 2,
    z: max(width, height) / 2
  };

  // iterate and draw cubes
  for (let c of cubes) {
    c.update(bounds);
    c.display();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// BouncingCube class
class BouncingCube {
  constructor() {
    // position: random within the view volume
    this.pos = createVector(
      random(-width / 4, width / 4),
      random(-height / 4, height / 4),
      random(-max(width, height) / 6, max(width, height) / 6)
    );

    // velocity: small random velocities
    this.vel = createVector(
      random(-3, 3),
      random(-3, 3),
      random(-3, 3)
    );

    // size of cube
    this.size = random(24, 80);

    // rotation angles (radians)
    this.rx = random(TWO_PI);
    this.ry = random(TWO_PI);
    this.rz = random(TWO_PI);

    // rotation speed around each axis (radians per frame)
    // allow positive or negative small speeds
    this.rSpeed = createVector(
      random(-0.08, 0.08),
      random(-0.08, 0.08),
      random(-0.08, 0.08)
    );

    // stroke color and fill are global; but keep per-cube optional jitter for variety
    this.strokeJitter = random(-20, 20);
  }

  update(bounds) {
    // move
    this.pos.add(this.vel);

    // rotate
    this.rx += this.rSpeed.x;
    this.ry += this.rSpeed.y;
    this.rz += this.rSpeed.z;

    // bounce on X
    const halfSize = this.size / 2;
    if (this.pos.x + halfSize > bounds.x / 1.05) {
      this.pos.x = bounds.x / 1.05 - halfSize;
      this.vel.x *= -1;
      this._onBounce();
    } else if (this.pos.x - halfSize < -bounds.x / 1.05) {
      this.pos.x = -bounds.x / 1.05 + halfSize;
      this.vel.x *= -1;
      this._onBounce();
    }

    // bounce on Y
    if (this.pos.y + halfSize > bounds.y / 1.05) {
      this.pos.y = bounds.y / 1.05 - halfSize;
      this.vel.y *= -1;
      this._onBounce();
    } else if (this.pos.y - halfSize < -bounds.y / 1.05) {
      this.pos.y = -bounds.y / 1.05 + halfSize;
      this.vel.y *= -1;
      this._onBounce();
    }

    // bounce on Z (depth)
    if (this.pos.z + halfSize > bounds.z / 1.05) {
      this.pos.z = bounds.z / 1.05 - halfSize;
      this.vel.z *= -1;
      this._onBounce();
    } else if (this.pos.z - halfSize < -bounds.z / 1.05) {
      this.pos.z = -bounds.z / 1.05 + halfSize;
      this.vel.z *= -1;
      this._onBounce();
    }
  }

  _onBounce() {
    // Slight random tweak to rotation speed on bounce for variance
    this.rSpeed.x += random(-0.01, 0.01);
    this.rSpeed.y += random(-0.01, 0.01);
    this.rSpeed.z += random(-0.01, 0.01);

    // limit rotation speeds to keep motion pleasant
    this.rSpeed.x = constrain(this.rSpeed.x, -0.12, 0.12);
    this.rSpeed.y = constrain(this.rSpeed.y, -0.12, 0.12);
    this.rSpeed.z = constrain(this.rSpeed.z, -0.12, 0.12);
  }

  display() {
    push();

    // translate to cube position
    translate(this.pos.x, this.pos.y, this.pos.z);

    // apply rotations
    rotateX(this.rx);
    rotateY(this.ry);
    rotateZ(this.rz);

    // fill black, stroke green (stroke set globally)
    fill(0); // black interior
    // Slight dynamic stroke brightness if you like:
    const g = constrain(255 + this.strokeJitter, 0, 255);
    stroke(0, g, 0);

    box(this.size);

    pop();
  }
}
