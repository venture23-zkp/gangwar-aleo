import { gangwar } from "./gangwar";
import { core } from "../../core";
import { War, warLeoSchema } from "../../types";
import { start } from "repl";

jest.setTimeout(600000);

describe("Gangwar Service", () => {
  const keys = {
    owner: "aleo1z9rkh2xecmpnx9jxkvnyq08mfeddrsrccny0j2hgw4yfhnxpxyqqp42329",
    privateKey: "APrivateKey1zkp3WTnfDxUchbLeHqwGrgdkTNieykUP72UPNmv4uQngjwf",
    viewKey: "AViewKey1fvqnzQ9nYfFMAkhjdcz5UEtDD1JjpbtG8kMXBLJKAHbd",
  };

  let war: War;

  // it("Placeholder", async () => {
  //   console.log("Placeholder");
  // });

  // it("Initialize the game with a random seed", async () => {
  //   const { owner, privateKey, viewKey, startingSeed } = keys;
  //   const res = await gangwar.initialize(privateKey, viewKey, startingSeed);
  //   console.log(res);
  // });

  it("Starts the game with two teams", async () => {
    const { owner, privateKey, viewKey } = keys;

    const simId = "123";
    // const { teamA, teamB, simulationId } = core.createPayload(simId, 2);

    const teamA = {
      player_1: {
        nftId: 1,
        primaryStats: { strength: 214 },
        secondaryStats: {
          health: 1023,
          dodgeChance: 0.43093928440360857,
          hitChance: 0.16799992127127047,
          criticalChance: 0.14580970808704566,
          meleeDamage: 0.834960115215087,
        },
        primaryEquipment: {
          id: 5,
          type: 1,
          consumptionRate: 13,
          criticalChance: 0.07981157237227225,
          damage: 170,
          duraAmmo: 168,
          hitChance: 0.6490033077036278,
          numberOfHits: 5,
          isBroken: false,
        },
      },
    };

    const teamB = {
      player_1: {
        nftId: 2,
        primaryStats: { strength: 256 },
        secondaryStats: {
          health: 561,
          dodgeChance: 0.39985317653361185,
          hitChance: 0.11445590517731072,
          criticalChance: 0.29896814249394266,
          meleeDamage: 0.445982293055327,
        },
        primaryEquipment: {
          id: 4,
          type: 1,
          consumptionRate: 10,
          criticalChance: 0.16400151403404126,
          damage: 146,
          duraAmmo: 116,
          hitChance: 0.5103711991776986,
          numberOfHits: 8,
          isBroken: false,
        },
      },
    };

    console.log(JSON.stringify(teamA));
    console.log(JSON.stringify(teamB));

    // TODO: Starting seed needs to be the one that's stored on chain
    // So need a way to fetch and store it
    // For now let's use startingSeed = 1
    const startingSeed = "1";
    war = await gangwar.startGame(privateKey, viewKey, owner, simId, teamA, teamB);
    console.log(JSON.stringify(war));
  });

  // it("Play the game", async () => {
  //   const { owner, privateKey, viewKey } = keys;
  //   const war: War = {
  //     owner: "aleo15g9c69urtdhvfml0vjl8px07txmxsy454urhgzk57szmcuttpqgq5cvcdy.private",
  //     simulationId: "123u128.private",
  //     round: 0,
  //     mainTeam: {
  //       player_1: {
  //         nftId: 5305,
  //         primaryStats: { strength: 226 },
  //         secondaryStats: {
  //           health: 1530,
  //           dodgeChance: 0.4436036331060586,
  //           hitChance: 0.08308286075394761,
  //           criticalChance: 0.2059367036398738,
  //           meleeDamage: 0.6958860264418584,
  //         },
  //         primaryEquipment: {
  //           id: 14,
  //           type: 0,
  //           consumptionRate: 17,
  //           criticalChance: 0.1953940964301634,
  //           duraAmmo: 137,
  //           damage: 103,
  //           hitChance: 0.6038223594453261,
  //           numberOfHits: 4,
  //           isBroken: false,
  //         },
  //       },
  //     },
  //     targetTeam: {
  //       player_1: {
  //         nftId: 3412,
  //         primaryStats: { strength: 245 },
  //         secondaryStats: {
  //           health: 1345,
  //           dodgeChance: 0.3765843500178236,
  //           hitChance: 0.03727897836856869,
  //           criticalChance: 0.49800603453909015,
  //           meleeDamage: 0.6303408512458185,
  //         },
  //         primaryEquipment: {
  //           id: 6,
  //           type: 1,
  //           consumptionRate: 18,
  //           criticalChance: 0.15385655331755174,
  //           duraAmmo: 181,
  //           damage: 172,
  //           hitChance: 0.4589467069427763,
  //           numberOfHits: 7,
  //           isBroken: false,
  //         },
  //       },
  //     },
  //     physicalAttack: {
  //       isDodged: true,
  //       isHit: false,
  //       isCritical: false,
  //       totalCriticalHits: 0,
  //       totalNormalHits: 0,
  //       totalHits: 0,
  //       damage: 0,
  //     },
  //     _nonce: "3399030393888732710219135107453605892513877633692561480644792677407543462661group.public",
  //   };
  //   const startingSeed = "123154";
  //   const res = await gangwar.gameLoop(privateKey, viewKey, owner, war);
  //   console.log(res);
  // });
});
