import { GangwarSettings } from "../../types";
import { gangwar } from "./gangwar";

jest.setTimeout(600000);

describe("Gangwar Service", () => {
  const keys = {
    owner: "aleo1z9rkh2xecmpnx9jxkvnyq08mfeddrsrccny0j2hgw4yfhnxpxyqqp42329",
    privateKey: "APrivateKey1zkp3WTnfDxUchbLeHqwGrgdkTNieykUP72UPNmv4uQngjwf",
    viewKey: "AViewKey1fvqnzQ9nYfFMAkhjdcz5UEtDD1JjpbtG8kMXBLJKAHbd",
  };

  it("Create game", async () => {
    const { owner, privateKey, viewKey } = keys;

    const simulationId = 1;
    const registrationDuration = 1000;
    const maxNumberOfPlayers = 10;
    const gameloopCount = 10;

    const settings: GangwarSettings = await gangwar.createGame(
      privateKey,
      viewKey,
      simulationId,
      registrationDuration,
      maxNumberOfPlayers,
      gameloopCount
    );
  });
});
