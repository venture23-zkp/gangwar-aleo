import { env } from "../constants";
import {
  Character,
  CharacterLeo,
  characterLeoSchema,
  Item,
  ItemLeo,
  itemLeoSchema,
  leoBooleanSchema,
  LeoField,
  leoFieldSchema,
  LeoU128,
  leoU128Schema,
  LeoU32,
  leoU32Schema,
  LeoU64,
  leoU64Schema,
  LeoU8,
  leoU8Schema,
  PrimaryStats,
  PrimaryStatsLeo,
  primaryStatsLeoSchema,
  SecondaryStats,
  SecondaryStatsLeo,
  secondaryStatsLeoSchema,
  secondaryStatsSchema,
  Team,
  TeamLeo,
  teamLeoSchema,
  War,
  WarLeo,
  warLeoSchema,
  Weapon,
  WeaponLeo,
  weaponLeoSchema,
} from "../types";
import { apiError } from "./error";
import { encodeId } from "./id";

const stringifyLeoCmdParam = (value: unknown): string => {
  // if Leo will ever introduce strings, this will have to be updated
  const res = JSON.stringify(value).replaceAll('"', "");

  return env.ZK_MODE === "leo" ? `"${res}"` : `${res}`;
};

const privateField = (value: string) => value + ".private";

const publicField = (value: string) => value + ".public";

function prob(repr: string, maxValue: BigInt, prob: number) {
  // Use the decimal digits of MAX_SAFE_INTEGER as precision
  const precision = Number.MAX_SAFE_INTEGER.toString().length - 1;

  // Split the field value into two parts: first & second
  const first_part = maxValue.toString().substring(0, precision);

  // Note: Although second part won't ever be considered in practice
  // it can be randomized to give a sense of randomness to users
  // In gangstabet, the probabilites are set before-hand so randomness is not needed
  const second_part = maxValue.toString().substring(precision, maxValue.toString().length);

  let updated_first_part_after_probability = Math.round(Number(first_part) * prob);

  const final = updated_first_part_after_probability + second_part + repr;

  return final;
}

const field = (value: bigint): LeoField => {
  const parsed = value + "field";
  return leoFieldSchema.parse(parsed);
};

const id = (value: string): LeoField => {
  const encoded = encodeId(value);
  if (!encoded) throw apiError("Leo ID parsing failed.");
  return field(encoded);
};

const u8 = (value: number | string): LeoU8 => {
  const numVal = Number(value);
  if (isNaN(numVal)) throw apiError("u8 parsing failed");
  const parsed = numVal + "u8";
  return leoU8Schema.parse(parsed);
};

const u32 = (value: number | string): LeoU32 => {
  const numVal = Number(value);
  if (isNaN(numVal)) throw apiError("u32 parsing failed");
  const parsed = numVal + "u32";
  return leoU32Schema.parse(parsed);
};

const u64 = (value: number | string): LeoU64 => {
  const numVal = Number(value);
  if (isNaN(numVal)) throw apiError("u64 parsing failed");
  const parsed = numVal + "u64";
  return leoU64Schema.parse(parsed);
};

const u128 = (value: number | string): LeoU128 => {
  const numVal = Number(value);
  if (isNaN(numVal)) throw apiError("u128 parsing failed");
  const parsed = numVal + "u128";
  return leoU128Schema.parse(parsed);
};

const bool = (value: boolean): LeoU128 => {
  const val = value ? "true" : "false";
  return leoBooleanSchema.parse(val);
};

const fieldProb = (value: number): LeoField => {
  // Base field - 1 of Edwards BLS12
  // https://developer.aleo.org/advanced/the_aleo_curves/edwards_bls12#base-field
  const MAX_FIELD = BigInt("8444461749428370424248824938781546531375899335154063827935233455917409239040");
  const parsed = prob("field", MAX_FIELD, value);
  return leoFieldSchema.parse(parsed);
};

const u128Prob = (value: number): LeoU128 => {
  const MAX_UINT128 = BigInt("340282366920938463463374607431768211455"); // 2^128 - 1
  const parsed = prob("u128", MAX_UINT128, value);
  return leoU128Schema.parse(parsed);
};

const primaryStats = (primaryStats: PrimaryStats): PrimaryStatsLeo => {
  const res: PrimaryStatsLeo = {
    strength: u128(primaryStats.strength),
    // accuracy: u128(primaryStats.accuracy),
  };
  return primaryStatsLeoSchema.parse(res);
};

const secondaryStats = (secondaryStats: SecondaryStats): SecondaryStatsLeo => {
  const res: SecondaryStatsLeo = {
    health: u128(secondaryStats.health),
    dodge_chance: u128Prob(secondaryStats.dodgeChance),
    hit_chance: u128Prob(secondaryStats.hitChance),
    critical_chance: u128Prob(secondaryStats.criticalChance),
    melee_damage: u128Prob(secondaryStats.meleeDamage),
  };
  return secondaryStatsLeoSchema.parse(res);
};

const weapon = (weapon: Weapon): WeaponLeo => {
  const res: WeaponLeo = {
    id: u128(weapon.id),
    w_type: u128(weapon.type),
    consumption_rate: u128(weapon.consumptionRate),
    critical_chance: u128Prob(weapon.criticalChance),
    dura_ammo: u128(weapon.duraAmmo),
    damage: u128(weapon.damage),
    hit_chance: u128Prob(weapon.hitChance),
    number_of_hits: u128(weapon.numberOfHits),
    is_broken: bool(weapon.isBroken),
  };
  return weaponLeoSchema.parse(res);
};

const item = (item: Item): ItemLeo => {
  const res: ItemLeo = {
    item_id: u128(item.itemId),
    item_count: u128(item.itemCount),
    stat_boost: item.statBoost,
    rank: item.rank,
  };
  return itemLeoSchema.parse(res);
};

const character = (character: Character): CharacterLeo => {
  const res: CharacterLeo = {
    primary_stats: primaryStats(character.primaryStats),
    secondary_stats: secondaryStats(character.secondaryStats),
    primary_equipment: weapon(character.primaryEquipment),
  };
  return characterLeoSchema.parse(res);
};

const team = (team: Team): TeamLeo => {
  const res: TeamLeo = {
    player_1: character(team.player_1),
    // player_2: character(team.player_2),
  };
  return res;
  // return teamLeoSchema.parse(team);
};

const war = (war: War): WarLeo => {
  const res: WarLeo = {
    owner: war.owner,
    main_team: team(war.mainTeam),
    target_team: team(war.targetTeam),
    _nonce: war._nonce,
  };
  return warLeoSchema.parse(res);
};

export const leoParse = {
  field,
  id,
  u8,
  u32,
  u64,
  u128,
  stringifyLeoCmdParam,
  team,
  war,
};
