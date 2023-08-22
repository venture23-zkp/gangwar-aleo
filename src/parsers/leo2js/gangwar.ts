import {
  PrimaryStats,
  PrimaryStatsLeo,
  primaryStatsSchema,
  SecondaryStats,
  SecondaryStatsLeo,
  secondaryStatsSchema,
  Weapon,
  WeaponLeo,
  weaponSchema,
  CharacterLeo,
  characterSchema,
  Character,
  SchnorrSignature,
  SchnorrSignatureLeo,
  schnorrSignatureSchema,
  schnorrSignatureLeoSchema,
  GangwarSettings,
  gangwarSettingsLeoSchema,
  gangwarSettingsSchema,
  playerLeoSchema,
  playerSchema,
  Player,
  PlayerLeo,
  Team,
  TeamLeo,
  teamSchema,
  physicalAttackLeoSchema,
  PhysicalAttack,
  phyiscalAttackSchema,
  PhysicalAttackLeo,
  phyAttackSchema,
  PhyAttack,
  War,
  WarLeo,
  warLeoSchema,
  warSchema,
} from "../../types";
import { u8, u16, u16Prob, u32, bool, group, address } from "./common";

const primaryStats = (primaryStats: PrimaryStatsLeo): PrimaryStats => {
  const res: PrimaryStats = {
    strength: u16(primaryStats.strength),
  };
  return primaryStatsSchema.parse(res);
};

const secondaryStats = (secondaryStats: SecondaryStatsLeo): SecondaryStats => {
  const res: SecondaryStats = {
    health: u16(secondaryStats.health),
    dodgeChance: u16Prob(secondaryStats.dodge_chance),
    hitChance: u16Prob(secondaryStats.hit_chance),
    criticalChance: u16Prob(secondaryStats.critical_chance),
    meleeDamage: u16Prob(secondaryStats.melee_damage),
  };
  // console.log(res);
  return secondaryStatsSchema.parse(res);
};

const weapon = (weapon: WeaponLeo): Weapon => {
  const res: Weapon = {
    id: u16(weapon.id),
    type: u16(weapon.w_type),
    consumptionRate: u16(weapon.consumption_rate),
    criticalChance: u16Prob(weapon.critical_chance),
    duraAmmo: u16(weapon.dura_ammo),
    damage: u16(weapon.damage),
    hitChance: u16Prob(weapon.hit_chance),
    numberOfHits: u16(weapon.number_of_hits),
    isBroken: bool(weapon.is_broken),
  };
  return weaponSchema.parse(res);
};

// const item = (item: ItemLeo): Item => {
//   const res: Item = {
//     itemId: u128(item.item_id),
//     itemCount: u128(item.item_count),
//     statBoost: item.stat_boost,
//     rank: item.rank,
//   };
//   return itemSchema.parse(res);
// };

const character = (character: CharacterLeo): Character => {
  const res: Character = {
    nftId: u16(character.nft_id),
    playerAddr: address(character.player_addr),
    primaryStats: primaryStats(character.primary_stats),
    secondaryStats: secondaryStats(character.secondary_stats),
    primaryEquipment: weapon(character.primary_equipment),
  };
  return characterSchema.parse(res);
};

const signature = (record: Record<string, unknown>): SchnorrSignature => {
  const parsed = schnorrSignatureLeoSchema.parse(record);
  const res: SchnorrSignature = {
    r: group(parsed.r).toString(),
    s: group(parsed.s).toString(),
    validityTimestamp: u32(parsed.validity_timestamp),
  };
  return schnorrSignatureSchema.parse(res);
};

const settings = (record: Record<string, unknown>): GangwarSettings => {
  const parsed = gangwarSettingsLeoSchema.parse(record);
  // console.log(parsed);
  const gangwarSettings: GangwarSettings = {
    createdAt: u32(parsed.created_at),
    startTime: 0,
    deadlineToRegister: u32(parsed.deadline_to_register),
    maxNumberOfPlayers: u8(parsed.max_number_of_players),
    maxRounds: u8(parsed.max_rounds),
    participationLootcrateCount: u8(parsed.participation_lootcrate_count),
    winnerLootcrateCount: u8(parsed.winner_lootcrate_count),
    registeredPlayers: u8(parsed.registered_players),
    randomNumber: u16(parsed.random_number),
  };
  return gangwarSettingsSchema.parse(gangwarSettings);
};

const playerRecord = (record: Record<string, unknown>): Player => {
  const parsed = playerLeoSchema.parse(record);
  // console.log(parsed);
  const player: Player = {
    owner: address(parsed.owner),
    simulationId: u32(parsed.simulation_id),
    char: character(parsed.char),
    // nftId: u16(parsed.nft_id),
    // playerAddr: replaceValue(parsed.player_addr),
    // primaryStats: primaryStats(parsed.primary_stats),
    // secondaryStats: secondaryStats(parsed.secondary_stats),
    // primaryEquipment: weapon(parsed.primary_equipment),
    _nonce: group(parsed._nonce).toString(),
  };
  return playerSchema.parse(player);
};

const team = (team: TeamLeo): Team => {
  const res: Team = {
    p1: character(team.p1),
    p2: character(team.p2),
    p3: character(team.p3),
  };
  return teamSchema.parse(res);
};

const phyAttack = (damage: PhysicalAttackLeo): PhyAttack => {
  const res: PhyAttack = {
    main: u8(damage.main),
    target: u8(damage.target),
    isDodged: bool(damage.is_dodged),
    isCritical: bool(damage.is_critical),
    totalNormalHits: u16(damage.total_normal_hits),
    totalCriticalHits: u16(damage.total_critical_hits),
    damage: u16(damage.damage),
  };
  return phyAttackSchema.parse(res);
};

const physicalAttack = (damage: PhysicalAttackLeo): PhysicalAttack => {
  const damageValue = u16(damage.damage);
  const totalCriticalHits = u16(damage.total_critical_hits);
  const totalNormalHits = u16(damage.total_normal_hits);
  const res: PhysicalAttack = {
    main: u8(damage.main),
    target: u8(damage.target),
    isDodged: bool(damage.is_dodged),
    isHit: damageValue > 0,
    isCritical: bool(damage.is_critical),
    totalNormalHits,
    totalCriticalHits,
    totalHits: totalCriticalHits + totalCriticalHits,
    damage: damageValue,
  };
  return phyiscalAttackSchema.parse(res);
};

const convertIndexToNftId = (index: number, team: Team): number => {
  switch (index) {
    case 0:
      return 0;
    case 1:
      return team.p1.nftId;
    case 2:
      return team.p2.nftId;
    case 3:
      return team.p3.nftId;
    default:
      throw Error("Not a proper index");
  }
};

const war = (record: Record<string, unknown>): War => {
  const parsed = warLeoSchema.parse(record);
  // console.log(parsed);
  const { main_team, target_team } = parsed;
  const mainTeam = team(main_team);
  const targetTeam = team(target_team);
  const attack = physicalAttack(parsed.physical_attack);

  console.log(attack);
  const mainNftId = convertIndexToNftId(attack.main, targetTeam);
  const targetNftId = convertIndexToNftId(attack.main, mainTeam);

  const updatedAttack: PhysicalAttack = { ...attack, main: mainNftId, target: targetNftId };

  const war: War = {
    owner: address(parsed.owner),
    simulationId: u32(parsed.simulation_id),
    round: u8(parsed.round),
    mainTeam,
    targetTeam,
    physicalAttack: updatedAttack,
    phyAttack: phyAttack(parsed.physical_attack),
    _nonce: group(parsed._nonce).toString(),
  };

  return warSchema.parse(war);
};

export const gangwar = {
  primaryStats,
  secondaryStats,
  weapon,
  character,
  signature,
  settings,
  playerRecord,
  physicalAttack,
  war,
};
