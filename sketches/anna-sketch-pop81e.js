// p5.js sketch: creates a small dog each time the mouse is clicked

let dogs = []; // array to store dog positions

function setup() {
  createCanvas(600, 400);
  background(200);
}

function draw() {
  background(300);

  // draw all dogs
  for (let dog of dogs) {
    drawDog(dog.x, dog.y);
  }
}

function mousePressed() {
  // add a new dog at the mouse position
  dogs.push({ x: mouseX, y: mouseY });
}

// function to draw a simple dog at given coordinates
function drawDog(x, y) {
  push();
  translate(x, y);
  scale(0.5); // make the dog small

  // body
  fill(150, 100, 50);
  ellipse(0, 0, 120, 40);

  // head
  ellipse(40, -10, 40, 30);

  // ears
  fill(120, 70, 30);
  triangle(50, -25, 45, -40, 55, -30);
  triangle(30, -25, 25, -40, 35, -30);

  // eyes
  fill(0);
  ellipse(45, -10, 5, 5);
  ellipse(35, -10, 5, 5);

  // nose
  fill(0);
  ellipse(55, -5, 5, 5);

  // legs
  fill(150, 100, 50);
  rect(-30, 15, 10, 20);
  rect(10, 15, 10, 20);
  rect(-10, 15, 10, 20);
  rect(30, 15, 10, 20);

  // tail
  stroke(120, 70, 30);
  strokeWeight(4);
  line(-40, -10, -60, -30);

  pop();
}
