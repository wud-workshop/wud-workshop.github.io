// sketch.js
// Requires p5.js + p5.sound.js
//
// ✅ Loudness → MORE compression
// ✅ Sensitivity adjustable with slider
// ✅ Loudness → pixel color spectrum (blue → red)
// ✅ “ANGER TEST” label bottom-center
// ✅ Score increases when the user screams

let video;
let mic;
let userStartedAudio = false;

let sensitivitySlider;
let levelHistory = [];
const LEVEL_HISTORY_LEN = 12;

let off;
let canvasW = 800;
let canvasH = 600;

let angerScore = 0;

function setup() {
  let cnv = createCanvas(canvasW, canvasH);
  pixelDensity(1);

  // Click activates mic
  cnv.mousePressed(startAudio);
  cnv.touchStarted(startAudio);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  off = createGraphics(320, 240);
  off.noSmooth();
  off.pixelDensity(1);

  mic = new p5.AudioIn();

  // Sensitivity control
  sensitivitySlider = createSlider(0.01, 1.0, 0.25, 0.01);
  sensitivitySlider.position(10, 10);
  sensitivitySlider.style("width", "200px");
}

function startAudio() {
  if (!userStartedAudio) {
    userStartedAudio = true;
    getAudioContext().resume().then(() => {
      mic.start();
    });
  }
}

function getSmoothedLevel() {
  if (!mic.enabled) return 0;
  let lv = mic.getLevel();
  lv = constrain(lv, 0, 1);
  levelHistory.push(lv);
  if (levelHistory.length > LEVEL_HISTORY_LEN) levelHistory.shift();
  return levelHistory.reduce((a, b) => a + b, 0) / levelHistory.length;
}

function draw() {
  background(20);

  let raw = getSmoothedLevel();
  let sens = sensitivitySlider.value();
  let factor = map(raw, 0, sens, 0, 1);
  factor = constrain(factor, 0, 1);
  factor = pow(factor, 1.3);

  // Update anger score — louder = more points
  angerScore += factor * 0.5;  // adjust multiplier if needed

  // Resolution compression
  let lowW = int(map(factor, 0, 1, width, width * 0.03));
  let lowH = int(map(factor, 0, 1, height, height * 0.03));
  lowW = max(16, lowW);
  lowH = max(12, lowH);

  if (off.width !== lowW || off.height !== lowH) {
    off = createGraphics(lowW, lowH);
    off.noSmooth();
    off.pixelDensity(1);
  }

  // Draw camera into tiny buffer
  off.push();
  off.background(0);

  let vw = video.width;
  let vh = video.height;
  let targetRatio = off.width / off.height;
  let vidRatio = vw / vh;

  if (vidRatio > targetRatio) {
    let drawH = off.height;
    let drawW = drawH * vidRatio;
    off.image(video, (off.width - drawW) / 2, 0, drawW, drawH);
  } else {
    let drawW = off.width;
    let drawH = drawW / vidRatio;
    off.image(video, 0, (off.height - drawH) / 2, drawW, drawH);
  }
  off.pop();

  off.loadPixels();

  // Color shift based on loudness:
  // quiet → BLUE / loud → RED
  for (let i = 0; i < off.pixels.length; i += 4) {
    let r = off.pixels[i];
    let g = off.pixels[i + 1];
    let b = off.pixels[i + 2];

    let blueBoost = (1 - factor) * 180;
    let redBoost  = factor * 180;

    r = r + redBoost;
    b = b + blueBoost;

    off.pixels[i]     = constrain(r, 0, 255);
    off.pixels[i + 1] = g;
    off.pixels[i + 2] = constrain(b, 0, 255);
  }

  off.updatePixels();

  // Draw with nearest-neighbor
  push();
  drawingContext.imageSmoothingEnabled = false;
  image(off, 0, 0, width, height);
  drawingContext.imageSmoothingEnabled = true;
  pop();

  drawHUD(raw, factor);
  drawAngerDisplay();
}

function drawHUD(raw, factor) {
  push();
  fill(255);
  textSize(15);
  textAlign(LEFT, TOP);

  text("Sensitivity", 220, 10);
  text("Mic: " + nf(raw, 1, 3), 10, 60);
  text("Factor: " + nf(factor, 1, 3), 10, 80);

  if (!userStartedAudio || !mic.enabled) {
    fill(255, 60, 60);
    text("Click to enable microphone", 10, 120);
  }
  pop();
}

function drawAngerDisplay() {
  push();
  textAlign(CENTER, CENTER);

  // Sign
  textSize(36);
  fill(255);
  text("ANGER TEST", width / 2, height - 80);

  // Score
  textSize(24);
  text("Score: " + nf(angerScore, 1, 1), width / 2, height - 45);

  pop();
}
