import { z } from "zod";
import { leoU128Schema } from "./leo";

export const tokenIdLeoSchema = z.object({
  data1: leoU128Schema,
  data2: leoU128Schema,
});
export type TokenIdLeo = z.infer<typeof tokenIdLeoSchema>;

export const tokenIdSchema = z.object({
  data: z.string(),
});
export type TokenId = z.infer<typeof tokenIdSchema>;

export const baseURILeoSchma = z.object({
  data0: leoU128Schema,
  data1: leoU128Schema,
  data2: leoU128Schema,
  data3: leoU128Schema,
});
export type BaseURILeo = z.infer<typeof baseURILeoSchma>;

export const baseURISchema = z.object({
  data: z.string(),
});
export type BaseURI = z.infer<typeof baseURISchema>;
