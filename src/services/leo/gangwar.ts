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
  Team,
} from "../../types";
import { SchnorrSignature } from "../../types/dsa";
import {
  contractsPath,
  fetchUnspentRecords,
  getLatestHeight,
  getRandomAleoScalar,
  leoRun,
  networkClient,
  parseRecordString,
  snarkOsFetchMappingValue,
  zkRun,
} from "./util";

import { js2leo } from "../../parsers/js2leo";
import { leo2js } from "../../parsers/leo2js";

import { samplePlayerRecords } from "../../samples/playerRecords";

const gangwarPath = join(contractsPath, "gangwar");

const createGame = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  simulationId: number,
  registrationDuration: number,
  maxNumberOfPlayers: number,
  maxRounds: number,
  participationLootcrateCount: number,
  winnerLootcrateCount: number
): Promise<GangwarSettings> => {
  const transition = "create_game";

  const leoSimulationId = js2leo.u32(simulationId);
  const leoRegistrationDuration = js2leo.u32(registrationDuration);
  const leoMaxNumberOfPlayers = js2leo.u8(maxNumberOfPlayers);
  const leoGameLoopCount = js2leo.u8(maxRounds);
  const leoParticipationLootcrateCount = js2leo.u8(participationLootcrateCount);
  const leoWinnerLootcrateCount = js2leo.u8(winnerLootcrateCount);
  const params = [
    leoSimulationId,
    leoRegistrationDuration,
    leoMaxNumberOfPlayers,
    leoGameLoopCount,
    leoParticipationLootcrateCount,
    leoWinnerLootcrateCount,
  ];

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

const estimateWarStartTime = async (startBlockHeight: number): Promise<number> => {
  const latestTime = new Date().getTime();
  let latestBlockHeight;
  if (env.ZK_MODE !== "leo") {
    // Query latest block
    latestBlockHeight = Number(await getLatestHeight());
  } else {
    latestBlockHeight = 100;
  }
  const EXPECTED_BLOCK_DURATION = 13 * 1000;
  const remainingBlocks = startBlockHeight - latestBlockHeight;
  const expectedTime = latestTime + remainingBlocks * EXPECTED_BLOCK_DURATION;
  // const remainingTime = latestTime - remainingBlocks * EXPECTED_BLOCK_DURATION;
  // const expectedTime = latestTime + remainingTime;
  return expectedTime;
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
    let gangwarSettings = leo2js.gangwar.settings(gangwarSettingsLeo);
    const startTime = await estimateWarStartTime(gangwarSettings.deadlineToRegister);
    const latestHeight = Number(await getLatestHeight());
    return { ...gangwarSettings, startTime, latestHeight };
  } else {
    return {
      createdAt: 0,
      startTime: await estimateWarStartTime(1000),
      deadlineToRegister: 1000,
      maxNumberOfPlayers: 6,
      maxRounds: 2,
      participationLootcrateCount: 1,
      winnerLootcrateCount: 1,
      registeredPlayers: 1,
      randomNumber: Math.round(Math.random() * (Math.pow(2, 16) - 1)),
      latestHeight: 100,
    };
  }
};

const sign = async (
  character: Character,
  sk: string // Secret key
): Promise<any> => {
  const transition = "sign";
  const leoSk = js2leo.scalar(BigInt(sk));

  const k = getRandomAleoScalar(); // Random signing nonce
  const leoK = js2leo.scalar(k);

  const BLOCKS_IN_ONE_DAY = 7000; // Considering 13s as block duration
  const VALIDITY_DURATION = 10 * BLOCKS_IN_ONE_DAY; // 10 days

  let validTimestamp = 0;
  if (env.ZK_MODE !== "leo") {
    const blockHeight = Number(await networkClient.getLatestHeight());
    validTimestamp = blockHeight + VALIDITY_DURATION;
  } else {
    validTimestamp = VALIDITY_DURATION;
  }

  const leoValidityTimestamp = js2leo.u32(validTimestamp);
  const leoCharacter = js2leo.gangwar.character(character);

  let leoCharacterParam = `"${js2leo.stringifyLeoCmdParam(leoCharacter)}"`;
  // let leoCharacterParam = js2leo.stringifyLeoCmdParam(leoCharacter);

  const params = [leoCharacterParam, leoSk, leoK, leoValidityTimestamp];

  // console.log("gangwar.ts Trying to create game with ", simulationId);
  const signatureLeo = await leoRun({
    contractPath: gangwarPath,
    transition,
    params,
  });

  const signature = leo2js.gangwar.signature(signatureLeo);

  return { signature, leoCharacterParam, signatureLeo };
};

const verifySig = async (character: Character, signature: SchnorrSignature): Promise<any> => {
  const transition = "verify_sig";

  const leoCharacter = js2leo.gangwar.character(character);
  const leoSignature = js2leo.gangwar.signature(signature);

  // const leoCharacterParam = js2leo.stringifyLeoCmdParam(leoCharacter);
  // const leoSignatureParam = js2leo.stringifyLeoCmdParam(leoSignature);
  const leoCharacterParam = `"${js2leo.stringifyLeoCmdParam(leoCharacter)}"`;
  const leoSignatureParam = `"${js2leo.stringifyLeoCmdParam(leoSignature)}"`;

  const params = [leoCharacterParam, leoSignatureParam];

  // console.log("gangwar.ts Trying to create game with ", simulationId);
  const valid = await leoRun({
    contractPath: gangwarPath,
    transition,
    params,
  });

  return valid;
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

  console.log(params);

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

const fetchPlayerRecords = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  simulationId: number,
  startHeight?: number
): Promise<any> => {
  const settings = await fetchGangwarSettings(simulationId);
  if (env.ZK_MODE !== "leo") {
    let startBlock = settings.createdAt;
    if (startHeight && startHeight > startBlock) {
      startBlock = startHeight;
    }
    const endHeight = settings.deadlineToRegister;
    const bracketPattern = playerRecordBracketPattern();
    const unspentRecords = await fetchUnspentRecords(
      privateKey,
      viewKey,
      programNames.GANGWAR,
      "Player",
      startBlock,
      endHeight,
      bracketPattern
    );
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
  } else {
    const playerRecords = samplePlayerRecords;
    return playerRecords;
  }
};

const fetchWarRecord = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, simulationId: number): Promise<any> => {
  const settings = await fetchGangwarSettings(simulationId);

  const startBlock = settings.deadlineToRegister;
  const bracketPattern = warBracketPattern(3, 3);
  const unspentRecords = await fetchUnspentRecords(privateKey, viewKey, programNames.GANGWAR, "War", startBlock, undefined, bracketPattern);
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

const startGame = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, simulationId: number): Promise<War> => {
  const transition = "start_game";

  const leoSimulationId = js2leo.u32(simulationId);
  const gangwarSettings = await fetchGangwarSettings(simulationId);
  const leoRandomSeed = js2leo.u16(gangwarSettings.randomNumber);

  const leoPlayerRecordParams = [];
  const onChainPlayers = await fetchPlayerRecords(privateKey, viewKey, simulationId);
  if (onChainPlayers.length != gangwarSettings.maxNumberOfPlayers) {
    throw Error("Game can only be started when all players have joined");
  }

  // Sort the players by strength
  for (let i = 0; i < onChainPlayers.length; i++) {
    for (let j = 0; j < onChainPlayers.length - i - 1; j++) {
      if (onChainPlayers[j].char.primaryStats.strength < onChainPlayers[j + 1].char.primaryStats.strength) {
        const temp = onChainPlayers[j];
        onChainPlayers[j] = onChainPlayers[j + 1];
        onChainPlayers[j + 1] = temp;
      }
    }
  }

  for (let player of onChainPlayers) {
    const leoPlayerRecord = js2leo.gangwar.playerRecord(player);
    const leoPlayerRecordParam = js2leo.stringifyLeoCmdParam(leoPlayerRecord);
    leoPlayerRecordParams.push(leoPlayerRecordParam);
  }

  // console.log(player);

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

  console.log(JSON.stringify(res));

  const warRecord = leo2js.gangwar.war(res);
  console.log(warRecord);
  return warRecord;
};

const simulate1vs1 = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, war: War): Promise<War> => {
  const transition = "simulate1vs1";

  const gangwarSettings = await fetchGangwarSettings(war.simulationId);
  const leoRandomSeed = js2leo.u16(gangwarSettings.randomNumber);
  console.log(leoRandomSeed);

  const leoWarRecord = js2leo.gangwar.warRecord(war);

  const leoWarRecordParam = js2leo.stringifyLeoCmdParam(leoWarRecord);
  console.log(leoWarRecordParam);

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

const getWinningTeam = (teamA: Team, teamB: Team, randomNumber: number): Team => {
  const teamAHealth = teamA.p1.secondaryStats.health + teamA.p2.secondaryStats.health + teamA.p3.secondaryStats.health;
  const teamBHealth = teamB.p1.secondaryStats.health + teamB.p2.secondaryStats.health + teamB.p3.secondaryStats.health;
  let winner: Team;
  if (teamAHealth > teamBHealth) {
    winner = teamA;
  } else if (teamBHealth > teamAHealth) {
    winner = teamB;
  } else {
    const isteamAWinner = randomNumber < 32768;
    if (isteamAWinner) {
      winner = teamA;
    } else {
      winner = teamB;
    }
  }
  return winner;
};

const finishGame = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, war: War): Promise<Team> => {
  const transition = "finish_game";

  const gangwarSettings = await fetchGangwarSettings(war.simulationId);
  const leoRandomSeed = js2leo.u16(gangwarSettings.randomNumber);
  const leoParticipationLootcrateCount = js2leo.u8(gangwarSettings.participationLootcrateCount);
  const leoWinnerLootcrateCount = js2leo.u8(gangwarSettings.winnerLootcrateCount);

  const leoWarRecord = js2leo.gangwar.warRecord(war);

  const leoWarRecordParam = js2leo.stringifyLeoCmdParam(leoWarRecord);

  const params = [leoWarRecordParam, leoParticipationLootcrateCount, leoWinnerLootcrateCount, leoRandomSeed];

  const winningTeam = getWinningTeam(war.mainTeam, war.targetTeam, gangwarSettings.randomNumber);

  // console.log("gangwar.ts Joining game ", simulationId);
  try {
    await zkRun({
      privateKey,
      viewKey,
      appName: programNames.GANGWAR,
      contractPath: gangwarPath,
      transition,
      params,
      fee: FEE,
    });
  } catch (err) {
    console.log("Error is expected.");
  }
  return winningTeam;
};

export const gangwar = {
  createGame,
  sign,
  verifySig,
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
