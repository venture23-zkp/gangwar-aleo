import { number, z } from "zod";

import { leoAddressSchema, leoFieldSchema, leoGroupSchema, leoU128Schema, leoU64Schema, leoU8Schema } from "./leo";

export const primaryStatsLeoSchema = z.object({
  strength: leoU128Schema,
  // accuracy: leoU128Schema,
  // mastery: leoU128Schema,
  // agility: leoU128Schema,
  // luck: leoU128Schema
});
export type PrimaryStatsLeo = z.infer<typeof primaryStatsLeoSchema>;

export const primaryStatsSchema = z.object({
  strength: z.number(),
});
export type PrimaryStats = z.infer<typeof primaryStatsSchema>;

export const secondaryStatsLeoSchema = z.object({
  health: leoU128Schema,
  dodge_chance: leoU128Schema,
  hit_chance: leoU128Schema,
  critical_chance: leoU128Schema,
  melee_damage: leoU128Schema,
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
  id: leoU128Schema,
  w_type: leoU128Schema, // Normal | Default??
  consumption_rate: leoU128Schema,
  critical_chance: leoU128Schema,
  dura_ammo: leoU128Schema,
  damage: leoU128Schema,
  hit_chance: leoU128Schema,
  number_of_hits: leoU128Schema,
  is_broken: z.boolean(),
});
export type WeaponLeo = z.infer<typeof weaponLeoSchema>;

export const weaponSchema = z.object({
  id: z.number(),
  wType: z.number(), // Normal | Default??
  consumptionRate: z.number(),
  criticalChance: z.number(),
  duraAmmo: z.number(),
  damage: z.number(),
  hitChance: z.number(),
  numberOfHits: z.number(),
  isBroken: z.boolean(),
});
export type Weapon = z.infer<typeof weaponSchema>;

export const itemLeoSchema = z.object({
  item_id: leoU128Schema,
  item_count: leoU128Schema,
  stat_boost: z.boolean(),
  rank: z.boolean(),
});
export type ItemLeo = z.infer<typeof itemLeoSchema>;

export const itemSchema = z.object({
  itemId: z.number(),
  itemCount: z.number(),
  statBoost: z.boolean(),
  rank: z.boolean(),
});
export type Item = z.infer<typeof itemSchema>;

export const multipliersLeoSchema = z.object({
  // attack: leoU128Schema,
  // defence: leoU128Schema,
  // strength: leoU128Schema,
  // accuracy: leoU128Schema,
  // mastery: leoU128Schema,
  // agility: leoU128Schema,
  // luck: leoU128Schema,
  // health: leoU128Schema,
  // speed: leoU128Schema,
  // dura_ammo: leoU128Schema,
  dodge_chance: leoU128Schema,
  // hit_chance: leoU128Schema,
  // critical_chance: leoU128Schema,
});
export type MultipliersLeo = z.infer<typeof multipliersLeoSchema>;

export const multipliersSchema = z.object({
  dodgeChance: z.number(),
});
export type Multiplers = z.infer<typeof multipliersSchema>;

export const characterLeoSchema = z.object({
  // name: leoU128Schema, // string,
  // u_type: leoU128Schema // can be 'HUMAN', 'ROBOT' ..
  // nft_id: u16, // 1..5555
  primary_stats: primaryStatsLeoSchema,
  secondary_stats: secondaryStatsLeoSchema,
  primary_equipment: weaponLeoSchema,
  // secondary_equipment: Weapon,
  // multipliers: Multipliers
  // item_1: Item,
  // item_2: Item,
  // item_3: Item
  // passive_ability: leoU128Schema
});
export type CharacterLeo = z.infer<typeof characterLeoSchema>;

export const characterSchema = z.object({
  primaryStats: primaryStatsSchema,
  secondaryStats: secondaryStatsSchema,
  primaryEquipment: weaponSchema,
});
export type Character = z.infer<typeof characterSchema>;

export const teamLeoSchema = z.object({
  player_1: characterLeoSchema,
  // player_2: character,
  // player_3: character
});
export type TeamLeo = z.infer<typeof teamLeoSchema>;

export const teamSchema = z.object({
  player_1: characterSchema,
});
export type Team = z.infer<typeof teamSchema>;

export const warLeoSchema = z.object({
  owner: leoAddressSchema,
  // room_id: u128,
  // simulation_id: u128,
  // duration: u128,
  // objectives: u128 // ??,
  main_team: teamLeoSchema,
  target_team: teamLeoSchema,
});
export type WarLeo = z.infer<typeof warLeoSchema>;

export const warSchema = z.object({
  owner: leoAddressSchema,
  mainTeam: teamSchema,
  targetTeam: teamSchema,
});
export type War = z.infer<typeof warSchema>;
