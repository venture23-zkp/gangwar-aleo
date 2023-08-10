import { exec } from "child_process";
import { readFile } from "fs/promises";
import { join } from "path";
import { promisify } from "util";

import { Address, DevelopmentClient, PrivateKey, ViewKey } from "../../aleo-sdk";
import { env, FEE, LOCAL_NETWORK_PRIVATE_KEY, programNames } from "../../constants";
import {
  LeoTx,
  leoTxSchema,
  LeoRecord,
  LeoViewKey,
  War,
  warLeoSchema,
  PrimaryStatsLeo,
  primaryStatsSchema,
  PrimaryStats,
  SecondaryStatsLeo,
  SecondaryStats,
  secondaryStatsSchema,
  WeaponLeo,
  Weapon,
  weaponSchema,
  // ItemLeo,
  // Item,
  // itemSchema,
  Character,
  characterSchema,
  CharacterLeo,
  TeamLeo,
  Team,
  teamSchema,
  warSchema,
  PhysicalAttack,
  PhysicalAttackLeo,
  phyiscalAttackSchema,
  playerLeoSchema,
  PlayerLeo,
  leoAddressSchema,
  Player,
  playerSchema,
  GangwarSettings,
  gangwarSettingsLeoSchema,
  gangwarSettingsSchema,
} from "../../types";
import { SchnorrSignature, SchnorrSignatureLeo, schnorrSignatureLeoSchema, schnorrSignatureSchema } from "../../types/dsa";
import { apiError, attemptFetch, decodeId, logger, wait } from "../../utils";

const developmentClient = new DevelopmentClient(env.DEVELOPMENT_SERVER_URL);

export const execute = promisify(exec);

export const contractsPath = join(env.NODE_PATH, "contracts");

const PRIVATE = ".private";
const PUBLIC = ".public";

const replaceValue = (value: string, searchValue = "") => value.replace(searchValue, "").replace(PRIVATE, "").replace(PUBLIC, "");

const address = (value: string): string => replaceValue(value);

function prob(repr: string, maxValue: BigInt, prob: string) {
  const probInBigInt = BigInt(prob.replace(repr, ""));
  // Use the decimal bits of MAX_SAFE_INTEGER as precision
  const precision = Number.MAX_SAFE_INTEGER.toString().length - 1;

  const maxValueLength = maxValue.toString().length;

  const portionToExtract = probInBigInt.toString().length - (maxValueLength - precision);

  // Extract the most significant digits of probability to generate probability in safe range
  const probInNum = Number(probInBigInt.toString().substring(0, portionToExtract));
  const maxValueInNum = Number(maxValue.toString().substring(0, precision));

  const probInNumber = probInNum / maxValueInNum;

  return probInNumber;
}

const field = (value: string): bigint => {
  const parsed = BigInt(replaceValue(value, "field"));
  return parsed;
};

const scalar = (value: string): bigint => {
  const parsed = BigInt(replaceValue(value, "scalar"));
  return parsed;
};

const group = (value: string): bigint => {
  const parsed = BigInt(replaceValue(value, "group"));
  return parsed;
};

const fieldToString = (value: string): string => {
  const parsed = replaceValue(value, "field");
  return parsed;
};

export const u8 = (value: string): number => {
  const parsed = Number(replaceValue(value, "u8"));
  if (isNaN(parsed)) throw apiError("u8 parsing failed");
  return parsed;
};

export const u16 = (value: string): number => {
  const parsed = Number(replaceValue(value, "u16"));
  if (isNaN(parsed)) throw apiError("u16 parsing failed");
  return parsed;
};

const u32 = (value: string): number => {
  const parsed = Number(replaceValue(value, "u32"));
  if (isNaN(parsed)) throw apiError("u32 parsing failed");
  return parsed;
};

const u64 = (value: string): number => {
  const parsed = Number(replaceValue(value, "u64"));
  if (isNaN(parsed)) throw apiError("u64 parsing failed");
  return parsed;
};

const u128 = (value: string): number => {
  const parsed = Number(replaceValue(value, "u128"));
  if (isNaN(parsed)) throw apiError("u128 parsing failed");
  return parsed;
};

const bool = (value: string): boolean => {
  const parsed = replaceValue(value, "");
  if (parsed === "true") {
    return true;
  } else if (parsed === "false") {
    return false;
  } else {
    throw apiError("bool parsing failed");
  }
};

const fieldProb = (value: string): number => {
  const MAX_FIELD = BigInt("8444461749428370424248824938781546531375899335154063827935233455917409239040");
  const parsed = replaceValue(value, "field");
  const valueInProb = prob("field", MAX_FIELD, parsed);
  if (isNaN(valueInProb)) throw apiError("field probability parsing failed");
  return valueInProb;
};

const u128Prob = (value: string): number => {
  const MAX_UINT128 = BigInt("340282366920938463463374607431768211455"); // 2^128 - 1
  const parsed = replaceValue(value, "u128");
  const valueInProb = prob("u128", MAX_UINT128, parsed);
  if (isNaN(valueInProb)) throw apiError("u128 probability parsing failed");
  return valueInProb;
};

const u16Prob = (value: string): number => {
  const MAX_UINT16 = Math.pow(2, 16);
  const parsed = replaceValue(value, "u16");
  const valueInProb = Number(parsed) / MAX_UINT16;
  if (isNaN(valueInProb)) throw apiError("u16 probability parsing failed");
  return valueInProb;
};

const primaryStats = (primaryStats: PrimaryStatsLeo): PrimaryStats => {
  const res: PrimaryStats = {
    strength: u16(primaryStats.strength),
  };
  return primaryStatsSchema.parse(res);
};

const secondaryStats = (secondaryStats: SecondaryStatsLeo): SecondaryStats => {
  const res: SecondaryStats = {
    health: u16(secondaryStats.health),
    dodgeChance: u16Prob(secondaryStats.dodge_chance),
    hitChance: u16Prob(secondaryStats.hit_chance),
    criticalChance: u16Prob(secondaryStats.critical_chance),
    meleeDamage: u16Prob(secondaryStats.melee_damage),
  };
  // console.log(res);
  return secondaryStatsSchema.parse(res);
};

const weapon = (weapon: WeaponLeo): Weapon => {
  const res: Weapon = {
    id: u16(weapon.id),
    type: u16(weapon.w_type),
    consumptionRate: u16(weapon.consumption_rate),
    criticalChance: u16Prob(weapon.critical_chance),
    duraAmmo: u16(weapon.dura_ammo),
    damage: u16(weapon.damage),
    hitChance: u16Prob(weapon.hit_chance),
    numberOfHits: u16(weapon.number_of_hits),
    isBroken: bool(weapon.is_broken),
  };
  return weaponSchema.parse(res);
};

// const item = (item: ItemLeo): Item => {
//   const res: Item = {
//     itemId: u128(item.item_id),
//     itemCount: u128(item.item_count),
//     statBoost: item.stat_boost,
//     rank: item.rank,
//   };
//   return itemSchema.parse(res);
// };

const character = (character: CharacterLeo): Character => {
  const res: Character = {
    nftId: u16(character.nft_id),
    playerAddr: replaceValue(character.player_addr),
    primaryStats: primaryStats(character.primary_stats),
    secondaryStats: secondaryStats(character.secondary_stats),
    primaryEquipment: weapon(character.primary_equipment),
  };
  return characterSchema.parse(res);
};

const signature = (record: Record<string, unknown>): SchnorrSignature => {
  const parsed = schnorrSignatureLeoSchema.parse(record);
  const res: SchnorrSignature = {
    r: group(parsed.r).toString(),
    s: group(parsed.s).toString(),
    validityTimestamp: u32(parsed.validity_timestamp),
  };
  return schnorrSignatureSchema.parse(res);
};

const settings = (record: Record<string, unknown>): GangwarSettings => {
  const parsed = gangwarSettingsLeoSchema.parse(record);
  // console.log(parsed);
  const gangwarSettings: GangwarSettings = {
    deadlineToRegister: u32(parsed.deadline_to_register),
    maxNumberOfPlayers: u8(parsed.max_number_of_players),
    maxRounds: u8(parsed.max_rounds),
    registeredPlayers: u8(parsed.registered_players),
    randomNumber: u16(parsed.random_number),
  };
  return gangwarSettingsSchema.parse(gangwarSettings);
};

const playerRecord = (record: Record<string, unknown>): Player => {
  const parsed = playerLeoSchema.parse(record);
  // console.log(parsed);
  const player: Player = {
    owner: replaceValue(parsed.owner),
    simulationId: u32(parsed.simulation_id),
    char: character(parsed.char),
    // nftId: u16(parsed.nft_id),
    // playerAddr: replaceValue(parsed.player_addr),
    // primaryStats: primaryStats(parsed.primary_stats),
    // secondaryStats: secondaryStats(parsed.secondary_stats),
    // primaryEquipment: weapon(parsed.primary_equipment),
    _nonce: group(parsed._nonce).toString(),
  };
  return playerSchema.parse(player);
};

const team = (team: TeamLeo): Team => {
  const res: Team = {
    p1: character(team.p1),
    p2: character(team.p2),
    p3: character(team.p3),
  };
  return teamSchema.parse(res);
};

const physicalAttack = (damage: PhysicalAttackLeo): PhysicalAttack => {
  const res: PhysicalAttack = {
    isDodged: bool(damage.is_dodged),
    isHit: bool(damage.is_hit),
    isCritical: bool(damage.is_critical),
    totalCriticalHits: u16(damage.total_critical_hits),
    totalNormalHits: u16(damage.total_normal_hits),
    totalHits: u16(damage.total_hits),
    damage: u16(damage.damage),
  };
  return phyiscalAttackSchema.parse(res);
};

const war = (record: Record<string, unknown>): War => {
  const parsed = warLeoSchema.parse(record);
  // console.log(parsed);
  const { main_team, target_team } = parsed;
  const war: War = {
    owner: replaceValue(parsed.owner),
    simulationId: u32(parsed.simulation_id),
    round: u8(parsed.round),
    mainTeam: team(main_team),
    targetTeam: team(target_team),
    physicalAttack: physicalAttack(parsed.physical_attack),
    _nonce: group(parsed._nonce).toString(),
  };

  return warSchema.parse(war);
};

export const parseOutput = { address, field, u8, u32, u64, war, signature, settings, playerRecord };

const immediatelyRepeatingNumberClosingBracket = (value: string) => {
  let count = 0;
  let repeatingStop = false;
  for (let i = 0; i < value.length; i++) {
    if (!repeatingStop) {
      if (value[i] === "}") {
        count += 1;
      } else if (value[i] !== "}") {
        repeatingStop = true;
      }
    }
  }
  return count;
};

const correctRecordBracketIssue = (recordString: string, bracketPattern: string): string => {
  // console.log("Trying to correct record bracket issue");
  let correctedRecordStringArray = [];
  let correctedString = "";
  for (let i = 0, j = 0; i < recordString.length; i++) {
    let recordChar = recordString[i];
    let patternChar = bracketPattern[j];
    let uptoPattern = bracketPattern.substring(0, j);

    correctedString = correctedRecordStringArray.join("");
    correctedString.replace(" ", "");
    if (recordChar === "{" && patternChar === "{") {
      correctedRecordStringArray.push(recordChar);
      j++;
    } else if (patternChar === "}" && recordChar === "}") {
      let immediatelyRepeatingClosingBracketOfRecord = immediatelyRepeatingNumberClosingBracket(
        recordString.substring(i, recordString.length)
      );
      let immediatelyRepeatingClosingBracketOfPattern = immediatelyRepeatingNumberClosingBracket(
        bracketPattern.substring(j, bracketPattern.length)
      );

      if (immediatelyRepeatingClosingBracketOfRecord > immediatelyRepeatingClosingBracketOfPattern) {
        // skip a closing bracket of record
        continue;
      } else if (immediatelyRepeatingClosingBracketOfRecord === immediatelyRepeatingClosingBracketOfPattern) {
        correctedRecordStringArray.push(recordChar);
        j++;
      }
    } else if (recordChar !== "{" && patternChar === "{") {
      correctedRecordStringArray.push(recordChar);
    } else if (recordChar !== "}" && recordChar !== "{" && patternChar !== "{" && patternChar !== "}") {
      correctedRecordStringArray.push(recordChar);
      j++;
    } else if (patternChar === "}" && recordChar !== "}") {
      correctedRecordStringArray.push(recordChar);
    } else {
      correctedRecordStringArray.push(recordChar);
    }
  }
  const correctedRecordString = correctedRecordStringArray.join("");
  return correctedRecordString;
};

export const parseRecordString = (recordString: string, correctBracketPattern?: string): Record<string, unknown> => {
  const json = recordString.replace(/(['"])?([a-z0-9A-Z_.]+)(['"])?/g, '"$2" ');
  let correctJson = json;
  if (correctBracketPattern) {
    correctJson = correctRecordBracketIssue(json, correctBracketPattern);
  }
  return JSON.parse(correctJson);
};

const parseCmdOutput = (cmdOutput: string, correctBracketPattern?: string): Record<string, unknown> => {
  const lines = cmdOutput.split("\n");

  let res: Record<string, unknown> = {};

  let objectStarted = false;
  let objectFinished = false;
  let done = false;
  let toParse = "";

  lines.forEach((line) => {
    if (done) return;

    if (objectStarted && objectFinished) {
      res = parseRecordString(toParse, correctBracketPattern);
      done = true;
    } else if (objectStarted) {
      if (line.startsWith("}")) {
        objectFinished = true;
      }
      const trimmedLine = line.trim();
      toParse = toParse + trimmedLine;
    } else if (line.includes("• {") || line.startsWith("{")) {
      toParse = toParse + "{";
      objectStarted = true;
    }
  });

  return res;
};

const getTxResult = (tx: LeoTx): string | undefined => {
  return tx.execution.transitions.at(0)?.outputs.at(0)?.value;
};

export const decryptRecord = async (
  encryptedRecord: LeoRecord,
  viewKey: LeoViewKey,
  correctBracketPattern?: string
): Promise<Record<string, unknown>> => {
  console.log("trying to decrypt", encryptedRecord);
  let decrypted = ViewKey.from_string(viewKey).decrypt(encryptedRecord).replaceAll("\n", "").replaceAll(" ", "");
  console.log("decrypted", decrypted);
  return parseRecordString(decrypted, correctBracketPattern);
};

interface LeoRunParams {
  contractPath: string;
  params?: string[];
  transition?: string;
}

export const leoRun = async (
  { contractPath, params = [], transition = "main" }: LeoRunParams,
  correctBracketPattern?: string
): Promise<Record<string, unknown>> => {
  const stringedParams = params.join(" ");
  const cmd = `cd ${contractPath} && leo run ${transition} ${stringedParams}`;
  console.log(cmd);
  const { stdout } = await execute(cmd);
  console.log(stdout);
  const parsed = parseCmdOutput(stdout, correctBracketPattern);

  return parsed;
};

interface SnarkOsExecuteParams {
  privateKey: string;
  viewKey: string;
  appName: string;
  params?: string[];
  transition?: string;
  fee: number;
}

const snarkOsExecute = async (
  { privateKey, viewKey, appName, params = [], transition = "main", fee }: SnarkOsExecuteParams,
  correctBracketPattern?: string
): Promise<Record<string, unknown>> => {
  // when running locally, transfer some credits to the account in order to facilitate the developer experience
  if (env.ZK_MODE === "testnet_local") {
    await transferCredits(FEE + 6, Address.from_private_key(PrivateKey.from_string(privateKey)).to_string());
    await wait();
  }

  let txId = "";
  let attemptsLeft = 5;
  let executed = false;

  while (!executed && attemptsLeft > 0) {
    try {
      txId = (await developmentClient.executeProgram(`${appName}.aleo`, transition, fee, params, privateKey)).replaceAll('"', "");
      executed = true;
    } catch (error) {
      attemptsLeft--;
      if (attemptsLeft === 0) {
        throw error;
      }
    }
  }

  const baseRoute = env.ZK_MODE === "testnet_public" ? "https://vm.aleo.org/api" : "http://127.0.0.1:3030";
  const url = `${baseRoute}/testnet3/transaction/${txId}`;
  const res = await attemptFetch(url);

  const tx: Record<string, unknown> = res.data;
  const parsedTx = leoTxSchema.parse(tx);
  const result = getTxResult(parsedTx);

  // I know a ternary would be cool, but it creates some weird concurrency issues sometimes
  let parsed = {};
  if (result) {
    parsed = await decryptRecord(result, viewKey, correctBracketPattern);
    console.log("decrypted", parsed);
  }

  return parsed;
};

interface SnarkOsMappingValueRequestParams {
  appName: string;
  mappingName: string;
  mappingKey: string;
}

export const snarkOsFetchMappingValue = async ({ appName, mappingName, mappingKey }: SnarkOsMappingValueRequestParams): Promise<string> => {
  // when running locally, transfer some credits to the account in order to facilitate the developer experience
  const baseRoute = env.ZK_MODE === "testnet_public" ? "https://vm.aleo.org/api" : "http://127.0.0.1:3030";
  const url = `${baseRoute}/testnet3/program/${appName}.aleo/mapping/${mappingName}/${mappingKey}`;
  // console.log("Trying to fetch from", url);
  const res = await attemptFetch(url);
  const value = res.data;
  return value;
};

type ExecuteZkLogicParams = LeoRunParams & SnarkOsExecuteParams;

export const zkRun = (params: ExecuteZkLogicParams, bracketPattern?: string): Promise<Record<string, unknown>> => {
  // console.log("ZK_MODE", env.ZK_MODE);
  if (env.ZK_MODE === "leo") {
    return leoRun(params, bracketPattern);
  } else {
    return snarkOsExecute(params, bracketPattern);
  }
};

/**
 * Deploys programs to the public or local Aleo testnet, using the Aleo TS SDK.
 * Before calling this function, make sure to execute "build_local_programs.sh" from the root directory
 * and make sure your account holds at least the required fee amount (56 credits).
 */
export const deployPrograms = async () => {
  const privateKey = env.DEPLOY_PRIVATE_KEY;
  // console.log(privateKey);
  if (!privateKey) return;

  const fees = {
    gangwar: 15,
  };

  const successfulPrograms: string[] = [];

  for (const programName of Object.values(programNames)) {
    logger.info(`Deploying ${programName}`);

    const path = join(contractsPath, programName, "build", "main.aleo");

    const program = await readFile(path, "utf-8");

    let attemptsLeft = 5;
    let deployed = false;

    while (!deployed && attemptsLeft > 0) {
      try {
        await developmentClient.deployProgram(program, fees[programName as keyof typeof fees], privateKey);
        logger.info(`Successfully deployed ${programName}`);
        successfulPrograms.push(programName);
        deployed = true;
      } catch (error) {
        attemptsLeft--;
        if (attemptsLeft === 0) {
          logger.info(`${programName} deployment failed. Check the dev server logs to see if it was already deployed.`);
        }
      }
    }
  }

  logger.info(`Successfully deployed programs: ${successfulPrograms.toString()}`);
};

/**
 * Transfer credits from the account identified by the private key to the account specified as recipient.
 * ! use this function only when the app is connected to a local node
 * @param amount - amount of credits to transfer to the recipient
 * @param recipient - address of the receiver account
 * @param privateKey - private key of the sender account, defaults to the private key of the local chain owner
 * @returns
 */
const transferCredits = async (amount: number, recipient: string, privateKey = LOCAL_NETWORK_PRIVATE_KEY) => {
  let attemptsLeft = 5;
  let transferred = false;

  while (!transferred && attemptsLeft > 0) {
    try {
      await developmentClient.transfer(amount, FEE, recipient, privateKey);
      logger.info(`Successfully transferred ${amount} credits to ${recipient}`);
      transferred = true;
    } catch (error) {
      attemptsLeft--;
      if (attemptsLeft === 0) {
        logger.info(`Transfer of ${amount} credits to ${recipient} failed.`);
      }
    }
  }
};
