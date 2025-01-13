// game variables
let carX, carY;
let carWidth = 50, carHeight = 100;
let roadWidth = 500;
let obstacles = [];
let defaultSpeed = 5;
let speed = 0;
let score = 0;
let slider, checkbox;
let minSens = 1;
let maxSens = 200;
let zStart = 0;
let obstacleColors = ["black", "white", "darkgreen", "darkyellow", "silver", "blue", "lightblue", "magenta"];
let linesOffset = 7;
let obstacleWidth = 50, obstacleHeight = 100;
let enableDrawLandmarks = false;
let playBrake = true;
const activeAudioSources = [];

// menu variables
let menuButtons = []

let backButton;

let retryButton;

// other variables
let page = 0; // 0..menu, 1...game, 2...options, 3...quit, 4...end of game

function setup() {
  console.log("setup called");
  const canvas = createCanvas(800, 600);
  carX = width / 2 - carWidth / 2;
  carY = height - carHeight - 20;

  menuButtons.push(new Button(100, 100, 200, 50, "Start Game"));
  menuButtons.push(new Button(100, 170, 200, 50, "Options"));
  //menuButtons.push(new Button(100, 240, 200, 50, "Quit"));

  backButton = new Button(40, 40, 100, 40, "Back");

  retryButton = new Button(40, 100, 100, 40, "Retry");

  const canvasContainer = document.getElementById('game');
  canvas.parent(canvasContainer);

  slider = createSlider(minSens, maxSens, Math.round(maxSens/2), 1);
  slider.position(100, 200);
  slider.size(200, 20);
  slider.hide();

  checkbox = createCheckbox();
  checkbox.position(230, 140)
  checkbox.size(20, 20);
  checkbox.hide();
}

function draw() {
  if(page == 0) {
    background("white");
    textSize(50);
    fill(255, 0, 0);
    text("Handless racer", width/4, 50);
    drawMenuButtons();
  }
  if(page == 1) {
    background("green");

    fill(100);
    rect(width / 2 - roadWidth / 2, 0, roadWidth, height);

    drawDriversCar(carX, carY, carWidth, carHeight);

    if (keyIsDown(LEFT_ARROW) && carX > width / 2 - roadWidth / 2 + carWidth) {
      carX -= 5;
    }
    if (keyIsDown(RIGHT_ARROW) && carX < width / 2 + roadWidth / 2 - carWidth) {
      carX += 5;
    }

    //road lines
    fill("#EDEADE");
    rect(width / 2 - roadWidth / 2 + linesOffset, 0, 10, height);
    rect(width / 2 + roadWidth / 2 - 2*linesOffset, 0, 10, height);

    //obstacles
    let validX = getValidObstacleX(3);

    if (frameCount % 60 == 0 && validX != null) {
      obstacles.push({
        x: validX,
        y: -40,
        width: obstacleWidth,
        height: obstacleHeight,
        color: obstacleColors[Math.floor(Math.random() * obstacleColors.length)],
        speed: defaultSpeed * random(0.9, 1.3),
      });
      score++;
    }

    //draw and move obstacle
    fill(0, 0, 200);
    for (let i = obstacles.length - 1; i >= 0; i--) {
      let obs = obstacles[i];
      drawObstaclesCar(obs.x, obs.y, obs.width, obs.height, obs.color);
      obs.y += obs.speed + speed;

      //collision
      if (
        carX < obs.x + obs.width &&
        carX + carWidth > obs.x &&
        carY < obs.y + obs.height &&
        carY + carHeight > obs.y
      ) {
        stopAllSounds();
        playSound("sounds\\crash-7075.mp3", false);
        textSize(32);
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        text("Game Over", width / 2, height / 2);
        enableBackButton(true);
        enableRetryButton(true);

        page = 4;
      }

      //remove obstacles that are past us
      if (obs.y - obstacleHeight / 2 > height) {
        obstacles.splice(i, 1);
      }
    }

    textSize(16);
    fill(255);
    text("Score: " + score, 50, 20);
  }
  if (page == 2) {
    background(255);
    textSize(16);
    fill(0);
    text(`Steering sensitivity: ${slider.value()}`, 180, 180);
    text(`Draw landmarks`, 150, 150);
    drawBackButton();
  }
  if (page == 3) {
    //TODO
    page = 0;
  }
  if (page == 4) {
    drawRetryButton();
    drawBackButton();
  }
}

function getValidObstacleX(tries) {
  let valid = true;
  while(tries > 0) {
    let tryX = random(width / 2 - roadWidth / 2 + obstacleWidth/2 , width / 2 + roadWidth / 2 - obstacleWidth/2);
    for(let i = obstacles.length - 1; i >= 0; i--) {
      let obs = obstacles[i];
      if(tryX + obstacleWidth >= obs.x && tryX - obstacleWidth < obs.x) {
        valid = false;
        break;
      }
    }
    tries--;
    if(valid)
      return tryX;
    else
      valid = true;
  }
  return null;
}

function drawDriversCar(x, y, carWidth, carHeight) {
  //body of the car
  fill(200, 0, 0);
  rectMode(CENTER);
  rect(x, y, carWidth, carHeight, 10);
  
  //windows
  fill(100, 200, 255);
    //front
  rect(x, y - 12, carWidth * 0.8, carHeight * 0.2, 5);
    //back
  rect(x, y + 25, carWidth * 0.8, carHeight * 0.1, 5);
  
  //wheels
  fill("#232b2b");
  let wheelOffsetX = carWidth * 0.55;
  let wheelOffsetY = carHeight * 0.6;
  ellipse(x - wheelOffsetX, y - wheelOffsetY / 2, carWidth * 0.2, carHeight * 0.2);
  ellipse(x + wheelOffsetX, y - wheelOffsetY / 2, carWidth * 0.2, carHeight * 0.2);
  ellipse(x - wheelOffsetX, y + wheelOffsetY / 2, carWidth * 0.2, carHeight * 0.2);
  ellipse(x + wheelOffsetX, y + wheelOffsetY / 2, carWidth * 0.2, carHeight * 0.2);
  
  //headlights
  fill(255, 255, 100);
  ellipse(x - carWidth * 0.35, y - carHeight * 0.5, 10, 10); // Left headlight
  ellipse(x + carWidth * 0.35, y - carHeight * 0.5, 10, 10); // Right headlight
  
  //tail lights
  fill(255, 50, 50);
  ellipse(x - carWidth * 0.35, y + carHeight * 0.5, 10, 10);
  ellipse(x + carWidth * 0.35, y + carHeight * 0.5, 10, 10);
  rectMode(CORNER);
}

function drawObstaclesCar(x, y, carWidth, carHeight, color) {
  //body of the car
  fill(color);
  rectMode(CENTER);
  rect(x, y, carWidth, carHeight, 10);
  
  //windows
  fill(100, 200, 255); // Light blue color
    //front
  rect(x, y + 12, carWidth * 0.8, carHeight * 0.2, 5);
    //back
  rect(x, y - 25, carWidth * 0.8, carHeight * 0.1, 5);
  
  //wheels
  fill("#232b2b");
  let wheelOffsetX = carWidth * 0.55;
  let wheelOffsetY = carHeight * 0.6;
  ellipse(x - wheelOffsetX, y - wheelOffsetY / 2, carWidth * 0.2, carHeight * 0.2);
  ellipse(x + wheelOffsetX, y - wheelOffsetY / 2, carWidth * 0.2, carHeight * 0.2);
  ellipse(x - wheelOffsetX, y + wheelOffsetY / 2, carWidth * 0.2, carHeight * 0.2);
  ellipse(x + wheelOffsetX, y + wheelOffsetY / 2, carWidth * 0.2, carHeight * 0.2);
  
  //tail lights
  fill("red");
  ellipse(x - carWidth * 0.35, y - carHeight * 0.5, 10, 10);
  ellipse(x + carWidth * 0.35, y - carHeight * 0.5, 10, 10);
  
  //head lights
  fill("yellow");
  ellipse(x - carWidth * 0.35, y + carHeight * 0.5, 10, 10);
  ellipse(x + carWidth * 0.35, y + carHeight * 0.5, 10, 10);
  rectMode(CORNER);
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
function drawRetryButton() {
  retryButton.display();
  retryButton.checkHover(mouseX, mouseY);
}
function enableBackButton(enabled) {
  backButton.enabled = enabled;
}
function enableRetryButton(enabled) {
  retryButton.enabled = enabled;
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
  if(retryButton.enabled && retryButton.isHovered) {
    retryButton.onClick();
  } 
}

function stopAllSounds() {
  activeAudioSources.forEach(source => source.stop());
  activeAudioSources.length = [];
}

async function playSound(pathToFile, playInLoop) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const response = await fetch(pathToFile);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const soundSource = audioContext.createBufferSource();
  soundSource.buffer = audioBuffer;
  soundSource.connect(audioContext.destination);
  soundSource.start();
  console.log(`Playing ${pathToFile} audio file`);

  activeAudioSources.push(soundSource);

  soundSource.onended = () => {
    console.log(`Sound effect ${pathToFile} has finished playing!`)
    const index = activeAudioSources.indexOf(soundSource);
    if (index > -1) activeAudioSources.splice(index, 1);
    if (page == 1 && playInLoop) playSound(pathToFile, playInLoop);
  };
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
  let pred = e.detail.message;
  if (pred.handednesses.length == 2) {
    let leftHand, rightHand;
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


    //HANDLE STEERING
    //------------------------
    let step = 15;

    if (angle < 0.05 && angle > -0.05) {
      //console.log("Forward");
    } else if (angle >= 0.05 && carX < width / 2 + roadWidth / 2 - carWidth) {
      //console.log("Right");
      carX += step*angle*(slider.value()/maxSens);
    } else if (angle <= -0.05 && carX > width / 2 - roadWidth / 2 + carWidth) {
      //console.log("Left");
      carX -= step*abs(angle)*(slider.value()/maxSens);
    }
    //------------------------


    //HANDLE SPEED
    //------------------------
    let avgZ = (leftHandCoord.z + rightHandCoord.z) / 2;

    //console.log(avgZ/zStart);
    if(zStart == 0) {
      //initialize starting distance
      zStart = avgZ;
    } else if (avgZ/zStart < 1.1 && avgZ/zStart > 0.9) {
      //console.log("Don't change the speed");
    } else if (zStart < avgZ) {
      if (-zStart/avgZ > -3)
        speed = -zStart/avgZ;
      else
        speed = -3;
      if(playBrake && page == 1)
        playSound("sounds\\brake-6315.mp3", false);
      playBrake = false;
    } else if (zStart > avgZ) {
      speed = avgZ/zStart;
      playBrake = true;
    }
    //------------------------
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
    this.cornerRadius = 10;
    this.enabled = true;
  }

  display() {
    noStroke();
    fill(this.isHovered ? this.hoverColor : this.baseColor);
    rect(this.x, this.y, this.w, this.h, this.cornerRadius);

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
      checkbox.hide();
      console.log("Start Game clicked");
      const eventStart = new CustomEvent('enablecam', { detail: { message: true } });
      window.dispatchEvent(eventStart);
      page = 1;
      enableRetryButton(false);
      enableBackButton(false);
      enableMenuButtons(false);
      playSound("sounds\\car-acceleration-inside-car-7087.mp3", true);
    } else if (this.label === "Options") {
      slider.show();
      checkbox.show();
      console.log("Options clicked");
      page = 2;
      enableBackButton(true);
      enableMenuButtons(false);
    } else if (this.label === "Quit") {
      slider.hide();
      checkbox.hide();
      console.log("Quit clicked");
      page = 3;
    } else if (this.label == "Back") {
      slider.hide();
      checkbox.hide();
      if(page == 4)
        window.location.reload();
      page = 0;
      console.log("Back")
      enableBackButton(false);
      enableRetryButton(false);
      enableMenuButtons(true);
    } else if (this.label == "Retry") {
      console.log("Retry clicked");
      obstacles = [];
      carX = width / 2 - carWidth / 2;
      carY = height - carHeight - 20;
      score = 0;
      page = 1;
      enableRetryButton(false);
      enableBackButton(false);
      playSound("sounds\\car-acceleration-inside-car-7087.mp3", true);
    }
  }
}
