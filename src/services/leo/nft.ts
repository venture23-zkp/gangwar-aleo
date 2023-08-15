import { join, parse } from "path";

import { env, FEE, programNames } from "../../constants";
import {
  BaseURILeo,
  CollectionInfo,
  LeoAddress,
  LeoPrivateKey,
  LeoViewKey,
  NftClaimRecord,
  NftMintRecord,
  ToggleSettings,
} from "../../types";
import { leoParse } from "../../utils";
import { contractsPath, fetchUnspentRecords, parseOutput, snarkOsFetchMappingValue, zkRun } from "./util";

const nftPath = join(contractsPath, "leo_nft");

const getNftCollectionInfo = async (): Promise<CollectionInfo> => {
  if (env.ZK_MODE !== "leo") {
    const totalNftsLeo = await snarkOsFetchMappingValue({
      appName: programNames.LEO_NFT,
      mappingName: "general_settings",
      mappingKey: "0u8",
    });
    const totalNfts = Number(parseOutput.u128(totalNftsLeo).toString());

    const totalSupplyLeo = await snarkOsFetchMappingValue({
      appName: programNames.LEO_NFT,
      mappingName: "general_settings",
      mappingKey: "1u8",
    });
    const totalSupply = Number(parseOutput.u128(totalSupplyLeo).toString());

    const symbolLeo = await snarkOsFetchMappingValue({
      appName: programNames.LEO_NFT,
      mappingName: "general_settings",
      mappingKey: "2u8",
    });
    const symbol = parseOutput.symbol(symbolLeo);

    const baseUriPart0Leo = await snarkOsFetchMappingValue({
      appName: programNames.LEO_NFT,
      mappingName: "general_settings",
      mappingKey: "3u8",
    });
    const baseUriPart1Leo = await snarkOsFetchMappingValue({
      appName: programNames.LEO_NFT,
      mappingName: "general_settings",
      mappingKey: "4u8",
    });
    const baseUriPart2Leo = await snarkOsFetchMappingValue({
      appName: programNames.LEO_NFT,
      mappingName: "general_settings",
      mappingKey: "5u8",
    });
    const baseUriPart3Leo = await snarkOsFetchMappingValue({
      appName: programNames.LEO_NFT,
      mappingName: "general_settings",
      mappingKey: "5u8",
    });
    const baseUriLeo: BaseURILeo = {
      data0: baseUriPart0Leo,
      data1: baseUriPart1Leo,
      data2: baseUriPart2Leo,
      data3: baseUriPart3Leo,
    };
    const baseURI = parseOutput.baseURI(baseUriLeo);

    const toggleSettingsLeo = await snarkOsFetchMappingValue({
      appName: programNames.LEO_NFT,
      mappingName: "toggle_settings",
      mappingKey: "0u8",
    });
    const toggleSettings = parseOutput.toggleSettings(toggleSettingsLeo);

    const mintAllowedBlockLeo = await snarkOsFetchMappingValue({
      appName: programNames.LEO_NFT,
      mappingName: "toggle_settings",
      mappingKey: "1u8",
    });
    const mintAllowedFromBlock = parseOutput.u32(mintAllowedBlockLeo);

    return {
      symbol,
      baseURI,
      totalSupply,
      totalNfts,
      ...toggleSettings,
      mintAllowedFromBlock,
    };
  } else {
    return {
      symbol: "TEST",
      baseURI: "http://this_is_test_uri",
      totalSupply: 100,
      totalNfts: 0,
      frozen: false,
      active: true,
      whiteList: true,
      initialized: true,
      mintAllowedFromBlock: 0,
    };
  }
};

const initializeCollection = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  total: number,
  symbol: string,
  baseURI: string
  // TODO: verify return type
): Promise<CollectionInfo> => {
  const transition = "initialize_collection";

  const leoTotal = leoParse.u128(total);
  const leoSymbol = leoParse.symbol(symbol);
  const leoBaseURI = leoParse.baseURI(baseURI);

  const leoBaseURIParam = leoParse.stringifyLeoCmdParam(leoBaseURI);

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
  return getNftCollectionInfo();
};

const addNft = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  tokenId: string,
  edition: string
  // TODO: verify return type
): Promise<any> => {
  const transition = "add_nft";

  const leoTokenId = leoParse.tokenId(tokenId);
  const leoEdition = leoParse.edition(edition);

  const leoTokenIdParam = leoParse.stringifyLeoCmdParam(leoTokenId);

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
  return getNftCollectionInfo();
};

const addMinter = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  minter: LeoAddress,
  amount: number
  // TODO: verify return type
): Promise<any> => {
  const transition = "add_minter";

  const leoAmount = leoParse.u8(amount);

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
  // return nftMintRecord;
  return getNftCollectionInfo();
};

const fetchUnspentNftMintRecords = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey
  // TODO: verify return type
): Promise<any> => {
  const startBlock = 0;
  const unspentRecords = await fetchUnspentRecords(privateKey, viewKey, programNames.LEO_NFT, startBlock);
  const unspentNftMintRecords = [];
  for (let record of unspentRecords) {
    try {
      const nftMintRecord = parseOutput.nftMintRecord(record);
      unspentNftMintRecords.push(nftMintRecord);
    } catch {}
  }
  return unspentNftMintRecords;
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
  return getNftCollectionInfo();
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
  return getNftCollectionInfo();
};

const updateSymbol = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  symbol: string
  // TODO: verify return type
): Promise<any> => {
  const transition = "update_symbol";

  const leoSymbol = leoParse.symbol(symbol);
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
  return getNftCollectionInfo();
};

const updateBaseURI = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  baseURI: string
  // TODO: verify return type
): Promise<any> => {
  const transition = "update_base_uri";

  const leoBaseURI = leoParse.baseURI(baseURI);
  const leoBaseURIParam = leoParse.stringifyLeoCmdParam(leoBaseURI);

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
  return getNftCollectionInfo();
};

const getRandomLeoHidingNonce = () => {
  const EDWARDS_BLS12_SCALAR_FIELD = "2111115437357092606062206234695386632838870926408408195193685246394721360383";
  let hidingNonce = EDWARDS_BLS12_SCALAR_FIELD;

  while (Number(hidingNonce) >= Number(EDWARDS_BLS12_SCALAR_FIELD)) {
    var buf = new Uint32Array(8);
    const hidingNonceArray = crypto.getRandomValues(buf);
    hidingNonce = hidingNonceArray.join("");
  }

  const leoHidingNonce = leoParse.scalar(BigInt(hidingNonce));
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

const fetchUnspentNftClaimRecords = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey
  // TODO: verify return type
): Promise<any> => {
  const startBlock = 0;
  const unspentRecords = await fetchUnspentRecords(privateKey, viewKey, programNames.LEO_NFT, startBlock);
  const unspentNftClaimRecords = [];
  for (let record of unspentRecords) {
    try {
      const nftClaimRecord = parseOutput.nftClaimRecord(record);
      unspentNftClaimRecords.push(nftClaimRecord);
    } catch {}
  }
  return unspentNftClaimRecords;
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

const claimNFT = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  claimRecord: NftClaimRecord,
  tokenId: string,
  edition: string
  // TODO: verify return type
): Promise<any> => {
  const transition = "claim_nft";

  const leoClaimRecord = leoParse.nftClaimRecord(claimRecord);
  const leoClaimRecordParam = leoParse.stringifyLeoCmdParam(leoClaimRecord);

  const leoTokenId = leoParse.tokenId(tokenId);
  const leoTokenIdParam = leoParse.stringifyLeoCmdParam(leoTokenId);

  const leoEdition = leoParse.edition(edition);

  const params = [leoClaimRecordParam, leoTokenIdParam, leoEdition];

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

  console.log(res);

  const nftMintRecord = parseOutput.nftRecord(res);
  return nftMintRecord;
};

const fetchUnspentNftRecords = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey
  // TODO: verify return type
): Promise<any> => {
  const startBlock = 0;
  const unspentRecords = await fetchUnspentRecords(privateKey, viewKey, programNames.LEO_NFT, startBlock);
  const unspentNftRecords = [];
  for (let record of unspentRecords) {
    try {
      const nftRecord = parseOutput.nftRecord(record);
      unspentNftRecords.push(nftRecord);
    } catch {}
  }
  return unspentNftRecords;
};

export const nft = {
  getNftCollectionInfo,
  initializeCollection,
  addNft,
  addMinter,
  updateToggleSettings,
  setMintBlock,
  updateSymbol,
  updateBaseURI,
  openMint,
  mint,
  claimNFT,
  fetchUnspentNftMintRecords,
  fetchUnspentNftClaimRecords,
  fetchUnspentNftRecords,
};
