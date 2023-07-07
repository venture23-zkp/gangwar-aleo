import { characterBracketPattern, warBracketPattern } from "../../types";
import { parseRecordString, parseRecordStringTest } from "./util";

jest.setTimeout(600000);

describe("Utilies Test", () => {
  // const recordString = `{ "owner" : "aleo15g9c69urtdhvfml0vjl8px07txmxsy454urhgzk57szmcuttpqgq5cvcdy.private" , "main_team" : { "player_1" : { "primary_stats" : { "strength" : "189u128.private" , }}, "secondary_stats" : { "health" : "1203u128.private" , }}, "primary_equipment" : { "id" : "3u128.private" , }} }, "player_2" : { "primary_stats" : { "strength" : "160u128.private" , }}, "secondary_stats" : { "health" : "1105u128.private" , }}, "primary_equipment" : { "id" : "3u128.private" , } } }, "target_team" : { "player_1" : { "primary_stats" : { "strength" : "234u128.private" , }}, "secondary_stats" : { "health" : "1136u128.private" , }}, "primary_equipment" : { "id" : "13u128.private" , }} },"player_2" : { "primary_stats" : { "strength" : "212u128.private" , }}, "secondary_stats" : { "health" : "754u128.private" , }}, "primary_equipment" : { "id" : "2u128.private" , } } }, "_nonce" : "3513486177675880197372663134191714822319659637298638843143809159985282661750group.public" }`;

  // it("Initialize the game with a random seed", async () => {
  //   const { owner, privateKey, viewKey, startingSeed } = keys;
  //   const res = await gangwar.initialize(privateKey, viewKey, startingSeed);
  //   console.log(res);
  // });

  it("Test record string", async () => {
    // parseRecordStringTest(recordString, warBracketPattern(2, 2));
  });
});
