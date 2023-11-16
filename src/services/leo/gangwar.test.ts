import { GangwarSettings, Player, War } from "../../types";
import { gangwar } from "./gangwar";
import { createCharacters } from "../../core/gangwar";

// import { sampleParticipants } from "../../samples/participants";
import { initialWarRecord } from "../../samples/initialWarRecord";
import { LOCAL_NETWORK_ADDRESS, LOCAL_NETWORK_PRIVATE_KEY, LOCAL_NETWORK_VIEW_KEY } from "../../constants";

jest.setTimeout(600000);

describe("Gangwar Service", () => {
  const keys = {
    owner: LOCAL_NETWORK_ADDRESS,
    privateKey: LOCAL_NETWORK_PRIVATE_KEY,
    viewKey: LOCAL_NETWORK_VIEW_KEY,
  };

  const schnorrKeys = {
    sk: "1", // secret key
  };

  let updatedWar: War;

  it("Create game", async () => {
    const { owner, privateKey, viewKey } = keys;

    const simulationId = 1;
    const registrationDuration = 1000;
    const maxNumberOfPlayers = 6;
    const maxRounds = 10;
    const participationLootcrateCount = 1;
    const winnerLootcrateCount = 1;

    const settings: GangwarSettings = await gangwar.createGame(
      privateKey,
      viewKey,
      simulationId,
      registrationDuration,
      maxNumberOfPlayers,
      maxRounds,
      participationLootcrateCount,
      winnerLootcrateCount
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
    const { sk } = schnorrKeys;

    const character = createCharacters(1, ["Apple"])[0];
    console.log(character);
    console.log(JSON.stringify(character));

    const signature = await gangwar.sign(character, sk);
    console.log(signature);
  });

  it("Join a Game", async () => {
    const { owner, privateKey, viewKey } = keys;
    const { sk } = schnorrKeys;

    const character = createCharacters(1, ["Apple"])[0];

    const validityTimestamp = 200; // 100 blocks
    const { signature } = await gangwar.sign(character, sk);

    const simulationId = 1;
    const playerRecord = await gangwar.joinGame(privateKey, viewKey, simulationId, character, signature);
    console.log(JSON.stringify(playerRecord));
  });

  it("Start the Game", async () => {
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
