class BodyMeasure {
  personHeightIn: number;
  personWeightLb: number;
  personGender: string;
  cameraHeightPx: number;
  cameraWidthPx: number;
  frontSegmentation: any;
  sideSegmentation: any;
  frontConversionFactor: number;
  sideConversionFactor: number;
  frontKeypoints: Array<number>;
  sideKeypoints: Array<number>;
  neckCirc: number;
  shoulderWidth: number;
  sleeveLength: number;
  inseamLength: number;
  chestCirc: number;
  waistCirc: number;
  hipCirc: number;

  constructor(
    personHeightIn: number,
    personWeightLb: number,
    personGender: string,
    frontSegmentation: any,
    sideSegmentation: any
    // cameraHeightPx: number,
    // camerWidthPx: number
  ) {
    this.personHeightIn = personHeightIn;
    this.personWeightLb = personWeightLb;
    this.personGender = personGender;
    this.cameraHeightPx = -1;
    this.cameraWidthPx = -1;
    this.frontConversionFactor = 0;
    this.sideConversionFactor = 0;
    this.frontKeypoints = [];
    this.sideKeypoints = [];
    this.neckCirc = -1;
    this.shoulderWidth = -1;
    this.sleeveLength = -1;
    this.chestCirc = -1;
    this.waistCirc = -1;
    this.inseamLength = -1;
    this.hipCirc = -1;
    this.frontSegmentation = frontSegmentation;
    this.sideSegmentation = sideSegmentation;
  }

  setFrameDims(): void {
    this.cameraHeightPx = this.frontSegmentation["height"];
    this.cameraWidthPx = this.frontSegmentation["width"];
  }
  setKeyPoints(): void {
    this.frontKeypoints = this.frontSegmentation["allPoses"][0]["keypoints"];
    this.sideKeypoints = this.sideSegmentation["allPoses"][0]["keypoints"];
  }

  estConversionFactor(
    imgData: Array<Number>,
    keypoints: Array<any>,
    view: string
  ): number {
    // Reference for keypoints: https://github.com/tensorflow/tfjs-models/tree/master/posenet#keypoints
    const isPixelPerson = imgData.map((e) => (e > -1 ? 1 : 0));
    let indexFirstPersonPixel = isPixelPerson.indexOf(1);
    let indexLastPersonPixel = isPixelPerson.lastIndexOf(1);
    let keypointVal = 15; // default left ankle
    if (view === "side") {
      if (keypoints[2]["score"] > 0.9) {
        // right eye high likelihood -> right side view
        keypointVal = 16;
      }
    }
    //indexLastKeypoint not utilized, currently using bottom-most pixel
    let indexLastKeypoint = keypoints[keypointVal]["position"]["y"];
    console.log("left ankle y val: ", indexLastKeypoint);

    let yTopPixel = Math.floor(indexFirstPersonPixel / this.cameraWidthPx);
    //TODO check if ankle better than botttom-most pixel
    let yBottomPixel = Math.floor(indexLastPersonPixel / this.cameraWidthPx);
    console.log("y calculated pixel: ", yBottomPixel);

    let personPixelHeight = Math.abs(yBottomPixel - yTopPixel);
    return Math.abs(this.personHeightIn / personPixelHeight);
    // console.log(this.conversionFactor);
  }

  // estConversionFactors(imgData: Array<Number>, keypoints: Array<any>): void {
  estConversionFactors(): void {
    this.frontConversionFactor = this.estConversionFactor(
      this.frontSegmentation["data"],
      this.frontKeypoints,
      "front"
    );
    this.sideConversionFactor = this.estConversionFactor(
      this.sideSegmentation["data"],
      this.sideKeypoints,
      "side"
    );
  }

  pixelDistance(point1: [number, number], point2: [number, number]): number {
    let xDiffSqr = Math.pow(point1[0] - point2[0], 2);
    let yDiffSqr = Math.pow(point1[1] - point2[1], 2);
    return Math.sqrt(xDiffSqr + yDiffSqr);
  }

  // ellipsePeri(radius1: number, radius2: number): number {
  //   return (
  //     Math.PI *
  //     (3 * (radius1 + radius2) +
  //       Math.sqrt((3 * radius1 + radius2) * (radius1 + 3 * radius2)))
  //   );
  // }

  ellipsePeri(radius1: number, radius2: number): number {
    let diffSqr = (radius1 - radius2) ** 2;
    let addSqr = (radius1 + radius2) ** 2;
    let denomSqrtPart = Math.sqrt(-3 * (diffSqr / addSqr) + 4) + 10;

    return (
      Math.PI *
      (radius1 + radius2) *
      (3 * (diffSqr / (addSqr * denomSqrtPart)) + 1)
    );
  }

  midPoint(
    point1: { x: number; y: number; },
    point2: { x: number; y: number; }
  ): { x: number; y: number; } {
    return {
      x: (point1["x"] + point2["x"]) / 2,
      y: (point1["y"] + point2["y"]) / 2,
    };
  }

  calculateShoulder(keypoints: Array<any>): number {
    // Reference for keypoints: https://github.com/tensorflow/tfjs-models/tree/master/posenet#keypoints
    let ltShlderPnt = keypoints[5]["position"];
    let rtShlderPnt = keypoints[6]["position"];
    let shlderPixDist = this.pixelDistance(
      [ltShlderPnt["x"], ltShlderPnt["y"]],
      [rtShlderPnt["x"], rtShlderPnt["y"]]
    );
    //console.log("shoulder pixel dist:", shlderPixDist);
    return Math.abs(shlderPixDist * this.frontConversionFactor);
  }

  /**
   * Returns pixel [x,y] location of furthest left "l" or right "r" segment from keypoint.
   * partName to parse for, will check for = partName.
   * If no person found, returns [-1,-1]
   */
  PixelLeftRightOfKeypoint(
    imgData: Array<number>,
    laterality: string,
    keypoint: { x: number; y: number; },
    partName: number
  ): Array<number> {
    if (laterality !== "l" && laterality !== "r") {
      console.log("Error: Incorrect input given to pixel parser.");
    }
    let yKeypt = Math.floor(keypoint["y"]);
    let offset = yKeypt * this.cameraWidthPx;

    switch (laterality) {
      case "l":
        //leftmost index of imgData to start search
        for (var i = 0; i < this.cameraWidthPx; i++) {
          if (imgData[i + offset] === partName) {
            // console.log(
            //   "Found point at array: ",
            //   i + offset,
            //   " of type: ",
            //   imgData[i + offset]
            // );
            return [i, yKeypt];
          }
        }
        break;
      case "r":
        //right to left
        for (var j = this.cameraWidthPx; j >= 0; j--) {
          if (imgData[j + offset] === partName) {
            console.log(
              "Found point at array: ",
              j + offset,
              " of type: ",
              imgData[j + offset]
            );
            return [j, yKeypt];
          }
        }
        break;
    }
    console.log("No Person found on keypoint row.");
    return [-1, -1];
  }

  calculateHipWidth(keypoints: Array<any>, imgData: Array<number>): number {
    let ltHipPnt = keypoints[11]["position"];
    let rtHipPnt = keypoints[12]["position"];
    let ltHip = this.PixelLeftRightOfKeypoint(imgData, "r", ltHipPnt, 12);
    let rtHip = this.PixelLeftRightOfKeypoint(imgData, "l", rtHipPnt, 12);
    // console.log("ltHip location", ltHip);
    // console.log("rtHip location: ", rtHip);
    let hipPixDist = this.pixelDistance(
      [ltHip[0], ltHip[1]],
      [rtHip[0], rtHip[1]]
    );
    console.log(
      "Hip inches distance calculated: ",
      hipPixDist * this.frontConversionFactor
    );
    return hipPixDist * this.frontConversionFactor;
  }

  calculateHipCirc(
    frontKeypoints: Array<any>,
    frontImgData: Array<number>,
    sideKeypoints: Array<any>,
    sideImgData: Array<number>
  ): number {
    let frontHipDist = this.calculateHipWidth(frontKeypoints, frontImgData);
    let sideHipDist = -1;
    let hipLevel = -1;
    let leftHipKeyPoint = sideKeypoints[11];
    let rightHipKeyPoint = sideKeypoints[12];

    if (leftHipKeyPoint["score"] > 0.7) {
      hipLevel = leftHipKeyPoint["position"]["y"];
    } else if (rightHipKeyPoint["score"] > 0.7) {
      hipLevel = rightHipKeyPoint["position"]["y"];
    }
    if (hipLevel > 0) {
      let sideHipImgArray = sideImgData.slice(
        Math.floor(hipLevel) * this.cameraWidthPx,
        Math.floor(hipLevel + 1) * this.cameraWidthPx
      );

      console.log("Sliced side image hip array: ", sideHipImgArray);

      //Ignore laterality of side image by mapping right/left arm + hand to -1, and then map rest to 1, find first and list index of 1
      let PixelRemoveArm = sideHipImgArray.map((e) => (e < 12 ? -1 : 1));
      console.log("Remapped hip array: ", PixelRemoveArm);

      let sideHipFrontPixel = PixelRemoveArm.indexOf(1); // front torso
      let sideHipBackPixel = PixelRemoveArm.lastIndexOf(1); //back torso

      sideHipDist =
        this.pixelDistance(
          [sideHipFrontPixel, Math.floor(hipLevel)],
          [sideHipBackPixel, Math.floor(hipLevel)]
        ) * this.sideConversionFactor;
    }
    console.log("Side Hip Distance: ", sideHipDist);

    if (sideHipDist > 0) {
      return this.ellipsePeri(frontHipDist / 2, sideHipDist / 2);
    } else {
      return -1;
    }
  }

  /**
   * Calculates both sleeve lengths and outputs average.
   */
  calculateSleeveLen(keypoints: Array<any>, imgData: Array<number>): number {
    //find neck midpoint, which will be last index of right face when traversing left to right
    let neckIndex = imgData.lastIndexOf(1);
    let neck = [
      neckIndex % this.cameraWidthPx,
      Math.floor(neckIndex / this.cameraWidthPx),
    ];
    console.log("Neck index: ", neck);

    //Finding right sleeve
    let rtShoulderPnt = keypoints[6]["position"];
    let rtShoulder = this.PixelLeftRightOfKeypoint(
      imgData,
      "l",
      rtShoulderPnt,
      4
    );

    let rtNeckToShoulder = this.pixelDistance(
      [neck[0], neck[1]],
      [rtShoulder[0], rtShoulder[1]]
    );

    let rtWrist = [
      keypoints[10]["position"]["x"],
      keypoints[10]["position"]["y"],
    ];

    let rtShoulderToWrist = this.pixelDistance(
      [rtShoulder[0], rtShoulder[1]],
      [rtWrist[0], rtWrist[1]]
    );

    console.log(
      "Right Shoulder to Neck in: ",
      rtNeckToShoulder * this.frontConversionFactor
    );
    console.log(
      "Right Wrist to Shoulder in: ",
      rtShoulderToWrist * this.frontConversionFactor
    );
    let rtSleeve =
      (rtNeckToShoulder + rtShoulderToWrist) * this.frontConversionFactor;

    //finding left sleeve
    let ltShoulderPnt = keypoints[5]["position"];
    let ltShoulder = this.PixelLeftRightOfKeypoint(
      imgData,
      "r",
      ltShoulderPnt,
      2
    );
    let ltNeckToShoulder = this.pixelDistance(
      [neck[0], neck[1]],
      [ltShoulder[0], ltShoulder[1]]
    );
    let ltWrist = [
      keypoints[9]["position"]["x"],
      keypoints[9]["position"]["y"],
    ];
    let ltShoulderToWrist = this.pixelDistance(
      [ltShoulder[0], ltShoulder[1]],
      [ltWrist[0], ltWrist[1]]
    );
    let ltSleeve =
      (ltNeckToShoulder + ltShoulderToWrist) * this.frontConversionFactor;
    console.log(
      "Left Shoulder to Neck in: ",
      ltNeckToShoulder * this.frontConversionFactor
    );
    console.log(
      "Left Wrist to Shoulder in: ",
      ltShoulderToWrist * this.frontConversionFactor
    );

    let Sleeve = -1;
    //TODO find good ratios for sleeve length, for now arbitrarily 10<x<40" acceptable range
    if (rtSleeve > 10 && rtSleeve < 40 && ltSleeve > 10 && ltSleeve < 40) {
      Sleeve = (rtSleeve + ltSleeve) / 2;
    } else if (ltSleeve > 10 && ltSleeve < 40) {
      Sleeve = ltSleeve;
    } else if (rtSleeve > 10 && rtSleeve < 40) {
      Sleeve = rtSleeve;
    }
    return Sleeve;
  }

  /**
   * Finds inseam length from imgData array and keypoints
   * @returns best average inseam from left and right legs, otherwise -1 if not found
   */
  calculateInseamLen(keypoints: Array<any>, imgData: Array<number>): number {
    //find midpt between hip keypoints
    let rtCrotchToKnee = 0;
    let rtKneeToAnkle = 0;

    //get x coordinate midpt val
    // let HipMidpt = keypoints[12]["position"]["x"];
    //add ofset between right and left hip
    // HipMidpt += (HipMidpt - keypoints[11]["position"]["x"]) / 2;

    let HipMidpt = this.midPoint(
      keypoints[11]["position"],
      keypoints[12]["position"]
    );

    let crotch = [
      Math.floor(HipMidpt["x"]),
      Math.floor(imgData.lastIndexOf(12) / this.cameraWidthPx),
    ];

    //find right inseam
    //get inner knee from right knee keypoint
    let rtKnee = this.PixelLeftRightOfKeypoint(
      imgData,
      "r",
      keypoints[14]["position"],
      16
    );

    rtCrotchToKnee = this.pixelDistance(
      [crotch[0], crotch[1]],
      [rtKnee[0], rtKnee[1]]
    );

    let rtAnkle = [
      keypoints[16]["position"]["x"],
      keypoints[16]["position"]["y"],
    ];

    rtKneeToAnkle = this.pixelDistance(
      [rtKnee[0], rtKnee[1]],
      [rtAnkle[0], rtAnkle[1]]
    );
    let rtInseam =
      (rtCrotchToKnee + rtKneeToAnkle) * this.frontConversionFactor;

    console.log(
      "right crotch to knee distance",
      rtCrotchToKnee * this.frontConversionFactor
    );
    console.log(
      "right knee to ankle dist (in)",
      rtKneeToAnkle * this.frontConversionFactor
    );

    //find left inseam
    let ltKnee = this.PixelLeftRightOfKeypoint(
      imgData,
      "l",
      keypoints[13]["position"],
      14
    );

    let ltCrotchToKnee = this.pixelDistance(
      [crotch[0], crotch[1]],
      [ltKnee[0], ltKnee[1]]
    );

    let ltAnkle = [
      keypoints[15]["position"]["x"],
      keypoints[15]["position"]["y"],
    ];

    let ltKneeToAnkle = this.pixelDistance(
      [ltKnee[0], ltKnee[1]],
      [ltAnkle[0], ltAnkle[1]]
    );
    let ltInseam =
      (ltCrotchToKnee + ltKneeToAnkle) * this.frontConversionFactor;
    console.log(
      "left crotch to knee distance",
      ltCrotchToKnee * this.frontConversionFactor
    );
    console.log(
      "left knee to ankle dist (in)",
      ltKneeToAnkle * this.frontConversionFactor
    );

    let Inseam = -1;
    //TODO find ratios for inseam, for now arbitrary 10 < x < 50 inches
    if (rtInseam > 10 && rtInseam < 40 && ltInseam > 10 && ltInseam < 40) {
      Inseam = (rtInseam + ltInseam) / 2;
    } else if (ltInseam > 10 && ltInseam < 40) {
      Inseam = ltInseam;
    } else if (rtInseam > 10 && rtInseam < 40) {
      Inseam = rtInseam;
    }

    return Inseam;
  }

  calculateChest(
    frontKeypoints: Array<any>,
    frontImgData: Array<number>,
    sideKeypoints: Array<any>,
    sideImgData: Array<number>
  ): number {
    let sideLeftSholderKeyPoint = sideKeypoints[5];
    let sideLeftElbowKeyPoint = sideKeypoints[7];
    let sideRightSholderKeyPoint = sideKeypoints[6];
    let sideRightElbowKeyPoint = sideKeypoints[8];
    let chestPositionY = -1;
    let chestSideDimension = -1;

    if (
      sideLeftSholderKeyPoint["score"] >= 0.8 &&
      sideLeftElbowKeyPoint["score"] >= 0.8
    ) {
      chestPositionY =
        (sideLeftSholderKeyPoint["position"]["y"] +
          sideLeftElbowKeyPoint["position"]["y"]) /
        2;
    } else if (
      sideRightSholderKeyPoint["score"] >= 0.8 &&
      sideRightElbowKeyPoint["score"] >= 0.8
    ) {
      chestPositionY =
        (sideRightSholderKeyPoint["position"]["y"] +
          sideRightElbowKeyPoint["position"]["y"]) /
        2;
    }

    // let chestPositionLeftX =
    //   (sideLeftSholderKeyPoint["position"]["x"] +
    //     sideLeftElbowKeyPoint["position"]["x"]) /
    //   2;

    // let chestLevelSideView = Math.floor(chestPositionLeftX / this.camerWidthPx);
    if (chestPositionY > 0) {
      let chestLevelSideViewArray = sideImgData.slice(
        Math.floor(chestPositionY) * this.cameraWidthPx,
        (Math.floor(chestPositionY) + 1) * this.cameraWidthPx
      );

      console.log("chest side array", chestLevelSideViewArray);
      //Remove hand or arm, setting torso or leg to 1 in slice
      let PixelRemoveArm = chestLevelSideViewArray.map((e) =>
        e < 12 ? -1 : 1
      );
      console.log("Remapped chest array: ", PixelRemoveArm);

      let sideChestFrontPixel = PixelRemoveArm.indexOf(1); // front torso
      let sideChestBackPixel = PixelRemoveArm.lastIndexOf(1); // back torso

      chestSideDimension =
        this.pixelDistance(
          [sideChestFrontPixel, Math.floor(chestPositionY)],
          [sideChestBackPixel, Math.floor(chestPositionY)]
        ) * this.sideConversionFactor;
    }

    console.log("chest side width", chestSideDimension);

    let frontLeftSholderKeyPoint = frontKeypoints[5];
    let frontLeftElbowKeyPoint = frontKeypoints[7];
    let frontRightSholderKeyPoint = frontKeypoints[6];
    let frontRightElbowKeyPoint = frontKeypoints[8];

    let shoulderMid = this.midPoint(
      frontLeftSholderKeyPoint["position"],
      frontRightSholderKeyPoint["position"]
    );
    let elbowMid = this.midPoint(
      frontLeftElbowKeyPoint["position"],
      frontRightElbowKeyPoint["position"]
    );
    let frontChestLevel = this.midPoint(shoulderMid, elbowMid);

    // console.log("front chest level:", frontChestLevel);

    let chestLevelFrontViewArray = frontImgData.slice(
      Math.floor(frontChestLevel["y"]) * this.cameraWidthPx,
      Math.floor(frontChestLevel["y"] + 1) * this.cameraWidthPx
    );
    // console.log("chest front array", chestLevelFrontViewArray);

    let frontChestFrontPixel = chestLevelFrontViewArray.indexOf(12); // front torso
    let frontChestBackPixel = chestLevelFrontViewArray.lastIndexOf(12); // front torso

    let chestFrontDimension =
      this.pixelDistance(
        [frontChestFrontPixel, Math.floor(chestPositionY)],
        [frontChestBackPixel, Math.floor(chestPositionY)]
      ) * this.frontConversionFactor;

    console.log("chest front width :", chestFrontDimension);
    if (chestSideDimension > 0) {
      return this.ellipsePeri(
        chestFrontDimension / 2.0,
        chestSideDimension / 2.0
      );
    } else {
      return -1;
    }
  }

  calculateNeck(
    frontKeypoints: Array<any>,
    frontImgData: Array<number>,
    sideKeypoints: Array<any>,
    sideImgData: Array<number>
  ): number {
    let frontNeckPositionY = -1;
    let sideNeckMeasurement = -1;
    // let sideNeckFrontPixel

    frontNeckPositionY = Math.floor(
      frontImgData.lastIndexOf(0) / this.cameraWidthPx
    );

    let neckLevelFrontViewArray = frontImgData.slice(
      Math.floor(frontNeckPositionY) * this.cameraWidthPx,
      Math.floor(frontNeckPositionY + 1) * this.cameraWidthPx
    );

    const isPartOfBody = (element: number) => element !== -1;
    let frontNeckLeftPixel = neckLevelFrontViewArray.findIndex(isPartOfBody);
    let frontNeckRightPixel =
      neckLevelFrontViewArray.length -
      neckLevelFrontViewArray.reverse().findIndex(isPartOfBody);

    let frontNeckMeasurement =
      this.pixelDistance(
        [frontNeckLeftPixel, frontNeckPositionY],
        [frontNeckRightPixel, frontNeckPositionY]
      ) * this.frontConversionFactor;

    if (sideKeypoints[1]["score"] > 0.9) {
      // left sided
      let sideNeckFrontPixel = sideImgData.indexOf(12);
      let sideNeckBackPixel = sideImgData.indexOf(13);
      sideNeckMeasurement =
        this.pixelDistance(
          [
            sideNeckFrontPixel % this.cameraWidthPx,
            Math.floor(sideNeckFrontPixel / this.cameraWidthPx),
          ],
          [
            sideNeckBackPixel % this.cameraWidthPx,
            Math.floor(sideNeckBackPixel / this.cameraWidthPx),
          ]
        ) * this.sideConversionFactor;
    }

    if (sideNeckMeasurement > 0) {
      return this.ellipsePeri(
        frontNeckMeasurement / 2,
        sideNeckMeasurement / 2
      );
    } else {
      return -1;
    }
  }

  calculateWaistCirc(
    frontKeypoints: Array<any>,
    frontImgData: Array<number>,
    sideKeypoints: Array<any>,
    sideImgData: Array<number>
  ): number {
    let frontLeftSholderKeyPoint = frontKeypoints[5];
    let frontLeftElbowKeyPoint = frontKeypoints[7];
    let frontRightSholderKeyPoint = frontKeypoints[6];
    let frontRightElbowKeyPoint = frontKeypoints[8];
    let frontLeftHipKeyPoint = frontKeypoints[11];
    let frontRightHipKeyPoint = frontKeypoints[12];

    let sideLeftSholderKeyPoint = sideKeypoints[5];
    let sideLeftElbowKeyPoint = sideKeypoints[7];
    let sideRightSholderKeyPoint = sideKeypoints[6];
    let sideRightElbowKeyPoint = sideKeypoints[8];
    let sideLeftHipKeyPoint = sideKeypoints[12];
    let sideRightHipKeyPoint = sideKeypoints[12];
    let sideChestPositionY = -1;
    let sideWaistPositionY = -1;
    let waistSideDimention = -1;

    let shoulderMid = this.midPoint(
      frontLeftSholderKeyPoint["position"],
      frontRightSholderKeyPoint["position"]
    );
    let elbowMid = this.midPoint(
      frontLeftElbowKeyPoint["position"],
      frontRightElbowKeyPoint["position"]
    );
    let hipMid = this.midPoint(
      frontLeftHipKeyPoint["position"],
      frontRightHipKeyPoint["position"]
    );
    let frontChestLevel = this.midPoint(shoulderMid, elbowMid);
    let frontWaistLevel = this.midPoint(hipMid, frontChestLevel);

    let waistFrontViewArray = frontImgData.slice(
      Math.floor(frontWaistLevel["y"]) * this.cameraWidthPx,
      Math.floor(frontWaistLevel["y"] + 1) * this.cameraWidthPx
    );
    let frontWaistLeftPixel = waistFrontViewArray.indexOf(12); // front torso
    let frontWaistRightPixel = waistFrontViewArray.lastIndexOf(12); // front thorso

    let waistFrontDimention =
      this.pixelDistance(
        [frontWaistLeftPixel, frontWaistLevel["y"]],
        [frontWaistRightPixel, frontWaistLevel["y"]]
      ) * this.frontConversionFactor;

    if (
      sideLeftElbowKeyPoint["score"] >= 0.8 &&
      sideLeftElbowKeyPoint["score"] >= 0.8 &&
      sideLeftHipKeyPoint["score"] >= 0.8
    ) {
      sideChestPositionY =
        (sideLeftSholderKeyPoint["position"]["y"] +
          sideLeftElbowKeyPoint["position"]["y"]) /
        2;
      sideWaistPositionY =
        (sideChestPositionY + sideLeftHipKeyPoint["position"]["y"]) / 2;
    } else if (
      sideRightSholderKeyPoint["score"] >= 0.8 &&
      sideRightElbowKeyPoint["score"] >= 0.8 &&
      sideRightHipKeyPoint["score"] >= 0.8
    ) {
      sideChestPositionY =
        (sideRightSholderKeyPoint["position"]["y"] +
          sideRightElbowKeyPoint["position"]["y"]) /
        2;
      sideWaistPositionY =
        (sideChestPositionY + sideRightHipKeyPoint["position"]["y"]) / 2;
    }
    if (sideWaistPositionY > 0) {
      let waistLevelSideViewArray = sideImgData.slice(
        Math.floor(sideWaistPositionY) * this.cameraWidthPx,
        Math.floor(sideWaistPositionY + 1) * this.cameraWidthPx
      );
      //TODO Need to figure out laterality of the side image and determine the body section
      let sideWaistFrontPixel = waistLevelSideViewArray.indexOf(12); // front torso
      let sideWaistBackPixel = waistLevelSideViewArray.lastIndexOf(13); // back thorso

      waistSideDimention =
        this.pixelDistance(
          [sideWaistFrontPixel, sideWaistPositionY],
          [sideWaistBackPixel, sideWaistPositionY]
        ) * this.sideConversionFactor;
    }

    if (sideChestPositionY > 0) {
      return this.ellipsePeri(
        waistFrontDimention / 2.0,
        waistSideDimention / 2.0
      );
    } else {
      return -1;
    }
  }

  doAllMeasurements(): void {

    // Set up 
    this.setFrameDims();
    this.setKeyPoints();

    this.estConversionFactors();

    this.shoulderWidth = this.calculateShoulder(this.frontKeypoints);
    this.hipCirc = this.calculateHipCirc(
      this.frontKeypoints,
      this.frontSegmentation["data"],
      this.sideKeypoints,
      this.sideSegmentation["data"]
    );
    this.chestCirc = this.calculateChest(
      this.frontKeypoints,
      this.frontSegmentation["data"],
      this.sideKeypoints,
      this.sideSegmentation["data"]
    );
    this.waistCirc = this.calculateWaistCirc(
      this.frontKeypoints,
      this.frontSegmentation["data"],
      this.sideKeypoints,
      this.sideSegmentation["data"]
    );
    this.sleeveLength = this.calculateSleeveLen(
      this.frontKeypoints,
      this.frontSegmentation["data"]
    );
    this.inseamLength = this.calculateInseamLen(
      this.frontKeypoints,
      this.frontSegmentation["data"]
    );
    this.neckCirc = this.calculateNeck(
      this.frontKeypoints,
      this.frontSegmentation["data"],
      this.sideKeypoints,
      this.sideSegmentation["data"]
    );
  }
}

export { BodyMeasure };
