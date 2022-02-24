import BaseMeasurement from "./BaseMeasurement";

const FrontMeasurement = ({ onCompletion }) => {
  return (
    <>
      <BaseMeasurement
        onCompletion={onCompletion}
        detectBodyParts={detectAllFrontBodyParts}
        inPositionMsg="Please continue to hold"
        outPositionMsg="Please stand back and hold steady. Keep your entire front body in the frame (head to feet)"
      />
    </>
  );
};

export default FrontMeasurement;

/**
 * Detects if all of the body parts are present in the person segmentation data and return true is yes, else false.
 */

function detectAllFrontBodyParts(personSegmentation) {
  if (
    !Array.isArray(personSegmentation.allPoses) ||
    !Array.isArray(personSegmentation.allPoses[0]["keypoints"])
  )
    return false;
  let keypoints = personSegmentation.allPoses[0]["keypoints"];
  // Check to make sure that every body part listed here is present: https://github.com/tensorflow/tfjs-models/tree/master/posenet#keypoints
  return keypoints.every((part) => part.score >= 0.4);
}
