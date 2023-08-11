import { join } from "path";

import { env, FEE, programNames } from "../../constants";
import { LeoAddress, LeoPrivateKey, LeoViewKey } from "../../types";
import { leoParse } from "../../utils";
import { contractsPath, parseOutput, snarkOsFetchMappingValue, zkRun } from "./util";

const nftPath = join(contractsPath, "leo_nft");

const initializeCollection = async (
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

  const params = [leoTotal, leoSymbol, leoBaseURIParam];

  await zkRun({
    privateKey,
    viewKey,
    appName: programNames.LEO_NFT,
    contractPath: nftPath,
    transition,
    params,
    fee: FEE,
  });
};

const addNft = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  tokenId: string,
  edition: string
  // TODO: verify return type
): Promise<any> => {
  const transition = "add_nft";

  let leoTokenId = leoParse.tokenId(tokenId);
  let leoEdition = leoParse.edition(edition);

  let leoTokenIdParam = leoParse.stringifyLeoCmdParam(leoTokenId);

  const params = [leoTokenIdParam, leoEdition];

  await zkRun({
    privateKey,
    viewKey,
    appName: programNames.LEO_NFT,
    contractPath: nftPath,
    transition,
    params,
    fee: FEE,
  });
};

const addMinter = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  minter: LeoAddress,
  amount: number
  // TODO: verify return type
): Promise<any> => {
  const transition = "add_minter";

  let leoAmount = leoParse.u8(amount);

  const params = [minter, leoAmount];

  const res = await zkRun({
    privateKey,
    viewKey,
    appName: programNames.LEO_NFT,
    contractPath: nftPath,
    transition,
    params,
    fee: FEE,
  });

  // TODO: do not parse the record as it may not belongs to the minter and not to us
  const nftMintRecord = parseOutput.nftMintRecord(res);
  return nftMintRecord;
};

export const nft = { initializeCollection, addNft, addMinter };
