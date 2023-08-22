import { number, z } from "zod";

import { leoAddressSchema, leoBooleanSchema, leoGroupSchema, leoU16Schema, leoU32Schema, leoU8Schema } from "./leo";

export const gangwarSettingsLeoSchema = z.object({
  created_at: leoU32Schema,
  deadline_to_register: leoU32Schema,
  max_number_of_players: leoU8Schema,
  max_rounds: leoU8Schema,
  participation_lootcrate_count: leoU8Schema,
  winner_lootcrate_count: leoU8Schema,
  registered_players: leoU8Schema,
  random_number: leoU16Schema,
});
export type GangwarSettingsLeo = z.infer<typeof gangwarSettingsLeoSchema>;

export const gangwarSettingsSchema = z.object({
  createdAt: z.number().int().min(0),
  startTime: z.number().int(),
  deadlineToRegister: z.number().int(),
  maxNumberOfPlayers: z.number().int(),
  maxRounds: z.number().int(),
  participationLootcrateCount: z.number().int(),
  winnerLootcrateCount: z.number().int(),
  registeredPlayers: z.number().int(),
  randomNumber: z.number(),
});
export type GangwarSettings = z.infer<typeof gangwarSettingsSchema>;

export const primaryStatsLeoSchema = z.object({
  strength: leoU16Schema,
});
export type PrimaryStatsLeo = z.infer<typeof primaryStatsLeoSchema>;

export const primaryStatsSchema = z.object({
  strength: z.number().int(),
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
  health: z.number().int(),
  dodgeChance: z.number().min(0).max(1),
  hitChance: z.number().min(0).max(1),
  criticalChance: z.number().min(0).max(1),
  meleeDamage: z.number().min(0).max(1),
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
  criticalChance: z.number().min(0).max(1),
  duraAmmo: z.number(),
  damage: z.number(),
  hitChance: z.number().min(0).max(1),
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
  simulation_id: leoU32Schema,
  char: characterLeoSchema,
  // nft_id: leoU16Schema,
  // player_addr: leoAddressSchema,
  // primary_stats: primaryStatsLeoSchema,
  // secondary_stats: secondaryStatsLeoSchema,
  // primary_equipment: weaponLeoSchema,
  _nonce: leoGroupSchema,
});
export type PlayerLeo = z.infer<typeof playerLeoSchema>;

export const playerSchema = z.object({
  owner: leoAddressSchema,
  simulationId: z.number(),
  char: characterSchema,
  // nftId: z.number(),
  // playerAddr: leoAddressSchema,
  // primaryStats: primaryStatsSchema,
  // secondaryStats: secondaryStatsSchema,
  // primaryEquipment: weaponSchema,
  _nonce: z.string(),
});
export type Player = z.infer<typeof playerSchema>;

export const characterBracketPattern = () => "{p1{pStats}{sStats}{weapon}}";
export const playerRecordBracketPattern = () => `{${characterBracketPattern}}`;
const teamBracketPattern = (numberOfPlayers: number) => {
  let bracketPattern = "{t";
  for (let i = 0; i < numberOfPlayers; i++) {
    bracketPattern = bracketPattern.concat(characterBracketPattern());
  }
  bracketPattern = bracketPattern.concat("}");
  return bracketPattern;
};
export const warBracketPattern = (teamAPlayerCount: number, teamBPlayerCount: number) =>
  `{o${teamBracketPattern(teamAPlayerCount)}, ${teamBracketPattern(teamBPlayerCount)}{pa}nonce}`;

export const teamLeoSchema = z.object({
  p1: characterLeoSchema,
  p2: characterLeoSchema,
  p3: characterLeoSchema,
});
export type TeamLeo = z.infer<typeof teamLeoSchema>;

export const teamSchema = z.object({
  p1: characterSchema,
  p2: characterSchema,
  p3: characterSchema,
});
export type Team = z.infer<typeof teamSchema>;

export const physicalAttackLeoSchema = z.object({
  main: leoU8Schema,
  target: leoU8Schema,
  is_dodged: leoBooleanSchema,
  is_critical: leoBooleanSchema,
  total_normal_hits: leoU16Schema,
  total_critical_hits: leoU16Schema,
  damage: leoU16Schema,
});
export type PhysicalAttackLeo = z.infer<typeof physicalAttackLeoSchema>;

export const phyiscalAttackSchema = z.object({
  main: z.number(), // NFT Id of main character
  target: z.number(), // NFT Id of target character
  isDodged: z.boolean(),
  isHit: z.boolean(),
  isCritical: z.boolean(),
  totalCriticalHits: z.number(),
  totalNormalHits: z.number(),
  totalHits: z.number(),
  damage: z.number(),
});
export type PhysicalAttack = z.infer<typeof phyiscalAttackSchema>;

// This is the same data that'll be on chain
// This data will be used to for creation of full physicalAttack
// Hence the name phyAttack 🤣
export const phyAttackSchema = z.object({
  main: z.number(), // Index
  target: z.number(), // Index
  isDodged: z.boolean(),
  isCritical: z.boolean(),
  totalNormalHits: z.number(),
  totalCriticalHits: z.number(),
  damage: z.number(),
});
export type PhyAttack = z.infer<typeof phyAttackSchema>;

export const warLeoSchema = z.object({
  owner: leoAddressSchema,
  simulation_id: leoU32Schema,
  round: leoU8Schema,
  main_team: teamLeoSchema,
  target_team: teamLeoSchema,
  physical_attack: physicalAttackLeoSchema,
  _nonce: leoGroupSchema,
});
export type WarLeo = z.infer<typeof warLeoSchema>;

export const warSchema = z.object({
  owner: leoAddressSchema,
  simulationId: z.number(),
  round: z.number(),
  mainTeam: teamSchema,
  targetTeam: teamSchema,
  physicalAttack: phyiscalAttackSchema,
  phyAttack: phyAttackSchema,
  _nonce: z.string(),
});
export type War = z.infer<typeof warSchema>;

// Maybe the following schema be used later
// const itemLeoSchema = z.object({
//   item_id: leoU16Schema,
//   item_count: leoU16Schema,
//   stat_boost: z.boolean(),
//   rank: z.boolean(),
// });
// type ItemLeo = z.infer<typeof itemLeoSchema>;

// const itemSchema = z.object({
//   itemId: z.number(),
//   itemCount: z.number(),
//   statBoost: z.boolean(),
//   rank: z.boolean(),
// });
// type Item = z.infer<typeof itemSchema>;

// const multipliersLeoSchema = z.object({
//   dodge_chance: leoU16Schema,
// });
// type MultipliersLeo = z.infer<typeof multipliersLeoSchema>;

// const multipliersSchema = z.object({
//   dodgeChance: z.number(),
// });
// type Multiplers = z.infer<typeof multipliersSchema>;
