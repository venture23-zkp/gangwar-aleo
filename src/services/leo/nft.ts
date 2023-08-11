import { join } from "path";

import { env, FEE, programNames } from "../../constants";
import { LeoAddress, LeoPrivateKey, LeoViewKey, NftMintRecord, ToggleSettings } from "../../types";
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
  console.log(nftMintRecord);
  return nftMintRecord;
};

const updateToggleSettings = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  settings: ToggleSettings
  // TODO: verify return type
): Promise<any> => {
  const transition = "update_toggle_settings";

  const leoUpdatedToggleSettings = leoParse.toggleSettings(settings);
  const params = [leoUpdatedToggleSettings];

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

const setMintBlock = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  mintBlock: number
  // TODO: verify return type
): Promise<any> => {
  const transition = "set_mint_block";

  const leoMintBlock = leoParse.u32(mintBlock);
  const params = [leoMintBlock];

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

const updateSymbol = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  symbol: string
  // TODO: verify return type
): Promise<any> => {
  const transition = "update_symbol";

  let leoSymbol = leoParse.symbol(symbol);
  const params = [leoSymbol];

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

const updateBaseURI = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  baseURI: string
  // TODO: verify return type
): Promise<any> => {
  const transition = "update_base_uri";

  let leoBaseURI = leoParse.baseURI(baseURI);
  let leoBaseURIParam = leoParse.stringifyLeoCmdParam(leoBaseURI);

  const params = [leoBaseURIParam];

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

const getRandomLeoHidingNonce = () => {
  const EDWARDS_BLS12_SCALAR_FIELD = "2111115437357092606062206234695386632838870926408408195193685246394721360383";
  let hidingNonce = EDWARDS_BLS12_SCALAR_FIELD;

  while (Number(hidingNonce) >= Number(EDWARDS_BLS12_SCALAR_FIELD)) {
    var buf = new Uint32Array(8);
    const hidingNonceArray = crypto.getRandomValues(buf);
    hidingNonce = hidingNonceArray.join("");
  }

  let leoHidingNonce = leoParse.scalar(BigInt(hidingNonce));
  return leoHidingNonce;
};

const openMint = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey
  // TODO: verify return type
): Promise<any> => {
  const transition = "open_mint";

  const leoHidingNonce = getRandomLeoHidingNonce();
  const params = [leoHidingNonce];

  const res = await zkRun({
    privateKey,
    viewKey,
    appName: programNames.LEO_NFT,
    contractPath: nftPath,
    transition,
    params,
    fee: FEE,
  });

  const nftClaimRecord = parseOutput.nftClaimRecord(res);
  return nftClaimRecord;
};

const mint = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  mintRecord: NftMintRecord
  // TODO: verify return type
): Promise<any> => {
  const transition = "mint";

  const leoMintRecord = leoParse.nftMintRecord(mintRecord);
  const leoMintRecordParam = leoParse.stringifyLeoCmdParam(leoMintRecord);

  const leoHidingNonce = getRandomLeoHidingNonce();
  const params = [leoMintRecordParam, leoHidingNonce];

  // Note: this results in two different records but only first one is caught
  // TODO: fix this in zkRun code itself; might need to return array of Records (a bit tricky?)
  const res = await zkRun({
    privateKey,
    viewKey,
    appName: programNames.LEO_NFT,
    contractPath: nftPath,
    transition,
    params,
    fee: FEE,
  });

  const nftMintRecord = parseOutput.nftMintRecord(res);
  return nftMintRecord;
};

export const nft = {
  initializeCollection,
  addNft,
  addMinter,
  updateToggleSettings,
  setMintBlock,
  updateSymbol,
  updateBaseURI,
  openMint,
  mint,
};
