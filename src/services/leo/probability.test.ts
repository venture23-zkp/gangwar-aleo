import assert from "assert";
import { convertFieldToProb, convertProbToField } from "./probability";

jest.setTimeout(600000);

describe("Probability Test", () => {
  const probability = 0.015;

  // it("Initialize the game with a random seed", async () => {
  //   const { owner, privateKey, viewKey, startingSeed } = keys;
  //   const res = await gangwar.initialize(privateKey, viewKey, startingSeed);
  //   console.log(res);
  // });

  it("Convert probability to field", async () => {
    const probInField = convertProbToField(probability);
    const probInNumber = convertFieldToProb(probInField);
    expect(probInNumber).toBeCloseTo(probability);
  });
});
