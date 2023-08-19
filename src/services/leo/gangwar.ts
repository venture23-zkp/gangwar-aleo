import { join } from "path";

import { env, FEE, programNames } from "../../constants";
import {
  Character,
  GangwarSettings,
  LeoAddress,
  leoAddressSchema,
  LeoPrivateKey,
  LeoScalar,
  leoScalarSchema,
  LeoU128,
  LeoViewKey,
  Player,
  playerRecordBracketPattern,
  War,
  warBracketPattern,
} from "../../types";
import { SchnorrSignature } from "../../types/dsa";
import { contractsPath, fetchUnspentRecords, leoRun, networkClient, parseRecordString, snarkOsFetchMappingValue, zkRun } from "./util";

import { js2leo } from "../../parsers/js2leo";
import { leo2js } from "../../parsers/leo2js";

const gangwarPath = join(contractsPath, "gangwar");

const createGame = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  simulationId: number,
  registrationDuration: number,
  maxNumberOfPlayers: number,
  maxRounds: number
): Promise<GangwarSettings> => {
  const transition = "create_game";

  const leoSimulationId = js2leo.u32(simulationId);
  const leoRegistrationDuration = js2leo.u32(registrationDuration);
  const leoMaxNumberOfPlayers = js2leo.u8(maxNumberOfPlayers);
  const leoGameLoopCount = js2leo.u8(maxRounds);
  const params = [leoSimulationId, leoRegistrationDuration, leoMaxNumberOfPlayers, leoGameLoopCount];

  console.log("gangwar.ts Trying to create game with ", simulationId, programNames.GANGWAR);
  await zkRun({
    privateKey,
    viewKey,
    appName: programNames.GANGWAR,
    contractPath: gangwarPath,
    transition,
    params,
    fee: FEE,
  });

  // Query blockchain for the settings
  const gangwarSettings = fetchGangwarSettings(simulationId);
  return gangwarSettings;
};

const fetchGangwarSettings = async (simulationId: number): Promise<GangwarSettings> => {
  const leoSimulationId = js2leo.u32(simulationId);
  if (env.ZK_MODE !== "leo") {
    const res = await snarkOsFetchMappingValue({
      appName: programNames.GANGWAR,
      mappingName: "gangwar_settings",
      mappingKey: leoSimulationId,
    });
    const gangwarSettingsLeo = parseRecordString(res);
    const gangwarSettings = leo2js.gangwar.settings(gangwarSettingsLeo);
    return gangwarSettings;
  } else {
    return {
      createdAt: 0,
      deadlineToRegister: 1000,
      maxNumberOfPlayers: 10,
      maxRounds: 10,
      registeredPlayers: 1,
      randomNumber: Math.round(Math.random() * (Math.pow(2, 16) - 1)),
    };
  }
};

// TODO: to check in deployment
const sign = async (
  character: Character,
  sk: string, // Secret key
  k: string // Nonce for signing
): Promise<any> => {
  const transition = "sign";
  // const leoSk: LeoScalar = leoScalarSchema.parse(sk);
  const leoSk = js2leo.scalar(BigInt(sk));
  const leoK = js2leo.scalar(BigInt(k));

  // TODO: Verify block duration to provide validityTimestamp
  // May need to convert timestamp to proper block (may not be deterministic)
  // For now Assume block duration = 1 sec
  const SECONDS_IN_ONE_DAY = 86400;
  const VALIDITY_DURATION = 1 * SECONDS_IN_ONE_DAY; // 1 day

  // TODO: update variables
  let validTimestamp = 0;
  if (env.ZK_MODE !== "leo") {
    const blockHeight = Number(await networkClient.getLatestHeight());
    validTimestamp = blockHeight + VALIDITY_DURATION;
  } else {
    validTimestamp = VALIDITY_DURATION;
  }

  const leoValidityTimestamp = js2leo.u32(validTimestamp);
  const leoCharacter = js2leo.gangwar.character(character);
  console.log(leoCharacter);
  let leoCharacterParam = js2leo.stringifyLeoCmdParam(leoCharacter);

  // TODO: search if there's a better approach
  // Yes. Implement later. Check stringifyLeoCmdParam function
  if (!leoCharacterParam.startsWith('"') || !leoCharacterParam.endsWith('"')) {
    leoCharacterParam = '"' + leoCharacterParam + '"';
  }
  const params = [leoCharacterParam, leoSk, leoK, leoValidityTimestamp];

  // console.log("gangwar.ts Trying to create game with ", simulationId);
  const res = await leoRun({
    contractPath: gangwarPath,
    transition,
    params,
  });

  const signature = leo2js.gangwar.signature(res);

  return { signature, leoCharacterParam };
};

// const updateMaxRounds = async (
//   privateKey: LeoPrivateKey,
//   viewKey: LeoViewKey,
//   simulationId: number,
//   maxRounds: number
// ): Promise<GangwarSettings> => {
//   const transition = "update_max_rounds";

//   const leoSimulationId = js2leo.u32(simulationId);
//   const leoGameLoopCount = js2leo.u8(maxRounds);
//   const params = [leoSimulationId, leoGameLoopCount];

//   console.log("gangwar.ts Trying to create game with ", simulationId, programNames.GANGWAR);
//   await zkRun({
//     privateKey,
//     viewKey,
//     appName: programNames.GANGWAR,
//     contractPath: gangwarPath,
//     transition,
//     params,
//     fee: FEE,
//   });

//   // Query blockchain for the settings
//   const gangwarSettings = fetchGangwarSettings(simulationId);
//   return gangwarSettings;
// };

const updateRegistrationTime = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  simulationId: number,
  gameStartTime: number
): Promise<GangwarSettings> => {
  const transition = "update_registration_time";

  const leoSimulationId = js2leo.u32(simulationId);
  const leoGameStartTime = js2leo.u32(gameStartTime);
  const params = [leoSimulationId, leoGameStartTime];

  console.log("gangwar.ts Trying to update registration time ", simulationId, programNames.GANGWAR);
  await zkRun({
    privateKey,
    viewKey,
    appName: programNames.GANGWAR,
    contractPath: gangwarPath,
    transition,
    params,
    fee: FEE,
  });

  // Query blockchain for the settings
  const gangwarSettings = fetchGangwarSettings(simulationId);
  return gangwarSettings;
};

const joinGame = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  simulationId: number,
  character: Character,
  signature: SchnorrSignature
): Promise<Player> => {
  const transition = "join_game";

  const leoSimulationId = js2leo.u32(simulationId);

  const leoCharacter = js2leo.gangwar.character(character);
  const leoSignature = js2leo.gangwar.signature(signature);

  const leoCharacterParam = js2leo.stringifyLeoCmdParam(leoCharacter);
  const leoSignatureParam = js2leo.stringifyLeoCmdParam(leoSignature);

  const params = [leoSimulationId, leoCharacterParam, leoSignatureParam];

  // console.log("gangwar.ts Joining game ", simulationId);
  let res = await zkRun(
    {
      privateKey,
      viewKey,
      appName: programNames.GANGWAR,
      contractPath: gangwarPath,
      transition,
      params,
      fee: FEE,
    },
    playerRecordBracketPattern()
  );

  const playerRecord = leo2js.gangwar.playerRecord(res);
  return playerRecord;
};

const fetchPlayerRecords = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, simulationId: number): Promise<any> => {
  // TODO: add start block to the settings
  const settings = await fetchGangwarSettings(simulationId);

  // TODO: maybe store startBlock on chain
  // const startBlock = settings.deadlineToRegister - 1000;
  const startBlock = settings.createdAt;
  const bracketPattern = playerRecordBracketPattern();
  const unspentRecords = await fetchUnspentRecords(privateKey, viewKey, programNames.GANGWAR, "Player", startBlock, bracketPattern);
  const playerRecords = [];
  for (let record of unspentRecords) {
    try {
      const playerRecord = leo2js.gangwar.playerRecord(record);
      if (playerRecord.simulationId == simulationId) {
        playerRecords.push(playerRecord);
      }
    } catch {}
  }
  return playerRecords;
};

const fetchWarRecord = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, simulationId: number): Promise<any> => {
  // TODO: add start block to the settings
  const settings = await fetchGangwarSettings(simulationId);

  // TODO: maybe store startBlock on chain
  // const startBlock = settings.deadlineToRegister - 1000;
  const startBlock = 250;
  const bracketPattern = warBracketPattern(3, 3);
  const unspentRecords = await fetchUnspentRecords(privateKey, viewKey, programNames.GANGWAR, "War", startBlock, bracketPattern);
  const warRecords = [];
  for (let record of unspentRecords) {
    try {
      const warRecord = leo2js.gangwar.war(record);
      if (warRecord.simulationId == simulationId) {
        warRecords.push(warRecord);
      }
    } catch {}
  }
  if (warRecords.length > 1) {
    throw Error("Only 1 War object can exist at a time");
  }
  return warRecords[0];
};

const startGame = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, simulationId: number, players: Player[]): Promise<War> => {
  const transition = "start_game";

  const leoSimulationId = js2leo.u32(simulationId);

  const gangwarSettings = fetchGangwarSettings(simulationId);
  const leoRandomSeed = js2leo.u16((await gangwarSettings).randomNumber);

  const leoPlayerRecordParams = [];
  // console.log(player);
  for (let player of players) {
    const leoPlayerRecord = js2leo.gangwar.playerRecord(player);
    const leoPlayerRecordParam = js2leo.stringifyLeoCmdParam(leoPlayerRecord);
    leoPlayerRecordParams.push(leoPlayerRecordParam);
  }

  const params = [leoSimulationId, leoRandomSeed, ...leoPlayerRecordParams];

  // console.log("gangwar.ts Joining game ", simulationId);
  let res = await zkRun(
    {
      privateKey,
      viewKey,
      appName: programNames.GANGWAR,
      contractPath: gangwarPath,
      transition,
      params,
      fee: FEE,
    },
    warBracketPattern(3, 3)
  );

  const warRecord = leo2js.gangwar.war(res);
  console.log(warRecord);
  return warRecord;
};

const simulate1vs1 = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, war: War): Promise<War> => {
  const transition = "simulate1vs1";

  const gangwarSettings = fetchGangwarSettings(war.simulationId);
  const leoRandomSeed = js2leo.u16((await gangwarSettings).randomNumber);
  console.log(leoRandomSeed);

  const leoWarRecord = js2leo.gangwar.warRecord(war);
  console.log(leoWarRecord);

  const leoWarRecordParam = js2leo.stringifyLeoCmdParam(leoWarRecord);

  const params = [leoWarRecordParam, leoRandomSeed];

  // console.log("gangwar.ts Joining game ", simulationId);
  let res = await zkRun(
    {
      privateKey,
      viewKey,
      appName: programNames.GANGWAR,
      contractPath: gangwarPath,
      transition,
      params,
      fee: FEE,
    },
    warBracketPattern(3, 3)
  );

  const warRecord = leo2js.gangwar.war(res);
  console.log(warRecord);
  return warRecord;
};

const finishGame = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  war: War
  // TODO: verify return type
): Promise<any> => {
  const transition = "finish_game";

  const gangwarSettings = fetchGangwarSettings(war.simulationId);
  const leoRandomSeed = js2leo.u16((await gangwarSettings).randomNumber);
  console.log(leoRandomSeed);

  const leoWarRecord = js2leo.gangwar.warRecord(war);

  const leoWarRecordParam = js2leo.stringifyLeoCmdParam(leoWarRecord);

  const params = [leoWarRecordParam, leoRandomSeed];

  // console.log("gangwar.ts Joining game ", simulationId);
  await zkRun({
    privateKey,
    viewKey,
    appName: programNames.GANGWAR,
    contractPath: gangwarPath,
    transition,
    params,
    fee: FEE,
  });
};

export const gangwar = {
  createGame,
  sign,
  joinGame,
  startGame,
  simulate1vs1,
  finishGame,
  fetchGangwarSettings,
  fetchPlayerRecords,
  fetchWarRecord,
  updateRegistrationTime,
  // updateMaxRounds,
};
