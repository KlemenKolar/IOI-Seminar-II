// game variables
let carX, carY;
let carWidth = 50, carHeight = 100;
let roadWidth = 300;
let obstacles = [];
let speed = 5;
let score = 0;
let slider;
let minSens = 1;
let maxSens = 200;

// menu variables
let menuButtons = []

let backButton;

// other variables
let page = 0; // 0..menu, 1...game, 2...options, 3...quit

function setup() {
  console.log("setup called");
  const canvas = createCanvas(800, 600);
  carX = width / 2 - carWidth / 2;
  carY = height - carHeight - 20;

  menuButtons.push(new Button(100, 100, 200, 50, "Start Game"));
  menuButtons.push(new Button(100, 170, 200, 50, "Options"));
  menuButtons.push(new Button(100, 240, 200, 50, "Quit"));

  backButton = new Button(100, 100, 200, 50, "Back");

  const canvasContainer = document.getElementById('game');
  canvas.parent(canvasContainer);

  slider = createSlider(minSens, maxSens, Math.round(maxSens/2), 1);
  slider.position(100, 520);
  slider.size(200, 20);
  slider.hide();
}

function draw() {
  if(page == 0) {
    background(255);
    drawMenuButtons();
  }
  if(page == 1) {
    background(50);

    fill(100);
    rect(width / 2 - roadWidth / 2, 0, roadWidth, height);

    fill(200, 0, 0);
    rect(carX, carY, carWidth, carHeight);

    if (keyIsDown(LEFT_ARROW) && carX > width / 2 - roadWidth / 2) {
      carX -= 5;
    }
    if (keyIsDown(RIGHT_ARROW) && carX < width / 2 + roadWidth / 2 - carWidth) {
      carX += 5;
    }

    //obstacles
    if (frameCount % 60 == 0) {
      obstacles.push({
        x: random(width / 2 - roadWidth / 2, width / 2 + roadWidth / 2 - 40),
        y: -40,
        width: 40,
        height: 40
      });
      score++;
    }

    //draw and move obstacle
    fill(0, 0, 200);
    for (let i = obstacles.length - 1; i >= 0; i--) {
      let obs = obstacles[i];
      rect(obs.x, obs.y, obs.width, obs.height);
      obs.y += speed;

      //collision
      if (
        carX < obs.x + obs.width &&
        carX + carWidth > obs.x &&
        carY < obs.y + obs.height &&
        carY + carHeight > obs.y
      ) {
        noLoop();
        textSize(32);
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        text("Game Over", width / 2, height / 2);
      }

      //remove obstacles that are past us
      if (obs.y > height) {
        obstacles.splice(i, 1);
      }
    }

    textSize(16);
    fill(255);
    text("Score: " + score, 10, 20);
  }
  if (page == 2) {
    background(255);
    textSize(16);
    fill(0);
    text(`Steering sensitivity: ${slider.value()}`, 180, 500);
    drawBackButton();
  }
  if (page == 3) {
    //TODO
    page = 0;
  }
}

function drawMenuButtons() {
  for (let btn of menuButtons) {
    btn.display();
    btn.checkHover(mouseX, mouseY);
  }
}

function enableMenuButtons(enabled) {
  for (let btn of menuButtons)
    btn.enabled = enabled;
}

function drawBackButton() {
  backButton.display();
  backButton.checkHover(mouseX, mouseY);
}
function enableBackButton(enabled) {
  backButton.enabled = enabled;
}

function mousePressed() {
  for (let btn of menuButtons) {
    if (btn.enabled && btn.isHovered) {
      btn.onClick();
    }
  }
  if(backButton.enabled && backButton.isHovered) {
    backButton.onClick();
  }  
}

function getAvgCoord(hand) {
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  for (coord of hand) {
    sumX += coord.x;
    sumY += coord.y;
    sumZ += coord.z;
  }
  let X = sumX / hand.length;
  let Y = sumY / hand.length;
  let Z = sumZ / hand.length;

  return {"x": X, "y": Y,"z": Z};
}

function getAngle(c1, c2) {
  return Math.tan(c1.y-c2.y, c1.x-c2.x);
}

// get the predicted hand coords and steer the car
window.addEventListener('predictions', (e) => {
  //console.log(e.detail.message);
  let pred = e.detail.message;
  if (pred.handednesses.length == 2) {
    let leftHand, rightHand;
    //console.log(pred.handednesses[0][0].categoryName);
    if(pred.handednesses[0][0].categoryName == "Left")
    {
      //console.log("A")
      leftHand = pred.landmarks[0];
      rightHand = pred.landmarks[1];
    } else {
      //console.log("B")
      leftHand = pred.landmarks[1];
      rightHand = pred.landmarks[0];
    }
    // calculate average x and y coords of hands
    let leftHandCoord = getAvgCoord(leftHand);
    let rightHandCoord = getAvgCoord(rightHand);

    let angle = getAngle(leftHandCoord, rightHandCoord);
    //-vrednost gre v levo
    // +vrednost gre v desno

    let step = 15;
    console.log(angle);

    if (angle < 0.05 && angle > -0.05) {
      console.log("Forward");
    } else if (angle >= 0.05 && carX < width / 2 + roadWidth / 2 - carWidth) {
      //console.log("Right");
      carX += step*angle*(slider.value()/maxSens);
    } else if (angle <= -0.05 && carX > width / 2 - roadWidth / 2) {
      //console.log("Left");
      carX -= step*abs(angle)*(slider.value()/maxSens);
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
    this.enabled = true;
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
    this.isHovered = mx > this.x && mx < this.x + this.w && my > this.y && my < this.y + this.h;
  }

  onClick() {
    if (this.label === "Start Game") {
      slider.hide();
      console.log("Start Game clicked");
      const eventStart = new CustomEvent('enablecam', { detail: { message: true } });
      window.dispatchEvent(eventStart);
      page = 1;
      console.log(page);
    } else if (this.label === "Options") {
      slider.show();
      console.log("Options clicked");
      page = 2;
      enableBackButton(true);
      enableMenuButtons(false);
    } else if (this.label === "Quit") {
      slider.hide();
      console.log("Quit clicked");
      page = 3;
    } else if (this.label == "Back") {
      slider.hide();
      page = 0;
      console.log("Back")
      enableBackButton(false);
      enableMenuButtons(true);
    }
  }
}
