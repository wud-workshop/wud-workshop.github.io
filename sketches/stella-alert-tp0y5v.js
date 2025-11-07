let prevX, prevY;
let speed = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // start previous mouse positions at the center
  prevX = mouseX;
  prevY = mouseY;
}

function draw() {
  // calculate distance mouse moved since last frame
  let dx = mouseX - prevX;
  let dy = mouseY - prevY;

  // speed is distance
  speed = sqrt(dx * dx + dy * dy);

  // map speed to color range
  let col = map(speed, 0, 50, 0, 255);
  col = constrain(col, 0, 255);

  // fill the background with color that changes by speed
  background(col, 100, 255 - col);

  // update previous position
  prevX = mouseX;
  prevY = mouseY;
}