let dogs = []; // array to store dog positions and movement

function setup() {
  createCanvas(600, 400);
  background(200);
}

function draw() {
  background (255);

  // update and draw all dogs
  for (let dog of dogs) {
    dog.x += dog.vx;
    dog.y += dog.vy;

    // bounce off the walls
    if (dog.x < 0 || dog.x > width) dog.vx *= -1;
    if (dog.y < 0 || dog.y > height) dog.vy *= -1;

    drawDog(dog.x, dog.y);
  }
}

function mousePressed() {
  // add a new dog with random walking speed
  let newDog = {
    x: mouseX,
    y: mouseY,
    vx: random(-1.5, 1.5), // horizontal speed
    vy: random(-1.5, 1.5)  // vertical speed
  };
  dogs.push(newDog);
}

// function to draw a simple dog at given coordinates
function drawDog(x, y) {
  push();
  translate(x, y);
  scale(0.5); // small size

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
