import { convertProbToField, convertProbToUInt128, convertToField, convertToUInt128 } from "./conversions";
import { CDefaultWeaponsName, CNormalWeaponsName, EDefaultEquipmentID, ENormalEquipmentID } from "./enums";

function randRange(max: number, min: number, denominator: number) {
  let max_n = max > min ? max : min;
  let min_n = max > min ? min : max;
  return (Math.floor(Math.random() * (max_n - min_n)) + min_n) / denominator;
}

function randRangeInUInt128(max: number, min: number, denominator: number) {
  return convertToUInt128(randRange(max, min, denominator));
}

function randRangeProb(max: number, min: number, denominator: number) {
  let max_n = max > min ? max : min;
  let min_n = max > min ? min : max;
  return Math.random() * (max_n - min_n) + min_n / denominator;
}

function randRangeProbInUInt128(max: number, min: number, denominator: number) {
  let prob = randRangeProb(max, min, denominator);
  let probInField = convertProbToUInt128(prob);
  return probInField;
}

function weaponCreator(useType: "Normal" | "Default") {
  const normalWepId = Object.keys(CNormalWeaponsName);
  const defaultWepId = Object.keys(CDefaultWeaponsName);
  if (useType == "Normal") {
    const id = normalWepId[Math.floor(Math.random() * normalWepId.length)];
    const { name, type } = CNormalWeaponsName[parseInt(id) as ENormalEquipmentID];
    return {
      id: id.toString() + "u128",
      // name: name,
      // imageUrl:
      //   "https://d3o1y7koafmnju.cloudfront.net/primary_equipment_images/13.png",
      // description:
      //   "Toss a grenade toward the enemy and watch it go boom, damaging multiple targets at once.",
      // equipmentId: parseInt(id),
      // isSupport: false,
      type: "1field",
      // stats: {
      consumption_rate: randRange(20, 10, 1),
      critical_chance: randRange(0, 0.3, 1),
      damage: randRange(95, 200, 1),
      dura_ammo: randRange(95, 200, 1),
      hit_chance: randRangeProb(0.7, 0.3, 1),
      number_of_hits: randRange(8, 1, 1),
      is_broken: false,
      // },
      // properties: {
      //   masteryRequired: 0,
      // },
    };
  } else {
    const id = defaultWepId[Math.floor(Math.random() * defaultWepId.length)];
    const { name, type } = CDefaultWeaponsName[parseInt(id) as EDefaultEquipmentID];
    return {
      id: id.toString() + "u128",
      // name: name,
      // imageUrl:
      //   "https://d3o1y7koafmnju.cloudfront.net/primary_equipment_images/13.png",
      // description:
      //   "Toss a grenade toward the enemy and watch it go boom, damaging multiple targets at once.",
      // equipmentId: parseInt(id),
      // isSupport: false,
      type: "0field",
      // stats: {
      consumption_rate: -1,
      critical_chance: randRangeProb(0, 0.3, 1),
      damage: randRange(95, 200, 1),
      dura_ammo: randRange(95, 200, 1),
      hit_chance: randRangeProb(0.7, 0.3, 1),
      numberof_hits: randRange(8, 1, 1),
      is_broken: false,
      // },
      // properties: {
      //   masteryRequired: 0,
      // },
    };
  }
}

function getItems(number: number): Array<any> {
  let items: any = [];
  let itemK: Record<number, number> = {};
  for (let i = 0; i < number; i++) {
    const id = randRange(9, 1, 1);
    if (Object.keys(itemK).includes(id.toString())) {
      itemK[id] += 1;
    } else {
      itemK[id] = 1;
    }
  }
  Object.keys(itemK).map((id) => {
    items.push({
      itemId: parseInt(id),
      itemCount: itemK[parseInt(id)],
      statBoost: null,
      rank: null,
    });
  });
  return items;
}
function getPassiveAbility(): Array<any> {
  let id = [3, 14, 13];
  let items: any = [];
  id.map((key) => {
    items.push({
      abilityId: key,
      count: 1,
    });
  });
  return items;
}
function createRandomTeams(teamANumber: number, teamBNumber: number) {
  const name1 = ["[DaVinci]", "[Lady Irene]", "[Lakhe]", "[Don Solaire]", "[FlyingWhale]", "[FTX]"];
  const name2 = ["[Grimlock]", "[Harvard University]", "[Toast The Profit]", "[Kenzie]", "[Schaduuuwtje]", "[Jp]"];
  let team_a: any = {};
  for (let i = 1; i <= teamANumber; i++) {
    let index = i;
    let char = {
      // name: name1[i - 1],
      // type: "HUMAN",
      // nftId: `0x${index.toString(16)}`,
      primary_stats: {
        strength: randRange(150, 300, 1),
        // accuracy: randRange(150, 300, 1),
        // agility: randRange(150, 300, 1),
        // mastery: randRange(150, 300, 1),
        // luck: randRange(150, 300, 1),
      },
      secondary_stats: {
        health: randRange(500, 1700, 1),
        speed: randRange(500, 1700, 1),
        dura_ammo: randRange(1, 2, 1),
        dodge_chance: randRangeProb(0.3, 0.5, 1),
        hit_chance: randRangeProb(0.4, 1, 1),
        critical_chance: randRangeProb(0.1, 0.5, 1),
        // supportEffectiveness: randRangeProb(0.4, 1, 1),
        // SupportTriggerChance: randRangeProb(0.4, 1, 1),
        melee_damage: randRangeProb(0.4, 1, 1),
      },
      primary_equipment: weaponCreator("Normal"),
      // defaultEquipment: weaponCreator("Default"),
      // items: getItems(3),
      // passiveAbilities: getPassiveAbility(),
    };

    if (i == 1) {
      team_a.player_1 = char;
    } else if (i == 2) {
      team_a.player_2 = char;
    }
    // and so on
  }
  let team_b: any = {};
  for (let i = 1; i <= teamBNumber; i++) {
    let index = i + 5;
    let char = {
      // name: name2[i - 1],
      // type: "HUMAN",
      // nftId: `0x${index.toString(16)}`,
      primary_stats: {
        strength: randRange(150, 300, 1),
        accuracy: randRange(150, 300, 1),
        agility: randRange(150, 300, 1),
        mastery: randRange(150, 300, 1),
        luck: randRange(150, 300, 1),
      },
      secondary_stats: {
        health: randRange(500, 1700, 1),
        speed: randRange(500, 1700, 1),
        dura_ammo: randRange(1, 2, 1),
        dodge_chance: randRangeProb(0.3, 0.5, 1),
        hit_chance: randRangeProb(0.4, 1, 1),
        critical_chance: randRangeProb(0.1, 0.5, 1),
        // supportEffectiveness: randRangeProb(0.4, 1, 1),
        // SupportTriggerChance: randRangeProb(0.4, 1, 1),
        melee_damage: randRangeProb(0.4, 1, 1),
      },
      primary_equipment: weaponCreator("Normal"),
      // defaultEquipment: weaponCreator("Default"),
      // items: getItems(3),
      // passiveAbilities: getPassiveAbility(),
    };
    if (i == 1) {
      team_b.player_1 = char;
    } else if (i == 2) {
      team_b.player_2 = char;
    }
    // and so on
    // team_b.push(char);
  }
  return { team_a, team_b };
}

export function createPayload(simId: number, playersPerTeam: number) {
  const { team_a, team_b } = createRandomTeams(playersPerTeam, playersPerTeam);
  return {
    // roomId: `gangwar#${simId}`,
    // simulationId: simId,
    // duration: `0x23C34600`, //10 minutes
    // objectives: ["0x1"],
    team_a: team_a,
    team_b: team_b,
  };
}
