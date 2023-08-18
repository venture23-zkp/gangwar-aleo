import {
  SymbolLeo,
  BaseURILeo,
  baseURILeoSchema,
  NftTokenIdLeo,
  tokenIdLeoSchema,
  ToggleSettings,
  NftMintRecord,
  NftMintRecordLeo,
  nftMintRecordLeoSchema,
  NftClaimRecord,
  NftClaimRecordLeo,
  nftClaimRecordLeoSchema,
  NftRecord,
  NftRecordLeo,
  leoU128Schema,
  LeoScalar,
  LeoU32,
  leoU32Schema,
  leoScalarSchema,
} from "../../types";

import { u8, u16, u32, u128, group, scalar, privateField, publicField, u16Prob, bool, field } from "./common";

function getBit(setting: boolean): string {
  return setting ? "1" : "0";
}

function convertSettingsToNumber(settings: { frozen: boolean; active: boolean; whiteList: boolean; initialized: boolean }): number {
  const { frozen, active, whiteList, initialized } = settings;
  const bitString = `${getBit(frozen)}${getBit(whiteList)}${getBit(active)}${getBit(initialized)}`;

  return parseInt(bitString, 2);
}

function safeParseInt(value: string): number {
  const parsedValue = parseInt(value, 10);
  return isNaN(parsedValue) ? 0 : parsedValue;
}

function stringToBigInt(input: string): bigint {
  const encoder = new TextEncoder();
  const encodedBytes = encoder.encode(input);

  let bigIntValue = BigInt(0);
  for (let i = 0; i < encodedBytes.length; i++) {
    const byteValue = BigInt(encodedBytes[i]);
    const shiftedValue = byteValue << BigInt(8 * i);
    bigIntValue = bigIntValue | shiftedValue;
  }

  return bigIntValue;
}

function splitStringToBigInts(input: string): bigint[] {
  const chunkSize = 16; // Chunk size to split the string
  const numChunks = Math.ceil(input.length / chunkSize);
  const bigInts: bigint[] = [];

  for (let i = 0; i < numChunks; i++) {
    const chunk = input.substr(i * chunkSize, chunkSize);
    const bigIntValue = stringToBigInt(chunk);
    bigInts.push(bigIntValue);
  }

  return bigInts;
}

function padArray(array: bigint[], length: number): bigint[] {
  const paddingLength = length - array.length;
  if (paddingLength <= 0) {
    return array; // No padding needed
  }

  const padding = Array(paddingLength).fill(BigInt(0));
  const paddedArray = array.concat(padding);
  return paddedArray;
}

function parseStringToBigIntArray(input: string): bigint[] {
  const bigIntRegex = /([0-9]+)u128/g;
  const matches = input.match(bigIntRegex);

  if (!matches) {
    return [];
  }

  const bigInts = matches.map((match) => BigInt(match.slice(0, -4)));
  return bigInts;
}

function getRandomElement<T>(list: T[]): T {
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

const symbol = (symbol: string): SymbolLeo => {
  let res = u128(stringToBigInt(symbol).toString());
  return leoU128Schema.parse(res);
};

const baseURI = (uri: string): BaseURILeo => {
  let uriInputs = padArray(splitStringToBigInts(uri), 4);
  let res: BaseURILeo = {
    data0: u128(uriInputs[0].toString()),
    data1: u128(uriInputs[1].toString()),
    data2: u128(uriInputs[2].toString()),
    data3: u128(uriInputs[3].toString()),
  };
  return baseURILeoSchema.parse(res);
};

const edition = (edition: string): LeoScalar => {
  let res = scalar(BigInt(edition));
  return leoScalarSchema.parse(res);
};

const tokenId = (tokenId: string): NftTokenIdLeo => {
  let tokenIdInputs = padArray(splitStringToBigInts(tokenId), 2);
  let res: NftTokenIdLeo = {
    data1: u128(tokenIdInputs[0].toString()),
    data2: u128(tokenIdInputs[1].toString()),
  };
  return tokenIdLeoSchema.parse(res);
};

const toggleSettings = (settings: ToggleSettings): LeoU32 => {
  let res = u32(convertSettingsToNumber(settings));
  return leoU32Schema.parse(res);
};

const nftMintRecord = (mintRecord: NftMintRecord): NftMintRecordLeo => {
  let res: NftMintRecordLeo = {
    owner: privateField(mintRecord.owner),
    amount: privateField(u8(mintRecord.amount)),
    _nonce: publicField(group(BigInt(mintRecord._nonce))),
  };
  return nftMintRecordLeoSchema.parse(res);
};

const nftClaimRecord = (claimRecord: NftClaimRecord): NftClaimRecordLeo => {
  let res: NftClaimRecordLeo = {
    owner: privateField(claimRecord.owner),
    claim: privateField(field(BigInt(claimRecord.claim))),
    _nonce: publicField(group(BigInt(claimRecord._nonce))),
  };
  return nftClaimRecordLeoSchema.parse(res);
};
