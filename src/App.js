import React, { useState } from "react";
import "./scss/App.scss";
import Container from "react-bootstrap/Container";
import WelcomeScreen from "./components/WelcomeScreen";
import BasicInfoInput from "./components/BasicInfoInput";
import InstructionScreen from "./components/InstructionScreen";
import FrontMeasurement from "./components/FrontMeasurement";
import SideMeasurement from "./components/SideMeasurement";
import ResultOutput from "./components/ResultOutput";

import {
  HashRouter as Router,
  Switch,
  Redirect,
  Route,
} from "react-router-dom";

function App() {
  const [appStage, setappStage] = useState(0);
  const [frontBodySegmentation, setFrontBodySegmentation] = useState(null);
  const [sideBodySegmentation, setSideBodySegmentation] = useState(null);
  const [height, setHeight] = useState(null);
  const [weight, setWeight] = useState(null);
  const [gender, setGender] = useState(null);

  const goToNextStage = () => {
    setappStage(appStage + 1);
  };

  const startOver = () => {
    setappStage(1);
  };

  return (
    <Router>
      <div className="App">
        <Container fluid="sm" className="h-100 pt-3 main-content">
          <Switch>
            <Route exact path="/">
              <WelcomeScreen onCompletion={goToNextStage} />
            </Route>
            <Route path="/basic">
              <BasicInfoInput
                onCompletion={(height, weight, gender) => {
                  console.log(
                    `Height: ${height} in, Weight: ${weight} lb, Gender: ${gender}`
                  );

                  setHeight(height);
                  setWeight(weight);
                  setGender(gender);
                  goToNextStage();
                }}
              />
            </Route>
            <Route exact path="/instruction">
              <InstructionScreen onCompletion={goToNextStage} />
            </Route>
            <Route path="/front">
              <FrontMeasurement
                onCompletion={(bodySegmentation) => {
                  // eslint-disable-next-line
                  setFrontBodySegmentation(bodySegmentation);
                  console.log("Front body segmentation saved");
                  console.log(bodySegmentation);
                  goToNextStage();
                }}
              />
            </Route>
            <Route path="/side">
              <SideMeasurement
                onCompletion={(bodySegmentation) => {
                  // eslint-disable-next-line
                  setSideBodySegmentation(bodySegmentation);
                  console.log("Side body segmentation saved");
                  console.log(bodySegmentation);
                  goToNextStage();
                }}
              />
            </Route>
            <Route path="/result">
              <ResultOutput
                height={height}
                weight={weight}
                gender={gender}
                frontBodySegmentation={frontBodySegmentation}
                sideBodySegmentation={sideBodySegmentation}
                onCompletion={startOver}
              />
            </Route>
          </Switch>

          {appStage === 0 && <Redirect to="/" />}
          {appStage === 1 && <Redirect to="/basic" />}
          {appStage === 2 && <Redirect to="/instruction" />}
          {appStage === 3 && <Redirect to="/front" />}
          {appStage === 4 && <Redirect to="/side" />}
          {appStage === 5 && <Redirect to="/result" />}
        </Container>
      </div>
    </Router>
  );
}

export default App;
