import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
const InstructionScreen = ({ onCompletion }) => {
  return (
    <>
      <Row className="h-75">
        <Col>
          <h2>Instruction</h2>

          <div>
            <p>
              {" "}
              Before we proceed, please set your device up so its camera is
              pointing forward and parallel to the ground.{" "}
            </p>

            <p>
              {" "}
              For example, if you are using a phone, make sure that the phone is
              standing up straight. The front camera should have a full,
              unobstructed view of your body.
            </p>
          </div>
        </Col>
      </Row>

      <Row>
        <Col className="justify-content-center text-center">
          <Button onClick={onCompletion}>Next Step</Button>
        </Col>
      </Row>
    </>
  );
};

export default InstructionScreen;
