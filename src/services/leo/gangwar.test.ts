import { gangwar } from "./gangwar";
import { core } from "../../core";
import { War, warLeoSchema } from "../../types";
import { start } from "repl";

jest.setTimeout(600000);

describe("Gangwar Service", () => {
  const keys = {
    owner: "aleo1z9rkh2xecmpnx9jxkvnyq08mfeddrsrccny0j2hgw4yfhnxpxyqqp42329",
    privateKey: "APrivateKey1zkp3WTnfDxUchbLeHqwGrgdkTNieykUP72UPNmv4uQngjwf",
    viewKey: "AViewKey1fvqnzQ9nYfFMAkhjdcz5UEtDD1JjpbtG8kMXBLJKAHbd",
  };

  let war: War;

  // it("Placeholder", async () => {
  //   console.log("Test");
  //   console.log(JSON.stringify(warLeoSchema));
  // });

  // it("Initialize the game with a random seed", async () => {
  //   const { owner, privateKey, viewKey, startingSeed } = keys;
  //   const res = await gangwar.initialize(privateKey, viewKey, startingSeed);
  //   console.log(res);
  // });

  it("Starts the game with two teams", async () => {
    const { owner, privateKey, viewKey } = keys;
    const { teamA, teamB, simulationId } = core.createPayload(1, 2);

    // TODO: Starting seed needs to be the one that's stored on chain
    // So need a way to fetch and store it
    // For now let's use startingSeed = 1
    const startingSeed = "1";
    war = await gangwar.startGame(privateKey, viewKey, owner, simulationId, teamA, teamB, startingSeed);
    // console.log(JSON.stringify(war));
  });

  it("Play the game", async () => {
    const { owner, privateKey, viewKey } = keys;
    const startingSeed = "1";
    const res = await gangwar.gameLoop(privateKey, viewKey, owner, war, startingSeed);
    // console.log(res);
  });
});
