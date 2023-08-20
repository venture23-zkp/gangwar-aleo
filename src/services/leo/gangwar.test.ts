import { GangwarSettings, Player, War } from "../../types";
import { gangwar } from "./gangwar";
import { createCharacters } from "../../core/gangwar";

// import { sampleParticipants } from "../../samples/participants";
import { initialWarRecord } from "../../samples/initialWarRecord";

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

  let updatedWar: War;

  it("Create game", async () => {
    const { owner, privateKey, viewKey } = keys;

    const simulationId = 1;
    const registrationDuration = 1000;
    const maxNumberOfPlayers = 10;
    const maxRounds = 10;

    const settings: GangwarSettings = await gangwar.createGame(
      privateKey,
      viewKey,
      simulationId,
      registrationDuration,
      maxNumberOfPlayers,
      maxRounds
    );
  });

  it("Update game registrationTime", async () => {
    const { owner, privateKey, viewKey } = keys;

    const simulationId = 1;
    const registrationDuration = 1000;
    const maxNumberOfPlayers = 10;
    const maxRounds = 10;

    const settings: GangwarSettings = await gangwar.updateRegistrationTime(privateKey, viewKey, simulationId, registrationDuration);
  });

  it("Sign a Character", async () => {
    const { owner, privateKey, viewKey } = keys;
    const { sk, k } = schnorrKeys;

    const character = createCharacters(1, ["Apple"])[0];
    console.log(character);
    console.log(JSON.stringify(character));

    const validityTimestamp = 200; // 100 blocks
    const signature = await gangwar.sign(character, sk, k);
    console.log(signature);
  });

  it("Join a Game", async () => {
    const { owner, privateKey, viewKey } = keys;
    const { sk, k } = schnorrKeys;

    const character = createCharacters(1, ["Apple"])[0];

    const validityTimestamp = 200; // 100 blocks
    const { signature } = await gangwar.sign(character, sk, k);

    const simulationId = 1;
    const playerRecord = await gangwar.joinGame(privateKey, viewKey, simulationId, character, signature);
    console.log(JSON.stringify(playerRecord));
  });

  it("Start the Game", async () => {
    const PLAYER_COUNT = 6;
    const { owner, privateKey, viewKey } = keys;
    const simulationId = 1;

    const war = await gangwar.startGame(privateKey, viewKey, simulationId);
    console.log(JSON.stringify(war));
  });

  it("Simulate 1vs1", async () => {
    const { owner, privateKey, viewKey } = keys;
    const simulationId = 1;

    updatedWar = await gangwar.simulate1vs1(privateKey, viewKey, initialWarRecord);
    console.log(JSON.stringify(updatedWar));
  });

  it("Finish Game", async () => {
    const { owner, privateKey, viewKey } = keys;
    const simulationId = 1;

    // let war: War = initialWarRecord;
    let war: War = updatedWar;

    await gangwar.finishGame(privateKey, viewKey, updatedWar);
  });
});
