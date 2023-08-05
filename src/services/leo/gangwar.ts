import { join } from "path";

import { env, FEE, programNames } from "../../constants";
import { LeoAddress, leoAddressSchema, LeoPrivateKey, LeoU128, LeoViewKey } from "../../types";
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
    appName: programNames.GANGWAR_ENGINE,
    contractPath: gangwarPath,
    transition,
    params,
    fee: FEE,
  });

  // Query blockchain for the settings
  let setting: any;
  if (env.ZK_MODE !== "leo") {
    setting = await snarkOsFetchMappingValue({
      appName: programNames.GANGWAR_ENGINE,
      mappingName: "settings",
      mappingKey: leoSimulationId,
    });
  }

  return setting;
};

export const gangwar = { createGame };
