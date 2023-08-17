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
import { leoParse } from "../../utils";
import {
  contractsPath,
  fetchUnspentRecords,
  leoRun,
  networkClient,
  parseOutput,
  parseRecordString,
  snarkOsFetchMappingValue,
  zkRun,
} from "./util";

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

  const leoSimulationId = leoParse.u32(simulationId);
  const leoRegistrationDuration = leoParse.u32(registrationDuration);
  const leoMaxNumberOfPlayers = leoParse.u8(maxNumberOfPlayers);
  const leoGameLoopCount = leoParse.u8(maxRounds);
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
  const leoSimulationId = leoParse.u32(simulationId);
  if (env.ZK_MODE !== "leo") {
    const res = await snarkOsFetchMappingValue({
      appName: programNames.GANGWAR,
      mappingName: "gangwar_settings",
      mappingKey: leoSimulationId,
    });
    const gangwarSettingsLeo = parseRecordString(res);
    const gangwarSettings = parseOutput.settings(gangwarSettingsLeo);
    return gangwarSettings;
  } else {
    return {
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
): Promise<SchnorrSignature> => {
  const transition = "sign";
  // const leoSk: LeoScalar = leoScalarSchema.parse(sk);
  const leoSk = leoParse.scalar(BigInt(sk));
  const leoK = leoParse.scalar(BigInt(k));

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

  const leoValidityTimestamp = leoParse.u32(validTimestamp);
  const leoCharacter = leoParse.character(character);
  console.log(leoCharacter);
  let leoCharacterParam = leoParse.stringifyLeoCmdParam(leoCharacter);

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

  const signature = parseOutput.signature(res);

  return signature;
};

const joinGame = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  simulationId: number,
  character: Character,
  signature: SchnorrSignature
): Promise<Player> => {
  const transition = "join_game";

  const leoSimulationId = leoParse.u32(simulationId);

  const leoCharacter = leoParse.character(character);
  const leoSignature = leoParse.signature(signature);

  const leoCharacterParam = leoParse.stringifyLeoCmdParam(leoCharacter);
  const leoSignatureParam = leoParse.stringifyLeoCmdParam(leoSignature);

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

  const playerRecord = parseOutput.playerRecord(res);
  return playerRecord;
};

const fetchPlayerRecords = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, simulationId: number): Promise<any> => {
  // TODO: add start block to the settings
  const settings = await fetchGangwarSettings(simulationId);

  // TODO: maybe store startBlock on chain
  // const startBlock = settings.deadlineToRegister - 1000;
  const startBlock = 250;
  const bracketPattern = playerRecordBracketPattern();
  const unspentRecords = await fetchUnspentRecords(privateKey, viewKey, programNames.GANGWAR, "Player", startBlock, bracketPattern);
  const playerRecords = [];
  for (let record of unspentRecords) {
    try {
      const playerRecord = parseOutput.playerRecord(record);
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
      const warRecord = parseOutput.war(record);
      console.log(warRecord);
      if (warRecord.simulationId == simulationId) {
        warRecords.push(warRecord);
      }
    } catch {}
  }
  return warRecords;
};

const startGame = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, simulationId: number, players: Player[]): Promise<War> => {
  const transition = "start_game";

  const leoSimulationId = leoParse.u32(simulationId);

  const gangwarSettings = fetchGangwarSettings(simulationId);
  const leoRandomSeed = leoParse.u16((await gangwarSettings).randomNumber);

  const leoPlayerRecordParams = [];
  // console.log(player);
  for (let player of players) {
    const leoPlayerRecord = leoParse.playerRecord(player);
    const leoPlayerRecordParam = leoParse.stringifyLeoCmdParam(leoPlayerRecord);
    leoPlayerRecordParams.push(leoPlayerRecordParam);
  }

  const params = [leoSimulationId, leoRandomSeed, ...leoPlayerRecordParams];

  // console.log("gangwar.ts Joining game ", simulationId);
  let res = await zkRun({
    privateKey,
    viewKey,
    appName: programNames.GANGWAR,
    contractPath: gangwarPath,
    transition,
    params,
    fee: FEE,
  });

  const warRecord = parseOutput.war(res);
  console.log(warRecord);
  return warRecord;
};

const simulate1vs1 = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, war: War): Promise<War> => {
  const transition = "simulate1vs1";

  const gangwarSettings = fetchGangwarSettings(war.simulationId);
  const leoRandomSeed = leoParse.u16((await gangwarSettings).randomNumber);
  console.log(leoRandomSeed);

  const leoWarRecord = leoParse.warRecord(war);

  const leoWarRecordParam = leoParse.stringifyLeoCmdParam(leoWarRecord);

  const params = [leoWarRecordParam, leoRandomSeed];

  // console.log("gangwar.ts Joining game ", simulationId);
  let res = await zkRun({
    privateKey,
    viewKey,
    appName: programNames.GANGWAR,
    contractPath: gangwarPath,
    transition,
    params,
    fee: FEE,
  });

  const warRecord = parseOutput.war(res);
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
  const leoRandomSeed = leoParse.u16((await gangwarSettings).randomNumber);
  console.log(leoRandomSeed);

  const leoWarRecord = leoParse.warRecord(war);

  const leoWarRecordParam = leoParse.stringifyLeoCmdParam(leoWarRecord);

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
};
