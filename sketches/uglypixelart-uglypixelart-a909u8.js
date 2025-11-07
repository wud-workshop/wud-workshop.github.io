let pixelSize = 8;
let cols = 80;
let rows = 80;

// New variable to track the girl's horizontal position (pixel-grid coordinates)
let girlX;

function setup() {
    createCanvas(640, 640);
    // noLoop(); // Re-enable the loop for movement
    frameRate(15); // Set a framerate for smooth movement, adjust as needed
    noStroke();
    
    // Initialize the girl's starting position on the far right
    girlX = cols; 
}

function draw() {
    background(40, 60, 120);
    
    // **Movement Update:** Move the girl one pixel to the left each frame
    girlX -= 1; 

    // **Infinite Scroll/Wrap:** If the girl moves completely off the left side
    // (the widest part of the girl is about 5 pixels wide, so wrap when girlX < -5)
    if (girlX < -5) { 
        girlX = cols; // Reset her position to the right side of the screen
    }

    drawScene();
}

function drawPixel(x, y, c) {
    fill(c);
    rect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
}

function drawScene() {
    // Sky with swirling clouds - STATIC
    for (let y = 0; y < 35; y++) {
        for (let x = 0; x < cols; x++) {
            let swirl = sin((x + y) * 0.3) + cos((x - y) * 0.2);
            let blues = [
                color(40, 60, 120),
                color(50, 80, 140),
                color(60, 100, 160),
                color(70, 110, 180),
                color(80, 120, 200),
                color(100, 140, 220)
            ];
            let idx = floor(map(swirl + noise(x * 0.1, y * 0.1), -1, 2, 0, blues.length));
            idx = constrain(idx, 0, blues.length - 1);
            drawPixel(x, y, blues[idx]);
        }
    }
    
    // Add yellow/white stars - STATIC
    // Note: The original star drawing happens *every* frame and uses `random()` which means they flicker. 
    // To make them static, you would need to define their positions in setup(). I'll leave it as is for now.
    for (let i = 0; i < 100; i++) {
        let sx = floor(random(cols));
        let sy = floor(random(35));
        if (random() > 0.7) {
            drawPixel(sx, sy, color(255, 255, 200, 200));
        }
    }
    
    // Moon - STATIC
    for (let y = 5; y < 15; y++) {
        for (let x = 60; x < 70; x++) {
            let d = dist(x, y, 65, 10);
            if (d < 5) {
                drawPixel(x, y, color(255, 255, 150));
            } else if (d < 6) {
                drawPixel(x, y, color(255, 255, 200, 180));
            }
        }
    }
    
    // Garden ground - STATIC
    for (let y = 35; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let n = noise(x * 0.15, y * 0.15);
            let greens = [
                color(60, 100, 40),
                color(70, 110, 50),
                color(50, 90, 35),
                color(80, 120, 60),
                color(55, 95, 45)
            ];
            let idx = floor(n * greens.length);
            drawPixel(x, y, greens[idx]);
        }
    }
    
    // Garden path - STATIC
    for (let y = 40; y < rows; y++) {
        for (let x = 30; x < 50; x++) {
            let n = noise(x * 0.2, y * 0.2);
            if (n > 0.3) {
                let browns = [
                    color(120, 90, 60),
                    color(130, 100, 70),
                    color(110, 80, 50),
                    color(140, 110, 80)
                ];
                drawPixel(x, y, random(browns));
            }
        }
    }
    
    // Flowers scattered - STATIC (but random on each draw call)
    let flowerColors = [
        color(255, 100, 100),
        color(255, 150, 50),
        color(255, 200, 0),
        color(200, 100, 255),
        color(255, 150, 200)
    ];
    
    for (let i = 0; i < 80; i++) {
        let fx = floor(random(5, 25));
        let fy = floor(random(45, 70));
        drawPixel(fx, fy, random(flowerColors));
        if (random() > 0.5) {
            drawPixel(fx + 1, fy, random(flowerColors));
        }
    }
    
    for (let i = 0; i < 80; i++) {
        let fx = floor(random(55, 75));
        let fy = floor(random(45, 70));
        drawPixel(fx, fy, random(flowerColors));
        if (random() > 0.5) {
            drawPixel(fx, fy + 1, random(flowerColors));
        }
    }
    
    // Trees - STATIC
    drawTree(10, 35);
    drawTree(68, 38);
    
    // Girl in the garden - NOW MOVING
    // Pass the girlX variable as the base X position
    drawGirl(girlX, 48); 
}

function drawTree(baseX, baseY) {
    // Trunk
    for (let y = 0; y < 12; y++) {
        for (let x = -1; x < 2; x++) {
            if (random() > 0.2) {
                drawPixel(baseX + x, baseY + y, color(60, 40, 20));
            }
        }
    }
    
    // Foliage - swirling greens
    for (let y = -8; y < 5; y++) {
        for (let x = -6; x < 7; x++) {
            let d = dist(x, y, 0, -2);
            if (d < 7 && random() > 0.3) {
                let greens = [
                    color(40, 80, 30),
                    color(50, 100, 40),
                    color(60, 120, 50),
                    color(70, 130, 60),
                    color(30, 70, 20)
                ];
                drawPixel(baseX + x, baseY + y, random(greens));
            }
        }
    }
}

function drawGirl(baseX, baseY) {
    // Girl is about 12 pixels tall
    
    // Hair - flowing impressionist strokes
    for (let y = 0; y < 5; y++) {
        for (let x = -2; x < 4; x++) {
            if ((y < 3 && abs(x) < 3) || (y < 2)) {
                drawPixel(baseX + x, baseY + y, color(80, 50, 30));
            }
        }
    }
    
    // Face - peachy tones
    for (let y = 2; y < 5; y++) {
        for (let x = 0; x < 3; x++) {
            drawPixel(baseX + x, baseY + y, color(255, 210, 180));
        }
    }
    
    // Eyes
    drawPixel(baseX, baseY + 3, color(50, 30, 20));
    drawPixel(baseX + 2, baseY + 3, color(50, 30, 20));
    
    // Dress - flowing with multiple colors
    let dressColors = [
        color(100, 150, 255),
        color(120, 170, 255),
        color(80, 130, 240),
        color(90, 140, 250)
    ];
    
    for (let y = 5; y < 10; y++) {
        for (let x = -2; x < 5; x++) {
            let d = abs(x - 1);
            if (d < 4 - (y - 5) * 0.3) {
                drawPixel(baseX + x, baseY + y, random(dressColors));
            }
        }
    }
    
    // Arms
    drawPixel(baseX - 3, baseY + 6, color(255, 210, 180));
    drawPixel(baseX - 2, baseY + 7, color(255, 210, 180));
    drawPixel(baseX + 5, baseY + 6, color(255, 210, 180));
    drawPixel(baseX + 4, baseY + 7, color(255, 210, 180));
    
    // Legs
    drawPixel(baseX, baseY + 10, color(255, 210, 180));
    drawPixel(baseX + 2, baseY + 10, color(255, 210, 180));
    drawPixel(baseX, baseY + 11, color(100, 70, 40));
    drawPixel(baseX + 2, baseY + 11, color(100, 70, 40));
    
    // Flower in hand
    drawPixel(baseX - 4, baseY + 7, color(255, 100, 100));
    drawPixel(baseX - 4, baseY + 8, color(255, 150, 50));
    drawPixel(baseX - 4, baseY + 9, color(80, 120, 60));
}