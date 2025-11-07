// Array to store all balls
let balls = [];

function setup() {
  createCanvas(800, 600);
  noStroke();
}

function draw() {
  background(240);

  // Update and display all balls
  for (let ball of balls) {
    ball.update();
    ball.display();
  }
}

// Add a new ball on mouse press
function mousePressed() {
  const newBall = new Ball(mouseX, mouseY);
  balls.push(newBall);
}

// Ball class definition
class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = random(20, 50);
    this.color = color(random(255), random(255), random(255));
    this.speedX = random(-2, 2);
    this.speedY = random(-2, 2);
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Bounce off walls
    if (this.x < this.radius || this.x > width - this.radius) {
      this.speedX *= -1;
    }
    if (this.y < this.radius || this.y > height - this.radius) {
      this.speedY *= -1;
    }
  }

  display() {
    fill(this.color);
    ellipse(this.x, this.y, this.radius * 2);
  }
}
