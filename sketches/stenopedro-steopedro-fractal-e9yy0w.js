let depthSlider;
let triangles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  angleMode(DEGREES);
  noFill();

  // Slider per controllare la profondità del frattale
  createP("Profondità del Triangolo di Sierpiński:")
    .style("color", "white")
    .style("font-size", "16px");

  depthSlider = createSlider(1, 8, 5, 1);
  depthSlider.style("width", "300px");

  // Crea un triangolo iniziale
  addTriangle();
}

function draw() {
  background(0, 0, 10, 20); // leggermente trasparente per la scia

  const depth = depthSlider.value();

  for (const tri of triangles) {
    push();
    translate(tri.x, tri.y);
    rotate(frameCount * tri.rotationSpeed);
    strokeWeight(2);
    drawSierpinski(0, 0, tri.size, depth, tri.hue);
    pop();
  }
}

// Funzione ricorsiva per disegnare il triangolo di Sierpiński
function drawSierpinski(x, y, size, depth, hue) {
  stroke((hue + random(-10, 10)) % 360, 80, 100);

  if (depth === 0) {
    beginShape();
    vertex(x, y);
    vertex(x + size / 2, y - size * sqrt(3) / 2);
    vertex(x + size, y);
    endShape(CLOSE);
  } else {
    drawSierpinski(x, y, size / 2, depth - 1, hue + 20);
    drawSierpinski(x + size / 2, y, size / 2, depth - 1, hue + 40);
    drawSierpinski(x + size / 4, y - size * sqrt(3) / 4, size / 2, depth - 1, hue + 60);
  }
}

// Aggiunge un nuovo triangolo casuale
function addTriangle() {
  const tri = {
    x: random(width * 0.2, width * 0.8),
    y: random(height * 0.4, height * 0.8),
    size: random(min(width, height) * 0.2, min(width, height) * 0.6),
    hue: random(360),
    rotationSpeed: random(0.2, 1.2)
  };
  triangles.push(tri);
}

// Al click del mouse aggiungi un nuovo triangolo
function mousePressed() {
  addTriangle();
}

// Mantieni il canvas a schermo intero
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
