import { sign } from "crypto";
import { env } from "../constants";
import {
  Character,
  CharacterLeo,
  characterLeoSchema,
  // Item,
  // ItemLeo,
  // itemLeoSchema,
  leoBooleanSchema,
  LeoField,
  leoFieldSchema,
  LeoGroup,
  leoGroupSchema,
  LeoScalar,
  leoScalarSchema,
  LeoU128,
  leoU128Schema,
  LeoU16,
  leoU16Schema,
  LeoU32,
  leoU32Schema,
  LeoU64,
  leoU64Schema,
  LeoU8,
  leoU8Schema,
  PlayerLeo,
  playerLeoSchema,
  Player,
  PrimaryStats,
  PrimaryStatsLeo,
  primaryStatsLeoSchema,
  SecondaryStats,
  SecondaryStatsLeo,
  secondaryStatsLeoSchema,
  secondaryStatsSchema,
  Weapon,
  WeaponLeo,
  weaponLeoSchema,
  TeamLeo,
  Team,
  teamLeoSchema,
  War,
  WarLeo,
  PhysicalAttack,
  PhysicalAttackLeo,
  physicalAttackLeoSchema,
  warLeoSchema,
} from "../types";
import { SchnorrSignature, SchnorrSignatureLeo, schnorrSignatureLeoSchema } from "../types/dsa";
// import { BaseURILeo, baseURILeoSchma, MAX_CHARS_PER_U128, U128_IN_BASE_URI } from "../types/nft";
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
  // In gangwar, the probabilites are set before-hand so randomness is not needed
  const second_part = maxValue.toString().substring(precision, maxValue.toString().length);

  let updated_first_part_after_probability = Math.round(Number(first_part) * prob);

  const final = updated_first_part_after_probability + second_part + repr;

  return final;
}

const field = (value: BigInt): LeoField => {
  const parsed = value + "field";
  return leoFieldSchema.parse(parsed);
};

const scalar = (value: BigInt): LeoScalar => {
  const parsed = value + "scalar";
  return leoScalarSchema.parse(parsed);
};

const group = (value: BigInt): LeoGroup => {
  const parsed = value + "group";
  return leoGroupSchema.parse(parsed);
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

const u16 = (value: number | string): LeoU16 => {
  const numVal = Number(value);
  if (isNaN(numVal)) throw apiError("u16 parsing failed");
  const parsed = numVal + "u16";
  return leoU16Schema.parse(parsed);
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

const u128String = (value: string): LeoU128 => {
  const parsed = value + "u128";
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

const u16Prob = (value: number): LeoU128 => {
  const MAX_UINT16 = BigInt("65535"); // 2^128 - 1
  const parsed = prob("u16", MAX_UINT16, value);
  return leoU16Schema.parse(parsed);
};

// TODO: Figure out how it is encoded
// const symbol = (sym: string): LeoU128 => {
//   const MAX_CHARS_PER_U128 = 128 / 8; // Represented as u128 / 8 bits per character
//   if (sym.length > MAX_CHARS_PER_U128) throw apiError("symbol parsing failed");

//   // Represent each character as HEX
//   let symHex = sym
//     .split("")
//     .map((x) => x.charCodeAt(0).toString(16))
//     .join("");

//   // Convert hex to integer
//   let symInt = parseInt(symHex, 16).toString();

//   return u128(symInt);
// };

// TODO: Figure out how it is encoded
// const baseURI = (uri: string): BaseURILeo => {
//   if (uri.length > MAX_CHARS_PER_U128 * U128_IN_BASE_URI) throw apiError("baseURI parsing failed");
//   let uriParts = [];
//   for (let i = 0; i < U128_IN_BASE_URI; i++) {
//     let vals = [];
//     for (let j = 0; j < MAX_CHARS_PER_U128; j++) {
//       let char = uri[i * MAX_CHARS_PER_U128 + j];
//       let val;
//       // Represent each character as HEX
//       if (!char) {
//         val = "00";
//       } else {
//         val = char.charCodeAt(0).toString(16);
//       }
//       vals.push(val);
//     }
//     // Convert hex to integer and push in array
//     const partOfURIInHex = vals.join("");
//     const partOfURIInInt = BigInt("0x" + partOfURIInHex).toString();
//     uriParts.push(partOfURIInInt);
//   }

//   console.log(u128String);

//   let baseURILeo: BaseURILeo = {
//     data0: u128String(uriParts[0]),
//     data1: u128String(uriParts[1]),
//     data2: u128String(uriParts[2]),
//     data3: u128String(uriParts[3]),
//   };

//   console.log(baseURILeo);

//   return baseURILeoSchma.parse(baseURILeo);
// };

const signature = (signature: SchnorrSignature): SchnorrSignatureLeo => {
  const res: SchnorrSignatureLeo = {
    r: group(BigInt(signature.r)),
    s: group(BigInt(signature.s)),
    validity_timestamp: u32(signature.validityTimestamp),
  };
  return schnorrSignatureLeoSchema.parse(res);
};

const primaryStats = (primaryStats: PrimaryStats): PrimaryStatsLeo => {
  const res: PrimaryStatsLeo = {
    strength: u16(primaryStats.strength),
  };
  return primaryStatsLeoSchema.parse(res);
};

const primaryStatsRecord = (primaryStats: PrimaryStats): PrimaryStatsLeo => {
  const res: PrimaryStatsLeo = {
    strength: privateField(u16(primaryStats.strength)),
  };
  return primaryStatsLeoSchema.parse(res);
};

const secondaryStats = (secondaryStats: SecondaryStats): SecondaryStatsLeo => {
  const res: SecondaryStatsLeo = {
    health: u16(secondaryStats.health),
    dodge_chance: u16Prob(secondaryStats.dodgeChance),
    hit_chance: u16Prob(secondaryStats.hitChance),
    critical_chance: u16Prob(secondaryStats.criticalChance),
    melee_damage: u16Prob(secondaryStats.meleeDamage),
  };
  return secondaryStatsLeoSchema.parse(res);
};

const secondaryStatsRecord = (secondaryStats: SecondaryStats): SecondaryStatsLeo => {
  const res: SecondaryStatsLeo = {
    health: privateField(u16(secondaryStats.health)),
    dodge_chance: privateField(u16Prob(secondaryStats.dodgeChance)),
    hit_chance: privateField(u16Prob(secondaryStats.hitChance)),
    critical_chance: privateField(u16Prob(secondaryStats.criticalChance)),
    melee_damage: privateField(u16Prob(secondaryStats.meleeDamage)),
  };
  return secondaryStatsLeoSchema.parse(res);
};

const weapon = (weapon: Weapon): WeaponLeo => {
  const res: WeaponLeo = {
    id: u16(weapon.id),
    w_type: u16(weapon.type),
    consumption_rate: u16(weapon.consumptionRate),
    critical_chance: u16Prob(weapon.criticalChance),
    dura_ammo: u16(weapon.duraAmmo),
    damage: u16(weapon.damage),
    hit_chance: u16Prob(weapon.hitChance),
    number_of_hits: u16(weapon.numberOfHits),
    is_broken: bool(weapon.isBroken),
  };
  return weaponLeoSchema.parse(res);
};
const weaponRecord = (weapon: Weapon): WeaponLeo => {
  const res: WeaponLeo = {
    id: privateField(u16(weapon.id)),
    w_type: privateField(u16(weapon.type)),
    consumption_rate: privateField(u16(weapon.consumptionRate)),
    critical_chance: privateField(u16Prob(weapon.criticalChance)),
    dura_ammo: privateField(u16(weapon.duraAmmo)),
    damage: privateField(u16(weapon.damage)),
    hit_chance: privateField(u16Prob(weapon.hitChance)),
    number_of_hits: privateField(u16(weapon.numberOfHits)),
    is_broken: privateField(bool(weapon.isBroken)),
  };
  return weaponLeoSchema.parse(res);
};

// const item = (item: Item): ItemLeo => {
//   const res: ItemLeo = {
//     item_id: u16(item.itemId),
//     item_count: u16(item.itemCount),
//     stat_boost: item.statBoost,
//     rank: item.rank,
//   };
//   return itemLeoSchema.parse(res);
// };

const physicalAttack = (damage: PhysicalAttack): PhysicalAttackLeo => {
  const res: PhysicalAttackLeo = {
    is_dodged: bool(damage.isDodged),
    is_hit: bool(damage.isHit),
    is_critical: bool(damage.isCritical),
    total_critical_hits: u16(damage.totalCriticalHits),
    total_normal_hits: u16(damage.totalNormalHits),
    total_hits: u16(damage.totalHits),
    damage: u16(damage.damage),
  };
  return physicalAttackLeoSchema.parse(res);
};

const physicalAttackRecord = (damage: PhysicalAttack): PhysicalAttackLeo => {
  const res: PhysicalAttackLeo = {
    is_dodged: privateField(bool(damage.isDodged)),
    is_hit: privateField(bool(damage.isHit)),
    is_critical: privateField(bool(damage.isCritical)),
    total_critical_hits: privateField(u16(damage.totalCriticalHits)),
    total_normal_hits: privateField(u16(damage.totalNormalHits)),
    total_hits: privateField(u16(damage.totalHits)),
    damage: privateField(u16(damage.damage)),
  };
  return physicalAttackLeoSchema.parse(res);
};

const character = (character: Character): CharacterLeo => {
  const res: CharacterLeo = {
    nft_id: u16(character.nftId),
    player_addr: character.playerAddr,
    primary_stats: primaryStats(character.primaryStats),
    secondary_stats: secondaryStats(character.secondaryStats),
    primary_equipment: weapon(character.primaryEquipment),
  };
  return characterLeoSchema.parse(res);
};

const characterRecord = (character: Character): CharacterLeo => {
  const res: CharacterLeo = {
    nft_id: privateField(u16(character.nftId)),
    player_addr: privateField(character.playerAddr),
    primary_stats: primaryStatsRecord(character.primaryStats),
    secondary_stats: secondaryStatsRecord(character.secondaryStats),
    primary_equipment: weaponRecord(character.primaryEquipment),
  };
  return characterLeoSchema.parse(res);
};

const playerRecord = (player: Player): PlayerLeo => {
  const res: PlayerLeo = {
    owner: privateField(player.owner),
    simulation_id: privateField(u32(player.simulationId)),
    char: characterRecord(player.char),
    _nonce: publicField(group(BigInt(player._nonce))),
  };
  return playerLeoSchema.parse(res);
};

const team = (team: Team): TeamLeo => {
  const res: TeamLeo = {
    p1: character(team.p1),
    p2: character(team.p2),
    p3: character(team.p3),
  };
  // return res;
  return teamLeoSchema.parse(res);
};

const teamRecord = (team: Team): TeamLeo => {
  const res: TeamLeo = {
    p1: characterRecord(team.p1),
    p2: characterRecord(team.p2),
    p3: characterRecord(team.p3),
  };
  // return res;
  return teamLeoSchema.parse(res);
};

const war = (war: War): WarLeo => {
  const res: WarLeo = {
    owner: war.owner,
    simulation_id: u32(war.simulationId),
    round: privateField(u16(war.round)),
    main_team: team(war.mainTeam),
    target_team: team(war.targetTeam),
    physical_attack: physicalAttack(war.physicalAttack),
    _nonce: war._nonce,
  };
  return warLeoSchema.parse(res);
};

const warRecord = (war: War): WarLeo => {
  const res: WarLeo = {
    owner: privateField(war.owner),
    simulation_id: privateField(u32(war.simulationId)),
    round: privateField(u8(war.round)),
    main_team: teamRecord(war.mainTeam),
    target_team: teamRecord(war.targetTeam),
    physical_attack: physicalAttackRecord(war.physicalAttack),
    _nonce: publicField(group(BigInt(war._nonce))),
  };
  return warLeoSchema.parse(res);
};

export const leoParse = {
  field,
  scalar,
  id,
  u8,
  u16,
  u32,
  u64,
  u128,
  stringifyLeoCmdParam,
  character,
  signature,
  playerRecord,
  // team,
  // war,
  warRecord,
  // symbol,
  // baseURI,
};
