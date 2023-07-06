import { z } from "zod";

import { leoAddressSchema, leoFieldSchema, leoGroupSchema, leoU128Schema, leoU64Schema, leoU8Schema } from "./leo";

const primaryStatsLeoSchema = z.object({
  strength: leoU128Schema,
  // accuracy: leoU128Schema,
  // mastery: leoU128Schema,
  // agility: leoU128Schema,
  // luck: leoU128Schema
});
export type PrimaryStatsLeo = z.infer<typeof primaryStatsLeoSchema>;

const secondaryStatsLeoSchema = z.object({
  health: leoU128Schema,
  dodge_chance: leoU128Schema,
  hit_chance: leoU128Schema,
  critical_chance: leoU128Schema,
  melee_damage: leoU128Schema,
});
export type SecondaryStatsLeo = z.infer<typeof secondaryStatsLeoSchema>;

const weaponLeoSchema = z.object({
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

const itemLeoSchema = z.object({
  item_id: leoU128Schema,
  item_count: leoU128Schema,
  stat_boost: z.boolean(),
  rank: z.boolean(),
});
export type ItemLeo = z.infer<typeof itemLeoSchema>;

const multipliersLeoSchema = z.object({
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

const characterLeoSchema = z.object({
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

const teamLeoSchema = z.object({
  player_1: characterLeoSchema,
  // player_2: character,
  // player_3: character
});
export type TeamLeo = z.infer<typeof teamLeoSchema>;

const warLeoSchema = z.object({
  owner: leoAddressSchema,
  // room_id: u128,
  // simulation_id: u128,
  // duration: u128,
  // objectives: u128 // ??,
  main_team: teamLeoSchema,
  target_team: teamLeoSchema,
});
export type WarLeo = z.infer<typeof warLeoSchema>;
