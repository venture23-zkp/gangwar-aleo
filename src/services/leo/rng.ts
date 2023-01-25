import { join } from "path";

import { LeoAddress, leoAddressSchema, HashChainRecord } from "../../types";
import { leoParse } from "../../utils";
import { contractsPath, execute, parseOutput } from "./util";

const rngPath = join(contractsPath, "rng");

const getRandomNumber = async (seed: number, min: number, max: number): Promise<number> => {
  const initialSeed = leoParse.u64(seed);
  const minAmount = leoParse.u64(min);
  const maxAmount = leoParse.u64(max);

  const cmd = `cd ${rngPath} && leo run get_random_number ${initialSeed} ${minAmount} ${maxAmount}`;
  const { stdout } = await execute(cmd);

  return parseOutput.randomNumber(stdout);
};

const getHashChainRecord = async (owner: LeoAddress, seed: number): Promise<HashChainRecord> => {
  leoAddressSchema.parse(owner); // Validate owner address

  const initialSeed = leoParse.u64(seed);

  const cmd = `cd ${rngPath} && leo run create_hash_chain_record ${owner} ${initialSeed}`;
  const { stdout } = await execute(cmd);

  return parseOutput.hashChainRecord(stdout);
};

export const rng = { getRandomNumber, getHashChainRecord };