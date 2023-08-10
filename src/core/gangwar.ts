import {
  CDefaultWeaponsName,
  CNormalWeaponsName,
  EDefaultEquipmentID,
  ENormalEquipmentID,
  equipmentTypes,
} from "../types/simulationEngine";

import { Character, PrimaryStats, SecondaryStats, Team, Weapon } from "../types/gangwar";
import { leoU128Schema } from "../types";
import { start } from "repl";
import { LOCAL_NETWORK_ADDRESS } from "../constants";

const flipACoin = (side1: [any, number], side2: any) => {
  return Math.random() <= side1[1] ? side1[0] : side2;
};

const randRange = (max: number, min: number) => {
  const max_n = max > min ? max : min;
  const min_n = max > min ? min : max;
  return Math.random() * (max_n - min_n) + min_n;
};

const randRangeInt = (max: number, min: number) => {
  const randNumInRange = randRange(max, min);
  return Math.round(randNumInRange);
};

const weaponTypeToInt = (type: equipmentTypes): number => {
  switch (type) {
    case "Melee":
      return 1;
    case "Range":
      return 2;
    case "Support":
      return 3;
    default:
      throw Error("Invalid weapon type");
  }
};

const intToWeaponType = (type: number): equipmentTypes => {
  switch (type) {
    case 1:
      return "Melee";
    case 2:
      return "Range";
    case 3:
      return "Support";
    default:
      throw Error("Invalid weapon type");
  }
};

const createWeapon = (useType: "Normal" | "Default"): Weapon => {
  const normalWepId = Object.keys(CNormalWeaponsName);
  const defaultWepId = Object.keys(CDefaultWeaponsName);

  let name: string;
  let id: string;
  let type: number;
  if (useType == "Normal") {
    id = normalWepId[Math.floor(Math.random() * normalWepId.length)];
    name = CNormalWeaponsName[parseInt(id) as ENormalEquipmentID].name;
    type = weaponTypeToInt(CNormalWeaponsName[parseInt(id) as ENormalEquipmentID].type);
  } else {
    id = defaultWepId[Math.floor(Math.random() * defaultWepId.length)];
    name = CDefaultWeaponsName[parseInt(id) as EDefaultEquipmentID].name;
    type = weaponTypeToInt(CDefaultWeaponsName[parseInt(id) as EDefaultEquipmentID].type);
  }
  return {
    id: parseInt(id),
    //   name: name,
    //   imageUrl: "https://d3o1y7koafmnju.cloudfront.net/primary_equipment_images/13.png",
    //   description: "Toss a grenade toward the enemy and watch it go boom, damaging multiple targets at once.",
    //   equipmentId: parseInt(id),
    //   isSupport: false,
    type: type,
    //   stats: {
    consumptionRate: randRangeInt(20, 10),
    criticalChance: randRange(0, 0.3),
    damage: randRangeInt(95, 200),
    duraAmmo: randRangeInt(95, 200),
    hitChance: randRange(0.7, 0.3),
    numberOfHits: randRangeInt(8, 1),
    isBroken: false, // Added later
    //   },
    //   properties: {
    //     masteryRequired: 0,
    //   },
  };
};

// function getItems(number: number): Array<any> {
//   let items: any = [];
//   let itemK: Record<number, number> = {};
//   for (let i = 0; i < number; i++) {
//     const id = randRange(9, 1);
//     if (Object.keys(itemK).includes(id.toString())) {
//       itemK[id] += 1;
//     } else {
//       itemK[id] = 1;
//     }
//   }
//   Object.keys(itemK).map((id) => {
//     items.push({
//       itemId: parseInt(id),
//       itemCount: parseInt(itemK[id]),
//       statBoost: null,
//       rank: null,
//     });
//   });
//   return items;
// }

// function getPassiveAbility(): Array<any> {
//   let id = [3, 14, 13];
//   let items: any = [];
//   id.map((key) => {
//     items.push({
//       abilityId: key,
//       count: 1,
//     });
//   });
//   return items;
// }

export const createCharacters = (count: number = 1, names: string[]): Character[] => {
  const characters: Character[] = [];

  for (let i = 0; i < count; i++) {
    const primaryStats: PrimaryStats = {
      strength: randRangeInt(150, 300),
      // accuracy: randRangeInt(150, 300),
    };

    const secondaryStats: SecondaryStats = {
      health: randRangeInt(500, 1700),
      // speed: randRange(500, 1700),
      // duraAmmo: randRange(1, 2),
      dodgeChance: randRange(0.3, 0.5),
      hitChance: randRange(0, 0.3),
      criticalChance: randRange(0.1, 0.5),
      // supportEffectiveness: randRange(0.4, 1),
      // SupportTriggerChance: randRange(0.4, 1),
      meleeDamage: randRange(0.4, 1),
    };

    const primaryEquipment: Weapon = createWeapon("Normal");
    // const defaultEquipment: Weapon = weaponCreator("Default");

    const character: Character = {
      //name:
      //type
      nftId: randRangeInt(1, 5555),
      playerAddr: LOCAL_NETWORK_ADDRESS,
      primaryStats,
      secondaryStats,
      primaryEquipment,
      //items
      //passiveAbilities
    };
    characters.push(character);
  }

  return characters;
};

const createRandomTeams = (teamANumber: number, teamBNumber: number): { teamA: Team; teamB: Team } => {
  const name1 = ["[DaVinci]", "[Lady Irene]", "[Lakhe]", "[Don Solaire]", "[FlyingWhale]", "[FTX]"];
  const name2 = ["[Grimlock]", "[Harvard University]", "[Toast The Profit]", "[Kenzie]", "[Schaduuuwtje]", "[Jp]"];
  let teamACharacters = createCharacters(teamANumber, name1);
  let teamBCharacters = createCharacters(teamBNumber, name2);
  let teamA: Team = {
    p1: teamACharacters[0],
    p2: teamACharacters[1],
    p3: teamACharacters[2],
    // player_2: teamACharacters[1],
    // To be added
  };
  let teamB: Team = {
    p1: teamBCharacters[0],
    p2: teamBCharacters[1],
    p3: teamBCharacters[2],
    // player_2: teamBCharacters[1],
    // To be added
  };
  return { teamA, teamB };
};

export const createPayload = (simId: string, playersPerTeam: number) => {
  const { teamA, teamB } = createRandomTeams(playersPerTeam, playersPerTeam);
  return {
    // roomId: `gangwar#${simId}`,
    simulationId: simId,
    // duration: `0x23C34600`, //10 minutes
    // objectives: ["0x1"],
    teamA,
    teamB,
  };
};
