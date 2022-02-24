/**
 * @license
 * Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import "@tensorflow/tfjs-backend-webgl";
import * as bodyPix from "@tensorflow-models/body-pix";

import { drawKeypoints, drawSkeleton } from "./demo_util";
// import * as partColorScales from "./part_color_scales";

const state = {
  video: null,
  stream: null,
  net: null,
  videoConstraints: {},
  animationRequestId: null,
};

const bodyPixConfig = {
  architecture: "MobileNetV1",
  outputStride: 16,
  multiplier: 0.75,
  quantBytes: 4,
};

const segmentationConfig = {
  flipHorizontal: false,
  internalResolution: "medium",
  segmentationThreshold: 0.7,
  scoreThreshold: 0.4,
};

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isiOS();
}
async function loadBodyPix() {
  state.net = await bodyPix.load(bodyPixConfig);
}

function stopExistingVideoCapture() {
  if (state.video && state.video.srcObject) {
    state.video.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
    state.video.srcObject = null;
  }
}

async function getConstraints() {
  let facingMode = isMobile() ? "user" : null;
  let width, height;

  width = isMobile() ? undefined : window.innerWidth;
  height = isMobile() ? undefined : window.innerHeight;

  return { facingMode, width, height };
}

/**
 * Loads a the camera to be used in the demo
 *
 */
async function setupCamera(videoElement) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      "Browser API navigator.mediaDevices.getUserMedia not available"
    );
  }

  stopExistingVideoCapture();

  const videoConstraints = await getConstraints();

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: videoConstraints,
    });
    videoElement.srcObject = stream;

    return new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        videoElement.width = videoElement.videoWidth;
        videoElement.height = videoElement.videoHeight;
        resolve(videoElement);
      };
    });
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function loadVideo(videoElement) {
  try {
    state.video = await setupCamera(videoElement);
  } catch (e) {
    console.log(
      "this browser does not support video capture or this device does not have a camera"
    );
    throw e;
  }

  state.video.play();
}

function drawPoses(personOrPersonPartSegmentation, flipHorizontally, ctx) {
  if (Array.isArray(personOrPersonPartSegmentation)) {
    personOrPersonPartSegmentation.forEach((personSegmentation) => {
      let pose = personSegmentation.pose;
      if (flipHorizontally) {
        pose = bodyPix.flipPoseHorizontal(pose, personSegmentation.width);
      }
      drawKeypoints(pose.keypoints, 0.1, ctx);
      drawSkeleton(pose.keypoints, 0.1, ctx);
    });
  } else {
    personOrPersonPartSegmentation.allPoses.forEach((pose) => {
      if (flipHorizontally) {
        pose = bodyPix.flipPoseHorizontal(
          pose,
          personOrPersonPartSegmentation.width
        );
      }
      drawKeypoints(pose.keypoints, 0.1, ctx);
      drawSkeleton(pose.keypoints, 0.1, ctx);
    });
  }
}

/**
 * Feeds an image to BodyPix to estimate segmentation - this is where the
 * magic happens. This function loops with a requestAnimationFrame method.
 */
function segmentBodyInRealTime(canvas, stopCondition, callback) {
  const flipHorizontally = segmentationConfig.flipHorizontal;

  // since images are being fed from a webcam

  async function bodySegmentationFrame() {
    try {
      // Make sure that the video element has data
      if (state.video.readyState >= 2) {
        // Run body segmentation on a single person
        const bodySegmentation = await state.net.segmentPersonParts(
          state.video,
          {
            flipHorizontal: segmentationConfig.flipHorizontal,
            internalResolution: segmentationConfig.internalResolution,
            segmentationThreshold: segmentationConfig.segmentationThreshold,
            scoreThrshold: segmentationConfig.scoreThreshold,
          }
        );

        const ctx = canvas.getContext("2d");

        const coloredPartImageData =
          bodyPix.toColoredPartMask(bodySegmentation);
        // const opacity = 0.7;
        // const flipHorizontal = false;
        // const maskBlurAmount = 0;
        // const pixelCellWidth = 10.0;

        bodyPix.drawPixelatedMask(canvas, state.video, coloredPartImageData);

        drawPoses(bodySegmentation, flipHorizontally, ctx);

        // If check if stop condition is met, if so, then send the output of the model to the callback and exit the function
        if (stopCondition(bodySegmentation)) {
          callback(bodySegmentation);
          return;
        }
      }
    } catch (error) {
      console.log(error);
    }

    state.animationRequestId = requestAnimationFrame(bodySegmentationFrame);
  }

  bodySegmentationFrame();
}

export async function setupBodyPix(
  videoElement,
  canvasElement,
  stopCondition,
  callback
) {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

  // Load the BodyPixModel
  await loadBodyPix();

  // Setup the video stream from the camera
  await loadVideo(videoElement);

  // Start body segmentation in real time. Call the callback function when the stopCondition function returns true
  segmentBodyInRealTime(canvasElement, stopCondition, callback);
}

export function cleanupBodyPix() {
  cancelAnimationFrame(state.animationRequestId);
  stopExistingVideoCapture();
  console.log("Cleaned up BodyPix camera feed");
}
