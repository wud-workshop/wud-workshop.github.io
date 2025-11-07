// Moving colored circles with smooth colors
// New circles appear BEHIND older ones
// First circle is black
// Background text: "wait for it"

let circles = [];
let startTime;

function setup() {
  createCanvas(800, 400);
  colorMode(HSB);
  textAlign(CENTER, CENTER);
  textSize(80);
  startTime = millis();
}

function draw() {
  background(0);

  // ✅ background text
  fill(255, 40);            // white, low opacity
  noStroke();
  text("wait for it", width/2, height/2);

  let t = (millis() - startTime) / 500;
  let totalCircles = floor(t);

  // create missing circles
  while (circles.length < totalCircles) {
    circles.push(makeCircle(circles.length));
  }

  // draw in reverse so newest is behind
  for (let i = circles.length - 1; i >= 0; i--) {
    drawCircle(circles[i], t);
  }
}

function makeCircle(index) {
  return {
    x: width / 2,
    baseY: height / 2,
    hue: (index * 18) % 360,
    delay: index * 0.01,
    index: index
  };
}

function drawCircle(c, t) {
  let time = max(0, t - c.delay);
  let y = c.baseY + sin(time * 2) * 200;

  stroke(0);
  strokeWeight(1);

  // first circle black, others colorful
  if (c.index === 0) fill(0);
  else fill(c.hue, 200, 230);

  ellipse(c.x, y, 300, 300);
}