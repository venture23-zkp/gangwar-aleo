import { characterSchema, GangwarSettings, Player, War } from "../../types";
import { gangwar } from "./gangwar";
import { createCharacters } from "../../core/gangwar";

jest.setTimeout(600000);

describe("Gangwar Service", () => {
  const keys = {
    owner: "aleo1z9rkh2xecmpnx9jxkvnyq08mfeddrsrccny0j2hgw4yfhnxpxyqqp42329",
    privateKey: "APrivateKey1zkp3WTnfDxUchbLeHqwGrgdkTNieykUP72UPNmv4uQngjwf",
    viewKey: "AViewKey1fvqnzQ9nYfFMAkhjdcz5UEtDD1JjpbtG8kMXBLJKAHbd",
  };

  const schnorrKeys = {
    sk: "2", // secret key
    k: "1", // one time signature key
  };

  let playerRecord: Player;
  let war: War;

  it("Create game", async () => {
    const { owner, privateKey, viewKey } = keys;

    const simulationId = 1;
    const registrationDuration = 1000;
    const maxNumberOfPlayers = 10;
    const maxRounds = 10;

    const settings: GangwarSettings = await gangwar.createGame(
      privateKey,
      viewKey,
      simulationId,
      registrationDuration,
      maxNumberOfPlayers,
      maxRounds
    );
  });

  it("Update game registrationTime", async () => {
    const { owner, privateKey, viewKey } = keys;

    const simulationId = 1;
    const registrationDuration = 1000;
    const maxNumberOfPlayers = 10;
    const maxRounds = 10;

    const settings: GangwarSettings = await gangwar.updateRegistrationTime(privateKey, viewKey, simulationId, registrationDuration);
  });

  it("Sign a Character", async () => {
    const { owner, privateKey, viewKey } = keys;
    const { sk, k } = schnorrKeys;

    const character = createCharacters(1, ["Apple"])[0];
    console.log(character);
    console.log(JSON.stringify(character));

    const validityTimestamp = 200; // 100 blocks
    const signature = await gangwar.sign(character, sk, k);
    console.log(signature);
  });

  it("Join a Game", async () => {
    const { owner, privateKey, viewKey } = keys;
    const { sk, k } = schnorrKeys;

    const character = createCharacters(1, ["Apple"])[0];

    const validityTimestamp = 200; // 100 blocks
    const { signature } = await gangwar.sign(character, sk, k);

    const simulationId = 1;
    playerRecord = await gangwar.joinGame(privateKey, viewKey, simulationId, character, signature);
    console.log(JSON.stringify(playerRecord));
  });

  it("Start the Game", async () => {
    const PLAYER_COUNT = 6;
    const { owner, privateKey, viewKey } = keys;
    const simulationId = 1;

    const players: Player[] = [];
    for (let i = 0; i < PLAYER_COUNT; i++) {
      players.push(playerRecord);
    }
    war = await gangwar.startGame(privateKey, viewKey, simulationId, players);
    console.log(JSON.stringify(war));
  });

  it("Simulate 1vs1", async () => {
    const { owner, privateKey, viewKey } = keys;
    const simulationId = 1;

    let war: War = {
      owner: "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px",
      simulationId: 1,
      round: 0,
      mainTeam: {
        p1: {
          nftId: 571,
          playerAddr: "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px",
          primaryStats: { strength: 250 },
          secondaryStats: {
            health: 851,
            dodgeChance: 0.4418182373046875,
            hitChance: 0.10986328125,
            criticalChance: 0.415557861328125,
            meleeDamage: 0.777618408203125,
          },
          primaryEquipment: {
            id: 13,
            type: 2,
            consumptionRate: 11,
            criticalChance: 0.0989532470703125,
            duraAmmo: 123,
            damage: 188,
            hitChance: 0.674407958984375,
            numberOfHits: 5,
            isBroken: false,
          },
        },
        p2: {
          nftId: 571,
          playerAddr: "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px",
          primaryStats: { strength: 250 },
          secondaryStats: {
            health: 851,
            dodgeChance: 0.4418182373046875,
            hitChance: 0.10986328125,
            criticalChance: 0.415557861328125,
            meleeDamage: 0.777618408203125,
          },
          primaryEquipment: {
            id: 13,
            type: 2,
            consumptionRate: 11,
            criticalChance: 0.0989532470703125,
            duraAmmo: 123,
            damage: 188,
            hitChance: 0.674407958984375,
            numberOfHits: 5,
            isBroken: false,
          },
        },
        p3: {
          nftId: 571,
          playerAddr: "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px",
          primaryStats: { strength: 250 },
          secondaryStats: {
            health: 851,
            dodgeChance: 0.4418182373046875,
            hitChance: 0.10986328125,
            criticalChance: 0.415557861328125,
            meleeDamage: 0.777618408203125,
          },
          primaryEquipment: {
            id: 13,
            type: 2,
            consumptionRate: 11,
            criticalChance: 0.0989532470703125,
            duraAmmo: 123,
            damage: 188,
            hitChance: 0.674407958984375,
            numberOfHits: 5,
            isBroken: false,
          },
        },
      },
      targetTeam: {
        p1: {
          nftId: 571,
          playerAddr: "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px",
          primaryStats: { strength: 250 },
          secondaryStats: {
            health: 851,
            dodgeChance: 0.4418182373046875,
            hitChance: 0.10986328125,
            criticalChance: 0.415557861328125,
            meleeDamage: 0.777618408203125,
          },
          primaryEquipment: {
            id: 13,
            type: 2,
            consumptionRate: 11,
            criticalChance: 0.0989532470703125,
            duraAmmo: 123,
            damage: 188,
            hitChance: 0.674407958984375,
            numberOfHits: 5,
            isBroken: false,
          },
        },
        p2: {
          nftId: 571,
          playerAddr: "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px",
          primaryStats: { strength: 250 },
          secondaryStats: {
            health: 851,
            dodgeChance: 0.4418182373046875,
            hitChance: 0.10986328125,
            criticalChance: 0.415557861328125,
            meleeDamage: 0.777618408203125,
          },
          primaryEquipment: {
            id: 13,
            type: 2,
            consumptionRate: 11,
            criticalChance: 0.0989532470703125,
            duraAmmo: 123,
            damage: 188,
            hitChance: 0.674407958984375,
            numberOfHits: 5,
            isBroken: false,
          },
        },
        p3: {
          nftId: 571,
          playerAddr: "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px",
          primaryStats: { strength: 250 },
          secondaryStats: {
            health: 851,
            dodgeChance: 0.4418182373046875,
            hitChance: 0.10986328125,
            criticalChance: 0.415557861328125,
            meleeDamage: 0.777618408203125,
          },
          primaryEquipment: {
            id: 13,
            type: 2,
            consumptionRate: 11,
            criticalChance: 0.0989532470703125,
            duraAmmo: 123,
            damage: 188,
            hitChance: 0.674407958984375,
            numberOfHits: 5,
            isBroken: false,
          },
        },
      },
      physicalAttack: {
        main: 0,
        target: 0,
        isDodged: true,
        isHit: false,
        isCritical: false,
        totalCriticalHits: 0,
        totalNormalHits: 0,
        totalHits: 0,
        damage: 0,
      },
      _nonce: "5967208642365040317664589798037377633370747933762135825300342793493163170453",
    };

    const updatedWar = await gangwar.simulate1vs1(privateKey, viewKey, war);
    war = updatedWar;
    console.log(JSON.stringify(updatedWar));
  });

  it("Finish Game", async () => {
    const { owner, privateKey, viewKey } = keys;
    const simulationId = 1;

    let war: War = {
      owner: "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px",
      simulationId: 1,
      round: 0,
      mainTeam: {
        p1: {
          nftId: 571,
          playerAddr: "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px",
          primaryStats: { strength: 250 },
          secondaryStats: {
            health: 851,
            dodgeChance: 0.4418182373046875,
            hitChance: 0.10986328125,
            criticalChance: 0.415557861328125,
            meleeDamage: 0.777618408203125,
          },
          primaryEquipment: {
            id: 13,
            type: 2,
            consumptionRate: 11,
            criticalChance: 0.0989532470703125,
            duraAmmo: 123,
            damage: 188,
            hitChance: 0.674407958984375,
            numberOfHits: 5,
            isBroken: false,
          },
        },
        p2: {
          nftId: 571,
          playerAddr: "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px",
          primaryStats: { strength: 250 },
          secondaryStats: {
            health: 851,
            dodgeChance: 0.4418182373046875,
            hitChance: 0.10986328125,
            criticalChance: 0.415557861328125,
            meleeDamage: 0.777618408203125,
          },
          primaryEquipment: {
            id: 13,
            type: 2,
            consumptionRate: 11,
            criticalChance: 0.0989532470703125,
            duraAmmo: 123,
            damage: 188,
            hitChance: 0.674407958984375,
            numberOfHits: 5,
            isBroken: false,
          },
        },
        p3: {
          nftId: 571,
          playerAddr: "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px",
          primaryStats: { strength: 250 },
          secondaryStats: {
            health: 851,
            dodgeChance: 0.4418182373046875,
            hitChance: 0.10986328125,
            criticalChance: 0.415557861328125,
            meleeDamage: 0.777618408203125,
          },
          primaryEquipment: {
            id: 13,
            type: 2,
            consumptionRate: 11,
            criticalChance: 0.0989532470703125,
            duraAmmo: 123,
            damage: 188,
            hitChance: 0.674407958984375,
            numberOfHits: 5,
            isBroken: false,
          },
        },
      },
      targetTeam: {
        p1: {
          nftId: 571,
          playerAddr: "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px",
          primaryStats: { strength: 250 },
          secondaryStats: {
            health: 851,
            dodgeChance: 0.4418182373046875,
            hitChance: 0.10986328125,
            criticalChance: 0.415557861328125,
            meleeDamage: 0.777618408203125,
          },
          primaryEquipment: {
            id: 13,
            type: 2,
            consumptionRate: 11,
            criticalChance: 0.0989532470703125,
            duraAmmo: 123,
            damage: 188,
            hitChance: 0.674407958984375,
            numberOfHits: 5,
            isBroken: false,
          },
        },
        p2: {
          nftId: 571,
          playerAddr: "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px",
          primaryStats: { strength: 250 },
          secondaryStats: {
            health: 851,
            dodgeChance: 0.4418182373046875,
            hitChance: 0.10986328125,
            criticalChance: 0.415557861328125,
            meleeDamage: 0.777618408203125,
          },
          primaryEquipment: {
            id: 13,
            type: 2,
            consumptionRate: 11,
            criticalChance: 0.0989532470703125,
            duraAmmo: 123,
            damage: 188,
            hitChance: 0.674407958984375,
            numberOfHits: 5,
            isBroken: false,
          },
        },
        p3: {
          nftId: 571,
          playerAddr: "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px",
          primaryStats: { strength: 250 },
          secondaryStats: {
            health: 851,
            dodgeChance: 0.4418182373046875,
            hitChance: 0.10986328125,
            criticalChance: 0.415557861328125,
            meleeDamage: 0.777618408203125,
          },
          primaryEquipment: {
            id: 13,
            type: 2,
            consumptionRate: 11,
            criticalChance: 0.0989532470703125,
            duraAmmo: 123,
            damage: 188,
            hitChance: 0.674407958984375,
            numberOfHits: 5,
            isBroken: false,
          },
        },
      },
      physicalAttack: {
        main: 0,
        target: 0,
        isDodged: true,
        isHit: false,
        isCritical: false,
        totalCriticalHits: 0,
        totalNormalHits: 0,
        totalHits: 0,
        damage: 0,
      },
      _nonce: "5967208642365040317664589798037377633370747933762135825300342793493163170453",
    };

    await gangwar.finishGame(privateKey, viewKey, war);
  });
});
