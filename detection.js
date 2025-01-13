// hand detection

import {
    HandLandmarker,
    FilesetResolver
  } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
  
  let handLandmarker = undefined;
  let runningMode = "IMAGE";
  
  // Before we can use HandLandmarker class we must wait for it to finish
  // loading. Machine Learning models can be large and take a moment to
  // get everything needed to run.
  const createHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `hand_landmarker.task`, //https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task
        delegate: "GPU"
      },
      runningMode: runningMode,
      numHands: 2
    });
  };
  createHandLandmarker();
  
  const video = document.getElementById("webcam");
  const canvasElement = document.getElementById("output_canvas");
  const canvasCtx = canvasElement.getContext("2d");
  
  // Check if webcam access is supported.
  const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;
  
  // If webcam supported, add event listener to button for when user
  // wants to activate it.

  window.addEventListener('enablecam', (e) => {
    let enable = e.detail.message;
    if (hasGetUserMedia() && enable) {
      enableCam();
    } else {
      console.warn("getUserMedia() is not supported by your browser");
    }
  });
  
  
  // Enable the live webcam view and start detection.
  function enableCam(event) {
    if (!handLandmarker) {
      console.log("Wait! objectDetector not loaded yet.");
      return;
    }
  
    // getUsermedia parameters.
    const constraints = {
      video: true
    };
  
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
    });
  }
  
  let lastVideoTime = -1;
  let results = undefined;
  console.log(video);
  export async function predictWebcam() {
    canvasElement.style.width = video.videoWidth;;
    canvasElement.style.height = video.videoHeight;
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    
    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
      runningMode = "VIDEO";
      await handLandmarker.setOptions({ runningMode: "VIDEO" });
    }
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      results = handLandmarker.detectForVideo(video, startTimeMs);
    }

    const event = new CustomEvent('predictions', { detail: { message: results } });
    window.dispatchEvent(event);

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { 
          color: "#00FF00",
          lineWidth: 2
        });
        drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 1 });
      }
    }

    drawSteeringWheel(results);

    canvasCtx.restore();
  
    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
    return results;
  }

  function drawSteeringWheel(landmarks) {
    //console.log(landmarks);
    if (landmarks.handednesses.length == 2) {
      let leftHand, rightHand;
      if(landmarks.handednesses[0][0].categoryName == "Left")
      {
        //console.log("A")
        leftHand = landmarks.landmarks[0];
        rightHand = landmarks.landmarks[1];
      } else {
        //console.log("B")
        leftHand = landmarks.landmarks[1];
        rightHand = landmarks.landmarks[0];
      }

      let leftHandCoord = getAvgCoordAndTranslate(leftHand);
      let rightHandCoord = getAvgCoordAndTranslate(rightHand);
  
      let angle = getAngle(leftHandCoord, rightHandCoord);

      let centerX = (leftHandCoord.x + rightHandCoord.x) / 2;
      let centerY = (leftHandCoord.y + rightHandCoord.y) / 2;

      console.log(centerX);

      canvasCtx.save();
    
      // Move to the center of the steering wheel
      canvasCtx.translate(centerX, centerY);
    
      // Rotate the canvas by the desired angle
      canvasCtx.rotate(angle);

      let steeringWheelRadius = Math.sqrt((leftHandCoord.x- rightHandCoord.x)**2 + (leftHandCoord.y - rightHandCoord.y)**2) / 2;
      steeringWheelRadius = abs(steeringWheelRadius);
    
      //outer circle of the steering wheel
      canvasCtx.beginPath();
      canvasCtx.arc(0, 0, steeringWheelRadius, 0, 2 * Math.PI);
      canvasCtx.strokeStyle = "#3b444b";
      canvasCtx.lineWidth = 15;
      canvasCtx.stroke();

      //inner edge of outer circle of the steering wheel
      canvasCtx.beginPath();
      canvasCtx.arc(0, 0, steeringWheelRadius - 7.5, 0, 2 * Math.PI);
      canvasCtx.strokeStyle = "#232b2b";
      canvasCtx.lineWidth = 3;
      canvasCtx.stroke();

      //inner edge 2 of outer circle of the steering wheel
      canvasCtx.beginPath();
      canvasCtx.arc(0, 0, steeringWheelRadius - 5, 0, 2 * Math.PI);
      canvasCtx.strokeStyle = "	#353839";
      canvasCtx.lineWidth = 4;
      canvasCtx.stroke();

      //outer edge of outer circle of the steering wheel
      canvasCtx.beginPath();
      canvasCtx.arc(0, 0, steeringWheelRadius + 7.5, 0, 2 * Math.PI);
      canvasCtx.strokeStyle = "#232b2b";
      canvasCtx.lineWidth = 2;
      canvasCtx.stroke();
    
      //inner details of the steering wheel
      canvasCtx.beginPath();
      //get points at an angle
      let angleWheelX = steeringWheelRadius * Math.cos(0.261799);
      let angleWheelY = steeringWheelRadius * Math.sin(0.261799);
      canvasCtx.moveTo(0, 0);
      canvasCtx.lineTo(angleWheelX, angleWheelY); // Right bar
      canvasCtx.moveTo(0, 0);
      canvasCtx.lineTo(-angleWheelX, angleWheelY);
      canvasCtx.moveTo(0, 0);
      canvasCtx.lineTo(0, -steeringWheelRadius); // Bottom bar
      canvasCtx.strokeStyle = "#232b2b";
      canvasCtx.lineWidth = 10;
      canvasCtx.stroke();

      //inner part of the steering wheel
      canvasCtx.beginPath();
      canvasCtx.arc(0, 0, steeringWheelRadius/3, 0, 2 * Math.PI);
      canvasCtx.fillStyle = "#232b2b";
      canvasCtx.fill();

      //inner-inner part of the steering wheel
      canvasCtx.beginPath();
      canvasCtx.arc(0, 0, steeringWheelRadius/4, 0, 2 * Math.PI);
      canvasCtx.fillStyle = "darkred";
      canvasCtx.fill();
    
      canvasCtx.restore();
    }
  }

  function getAvgCoordAndTranslate(hand) {
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
  
    return {"x": X * canvasElement.width, "y": Y * canvasElement.height,"z": Z * 1};
  }
  
  function getAngle(c1, c2) {
    Math.tan
    return Math.atan2(c1.y-c2.y, c1.x-c2.x);
  }