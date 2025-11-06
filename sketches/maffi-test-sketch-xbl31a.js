function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Draw a circle that follows mouse
  fill(255, 0, 100);
  ellipse(mouseX, mouseY, 50, 50);
  
  // Draw text
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(20);
  text('Workshop Test Sketch', 200, 200);
}

