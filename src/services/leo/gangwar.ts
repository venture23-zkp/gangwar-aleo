import { Signature } from "@aleohq/wasm";
import { join } from "path";

import { env, FEE, programNames } from "../../constants";
import {
  Character,
  LeoAddress,
  leoAddressSchema,
  LeoPrivateKey,
  LeoScalar,
  leoScalarSchema,
  LeoU128,
  LeoViewKey,
  PlayerRecord,
} from "../../types";
import { SchnorrSignature } from "../../types/dsa";
import { Team, War, warBracketPattern } from "../../types/gangwarEngine";
import { leoParse } from "../../utils";
import { convertProbToUInt128 } from "./probability";
import { contractsPath, parseOutput, snarkOsFetchMappingValue, zkRun } from "./util";

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
  let setting: any;
  if (env.ZK_MODE !== "leo") {
    setting = await snarkOsFetchMappingValue({
      appName: programNames.GANGWAR,
      mappingName: "settings",
      mappingKey: leoSimulationId,
    });
  }

  return setting;
};

// TODO: separate out the logic to sign
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
  const leoCharacterParam = leoParse.stringifyLeoCmdParam(leoCharacter);
  const params = [leoCharacterParam, leoSk, leoK, leoValidityTimestamp];

  // console.log("gangwar.ts Trying to create game with ", simulationId);
  const res = await zkRun({
    privateKey,
    viewKey,
    appName: programNames.GANGWAR,
    contractPath: gangwarPath,
    transition,
    params,
    fee: FEE,
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
): Promise<PlayerRecord> => {
  const transition = "join_game";

  const leoSimulationId = leoParse.u32(simulationId);

  const leoCharacter = leoParse.character(character);
  const leoSignature = leoParse.signature(signature);

  const leoCharacterParam = leoParse.stringifyLeoCmdParam(leoCharacter);
  const leoSignatureParam = leoParse.stringifyLeoCmdParam(leoSignature);

  const params = [leoSimulationId, leoCharacterParam, leoSignatureParam];

  // console.log("gangwar.ts Joining game ", simulationId);
  let res = await zkRun({
    privateKey,
    viewKey,
    appName: programNames.GANGWAR_ENGINE,
    contractPath: gangwarPath,
    transition,
    params,
    fee: FEE,
  });

  const playerRecord = parseOutput.playerRecord(res);
  return playerRecord;
};

export const gangwar = { createGame, sign, joinGame };
