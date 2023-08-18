import {
  Character,
  CharacterLeo,
  characterLeoSchema,
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
} from "../../types";
import { SchnorrSignature, SchnorrSignatureLeo, schnorrSignatureLeoSchema } from "../../types/dsa";
import { u8, u16, u32, group, privateField, publicField, u16Prob, bool } from "./common";

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

const signature = (signature: SchnorrSignature): SchnorrSignatureLeo => {
  const res: SchnorrSignatureLeo = {
    r: group(BigInt(signature.r)),
    s: group(BigInt(signature.s)),
    validity_timestamp: u32(signature.validityTimestamp),
  };
  return schnorrSignatureLeoSchema.parse(res);
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
