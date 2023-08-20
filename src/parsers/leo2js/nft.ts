import {
  SymbolLeo,
  ToggleSettings,
  NftTokenIdLeo,
  tokenIdLeoSchema,
  leoU128Schema,
  baseURILeoSchema,
  BaseURILeo,
  LeoU32,
  leoU32Schema,
  NftMintRecord,
  nftMintRecordLeoSchema,
  nftMintRecordSchema,
  NftClaimRecord,
  nftClaimRecordLeoSchema,
  nftClaimRecordSchema,
  nftRecordLeoSchema,
  NftRecord,
  nftRecordSchema,
} from "../../types";

import { u8, u16, u16Prob, u32, u128, bool, group, address, scalar, field } from "./common";

// Take from amazing work by DemoxLabs
// https://github.com/demox-labs/art-factory
function bigIntToString(bigIntValue: bigint): string {
  const bytes: number[] = [];
  let tempBigInt = bigIntValue;

  while (tempBigInt > BigInt(0)) {
    const byteValue = Number(tempBigInt & BigInt(255));
    bytes.push(byteValue);
    tempBigInt = tempBigInt >> BigInt(8);
  }

  const decoder = new TextDecoder();
  const asciiString = decoder.decode(Uint8Array.from(bytes));
  return asciiString;
}

function joinBigIntsToString(bigInts: bigint[]): string {
  let result = "";

  for (let i = 0; i < bigInts.length; i++) {
    const chunkString = bigIntToString(bigInts[i]);
    result += chunkString;
  }

  return result;
}

function getSettingsFromNumber(settingNum: number): ToggleSettings {
  const bitStringArray = settingNum.toString(2).padStart(32, "0").split("").reverse();
  return {
    initialized: bitStringArray[0] === "1",
    active: bitStringArray[1] === "1",
    whiteList: bitStringArray[2] === "1",
    frozen: bitStringArray[3] === "1",
  };
}

const symbol = (symbol: SymbolLeo): string => {
  const parsed = leoU128Schema.parse(symbol);
  const symbolInString = bigIntToString(u128(parsed));
  return symbolInString;
};

const tokenId = (tokenId: NftTokenIdLeo): string => {
  const parsed = tokenIdLeoSchema.parse(tokenId);
  const bigInts = [u128(parsed.data1), u128(parsed.data2)];
  const tokenIdInString = joinBigIntsToString(bigInts);
  return tokenIdInString;
};

const baseURI = (uri: BaseURILeo): string => {
  const parsed = baseURILeoSchema.parse(uri);
  const bigInts = [u128(parsed.data0), u128(parsed.data1), u128(parsed.data2), u128(parsed.data3)];
  const tokenIdInString = joinBigIntsToString(bigInts);
  return tokenIdInString;
};

const toggleSettings = (settingsNumber: LeoU32): ToggleSettings => {
  const parsed = leoU32Schema.parse(settingsNumber);
  const settings: ToggleSettings = getSettingsFromNumber(u32(parsed));
  return settings;
};

const nftMintRecord = (record: Record<string, unknown>): NftMintRecord => {
  const parsed = nftMintRecordLeoSchema.parse(record);
  const nftMint: NftMintRecord = {
    owner: address(parsed.owner),
    amount: u8(parsed.amount),
    _nonce: group(parsed._nonce).toString(),
  };
  return nftMintRecordSchema.parse(nftMint);
};

const nftClaimRecord = (record: Record<string, unknown>): NftClaimRecord => {
  const parsed = nftClaimRecordLeoSchema.parse(record);
  const nftClaim: NftClaimRecord = {
    owner: address(parsed.owner),
    claim: field(parsed.claim).toString(),
    _nonce: group(parsed._nonce).toString(),
  };
  return nftClaimRecordSchema.parse(nftClaim);
};

const nftRecord = (record: Record<string, unknown>): NftRecord => {
  const parsed = nftRecordLeoSchema.parse(record);
  const nft: NftRecord = {
    owner: address(parsed.owner),
    data: tokenId(parsed.data),
    edition: scalar(parsed.edition).toString(),
    _nonce: group(parsed._nonce).toString(),
  };
  return nftRecordSchema.parse(nft);
};

export const nft = {
  symbol,
  tokenId,
  baseURI,
  toggleSettings,
  nftMintRecord,
  nftClaimRecord,
  nftRecord,
};
