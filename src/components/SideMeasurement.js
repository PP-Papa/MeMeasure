import BaseMeasurement from "./BaseMeasurement";

const SideMeasurement = ({ onCompletion }) => {
  return (
    <>
      <BaseMeasurement
        onCompletion={onCompletion}
        detectBodyParts={detectAllSideBodyParts}
        inPositionMsg="Please continue to hold"
        outPositionMsg="Please stand back and hold steady. Keep one side of your body entirely in frame (head to feet)"
      />
    </>
  );
};

export default SideMeasurement;

/**
 * Detects if all of relevant the body parts are present in the person segmentation data and return true is yes, else false.
 */

function detectAllSideBodyParts(personSegmentation) {
  if (
    !Array.isArray(personSegmentation.allPoses) ||
    !Array.isArray(personSegmentation.allPoses[0]["keypoints"])
  )
    return false;
  let keypoints = personSegmentation.allPoses[0]["keypoints"];
  // Check to make sure that only 1 side is well taken https://github.com/tensorflow/tfjs-models/tree/master/posenet#keypoints

  let shoulder = keypoints[5].position.x - keypoints[6].position.x;
  return shoulder >= -40 && shoulder <= 40;
}
