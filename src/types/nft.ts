import { z } from "zod";
import { leoU128Schema } from "./leo";

export const MAX_CHARS_PER_U128 = 128 / 8; // Represented as u128 / 8 bits per character
export const U128_IN_BASE_URI = 4;

export const tokenIdLeoSchema = z.object({
  data1: leoU128Schema,
  data2: leoU128Schema,
});
export type TokenIdLeo = z.infer<typeof tokenIdLeoSchema>;

export const nftTokenIdSchema = z.object({
  data: z.string().max(MAX_CHARS_PER_U128),
});
export type NFTTokenId = z.infer<typeof nftTokenIdSchema>;

export const nftBaseURILeoSchma = z.object({
  data0: leoU128Schema,
  data1: leoU128Schema,
  data2: leoU128Schema,
  data3: leoU128Schema,
});
export type NFTBaseURILeo = z.infer<typeof nftBaseURILeoSchma>;

export const baseURISchema = z.string().max(MAX_CHARS_PER_U128 * U128_IN_BASE_URI);
export type BaseURI = z.infer<typeof baseURISchema>;

export const nftSymbolSchema = z.string().max(MAX_CHARS_PER_U128);
export const NFTSymbol = z.infer<typeof nftSymbolSchema>;
