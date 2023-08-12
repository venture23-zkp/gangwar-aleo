import { z } from "zod";
import { leoAddressSchema, leoFieldSchema, leoGroupSchema, leoScalarSchema, leoU128Schema, leoU8Schema } from "./leo";

export const MAX_CHARS_PER_U128 = 128 / 8; // Represented as u128 / 8 bits per character
export const U128_IN_BASE_URI = 4;

// TokenId
export const tokenIdLeoSchema = z.object({
  data1: leoU128Schema,
  data2: leoU128Schema,
});
export type NftTokenIdLeo = z.infer<typeof tokenIdLeoSchema>;

// BaseURI
export const baseURILeoSchema = z.object({
  data0: leoU128Schema,
  data1: leoU128Schema,
  data2: leoU128Schema,
  data3: leoU128Schema,
});
export type BaseURILeo = z.infer<typeof baseURILeoSchema>;

// Symbol
export type SymbolLeo = z.infer<typeof leoU128Schema>;

// Toggle Settings
export const toggleSettingsSchema = z.object({
  frozen: z.boolean(),
  active: z.boolean(),
  whiteList: z.boolean(),
  initialized: z.boolean(),
});
export type ToggleSettings = z.infer<typeof toggleSettingsSchema>;

// Toggle Settings
export const collectionInfoSchema = z.object({
  symbol: z.string(),
  baseURI: z.string(),
  totalSupply: z.number(),
  totalNfts: z.number(),
  frozen: z.boolean(),
  active: z.boolean(),
  whiteList: z.boolean(),
  initialized: z.boolean(),
  mintAllowedFromBlock: z.number(),
});
export type CollectionInfo = z.infer<typeof collectionInfoSchema>;

// NFT Record
export const nftRecordLeoSchema = z.object({
  owner: leoAddressSchema,
  data: tokenIdLeoSchema,
  edition: leoScalarSchema,
  _nonce: leoGroupSchema,
});
export type NftRecordLeo = z.infer<typeof nftRecordLeoSchema>;

export const nftRecordSchema = z.object({
  owner: leoAddressSchema,
  data: z.string(),
  edition: z.string(), // TODO: write the proper size of the string
  _nonce: z.string(),
});
export type NftRecord = z.infer<typeof nftRecordSchema>;

// NFT_mint Record
export const nftMintRecordLeoSchema = z.object({
  owner: leoAddressSchema,
  amount: leoU8Schema,
  _nonce: leoGroupSchema,
});
export type NftMintRecordLeo = z.infer<typeof nftMintRecordLeoSchema>;

export const nftMintRecordSchema = z.object({
  owner: leoAddressSchema,
  amount: z.number().max(256),
  _nonce: z.string(),
});
export type NftMintRecord = z.infer<typeof nftMintRecordSchema>;

// NFT_cliam Record
export const nftClaimRecordLeoSchema = z.object({
  owner: leoAddressSchema,
  claim: leoFieldSchema,
  _nonce: leoGroupSchema,
});
export type NftClaimRecordLeo = z.infer<typeof nftClaimRecordLeoSchema>;

export const nftClaimRecordSchema = z.object({
  owner: leoAddressSchema,
  claim: z.string(),
  _nonce: z.string(),
});
export type NftClaimRecord = z.infer<typeof nftClaimRecordSchema>;

// NFT_ownership Record
export const nftOwnershipRecordLeoSchema = z.object({
  owner: leoAddressSchema,
  nft_owner: leoAddressSchema,
  data: tokenIdLeoSchema,
  edition: leoScalarSchema,
  _nonce: leoGroupSchema,
});
export type NftOwnershipRecordLeo = z.infer<typeof nftClaimRecordLeoSchema>;

export const nftOwnershipRecordSchema = z.object({
  owner: leoAddressSchema,
  nftOwner: leoAddressSchema,
  data: z.string(),
  edition: z.string(), // TODO: write the proper size of the string
  _nonce: z.string(),
});
export type NftOwnershipRecord = z.infer<typeof nftOwnershipRecordSchema>;
