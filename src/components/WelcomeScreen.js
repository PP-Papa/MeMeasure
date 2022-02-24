import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
const WelcomeScreen = ({ onCompletion }) => {
  return (
    <>
      <Row className="h-75">
        <Col>
          <h2>Welcome to MeMeasure! </h2>

          <div className="welcome-message text-sm-left">
            <p>
              {" "}
              Empowered by the cutting edge technology of machine learning,
              MeMeasure is a nice little application that makes accurate
              measurement of body sizes in just a snap.
            </p>
          </div>
          <img src="/memeasure/tailor.jpeg" alt="tailor" id="welcome-image" />
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

export default WelcomeScreen;
