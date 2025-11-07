let firstPoint = null;
let secondPoint = null;
let isDragging = false;
let letters = [];
let shooting = false;

let fontSizeSlider;
let messageInput;

class Letter {
    constructor(x, y, char, angle, index, fontSize) {
        this.x = x;
        this.y = y;
        this.char = char;
        this.angle = angle;
        this.speed = 5 + index * 0.3;
        this.vx = cos(angle) * this.speed;
        this.vy = sin(angle) * this.speed;
        this.life = 255;
        this.size = fontSize;
        this.rotation = angle;
        this.rotationSpeed = random(-0.1, 0.1);
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 1.5;
        this.rotation += this.rotationSpeed;
    }
    
    display() {
        push();
        translate(this.x, this.y);
        rotate(this.rotation);
        fill(0, this.life);
        textAlign(CENTER, CENTER);
        textSize(this.size);
        textStyle(BOLD);
        text(this.char, 0, 0);
        pop();
    }
    
    isDead() {
        return this.life <= 0;
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont('Arial');
    
    // Create font size slider
    let sliderContainer = createDiv();
    sliderContainer.style('position', 'absolute');
    sliderContainer.style('top', '20px');
    sliderContainer.style('left', '20px');
    sliderContainer.style('background', 'rgba(255, 255, 255, 0.9)');
    sliderContainer.style('padding', '10px');
    sliderContainer.style('border-radius', '5px');
    
    let sliderLabel = createDiv('Font Size: ');
    sliderLabel.parent(sliderContainer);
    sliderLabel.style('display', 'inline-block');
    sliderLabel.style('margin-right', '10px');
    
    fontSizeSlider = createSlider(12, 72, 24, 1);
    fontSizeSlider.parent(sliderContainer);
    fontSizeSlider.style('vertical-align', 'middle');
    
    let sliderValue = createSpan('24');
    sliderValue.parent(sliderContainer);
    sliderValue.style('margin-left', '10px');
    sliderValue.id('sliderValue');
    
    fontSizeSlider.input(() => {
        select('#sliderValue').html(fontSizeSlider.value());
    });
    
    // Create message input field
    let inputContainer = createDiv();
    inputContainer.style('position', 'absolute');
    inputContainer.style('top', '70px');
    inputContainer.style('left', '20px');
    inputContainer.style('background', 'rgba(255, 255, 255, 0.9)');
    inputContainer.style('padding', '10px');
    inputContainer.style('border-radius', '5px');
    
    let inputLabel = createDiv('Message: ');
    inputLabel.parent(inputContainer);
    inputLabel.style('display', 'inline-block');
    inputLabel.style('margin-right', '10px');
    
    messageInput = createInput('the blacksmith and the software');
    messageInput.parent(inputContainer);
    messageInput.size(300);
}

function draw() {
    background(255);
    
    // Draw first point (small circle)
    if (firstPoint) {
        fill(100);
        noStroke();
        circle(firstPoint.x, firstPoint.y, 12);
    }
    
    // Draw arrow while dragging
    if (firstPoint && secondPoint && isDragging) {
        drawArrow(firstPoint.x, firstPoint.y, secondPoint.x, secondPoint.y);
    }
    
    // Update and display letters
    for (let i = letters.length - 1; i >= 0; i--) {
        letters[i].update();
        letters[i].display();
        
        if (letters[i].isDead()) {
            letters.splice(i, 1);
        }
    }
    
    // Display instructions
    if (!firstPoint && letters.length === 0) {
        fill(150);
        textAlign(CENTER, CENTER);
        textSize(20);
        text('Click to place the first point', width / 2, height / 2);
    } else if (firstPoint && !shooting && letters.length === 0) {
        fill(150);
        textAlign(CENTER, CENTER);
        textSize(20);
        text('Click and drag to aim the cannon', width / 2, height / 2 + 40);
    }
}

function drawArrow(x1, y1, x2, y2) {
    let angle = atan2(y2 - y1, x2 - x1);
    
    // Draw the line
    stroke(100);
    strokeWeight(3);
    line(x1, y1, x2, y2);
    
    // Draw the arrowhead
    push();
    translate(x2, y2);
    rotate(angle);
    
    fill(100);
    noStroke();
    let arrowSize = 15;
    triangle(0, 0, -arrowSize, -arrowSize / 2, -arrowSize, arrowSize / 2);
    pop();
    
    // Draw a small circle at the arrow tip
    noStroke();
    fill(100);
    circle(x2, y2, 8);
}

function mousePressed() {
    if (!firstPoint) {
        // First click - create first point
        firstPoint = createVector(mouseX, mouseY);
    } else if (!shooting) {
        // Second click - start dragging for arrow
        secondPoint = createVector(mouseX, mouseY);
        isDragging = true;
    }
}

function mouseDragged() {
    if (firstPoint && isDragging) {
        // Update second point while dragging
        secondPoint = createVector(mouseX, mouseY);
    }
}

function mouseReleased() {
    if (firstPoint && secondPoint && isDragging) {
        // Calculate angle and shoot letters
        let angle = atan2(secondPoint.y - firstPoint.y, secondPoint.x - firstPoint.x);
        shootLetters(angle);
        
        // Reset for next interaction
        setTimeout(() => {
            firstPoint = null;
            secondPoint = null;
            isDragging = false;
            shooting = false;
        }, 300);
    }
}

function shootLetters(angle) {
    shooting = true;
    letters = [];
    
    let message = messageInput.value();
    let fontSize = fontSizeSlider.value();
    
    // Create letters with slight spread
    for (let i = 0; i < message.length; i++) {
        if (message[i] !== ' ') {
            // Add slight angle variation for spread
            let spreadAngle = angle + random(-0.15, 0.15);
            let letter = new Letter(
                secondPoint.x,
                secondPoint.y,
                message[i],
                spreadAngle,
                i,
                fontSize
            );
            
            // Delay each letter slightly for cannon effect
            setTimeout(() => {
                letters.push(letter);
            }, i * 50);
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}