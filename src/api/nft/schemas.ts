import { number, z } from "zod";

import {
  characterSchema,
  leoAddressSchema,
  leoPrivateKeySchema,
  leoU128Schema,
  leoViewKeySchema,
  nftMintRecordSchema,
  playerSchema,
  teamSchema,
  toggleSettingsSchema,
  uuidSchema,
  warSchema,
} from "../../types";
import { schnorrSignatureSchema } from "../../types/dsa";

export const schemas = {
  body: {
    initializeCollection: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      maxSupply: z.number(),
      symbol: z.string(),
      baseURI: z.string(),
    }),

    addNft: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      tokenId: z.string(),
      edition: z.string(),
    }),

    addMinter: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      minter: leoAddressSchema,
      amount: z.number(),
    }),

    updateToggleSettings: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      settings: toggleSettingsSchema,
    }),

    setMintBlock: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      mintBlock: z.number(),
    }),

    updateSymbol: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      symbol: z.string(),
    }),

    updateBaseURI: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      baseURI: z.string(),
    }),

    openMint: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
    }),

    mint: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      mintRecord: nftMintRecordSchema,
    }),

    claimNft: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      tokenId: z.string(),
      edition: z.string(),
    }),
  },
};
