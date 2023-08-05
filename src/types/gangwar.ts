import { number, z } from "zod";

import {
  leoAddressSchema,
  leoBooleanSchema,
  leoFieldSchema,
  leoGroupSchema,
  leoU16Schema,
  leoU32Schema,
  leoU64Schema,
  leoU8Schema,
} from "./leo";

export const gangwarSettingsLeoSchema = z.object({
  deadline_to_register: leoU32Schema,
  max_number_of_players: leoU8Schema,
  gameloop_count: leoU8Schema,
});
export type GangwarSettingsLeo = z.infer<typeof gangwarSettingsLeoSchema>;

export const gangwarSettingsSchema = z.object({
  deadlineToRegister: z.number(), // TODO: Additional checks on limit
  maxNumberOfPlayers: z.number(), // TODO: Additional checks on limit
  gameloopCount: z.number(), // TODO: Additional checks on limit
});
export type GangwarSettings = z.infer<typeof gangwarSettingsSchema>;

export const primaryStatsLeoSchema = z.object({
  strength: leoU16Schema,
});
export type PrimaryStatsLeo = z.infer<typeof primaryStatsLeoSchema>;

export const primaryStatsSchema = z.object({
  strength: z.number(),
});
export type PrimaryStats = z.infer<typeof primaryStatsSchema>;

export const secondaryStatsLeoSchema = z.object({
  health: leoU16Schema,
  dodge_chance: leoU16Schema,
  hit_chance: leoU16Schema,
  critical_chance: leoU16Schema,
  melee_damage: leoU16Schema,
});
export type SecondaryStatsLeo = z.infer<typeof secondaryStatsLeoSchema>;

export const secondaryStatsSchema = z.object({
  health: z.number(),
  dodgeChance: z.number(),
  hitChance: z.number(),
  criticalChance: z.number(),
  meleeDamage: z.number(),
});
export type SecondaryStats = z.infer<typeof secondaryStatsSchema>;

export const weaponLeoSchema = z.object({
  id: leoU16Schema,
  w_type: leoU16Schema, // Used w_type instead of type because type is a reserved keyword
  consumption_rate: leoU16Schema,
  critical_chance: leoU16Schema,
  dura_ammo: leoU16Schema,
  damage: leoU16Schema,
  hit_chance: leoU16Schema,
  number_of_hits: leoU16Schema,
  is_broken: leoBooleanSchema,
});
export type WeaponLeo = z.infer<typeof weaponLeoSchema>;

export const weaponSchema = z.object({
  id: z.number(),
  type: z.number(), // Range[0] | Melee[1] | Support
  consumptionRate: z.number(),
  criticalChance: z.number(),
  duraAmmo: z.number(),
  damage: z.number(),
  hitChance: z.number(),
  numberOfHits: z.number(),
  isBroken: z.boolean(),
});
export type Weapon = z.infer<typeof weaponSchema>;

export const characterLeoSchema = z.object({
  nft_id: leoU16Schema,
  player_addr: leoAddressSchema,
  primary_stats: primaryStatsLeoSchema,
  secondary_stats: secondaryStatsLeoSchema,
  primary_equipment: weaponLeoSchema,
});
export type CharacterLeo = z.infer<typeof characterLeoSchema>;

export const characterSchema = z.object({
  nftId: z.number(),
  playerAddr: leoAddressSchema,
  primaryStats: primaryStatsSchema,
  secondaryStats: secondaryStatsSchema,
  primaryEquipment: weaponSchema,
});
export type Character = z.infer<typeof characterSchema>;

export const playerLeoSchema = z.object({
  owner: leoAddressSchema,
  simulation_id: leoFieldSchema,
  nft_id: leoU16Schema,
  player_addr: leoAddressSchema,
  primary_stats: primaryStatsLeoSchema,
  secondary_stats: secondaryStatsLeoSchema,
  primary_equipment: weaponLeoSchema,
});
export type PlayerLeo = z.infer<typeof playerLeoSchema>;

export const playerSchema = z.object({
  owner: leoAddressSchema,
  simulationId: z.string(),
  nftId: leoU16Schema,
  playerAddr: leoAddressSchema,
  primaryStats: primaryStatsSchema,
  secondaryStats: secondaryStatsSchema,
  primaryEquipment: weaponSchema,
});
export type Player = z.infer<typeof playerLeoSchema>;
