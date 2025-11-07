let cam;
let tiles = [];
const cols = 6;
const rows = 6;
let tileW, tileH;

function setup() {
  createCanvas(windowWidth, windowHeight);
  cam = createCapture(VIDEO);
  cam.size(640, 480);
  cam.hide();
  frameRate(9);



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
  background(0, 60);

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

    // ogni tile ha una probabilità o frequenza diversa di aggiornamento
    this.delayFrames = int(random(5, 60)); // quanti frame aspettare tra un update e l’altro
    this.frameCounter = int(random(10, this.delayFrames));
  }

  update() {
    // aggiorna solo se ha raggiunto il suo ritardo
    this.frameCounter++;
    if (this.frameCounter < this.delayFrames) return;
    this.frameCounter = 0;

    // movimento morbido basato sul noise
    this.t += 0.1;
    const driftX = noise(this.t, this.sx * 0.4) * 80 - 40;
    const driftY = noise(this.t + 100, this.sy * 0.01) * 80 - 40;
    this.offsetX = lerp(this.offsetX, driftX, 0.7);
    this.offsetY = lerp(this.offsetY, driftY, 0.7);
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
