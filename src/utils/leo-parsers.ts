import { env } from "../constants";
import {
  Character,
  CharacterLeo,
  characterLeoSchema,
  Dice,
  DiceData,
  DiceDataLeo,
  DiceLeo,
  diceLeoSchema,
  HashChain,
  HashChainLeo,
  Item,
  ItemLeo,
  itemLeoSchema,
  LeoField,
  leoFieldSchema,
  leoU128Schema,
  LeoU32,
  leoU32Schema,
  LeoU64,
  leoU64Schema,
  LeoU8,
  leoU8Schema,
  MatchSettings,
  MatchSettingsLeo,
  matchSettingsLeoSchema,
  PowerUp,
  PowerUpLeo,
  powerUpLeoSchema,
  PowerUpProbabilities,
  PowerUpProbabilitiesLeo,
  powerUpProbabilitiesLeoSchema,
  PrimaryStats,
  PrimaryStatsLeo,
  primaryStatsLeoSchema,
  Ranking,
  RankingLeo,
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

const u128 = (value: number | string): LeoU64 => {
  const numVal = Number(value);
  if (isNaN(numVal)) throw apiError("u128 parsing failed");
  const parsed = numVal + "u128";
  return leoU128Schema.parse(parsed);
};

const primaryStats = (primaryStats: PrimaryStats): PrimaryStatsLeo => {
  const res: PrimaryStatsLeo = {
    strength: u128(primaryStats.strength),
  };
  return primaryStatsLeoSchema.parse(res);
};

const secondaryStats = (secondaryStats: SecondaryStats): SecondaryStatsLeo => {
  const res: SecondaryStatsLeo = {
    health: u128(secondaryStats.health),
    dodge_chance: u128(secondaryStats.dodgeChance),
    hit_chance: u128(secondaryStats.hitChance),
    critical_chance: u128(secondaryStats.criticalChance),
    melee_damage: u128(secondaryStats.meleeDamage),
  };
  return secondaryStatsLeoSchema.parse(res);
};

const weapon = (weapon: Weapon): WeaponLeo => {
  const res: WeaponLeo = {
    id: u128(weapon.id),
    type: u128(weapon.type),
    consumption_rate: u128(weapon.consumptionRate),
    critical_chance: u128(weapon.criticalChance),
    dura_ammo: u128(weapon.duraAmmo),
    damage: u128(weapon.damage),
    hit_chance: u128(weapon.hitChance),
    number_of_hits: u128(weapon.numberOfHits),
    is_broken: weapon.isBroken,
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
  };
  return teamLeoSchema.parse(team);
};

const war = (war: War): WarLeo => {
  const res: WarLeo = {
    owner: war.owner,
    main_team: team(war.mainTeam),
    target_team: team(war.targetTeam),
  };
  return warLeoSchema.parse(res);
};

const matchSettings = (settings: MatchSettings): MatchSettingsLeo => {
  const res: MatchSettingsLeo = {
    player_amount: u8(settings.players),
    dice_per_player: u8(settings.dicePerPlayer),
    initial_power_up_amount: u8(settings.initialPowerUpAmount),
    max_power_up_amount: u8(settings.maxPowerUpAmount),
    heal_power_up_amount: u8(settings.healPowerUpAmount),
    stage_number_divisor: u8(settings.stageNumberDivisor),
    draw_round_offset: u8(settings.drawRoundOffset),
  };
  return matchSettingsLeoSchema.parse(res);
};

const powerUpProbabilities = (probabilities: PowerUpProbabilities): PowerUpProbabilitiesLeo => {
  const res: PowerUpProbabilitiesLeo = {
    pu_1: "0u8",
    pu_2: "0u8",
    pu_3: "0u8",
    pu_4: "0u8",
    pu_5: "0u8",
    pu_6: "0u8",
    pu_7: "0u8",
    pu_8: "0u8",
    pu_9: "0u8",
  };

  probabilities.forEach((prob) => {
    const key = ("pu_" + prob.id) as keyof PowerUpProbabilitiesLeo;
    res[key] = u8(prob.probability);
  });

  return powerUpProbabilitiesLeoSchema.parse(res);
};

const ranking = (leaderboard: Ranking): RankingLeo => {
  const res: RankingLeo = {
    p_1: "0field",
    p_2: "0field",
    p_3: "0field",
    p_4: "0field",
    p_5: "0field",
    p_6: "0field",
    p_7: "0field",
    p_8: "0field",
    p_9: "0field",
    p_10: "0field",
  };

  leaderboard.forEach((playerId, i) => {
    const place = i + 1;
    const key = ("p_" + place) as keyof RankingLeo;
    const parsedId = encodeId(playerId);

    if (!parsedId) throw apiError("ID encoding error");

    res[key] = field(parsedId);
  });

  return res;
};

const dice = (payload: Dice): DiceLeo => {
  const encodedId = encodeId(payload.matchId);

  if (!encodedId) throw apiError("ID encoding error");

  const res: DiceLeo = {
    _nonce: publicField(payload._nonce),
    owner: privateField(payload.owner),
    gates: privateField(u64(payload.gates)),
    match_id: privateField(field(encodedId)),
    face_amount: privateField(u8(payload.faceAmount)),
    dice_amount: privateField(u32(payload.diceAmount)),
  };

  return diceLeoSchema.parse(res);
};

const diceData = (diceData: DiceData): DiceDataLeo => {
  const diceDataLeo = {
    dice_1: "",
    dice_2: "",
    dice_3: "",
    dice_4: "",
    dice_5: "",
    dice_6: "",
    dice_7: "",
    dice_8: "",
    dice_9: "",
    dice_10: "",
  };

  const diceDataList = Object.values(diceData).map((diceValue) => u8(diceValue));

  diceDataList.forEach((value, i) => {
    const key = `dice_${i + 1}` as keyof DiceDataLeo;
    diceDataLeo[key] = value;
  });

  return diceDataLeo;
};

const powerUp = (payload: PowerUp): PowerUpLeo => {
  const encodedId = encodeId(payload.matchId);

  if (!encodedId) throw apiError("ID encoding error");

  const res: PowerUpLeo = {
    _nonce: publicField(payload._nonce),
    owner: privateField(payload.owner),
    gates: privateField(u64(payload.gates)),
    match_id: privateField(field(encodedId)),
    power_up_id: privateField(u8(payload.powerUpId)),
  };

  return powerUpLeoSchema.parse(res);
};

const hashChain = (payload: HashChain): HashChainLeo => {
  if (payload.length !== 32) throw apiError(`Hash chain must contain 32 elements, found ${payload.length}`);

  const res = payload.reduce((chain, hash, i) => {
    const key = ("hash_" + (i + 1)) as keyof HashChainLeo;
    return { ...chain, [key]: hash + "field" };
  }, {} as HashChainLeo);

  return res;
};

export const leoParse = {
  field,
  id,
  u8,
  u32,
  u64,
  u128,
  matchSettings,
  powerUpProbabilities,
  stringifyLeoCmdParam,
  team,
  war,
  ranking,
  dice,
  diceData,
  powerUp,
  hashChain,
};
