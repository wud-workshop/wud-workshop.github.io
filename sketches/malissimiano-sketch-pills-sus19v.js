let t = 0;
let rowSpeeds = [];
let rowTimers = [];
let rowPauses = [];
let rowPauseDurations = [];
// Define base rows with their pills (initial widths)
let baseRows = [];

function generateRandomRows() {
  baseRows = [];
  let numRows = 12; // Total number of rows
  
  for (let i = 0; i < numRows; i++) {
    generateSingleRow(i);
  }
}

function generateSingleRow(index) {
  let numPills = int(random(2, 5)); // Random number of pills: 2, 3, or 4
  let row = [];
  let remaining = 500;
  
  // Generate random widths that sum to 500
  for (let j = 0; j < numPills - 1; j++) {
    let minWidth = 50;
    let maxWidth = remaining - (numPills - j - 1) * minWidth;
    let width = random(minWidth, maxWidth);
    row.push(width);
    remaining -= width;
  }
  // Last pill gets the remaining width
  row.push(remaining);
  
  baseRows[index] = row;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Generate random rows
  generateRandomRows();

  // Generate random speeds and pause settings for each row
  for (let i = 0; i < baseRows.length; i++) {
    rowSpeeds.push(random(0.008, 0.01));
    rowTimers.push(0);
    rowPauses.push(false);
    rowPauseDurations.push(random(20, 60)); // Random pause duration
  }
}

function draw() {
  background("#D2D7DF"); // Light gray background

  // Animate time variable
  t += 1;

  let rowWidth = 500;
  let pillHeight = 60;
  let rowSpacing = 60; // No spacing between rows
  let startY = 80;
  let startX = (width - rowWidth) / 2; // Center horizontally
  let minPillWidth = 50;

  noStroke();

  // Classic colors
  // let color1 = color(25, 50, 120); // Deep blue
  let color1 = "#a9b7c1ff"; // Deep blue
  let color2 = "#7c7f8aff"; // Brick red

  // Draw each row
  for (let i = 0; i < baseRows.length; i++) {
    let y = startY + i * rowSpacing;
    let x = startX;

    // Each row has its own oscillation speed
    let oscillation = sin(t * rowSpeeds[i]); // Oscillates between -1 and 1

    // Calculate animated widths for this row
    let numPills = baseRows[i].length;
    let animatedWidths = [];

    // Calculate how much each pill should change
    for (let j = 0; j < numPills; j++) {
      let change = oscillation * 100 * (j % 2 === 0 ? 1 : -1); // Alternate growing/shrinking
      animatedWidths[j] = baseRows[i][j] + change;

      // Apply minimum width constraint
      animatedWidths[j] = max(animatedWidths[j], minPillWidth);
    }

    // Normalize to keep total at 500px
    let total = animatedWidths.reduce((sum, w) => sum + w, 0);
    let scaleFactor = rowWidth / total;
    animatedWidths = animatedWidths.map((w) => w * scaleFactor);

    // Draw pills in this row
    for (let j = 0; j < animatedWidths.length; j++) {
      let pillWidth = animatedWidths[j];

      // Alternate colors
      fill((i + j) % 2 === 0 ? color1 : color2);

      // Draw pill with rounded corners
      rect(x, y, pillWidth, pillHeight, pillHeight / 2);

      x += pillWidth; // No gap between pills
    }
  }
}

function mousePressed() {
  let rowWidth = 500;
  let pillHeight = 60;
  let rowSpacing = 60;
  let startY = 80;
  let startX = (width - rowWidth) / 2;
  
  // Check which row was clicked
  for (let i = 0; i < baseRows.length; i++) {
    let y = startY + i * rowSpacing;
    
    // Check if mouse is within this row's bounds
    if (mouseX >= startX && mouseX <= startX + rowWidth &&
        mouseY >= y && mouseY <= y + pillHeight) {
      // Regenerate this row with a new random configuration
      generateSingleRow(i);
      break;
    }
  }
}
