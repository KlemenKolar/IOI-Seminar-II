// game variables
let carX, carY;
let carWidth = 50, carHeight = 100;
let roadWidth = 300;
let obstacles = [];
let speed = 5;
let score = 0;

// menu variables
let buttons = []

// other variables
let page = 0; // 0..menu, 1...game, 2...options, 3...quit

function setup() {
  console.log("setup called");
  const canvas = createCanvas(800, 600);
  carX = width / 2 - carWidth / 2;
  carY = height - carHeight - 20;

  buttons.push(new Button(100, 100, 200, 50, "Start Game"));
  buttons.push(new Button(100, 170, 200, 50, "Options"));
  buttons.push(new Button(100, 240, 200, 50, "Quit"));

  const canvasContainer = document.getElementById('game');
  canvas.parent(canvasContainer);
}

function draw() {
  if(page == 0) {
    for (let btn of buttons) {
      btn.display();
      btn.checkHover(mouseX, mouseY);
    }
  }
  if(page == 1) {
    background(50);

    // Draw road
    fill(100);
    rect(width / 2 - roadWidth / 2, 0, roadWidth, height);

    // Draw car
    fill(200, 0, 0);
    rect(carX, carY, carWidth, carHeight);

    // Move car with arrow keys
    if (keyIsDown(LEFT_ARROW) && carX > width / 2 - roadWidth / 2) {
      carX -= 5;
    }
    if (keyIsDown(RIGHT_ARROW) && carX < width / 2 + roadWidth / 2 - carWidth) {
      carX += 5;
    }

    // Generate obstacles
    if (frameCount % 60 == 0) {
      obstacles.push({
        x: random(width / 2 - roadWidth / 2, width / 2 + roadWidth / 2 - 40),
        y: -40,
        width: 40,
        height: 40
      });
      score++;
    }

    // Draw and move obstacles
    fill(0, 0, 200);
    for (let i = obstacles.length - 1; i >= 0; i--) {
      let obs = obstacles[i];
      rect(obs.x, obs.y, obs.width, obs.height);
      obs.y += speed;

      // Check collision
      if (
        carX < obs.x + obs.width &&
        carX + carWidth > obs.x &&
        carY < obs.y + obs.height &&
        carY + carHeight > obs.y &&
        false
      ) {
        noLoop(); // Game over
        textSize(32);
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        text("Game Over", width / 2, height / 2);
      }

      // Remove off-screen obstacles
      if (obs.y > height) {
        obstacles.splice(i, 1);
      }
    }

    // Display score
    textSize(16);
    fill(255);
    text("Score: " + score, 10, 20);
  }
  if (page == 2) {
    //TODO
    page = 0;
  }
  if (page == 3) {
    //TODO
    page = 0;
  }
}

function mousePressed() {
  for (let btn of buttons) {
    if (btn.isHovered) {
      btn.onClick();
    }
  }  
}

// get the predicted hand coords and steer the car
window.addEventListener('predictions', (e) => {
  console.log(e.detail.message);
  let pred = e.detail.message;
  if (pred.handednesses.length == 2) {
    if (pred.landmarks[0][9].x/*left hand*/ > pred.landmarks[1][9].x/*right hand*/ && carX > width / 2 - roadWidth / 2) {
      carX += 2;
    }
    if (pred.landmarks[0][9].x/*left hand*/ < pred.landmarks[1][9].x/*right hand*/&& carX < width / 2 + roadWidth / 2 - carWidth) {
      carX -=2;
    }
  }
});

class Button {
  constructor(x, y, w, h, label) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.isHovered = false;
    this.baseColor = color(100, 150, 250);
    this.hoverColor = color(150, 200, 255);
    this.textColor = color(255);
    this.cornerRadius = 10; // Rounded corners
  }

  display() {
    noStroke();
    fill(this.isHovered ? this.hoverColor : this.baseColor);
    rect(this.x, this.y, this.w, this.h, this.cornerRadius);

    // Draw label
    textSize(20);
    fill(this.textColor);
    textAlign(CENTER, CENTER);
    text(this.label, this.x + this.w / 2, this.y + this.h / 2);
  }

  checkHover(mx, my) {
    // Check if mouse is over the button
    this.isHovered = mx > this.x && mx < this.x + this.w && my > this.y && my < this.y + this.h;
  }

  onClick() {
    // Define button actions
    if (this.label === "Start Game") {
      console.log("Start Game clicked");
      page = 1;
    } else if (this.label === "Options") {
      console.log("Options clicked");
      page = 2;
    } else if (this.label === "Quit") {
      console.log("Quit clicked");
      page = 3;
    }
  }
}
