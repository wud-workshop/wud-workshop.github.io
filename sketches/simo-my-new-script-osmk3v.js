// Game of Life Pattern Generator
// Click the mouse to generate a new random pattern

const cellSize = 10;      // Size of each cell in pixels
let cols, rows;
let grid;
let nextGrid;
let running = true;

function setup() {
  createCanvas(800, 600);
  frameRate(10);
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);
  initGrid();
}

function draw() {
  background(20);

  if (running) {
    drawGrid();
    updateGrid();
  }
}

// Initialize grid with random pattern
function initGrid() {
  grid = create2DArray(cols, rows);
  nextGrid = create2DArray(cols, rows);

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      grid[x][y] = random() > 0.8 ? 1 : 0;
    }
  }
}

// Draw all live cells
function drawGrid() {
  noStroke();
  fill(0, 255, 100);

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (grid[x][y] === 1) {
        rect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
}

// Apply Conway’s Game of Life rules
function updateGrid() {
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const state = grid[x][y];
      const neighbors = countNeighbors(grid, x, y);

      if (state === 0 && neighbors === 3) {
        nextGrid[x][y] = 1; // Birth
      } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
        nextGrid[x][y] = 0; // Death
      } else {
        nextGrid[x][y] = state; // Survival
      }
    }
  }

  // Swap references instead of copying arrays
  [grid, nextGrid] = [nextGrid, grid];
}

// Count live neighbors around a cell
function countNeighbors(grid, x, y) {
  let sum = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;

      const col = (x + dx + cols) % cols;
      const row = (y + dy + rows) % rows;
      sum += grid[col][row];
    }
  }
  return sum;
}

// Utility to create 2D array
function create2DArray(cols, rows) {
  const arr = new Array(cols);
  for (let i = 0; i < cols; i++) {
    arr[i] = new Array(rows).fill(0);
  }
  return arr;
}

// Generate new random pattern on mouse click
function mousePressed() {
  initGrid();
}
