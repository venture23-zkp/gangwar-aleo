import { join } from "path";

import { FEE, programNames } from "../../constants";
import { LeoAddress, leoAddressSchema, LeoPrivateKey, LeoU128, LeoViewKey } from "../../types";
import { Team, War, warBracketPattern } from "../../types/gangwar";
import { leoParse } from "../../utils";
import { contractsPath, parseOutput, zkRun } from "./util";

const gangwarPath = join(contractsPath, "gangwar_engine");

const initialize = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  randomSeed: LeoU128
  // TODO: verify return type
): Promise<any> => {
  const transition = "initialize";
  const params = [randomSeed];

  await zkRun({
    privateKey,
    viewKey,
    appName: programNames.GANGWAR_ENGINE,
    contractPath: gangwarPath,
    transition,
    params,
    fee: FEE,
  });
};

const startGame = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  owner: LeoAddress,
  simulationId: number,
  teamA: Team,
  teamB: Team,
  randomSeed: string
): Promise<War> => {
  leoAddressSchema.parse(owner);

  const leoTeamA = leoParse.team(teamA);
  const leoTeamB = leoParse.team(teamB);
  const leoSimulationId = leoParse.u128(simulationId);
  const leoRandomSeed = leoParse.u128(randomSeed);

  const teamAParam = leoParse.stringifyLeoCmdParam(leoTeamA);
  const teamBParam = leoParse.stringifyLeoCmdParam(leoTeamB);

  const transition = "start_game";
  const params = [leoSimulationId, teamAParam, teamBParam, leoRandomSeed];

  const correctBracketPattern = warBracketPattern(1, 1); // TODO

  const record = await zkRun(
    {
      privateKey,
      viewKey,
      appName: programNames.GANGWAR_ENGINE,
      contractPath: gangwarPath,
      transition,
      params,
      fee: FEE,
    },
    correctBracketPattern
  );

  // console.log(JSON.stringify(record));

  return parseOutput.war(record);
};

const gameLoop = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, owner: LeoAddress, war: War, randomSeed: string): Promise<War> => {
  leoAddressSchema.parse(owner);

  const leoWar = leoParse.warRecord(war);
  const leoRandomSeed = leoParse.u128(randomSeed);

  const warParam = leoParse.stringifyLeoCmdParam(leoWar);

  const transition = "game_loop";
  const params = [warParam, leoRandomSeed];

  const correctBracketPattern = warBracketPattern(1, 1); // TODO

  const record = await zkRun(
    {
      privateKey,
      viewKey,
      appName: programNames.GANGWAR_ENGINE,
      contractPath: gangwarPath,
      transition,
      params,
      fee: FEE,
    },
    correctBracketPattern
  );

  return parseOutput.war(record);
};

export const gangwar = { startGame, initialize, gameLoop };
