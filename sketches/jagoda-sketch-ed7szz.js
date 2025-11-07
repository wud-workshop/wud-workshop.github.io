// 🐸 Frog Chase Game
// Move your frog with arrow keys to catch the other frog!

let player;
let target;
let score = 0;

function setup() {
  createCanvas(600, 400);
  player = new Frog(width / 2, height / 2, color(0, 200, 0)); // green frog
  target = new Frog(random(width), random(height), color(0, 150, 255)); // blue frog
  textAlign(CENTER, CENTER);
  textSize(20);
}

function draw() {
  background(100, 200, 100); // grassy background

  // Move and display frogs
  player.display();
  target.display();
  target.moveRandom();

  // Player movement
  handleInput();

  // Check collision
  if (dist(player.x, player.y, target.x, target.y) < 40) {
    score++;
    target.x = random(width);
    target.y = random(height);
  }

  // Display score
  fill(255);
  noStroke();
  text("Score: " + score, width / 2, 30);
}

// Handle arrow key input
function handleInput() {
  if (keyIsDown(LEFT_ARROW)) player.x -= 4;
  if (keyIsDown(RIGHT_ARROW)) player.x += 4;
  if (keyIsDown(UP_ARROW)) player.y -= 4;
  if (keyIsDown(DOWN_ARROW)) player.y += 4;

  // Keep player inside the screen
  player.x = constrain(player.x, 0, width);
  player.y = constrain(player.y, 0, height);
}

// Frog class
class Frog {
  constructor(x, y, c) {
    this.x = x;
    this.y = y;
    this.c = c;
  }

  display() {
    push();
    translate(this.x, this.y);
    fill(this.c);
    stroke(0);
    strokeWeight(2);

    // body
    ellipse(0, 0, 40, 30);
    // eyes
    fill(255);
    ellipse(-10, -15, 10, 10);
    ellipse(10, -15, 10, 10);
    fill(0);
    ellipse(-10, -15, 5, 5);
    ellipse(10, -15, 5, 5);
    // mouth
    noFill();
    stroke(0);
    arc(0, 5, 15, 10, 0, PI);
    pop();
  }

  moveRandom() {
    // Random wandering movement
    this.x += random(-2, 2);
    this.y += random(-2, 2);

    // Keep within bounds
    this.x = constrain(this.x, 20, width - 20);
    this.y = constrain(this.y, 20, height - 20);
  }
}
