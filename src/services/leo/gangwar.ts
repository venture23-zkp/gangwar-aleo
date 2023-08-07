import { Signature } from "@aleohq/wasm";
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
} from "../../types";
import { SchnorrSignature } from "../../types/dsa";
import { leoParse } from "../../utils";
import { contractsPath, leoRun, parseOutput, parseRecordString, snarkOsFetchMappingValue, zkRun } from "./util";

const gangwarPath = join(contractsPath, "gangwar");

const createGame = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  simulationId: number,
  registrationDuration: number,
  maxNumberOfPlayers: number,
  gameloopCount: number
  // TODO: verify return type
): Promise<any> => {
  const transition = "create_game";

  const leoSimulationId = leoParse.u32(simulationId);
  const leoRegistrationDuration = leoParse.u32(registrationDuration);
  const leoMaxNumberOfPlayers = leoParse.u8(maxNumberOfPlayers);
  const leoGameLoopCount = leoParse.u8(gameloopCount);
  const params = [leoSimulationId, leoRegistrationDuration, leoMaxNumberOfPlayers, leoGameLoopCount];

  // console.log("gangwar.ts Trying to create game with ", simulationId);
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
      gameloopCount: 10,
      registeredPlayers: 1,
      randomNumber: 100,
    };
  }
};

// TODO: to check in deployment
const sign = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  character: Character,
  sk: string, // Secret key
  k: string, // Nonce for signing
  validityTimestamp: number
): Promise<SchnorrSignature> => {
  const transition = "sign";

  // const leoSk: LeoScalar = leoScalarSchema.parse(sk);
  const leoSk = leoParse.scalar(BigInt(sk));
  const leoK = leoParse.scalar(BigInt(k));

  const leoValidityTimestamp = leoParse.u32(validityTimestamp);
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
  // TODO: verify return type
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

const startGame = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  simulationId: number,
  player: Player
  // TODO: verify return type
): Promise<any> => {
  const transition = "start_game";

  const leoSimulationId = leoParse.u32(simulationId);

  const gangwarSettings = fetchGangwarSettings(simulationId);
  const leoRandomSeed = leoParse.u16((await gangwarSettings).randomNumber);

  // console.log(player);
  const leoPlayerRecord = leoParse.playerRecord(player);
  const leoPlayerRecordParam = leoParse.stringifyLeoCmdParam(leoPlayerRecord);

  const params = [
    leoSimulationId,
    leoRandomSeed,
    leoPlayerRecordParam,
    leoPlayerRecordParam,
    leoPlayerRecordParam,
    leoPlayerRecordParam,
    leoPlayerRecordParam,
    leoPlayerRecordParam,
  ];

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

export const gangwar = { createGame, sign, joinGame, startGame, fetchGangwarSettings };
