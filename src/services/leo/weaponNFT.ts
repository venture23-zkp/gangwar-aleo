import { join } from "path";

import { env, FEE, programNames } from "../../constants";
import { LeoPrivateKey, LeoU128, LeoViewKey } from "../../types";
import { leoParse } from "../../utils";
import { contractsPath, parseOutput, snarkOsFetchMappingValue, zkRun } from "./util";

const gangwarPath = join(contractsPath, "weapon_nft");

const initialize_collection = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  total: number,
  symbol: string,
  baseURI: string
  // TODO: verify return type
): Promise<any> => {
  const transition = "initialize_collection";

  let leoTotal = leoParse.u128(total);
  let leoSymbol = leoParse.symbol(symbol);
  let leoBaseURI = leoParse.baseURI(baseURI);

  let leoBaseURIParam = leoParse.stringifyLeoCmdParam(leoBaseURI);

  console.log(leoBaseURI);
  const params = [leoTotal, leoSymbol, leoBaseURIParam];
  console.log(params);

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
};

export const weaponNFT = { initialize_collection };
