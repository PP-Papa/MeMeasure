import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import { BodyMeasure } from "./BodyMeasure";

const ResultOutput = ({
  height,
  weight,
  gender,
  frontBodySegmentation,
  sideBodySegmentation,
  onCompletion,
}) => {
  console.log("frontBodySegmentation:", frontBodySegmentation);
  console.log("sideBodySegmentation:", sideBodySegmentation);

  let shoulderWidth = 0;
  let hipCirc = 0;
  let sleeveLen = 0;
  let inseamLen = 0;
  let neckCirc = 0;
  let chestCirc = 0;
  let waistCirc = 0;
  let neckComputed = false;

  if (frontBodySegmentation) {
    let measurePerson = new BodyMeasure(
      height,
      weight,
      gender,
      frontBodySegmentation,
      sideBodySegmentation
    );

    console.log(measurePerson);
    // let keypoints = frontBodySegmentation["allPoses"][0]["keypoints"];
    // measurePerson.estConversionFactor(frontBodySegmentation["data"], keypoints);
    // measurePerson.setFrameDims();
    // measurePerson.setKeyPoints();
    // measurePerson.estConversionFactors();
    measurePerson.doAllMeasurements();

    // Calculate the body measurements
    shoulderWidth = measurePerson.shoulderWidth;
    // hipWidth = measurePerson.calculateHipWidth(
    //   keypoints,
    //   frontBodySegmentation["data"]
    // );
    hipCirc = measurePerson.hipCirc;

    // sleeveLen = measurePerson.calculateSleeveLen(
    //   keypoints,
    //   frontBodySegmentation["data"]
    // );
    sleeveLen = measurePerson.sleeveLength;
    // inseamLen = measurePerson.calculateInseamLen(
    //   keypoints,
    //   frontBodySegmentation["data"]
    // );

    inseamLen = measurePerson.inseamLength;
    // neckCirc = measurePerson.calculateNeck();

    neckCirc = measurePerson.neckCirc;
    waistCirc = measurePerson.waistCirc;
    chestCirc = measurePerson.chestCirc;
    neckComputed = neckCirc > 3;
  }
  return (
    <>
      <h2>Result Output</h2>
      <Row className="h-75">
        <Table responsive size="sm">
          <thead>
            <th>Measurement</th>
            <th>Length (in)</th>
          </thead>
          <tbody>
            <tr className="table-light">
              <td>Neck</td>
              <td>
                {neckComputed ? Math.round(neckCirc) : "Unable to measure"}
              </td>
            </tr>
            <tr className="table-light">
              <td>Shoulder</td>
              <td>{Math.round(shoulderWidth)}</td>
            </tr>
            <tr className="table-light">
              <td>Chest</td>
              <td>{Math.round(chestCirc)}</td>
            </tr>
            <tr className="table-light">
              <td>Sleeve</td>
              <td>{Math.round(sleeveLen)}</td>
            </tr>
            <tr className="table-light">
              <td>Inseam</td>
              <td>{Math.round(inseamLen)}</td>
            </tr>
            <tr className="table-light">
              <td>Waist</td>
              <td>{Math.round(waistCirc)}</td>
            </tr>
            <tr className="table-light">
              <td>Hip</td>
              <td>{Math.round(hipCirc)}</td>
            </tr>
          </tbody>
        </Table>
      </Row>
      <Row>
        <Col className="justify-content-center text-center">
          <Button onClick={onCompletion}>Start Over</Button>
        </Col>
      </Row>
    </>
  );
};

export default ResultOutput;
