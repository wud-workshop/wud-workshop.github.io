// Low-fidelity 8-bit Mona Lisa with animated eyes
// by ChatGPT (GPT-5)

let pixelsWide = 20;  // Number of "pixels" horizontally
let pixelsHigh = 24;  // Number of "pixels" vertically
let pixelSize = 20;   // Size of each block

let palette = {
  skin: '#D2A679',
  darkSkin: '#A67C52',
  brown: '#7A5230',
  darkBrown: '#4B3621',
  hair: '#3B2F2F',
  black: '#1C1C1C',
  background: '#C2B280',
  green: '#607D3B',
  dress: '#40372A',
  eyeWhite: '#F2F2F2',
  eyeDark: '#3B2E1D'
};

let mona = [];

function setup() {
  createCanvas(pixelsWide * pixelSize, pixelsHigh * pixelSize);
  noStroke();

  // Simple low-res pixel Mona Lisa (20x24 grid)
  // Each row represents approximate colors
  mona = [
    "bbbbbbbbbbbbbbbbbbbb",
    "bbbbbbbbbbbbbbbbbbbb",
    "bbbbbggggggggggbbbbb",
    "bbgggsssssssgggggbbb",
    "bggsssssSSSsssssSggb",
    "bgsSSSSSSSSSSSSSSsgb",
    "bgsSSShhhhhhSSSSSsgb",
    "bgsSShhsSSshhSSSSsgb",
    "bgsShhSShhSShhSSSsgb",
    "bgsShSSShhShSSSSSsgb",
    "bgsShhhShhShhhSSSsgb",
    "bgsSSShhhhhhSSSSSsgb",
    "bgsSSSSSSSSSSSSSssgb",
    "bgsSSSSSSSSSSSSSssgb",
    "bgsSSSSdddddSSSSssgb",
    "bgsSSddddddddddSSsgb",
    "bbgsddddddddddddsgbb",
    "bbbgsddddddddddsgbbb",
    "bbbbgsddddddddsgbbbb",
    "bbbbbggsssssgggbbbbb",
    "bbbbbbgggggggggbbbbb",
    "bbbbbbbbbbbbbbbbbbbb",
    "bbbbbbbbbbbbbbbbbbbb",
    "bbbbbbbbbbbbbbbbbbbb"
  ];
}

function draw() {
  background(palette.background);
  drawMona();
  drawEyes();
}

// Draw the blocky pixel art Mona Lisa
function drawMona() {
  for (let y = 0; y < pixelsHigh; y++) {
    for (let x = 0; x < pixelsWide; x++) {
      let c = mona[y][x];
      fill(getColor(c));
      rect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
}

// Map character to palette color
function getColor(c) {
  switch (c) {
    case 's': return palette.skin;
    case 'S': return palette.darkSkin;
    case 'h': return palette.hair;
    case 'b': return palette.black;
    case 'g': return palette.green;
    case 'd': return palette.dress;
    default: return palette.background;
  }
}

// Draw simple eye animation — the eyes follow the mouse
function drawEyes() {
  // Base position for eyes (approximate pixel centers)
  let leftEyeBase = createVector(8 * pixelSize + pixelSize / 2, 9 * pixelSize + pixelSize / 2);
  let rightEyeBase = createVector(11 * pixelSize + pixelSize / 2, 9 * pixelSize + pixelSize / 2);

  // Distance of pupil from center based on mouse
  let offsetMax = 16;
  let mouseVec = createVector(mouseX, mouseY);

  drawEye(leftEyeBase, mouseVec, offsetMax);
  drawEye(rightEyeBase, mouseVec, offsetMax);
}

function drawEye(basePos, mouseVec, offsetMax) {
  // Compute direction from eye to mouse
  let dir = p5.Vector.sub(mouseVec, basePos);
  dir.limit(offsetMax);

  // Eye white
  fill(palette.eyeWhite);
  ellipse(basePos.x, basePos.y, pixelSize * 0.9, pixelSize * 0.9);

  // Pupil
  fill(palette.eyeDark);
  ellipse(basePos.x + dir.x * 0.2, basePos.y + dir.y * 0.2, pixelSize * 0.3, pixelSize * 0.3);
}

