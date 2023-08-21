import { js2leo } from "../../parsers/js2leo";
import { leo2js } from "../../parsers/leo2js";
import { characterBracketPattern, warBracketPattern } from "../../types";
import { decryptRecord, parseRecordString } from "./util";

jest.setTimeout(600000);

describe("Utilies Test", () => {
  // const recordString = `{ "owner" : "aleo15g9c69urtdhvfml0vjl8px07txmxsy454urhgzk57szmcuttpqgq5cvcdy.private" , "main_team" : { "player_1" : { "primary_stats" : { "strength" : "189u128.private" , }}, "secondary_stats" : { "health" : "1203u128.private" , }}, "primary_equipment" : { "id" : "3u128.private" , }} }, "player_2" : { "primary_stats" : { "strength" : "160u128.private" , }}, "secondary_stats" : { "health" : "1105u128.private" , }}, "primary_equipment" : { "id" : "3u128.private" , } } }, "target_team" : { "player_1" : { "primary_stats" : { "strength" : "234u128.private" , }}, "secondary_stats" : { "health" : "1136u128.private" , }}, "primary_equipment" : { "id" : "13u128.private" , }} },"player_2" : { "primary_stats" : { "strength" : "212u128.private" , }}, "secondary_stats" : { "health" : "754u128.private" , }}, "primary_equipment" : { "id" : "2u128.private" , } } }, "_nonce" : "3513486177675880197372663134191714822319659637298638843143809159985282661750group.public" }`;

  const recordStringRaw = `{owner: aleo15g9c69urtdhvfml0vjl8px07txmxsy454urhgzk57szmcuttpqgq5cvcdy.private,main_team: {player_1: {primary_stats: {strength: 254u128.private}},secondary_stats: {health: 1130u128.private,dodge_chance: 156579650307253463463374607431768211455u128.private,hit_chance: 288848884863404463463374607431768211455u128.private,critical_chance: 82663461669827463463374607431768211455u128.private,melee_damage: 194686696221238463463374607431768211455u128.private}},primary_equipment: {id: 12u128.private,w_type: 2u128.private,consumption_rate: 17u128.private,critical_chance: 36531656733520463463374607431768211455u128.private,dura_ammo: 177u128.private,damage: 139u128.private,hit_chance: 224760565228192463463374607431768211455u128.private,number_of_hits: 4u128.private,is_broken: false.private}}},target_team: {player_1: {primary_stats: {strength: 237u128.private}},secondary_stats: {health: 776u128.private,dodge_chance: 109950372090933463463374607431768211455u128.private,hit_chance: 316315489903825463463374607431768211455u128.private,critical_chance: 53603842395517463463374607431768211455u128.private,melee_damage: 328566870808774463463374607431768211455u128.private}},primary_equipment: {id: 10u128.private,w_type: 2u128.private,consumption_rate: 16u128.private,critical_chance: 91092183174713463463374607431768211455u128.private,dura_ammo: 169u128.private,damage: 197u128.private,hit_chance: 110949978212341463463374607431768211455u128.private,number_of_hits: 4u128.private,is_broken: false.private}}},_nonce: 2077463147515741928075881559217498762829759826834517111376279900669782571665group.public}`;
  // const recordStringShort = `{"o" : "aleo" ,"main" : {"p1" : {"pstats" : {"str" : "254" }},"sStats" : {"health" : "1130" }},"pEqip" : {"id" : "1" }}},"target" : {"p1" : {"pStats" : {"strength" : "23" }},"sStats" : {"health" : "77" ,}},"pEquip" : {"id" : "10}}},"_nonce" : "20" }`;
  const encryptedRecordRaw =
    "record1qyqsqu7tgw7uhevf7zr9ejn4ntvspgg9wpcky05zlu3nj5zcqr43mhqfq5xhx6tdw4kxzarfdah976tyyvqqyqgqkhz732fyxj3j8qhkuddzazjjzx03tugudtelv4xhnrw97z0whyps2un0w4hxggcqqgqsqpqt80n0ppk4n374fxh6tdd4w48ghmazm89tzt0xgmmcwjj9zxqdp9kkz6twta6x2ctdgvpqyysqx2kee2eegywl3zjxccg6s2g2sfmgah9pwkycl6ndl9sv35td6srejvfr3nqs4ptus6g7qyqehkhq6rfyhhavljg5cfyrgyrmnknvupcfccltddp4yxd90zwj6wtskdupkjfa4yz3jnr2k4zn08f7kh6xzx6z9nffrpzd650at9v8shxg6csqsmn3dd9wsaqlku9yrleea2xqh42k5s3svtwurv37ge3fx6nrzdpa25hm5wmh5zmam0trm6qef9sx5pdz2knweu7k8ssh49y9mun5dyy7k3tpapza8gq82gmc6gtktqf2fyfczc0cq47amjavug2wwzlls26ygardpxp0a8xamvk85msrkq8fzcdkf0hcpj9pqe3l5ju82v3ghj59l9uj060a2tqn0vnxl3thq4hmnkz0w2vlrt0e0th3vm7hx7wcxdxkmjv4w6sx2vmdjwte59asn22vhzw26s5306h9ux7cdesvqg2kfe9ft04mq5q6cz0su9kua9svvsqgjnt0dzvgwnghlcffs7899aru75k7zy88cvj3nmdlufqe85qxnsuhf638fh53sw08elcq6fs8tc395f87mu9a3jceawfgvwymqzqdyrq33rsyllcav7cd2jj0tcnygfpm9knyq0lytx8qzk39v8slpsw4ealp7g2395hzj23gtwjc8vzzx32tl2cswjx2yyep6684g6ksjmt52m38zr8ms7spxus0f9hc7kuaj2ndpyy0hvg68hh92u92djc857d53zs2y4nujzpv9tkvev4t0004rtkgsxsa8gwyjfyuxrhcpqqaf34edemy6jqh4r55dgvcxyhya9mvg5lwxwsadgw7uqc9kwe02rdvje0hgh23f6uhcdpha4hx2ekq8qpwq07s2z8ca9wunyukxun2qs9hgctjvajhghm5v4sk6sczqgfqqmzduc3sl2f80gmmy48680eg9z3x9a0jk8cvn2lu4panl0utkkqtdz2txu6e4fs3rwav568z5mp0ypfnl6de4p2ucpss26rdy267h5glgsxr37cw0ylrscvc82f804auf9pdt3mxs9kmzgtyfnkryv566zgpqw8qgcu6gqj5uhqmxlznvch0nw88zndrrzflm5vdazhl8gatpu32rjnp47gum60sclhaw3n4z8w4fdrk7s6agcj9a3m83ptycrwq8lczrelzha9xqf0ctr3m7dsqv7qsxhj4wfhn5dzv3jxss8gz5jg002vjkrehdxagnmu65ccdnxdwru0pnhj08d8y69tcrng603zupvx24te2nat74tthhcxf89tatukchpu7flx5jt907jq45x2h2zrdszn6cnnqpe0rwls6wcf2g6cc3vx378g3m9j3jet9e992vevxd0dfpkpvrjz6jvdzx4q9tsgrxvhu4k2xgf7j5pyc273649u2sp795xvsczkultqzcwpx8k06t2qwfnjr974nts27u9nwtp7p9749qdj7nzgzh7s4f2sd9uhtqhnfgx3sz7n0t0a9knxy4q4f29dll9t0p5z5ru9t6ermxhmtlnx9jqsn2sm966ql37v2nat962jd0dmc752n3gy2krd4z4gvm3ly374y7epttpt3sf22xp28lkr85qpgxmy84mtp8m76p3me3l477hasqh7ujhtsaz67jnttsn8ndjcnpwu4sm6j3g98w0ss6re4250t7smr4dykx3hm8238748ntl39cdm24zwa8s8n73gvqvcgfzqdur2782ptn72d05krzgjth75xmurf5t4pxfqmkglcjaenty95pdquc7ale9mjg7qcrt6zxletrgmqj950wj4puwt2ekznn3hjjzs0wp58jumfvdskchmpw36xzcmtcvqqypsq7rs4wh4wrxml58ph0pt35zzpdqnxr7t3rsqcf6r9ukevgt54auyrs20pd6jacc2uux0y5ruyuqfvjt0z866ry620qqdaqhsry2eckpgqxcj5x06jl6z335yfyqlm0l59ynw3hq5ycgrxn8dxw5xvr0jpqf3pnj2e0cezz6caxc6cm58f28e08tf6p82krdt83ucc320zxpksxtt9mk27wsn86mu660djh9el8n50ah2nr9xyfjmexczzpa4yufcx689426ta4s8f3nkrq6m7fr6dphmxkeenkmpd82w0glzw4m4cnyyy090xqg3m338c4lyajv94a6npmjpdn4exs6pcq7hr269t3x7gkyg5ygpzn";
  const viewKey = "AViewKey1mSnpFFC8Mj4fXbK5YiWgZ3mjiV8CxA79bYNa8ymUpTrw";

  // it("Test record string", async () => {
  //   parseRecordString(recordStringRaw, warBracketPattern(1, 1));
  // });

  // it("Decrypt and test", async () => {
  //   const decryptedRecord = await decryptRecord(encryptedRecordRaw, viewKey, warBracketPattern(1, 1));
  //   console.log(decryptedRecord);
  // });

  it("Probability u16", async () => {
    // const prob = Math.random();
    const prob = 0.391;
    let probInUint16 = js2leo.u16Prob(prob);
    let probInNumber = leo2js.u16Prob(probInUint16);
    console.log(probInUint16, probInNumber);

    probInUint16 = js2leo.u16Prob(probInNumber);
    console.log(probInNumber, probInUint16);
  });
});
