import React, { useEffect, useState } from "react";
import { setupBodyPix, cleanupBodyPix } from "./setupBodyPix";
const BaseMeasurement = ({
  onCompletion,
  detectBodyParts,
  inPositionMsg,
  outPositionMsg,
}) => {
  const webcamRef = React.useRef(null);
  const camCanvasRef = React.useRef(null);
  const [inPosition, setinPosition] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(null);
  var ring = new Audio("/memeasure/ringtone.wav");
  var hold = new Audio("/memeasure/ticktock.wav");

  // Set up bodyPix
  useEffect(() => {
    let startTime = new Date();
    hold.loop = true;

    const stopCondition = (bodySegmentation) => {
      hold.play();
      if (detectBodyParts(bodySegmentation)) {
        setinPosition(true);
      } else {
        // reset start time if camera is no longer capturing the full view
        startTime = new Date();
        setinPosition(false);
      }

      let timeElapsed = Math.round((new Date() - startTime) / 1000);
      // setTimeElapsed(timeElapsed);
      setTimeElapsed(timeElapsed);
      // Stop after we have the full view for 10 seconds
      if (timeElapsed >= 10) {
        hold.pause();
        ring.play();
        return true;
      }
    };

    const callback = (bodySegmentation) => {
      onCompletion(bodySegmentation);
    };

    setupBodyPix(
      webcamRef.current,
      camCanvasRef.current,
      stopCondition,
      callback
    );

    return () => {
      cleanupBodyPix();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <video
        id="video"
        playsInline
        ref={webcamRef}
        style={{ display: "none" }}
      ></video>

      <canvas
        id="camCanvas"
        ref={camCanvasRef}
        className="output-layer"
        style={{ zIndex: 1 }}
      ></canvas>
      <div id="message-overlay" className="output-layer" style={{ zIndex: 2 }}>
        <div>
          {" "}
          {inPosition ? (
            <span className="text-info display-4 font-weight-bold">
              {inPositionMsg} <br /> {10 - timeElapsed} seconds remaining{" "}
            </span>
          ) : (
            <span className="text-primary display-4 font-weight-bold">
              {outPositionMsg}
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default BaseMeasurement;
