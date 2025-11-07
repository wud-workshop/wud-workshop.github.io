let cam;
let tiles = [];
const cols = 10;
const rows = 10;
let tileW, tileH;



function setup() {
  createCanvas(windowWidth, windowHeight);
  cam = createCapture(VIDEO);
  cam.size(640, 480);
  cam.hide();

  tileW = width / cols;
  tileH = height / rows;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const sx = map(x, 0, cols, 0, cam.width);
      const sy = map(y, 0, rows, 0, cam.height);
      tiles.push(new Tile(x * tileW, y * tileH, sx, sy));
    }
  }

  noStroke();
}

function draw() {
  background(55, 190); // soft fading trail
  
  for (let t of tiles) {
    t.update();
    t.display();
  }
}

class Tile {
  constructor(x, y, sx, sy) {
    this.x = x;
    this.y = y;
    this.sx = sx;
    this.sy = sy;
    this.offsetX = random(-40, 40);
    this.offsetY = random(-40, 40);
    this.t = random(1000);
  }

  update() {
    // smooth drifting motion
    this.t += 0.01;
    const driftX = noise(this.t, this.sx * 0.01) * 80 - 40;
    const driftY = noise(this.t + 100, this.sy * 0.01) * 80 - 40;
    this.offsetX = lerp(this.offsetX, driftX, 0.05);
    this.offsetY = lerp(this.offsetY, driftY, 0.05);
  }

  display() {
    const sx = constrain(this.sx + this.offsetX, 0, cam.width - tileW);
    const sy = constrain(this.sy + this.offsetY, 0, cam.height - tileH);
    image(cam, this.x, this.y, tileW, tileH, sx, sy, tileW, tileH);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
