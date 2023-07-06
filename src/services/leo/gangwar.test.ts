import { gangwar } from "./gangwar";
import { core } from "../../core";

jest.setTimeout(600000);

describe("Hash Chain Service", () => {
  const keys = {
    owner: "aleo1z9rkh2xecmpnx9jxkvnyq08mfeddrsrccny0j2hgw4yfhnxpxyqqp42329",
    privateKey: "APrivateKey1zkp3WTnfDxUchbLeHqwGrgdkTNieykUP72UPNmv4uQngjwf",
    viewKey: "AViewKey1fvqnzQ9nYfFMAkhjdcz5UEtDD1JjpbtG8kMXBLJKAHbd",
    startingSeed: "42u128",
  };

  it("Starts the game with randome team", async () => {
    const { owner, privateKey, viewKey, startingSeed } = keys;

    const { teamA, teamB } = core.createPayload(1, 1);

    const res = await gangwar.startGame(privateKey, viewKey, owner, teamA, teamB, startingSeed);

    console.log(res);
  });
});
