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
  NftRecord,
  ToggleSettings,
} from "../../types";
import { contractsPath, fetchUnspentRecords, getRandomAleoScalar, snarkOsFetchMappingValue, zkRun } from "./util";

import { js2leo } from "../../parsers/js2leo";
import { leo2js } from "../../parsers/leo2js";

const nftPath = join(contractsPath, "leo_nft");

const getNftCollectionInfo = async (): Promise<CollectionInfo> => {
  if (env.ZK_MODE !== "leo") {
    const totalNftsLeo = await snarkOsFetchMappingValue({
      appName: programNames.LEO_NFT,
      mappingName: "general_settings",
      mappingKey: "0u8",
    });
    const totalNfts = Number(leo2js.u128(totalNftsLeo).toString());

    const totalSupplyLeo = await snarkOsFetchMappingValue({
      appName: programNames.LEO_NFT,
      mappingName: "general_settings",
      mappingKey: "1u8",
    });
    const totalSupply = Number(leo2js.u128(totalSupplyLeo).toString());

    const symbolLeo = await snarkOsFetchMappingValue({
      appName: programNames.LEO_NFT,
      mappingName: "general_settings",
      mappingKey: "2u8",
    });
    const symbol = leo2js.nft.symbol(symbolLeo);

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
    const baseURI = leo2js.nft.baseURI(baseUriLeo);

    const toggleSettingsLeo = await snarkOsFetchMappingValue({
      appName: programNames.LEO_NFT,
      mappingName: "toggle_settings",
      mappingKey: "0u8",
    });
    const toggleSettings = leo2js.nft.toggleSettings(toggleSettingsLeo);

    const mintAllowedBlockLeo = await snarkOsFetchMappingValue({
      appName: programNames.LEO_NFT,
      mappingName: "toggle_settings",
      mappingKey: "1u8",
    });
    const mintAllowedFromBlock = leo2js.u32(mintAllowedBlockLeo);

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
): Promise<CollectionInfo> => {
  const transition = "initialize_collection";

  const leoTotal = js2leo.u128(total);
  const leoSymbol = js2leo.nft.symbol(symbol);
  const leoBaseURI = js2leo.nft.baseURI(baseURI);

  const leoBaseURIParam = js2leo.stringifyLeoCmdParam(leoBaseURI);

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

const addNft = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, tokenId: string, edition: string): Promise<CollectionInfo> => {
  const transition = "add_nft";

  const leoTokenId = js2leo.nft.tokenId(tokenId);
  const leoEdition = js2leo.nft.edition(edition);

  const leoTokenIdParam = js2leo.stringifyLeoCmdParam(leoTokenId);

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

const addMinter = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, minter: LeoAddress, amount: number): Promise<CollectionInfo> => {
  const transition = "add_minter";

  const leoAmount = js2leo.u8(amount);

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

  // Note: do not parse the record as it may not belongs to the minter and not to us
  // const nftMintRecord = leo2js.nft.nftMintRecord(res);
  // console.log(nftMintRecord);
  // return nftMintRecord;
  return getNftCollectionInfo();
};

const fetchUnspentNftMintRecords = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey): Promise<NftMintRecord[]> => {
  const startBlock = 0;
  const unspentRecords = await fetchUnspentRecords(privateKey, viewKey, programNames.LEO_NFT, "NFT_mint", startBlock);
  const unspentNftMintRecords = [];
  for (let record of unspentRecords) {
    try {
      const nftMintRecord = leo2js.nft.nftMintRecord(record);
      unspentNftMintRecords.push(nftMintRecord);
    } catch {}
  }
  return unspentNftMintRecords;
};

const updateToggleSettings = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, settings: ToggleSettings): Promise<CollectionInfo> => {
  const transition = "update_toggle_settings";

  const leoUpdatedToggleSettings = js2leo.nft.toggleSettings(settings);
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

const setMintBlock = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, mintBlock: number): Promise<CollectionInfo> => {
  const transition = "set_mint_block";

  const leoMintBlock = js2leo.u32(mintBlock);
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

const updateSymbol = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, symbol: string): Promise<CollectionInfo> => {
  const transition = "update_symbol";

  const leoSymbol = js2leo.nft.symbol(symbol);
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

const updateBaseURI = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, baseURI: string): Promise<CollectionInfo> => {
  const transition = "update_base_uri";

  const leoBaseURI = js2leo.nft.baseURI(baseURI);
  const leoBaseURIParam = js2leo.stringifyLeoCmdParam(leoBaseURI);

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

const openMint = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey): Promise<NftClaimRecord> => {
  const transition = "open_mint";

  const hidingNonce = getRandomAleoScalar();
  const leoHidingNonce = js2leo.scalar(hidingNonce);
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

  const nftClaimRecord = leo2js.nft.nftClaimRecord(res);
  return nftClaimRecord;
};

const fetchUnspentNftClaimRecords = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey): Promise<NftClaimRecord[]> => {
  const startBlock = 0;
  const unspentRecords = await fetchUnspentRecords(privateKey, viewKey, programNames.LEO_NFT, "NFT_claim", startBlock);
  const unspentNftClaimRecords = [];
  for (let record of unspentRecords) {
    try {
      const nftClaimRecord = leo2js.nft.nftClaimRecord(record);
      unspentNftClaimRecords.push(nftClaimRecord);
    } catch {}
  }
  return unspentNftClaimRecords;
};

const mint = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey, mintRecord: NftMintRecord): Promise<NftMintRecord> => {
  const transition = "mint";

  const leoMintRecord = js2leo.nft.nftMintRecord(mintRecord);
  const leoMintRecordParam = js2leo.stringifyLeoCmdParam(leoMintRecord);

  const hidingNonce = getRandomAleoScalar();
  const leoHidingNonce = js2leo.scalar(hidingNonce);
  const params = [leoMintRecordParam, leoHidingNonce];

  const res = await zkRun({
    privateKey,
    viewKey,
    appName: programNames.LEO_NFT,
    contractPath: nftPath,
    transition,
    params,
    fee: FEE,
  });

  const nftMintRecord = leo2js.nft.nftMintRecord(res);
  return nftMintRecord;
};

const claimNFT = async (
  privateKey: LeoPrivateKey,
  viewKey: LeoViewKey,
  claimRecord: NftClaimRecord,
  tokenId: string,
  edition: string
): Promise<NftRecord> => {
  const transition = "claim_nft";

  const leoClaimRecord = js2leo.nft.nftClaimRecord(claimRecord);
  const leoClaimRecordParam = js2leo.stringifyLeoCmdParam(leoClaimRecord);

  const leoTokenId = js2leo.nft.tokenId(tokenId);
  const leoTokenIdParam = js2leo.stringifyLeoCmdParam(leoTokenId);

  const leoEdition = js2leo.nft.edition(edition);

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

  const nftMintRecord = leo2js.nft.nftRecord(res);
  return nftMintRecord;
};

const fetchUnspentNftRecords = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey): Promise<NftRecord[]> => {
  const startBlock = 0;
  const unspentRecords = await fetchUnspentRecords(privateKey, viewKey, programNames.LEO_NFT, "NFT", startBlock);
  const unspentNftRecords: NftRecord[] = [];
  for (let record of unspentRecords) {
    try {
      const nftRecord: NftRecord = leo2js.nft.nftRecord(record);
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
