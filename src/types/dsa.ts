import { z } from "zod";
import { leoGroupSchema, leoU32Schema } from "./leo";

export const schnorrSignatureLeoSchema = z.object({
  r: leoGroupSchema,
  s: leoGroupSchema,
  validity_timestamp: leoU32Schema,
});
export type SchnorrSignatureLeo = z.infer<typeof schnorrSignatureLeoSchema>;

export const schnorrSignatureSchema = z.object({
  r: z.bigint(),
  s: z.bigint(),
  validityTimestamp: z.number(),
});
export type SchnorrSignature = z.infer<typeof schnorrSignatureSchema>;
