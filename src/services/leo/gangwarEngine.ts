import { join } from "path";

import { env, FEE, programNames } from "../../constants";
import { LeoAddress, leoAddressSchema, LeoPrivateKey, LeoU128, LeoViewKey } from "../../types";
import { Team, War, warBracketPattern } from "../../types/gangwarEngine";
import { leoParse } from "../../utils";
import { convertProbToUInt128 } from "./probability";
import { contractsPath, parseOutput, snarkOsFetchMappingValue, zkRun } from "./util";

const gangwarPath = join(contractsPath, "gangwar_engine");

const initialize = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey
  // TODO: verify return type
): Promise<any> => {
  const transition = "initialize";

  let leoRandomSeed = convertProbToUInt128(Math.random());
  const params = [leoRandomSeed];

  // console.log("gangwar.ts Trying to initialize with ", leoRandomSeed);
  await zkRun({
    privateKey,
    viewKey,
    appName: programNames.GANGWAR_ENGINE,
    contractPath: gangwarPath,
    transition,
    params,
    fee: FEE,
  });

  // Query blockchain for the randomSeed
  // if (env.ZK_MODE !== "leo") {
  //   leoRandomSeed = await snarkOsFetchMappingValue({
  //     appName: programNames.GANGWAR_ENGINE,
  //     mappingName: "settings",
  //     mappingKey: "0u128",
  //   });
  // }

  // return leoRandomSeed;
};

// const startGame = async (
//   privateKey: LeoPrivateKey,
//   viewKey: LeoViewKey,
//   owner: LeoAddress,
//   simulationId: string,
//   teamA: Team,
//   teamB: Team
// ): Promise<War> => {
//   leoAddressSchema.parse(owner);

//   const leoTeamA = leoParse.team(teamA);
//   const leoTeamB = leoParse.team(teamB);
//   const leoSimulationId = leoParse.u128(simulationId);

//   // Query blockchain for the randomSeed
//   let leoRandomSeed = convertProbToUInt128(Math.random());
//   if (env.ZK_MODE !== "leo") {
//     leoRandomSeed = await snarkOsFetchMappingValue({
//       appName: programNames.GANGWAR_ENGINE,
//       mappingName: "settings",
//       mappingKey: "0u128",
//     });
//   }

//   // console.log("gangwar.ts Trying to startgame with ", leoTeamA, leoTeamB, leoRandomSeed);

//   const teamAParam = leoParse.stringifyLeoCmdParam(leoTeamA);
//   const teamBParam = leoParse.stringifyLeoCmdParam(leoTeamB);

//   const transition = "start_game";
//   const params = [leoSimulationId, teamAParam, teamBParam, leoRandomSeed];

//   const correctBracketPattern = warBracketPattern(1, 1); // TODO

//   const record = await zkRun(
//     {
//       privateKey,
//       viewKey,
//       appName: programNames.GANGWAR_ENGINE,
//       contractPath: gangwarPath,
//       transition,
//       params,
//       fee: FEE,
//     },
//     correctBracketPattern
//   );

//   // console.log(JSON.stringify(record));

//   return parseOutput.war(record);
// };

// const gameLoop = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, owner: LeoAddress, war: War): Promise<War> => {
//   // console.log(war);
//   leoAddressSchema.parse(owner);

//   const leoWar = leoParse.warRecord(war);
//   const warParam = leoParse.stringifyLeoCmdParam(leoWar);

//   // Query blockchain for the randomSeed
//   let leoRandomSeed = convertProbToUInt128(Math.random());
//   if (env.ZK_MODE !== "leo") {
//     leoRandomSeed = await snarkOsFetchMappingValue({
//       appName: programNames.GANGWAR_ENGINE,
//       mappingName: "settings",
//       mappingKey: "0u128",
//     });
//   }

//   const transition = "game_loop";
//   const params = [warParam, leoRandomSeed];

//   const correctBracketPattern = warBracketPattern(1, 1); // TODO

//   const record = await zkRun(
//     {
//       privateKey,
//       viewKey,
//       appName: programNames.GANGWAR_ENGINE,
//       contractPath: gangwarPath,
//       transition,
//       params,
//       fee: FEE,
//     },
//     correctBracketPattern
//   );

//   return parseOutput.war(record);
// };

// export const gangwar = { startGame, initialize, gameLoop };
export const gangwarEngine = { initialize };
