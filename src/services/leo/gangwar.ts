import { join } from "path";

import { FEE, programNames } from "../../constants";
import { LeoAddress, leoAddressSchema, LeoPrivateKey, LeoU128, LeoViewKey } from "../../types";
import { Team, War } from "../../types/gangwar";
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
  teamA: Team,
  teamB: Team,
  randomSeed: LeoU128
): Promise<War> => {
  leoAddressSchema.parse(owner);

  const leoTeamA = leoParse.team(teamA);
  const leoTeamB = leoParse.team(teamB);

  const teamAParam = leoParse.stringifyLeoCmdParam(leoTeamA);
  const teamBParam = leoParse.stringifyLeoCmdParam(leoTeamB);

  const transition = "start_game";
  const params = [owner, teamAParam, teamBParam, randomSeed];

  const record = await zkRun({
    privateKey,
    viewKey,
    appName: programNames.GANGWAR_ENGINE,
    contractPath: gangwarPath,
    transition,
    params,
    fee: FEE,
  });

  return parseOutput.war(record);
};

const gameLoop = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, owner: LeoAddress, war: War, randomSeed: LeoU128): Promise<War> => {
  leoAddressSchema.parse(owner);

  const leoWar = leoParse.war(war);

  const warParam = leoParse.stringifyLeoCmdParam(leoWar);

  const transition = "game_loop";
  const params = [owner, warParam, randomSeed];

  const record = await zkRun({
    privateKey,
    viewKey,
    appName: programNames.GANGWAR_ENGINE,
    contractPath: gangwarPath,
    transition,
    params,
    fee: FEE,
  });

  return parseOutput.war(record);
};

export const gangwar = { startGame, initialize, gameLoop };