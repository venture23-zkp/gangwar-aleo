import { z } from "zod";
import { leoAddressSchema, leoScalarSchema, leoU128Schema, leoU16Schema } from "./leo";
import { tokenIdLeoSchema } from "./nft";

export const weaponStatsLeoSchema = z.object({
  w_type: leoU16Schema,
  consumption_rate: leoU16Schema,
  critical_chance: leoU16Schema,
  dura_ammo: leoU16Schema,
  damage: leoU16Schema,
  hit_chance: leoU16Schema,
  number_of_hits: leoU16Schema,
});
export type WeaponStatsLeo = z.infer<typeof weaponStatsLeoSchema>;

export const weaponNFTLeoSchema = z.object({
  owner: leoAddressSchema,
  data: tokenIdLeoSchema,
  edition: leoScalarSchema,
  stats: weaponStatsLeoSchema,
});
export type WeaponNFTLeo = z.infer<typeof weaponStatsLeoSchema>;

export const lockedWeaponNFTLeoSchema = z.object({
  owner: leoAddressSchema,
  token_owner: leoAddressSchema,
  token_id_data1: leoU128Schema,
  token_id_data2: leoU128Schema,
  edition: leoScalarSchema,
  w_type: leoU16Schema,
  consumption_rate: leoU16Schema,
  critical_chance: leoU16Schema,
  dura_ammo: leoU16Schema,
  damage: leoU16Schema,
  hit_chance: leoU16Schema,
  number_of_hits: leoU16Schema,
});
export type LockedWeaponNFTLeo = z.infer<typeof lockedWeaponNFTLeoSchema>;

export const unlockedWeaponNFTLeoSchema = z.object({
  owner: leoAddressSchema,
  token_id_data1: leoU128Schema,
  token_id_data2: leoU128Schema,
  edition: leoScalarSchema,
  w_type: leoU16Schema,
  consumption_rate: leoU16Schema,
  critical_chance: leoU16Schema,
  dura_ammo: leoU16Schema,
  damage: leoU16Schema,
  hit_chance: leoU16Schema,
  number_of_hits: leoU16Schema,
});
export type UnlockedWeaponNFTLeo = z.infer<typeof lockedWeaponNFTLeoSchema>;
