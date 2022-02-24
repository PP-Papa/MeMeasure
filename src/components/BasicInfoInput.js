import React, { useRef, useState } from "react";
import { Form, FormGroup, InputGroup, Row, Col, Button } from "react-bootstrap";

const BasicInfoInput = ({ onCompletion }) => {
  const [validated, setValidated] = useState(false);
  const [heightFt, setHeightFt] = useState(-1);
  const [heightIn, setHeightIn] = useState(-1);
  const [gender, setGender] = useState("female");
  // const [weightLb, setWeightLb] = useState(-1);

  const form = useRef(null);

  const saveBasicInfo = () => {
    if (form.current.reportValidity()) {
      onCompletion(12 * parseInt(heightFt) + parseInt(heightIn), 0, gender);
    }
    setValidated(true);
  };
  return (
    <>
      <h2>Please enter your basic information:</h2>
      <Form
        noValidate
        validated={validated}
        onSubmit={(e) => e.preventDefault()}
        ref={form}
      >
        <FormGroup as={Row} controlId="formHeight">
          <Form.Label column md={3}>
            Enter Your Height:
          </Form.Label>

          <Col>
            {" "}
            <InputGroup>
              <Form.Control
                required
                type="number"
                size="2"
                min="4"
                max="7"
                onChange={(e) => {
                  setHeightFt(e.target.value);
                }}
              />

              <InputGroup.Append>
                <InputGroup.Text>ft</InputGroup.Text>
              </InputGroup.Append>
            </InputGroup>
          </Col>
          <Col>
            <InputGroup>
              <Form.Control
                required
                type="number"
                size="2"
                min="0"
                max="11"
                onChange={(e) => {
                  setHeightIn(e.target.value);
                }}
              />
              <InputGroup.Append>
                <InputGroup.Text>in</InputGroup.Text>
              </InputGroup.Append>
            </InputGroup>
          </Col>
        </FormGroup>

        <FormGroup as={Row} controlId="formGender">
          <Form.Label column md={3}>
            Select Your Gender:
          </Form.Label>
          <Col>
            <Form.Control
              as="select"
              required
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
              }}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Form.Control>
          </Col>
        </FormGroup>
        <Row>
          <Button
            type="submit"
            onClick={saveBasicInfo}
            className="mt-5 mx-auto"
          >
            Continue
          </Button>
        </Row>
      </Form>
    </>
  );
};

export default BasicInfoInput;
