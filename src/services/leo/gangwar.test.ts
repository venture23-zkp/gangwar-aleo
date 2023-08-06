import { characterSchema, GangwarSettings } from "../../types";
import { gangwar } from "./gangwar";
import { createCharacters } from "../../core/gangwar";
import { leoParse } from "../../utils";

jest.setTimeout(600000);

describe("Gangwar Service", () => {
  const keys = {
    owner: "aleo1z9rkh2xecmpnx9jxkvnyq08mfeddrsrccny0j2hgw4yfhnxpxyqqp42329",
    privateKey: "APrivateKey1zkp3WTnfDxUchbLeHqwGrgdkTNieykUP72UPNmv4uQngjwf",
    viewKey: "AViewKey1fvqnzQ9nYfFMAkhjdcz5UEtDD1JjpbtG8kMXBLJKAHbd",
  };

  const schnorrKeys = {
    sk: "2", // secret key
    k: "1", // one time signature key
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

  it("Sign a Character", async () => {
    const { owner, privateKey, viewKey } = keys;
    const { sk, k } = schnorrKeys;

    const character = createCharacters(1, ["Apple"])[0];

    const validityTimestamp = 200; // 100 blocks
    const signature = await gangwar.sign(privateKey, viewKey, character, sk, k, validityTimestamp);
    console.log(signature);
  });

  it("Join a Game", async () => {
    const { owner, privateKey, viewKey } = keys;
    const { sk, k } = schnorrKeys;

    const character = createCharacters(1, ["Apple"])[0];

    const validityTimestamp = 200; // 100 blocks
    const signature = await gangwar.sign(privateKey, viewKey, character, sk, k, validityTimestamp);

    const simulationId = 1;
    const playerRecord = await gangwar.joinGame(privateKey, viewKey, simulationId, character, signature);
    console.log(playerRecord);
  });
});
