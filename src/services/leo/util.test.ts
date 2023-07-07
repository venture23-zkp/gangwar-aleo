import { characterBracketPattern, warBracketPattern } from "../../types";
import { parseRecordString } from "./util";

jest.setTimeout(600000);

describe("Utilies Test", () => {
  // const recordString = `{ "owner" : "aleo15g9c69urtdhvfml0vjl8px07txmxsy454urhgzk57szmcuttpqgq5cvcdy.private" , "main_team" : { "player_1" : { "primary_stats" : { "strength" : "189u128.private" , }}, "secondary_stats" : { "health" : "1203u128.private" , }}, "primary_equipment" : { "id" : "3u128.private" , }} }, "player_2" : { "primary_stats" : { "strength" : "160u128.private" , }}, "secondary_stats" : { "health" : "1105u128.private" , }}, "primary_equipment" : { "id" : "3u128.private" , } } }, "target_team" : { "player_1" : { "primary_stats" : { "strength" : "234u128.private" , }}, "secondary_stats" : { "health" : "1136u128.private" , }}, "primary_equipment" : { "id" : "13u128.private" , }} },"player_2" : { "primary_stats" : { "strength" : "212u128.private" , }}, "secondary_stats" : { "health" : "754u128.private" , }}, "primary_equipment" : { "id" : "2u128.private" , } } }, "_nonce" : "3513486177675880197372663134191714822319659637298638843143809159985282661750group.public" }`;

  const recordStringRaw = `{owner: aleo15g9c69urtdhvfml0vjl8px07txmxsy454urhgzk57szmcuttpqgq5cvcdy.private,main_team: {player_1: {primary_stats: {strength: 254u128.private}},secondary_stats: {health: 1130u128.private,dodge_chance: 156579650307253463463374607431768211455u128.private,hit_chance: 288848884863404463463374607431768211455u128.private,critical_chance: 82663461669827463463374607431768211455u128.private,melee_damage: 194686696221238463463374607431768211455u128.private}},primary_equipment: {id: 12u128.private,w_type: 2u128.private,consumption_rate: 17u128.private,critical_chance: 36531656733520463463374607431768211455u128.private,dura_ammo: 177u128.private,damage: 139u128.private,hit_chance: 224760565228192463463374607431768211455u128.private,number_of_hits: 4u128.private,is_broken: false.private}}},target_team: {player_1: {primary_stats: {strength: 237u128.private}},secondary_stats: {health: 776u128.private,dodge_chance: 109950372090933463463374607431768211455u128.private,hit_chance: 316315489903825463463374607431768211455u128.private,critical_chance: 53603842395517463463374607431768211455u128.private,melee_damage: 328566870808774463463374607431768211455u128.private}},primary_equipment: {id: 10u128.private,w_type: 2u128.private,consumption_rate: 16u128.private,critical_chance: 91092183174713463463374607431768211455u128.private,dura_ammo: 169u128.private,damage: 197u128.private,hit_chance: 110949978212341463463374607431768211455u128.private,number_of_hits: 4u128.private,is_broken: false.private}}},_nonce: 2077463147515741928075881559217498762829759826834517111376279900669782571665group.public}`;
  // const recordStringShort = `{"o" : "aleo" ,"main" : {"p1" : {"pstats" : {"str" : "254" }},"sStats" : {"health" : "1130" }},"pEqip" : {"id" : "1" }}},"target" : {"p1" : {"pStats" : {"strength" : "23" }},"sStats" : {"health" : "77" ,}},"pEquip" : {"id" : "10}}},"_nonce" : "20" }`;

  // it("Initialize the game with a random seed", async () => {
  //   const { owner, privateKey, viewKey, startingSeed } = keys;
  //   const res = await gangwar.initialize(privateKey, viewKey, startingSeed);
  //   console.log(res);
  // });

  it("Test record string", async () => {
    parseRecordString(recordStringRaw, warBracketPattern(1, 1));
  });
});
