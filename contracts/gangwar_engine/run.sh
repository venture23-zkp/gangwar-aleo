# First check that Leo is installed.
if ! command -v leo &> /dev/null
then
    echo "leo is not installed."
    exit
fi

P1_ADDR=aleo15g9c69urtdhvfml0vjl8px07txmxsy454urhgzk57szmcuttpqgq5cvcdy
P1_VIEW_KEY=AViewKey1fSyEPXxfPFVgjL6qcM9izWRGrhSHKXyN3c64BNsAjnA6
P1_PRIVATE_KEY=APrivateKey1zkpGKaJY47BXb6knSqmT3JZnBUEGBDFAWz2nMVSsjwYpJmm

P2_ADDR=aleo1wyvu96dvv0auq9e4qme54kjuhzglyfcf576h0g3nrrmrmr0505pqd6wnry
P2_VIEW_KEY=AViewKey1hh6dvSEgeMdfseP4hfdbNYjX4grETwCuTbKnCftkpMwE
P2_PRIVATE_KEY=APrivateKey1zkp86FNGdKxjgAdgQZ967bqBanjuHkAaoRe19RK24ZCGsHH

echo "{
    \"program\": \"gangstabet_engine.aleo\",
    \"version\": \"0.0.0\",
    \"description\": \"\",
    \"development\": {
        \"private_key\": \"${P1_PRIVATE_KEY}\",
        \"view_key\": \"${P1_VIEW_KEY}\",
        \"address\": \"${P1_ADDR}\"
    },
    \"license\": \"MIT\"
}" > program.json



# TEAM_A='{player_1:{primary_stats:{strength:289u128},secondary_stats:{health:1007u128,speed:1197u128,dura_ammo:1u128,dodge_chance:148193045380736063463374607431768211455u128,hit_chance:142476168764691463463374607431768211455u128,critical_chance:97886783864153863463374607431768211455u128,melee_damage:272304252579574463463374607431768211455u128},primary_equipment:{id:13u128,type:1field,consumption_rate:11u128,critical_chance:0u128,damage:177u128,dura_ammo:180u128,hit_chance:177122105436891563463374607431768211455u128,number_of_hits:3u128,is_broken:false}}}'
# TEAM_A='{ player_1: { primary_stats: { strength: 100u128 }, secondary_stats: { health: 100u128, dodge_chance: 100u128, hit_chance: 100u128, critical_chance: 100u128, melee_damage: 100u128 }, primary_equipment: { id: 1u128, type: 1u128, consumption_rate: 100u128, critical_chance: 10u128, dura_ammo: 1000u128, damage: 10u128, hit_chance: 10u128, number_of_hits: 10u128, is_broken: false }, multipliers: { dodge_chance: 1u128 } } }'
# TEAM_B='{player_1:{primary_stats:{strength:213u128,accuracy:236u128,agility:191u128,mastery:284u128,luck:175u128},secondary_stats:{health:761u128,speed:589u128,dura_ammo:1u128,dodge_chance:151983403762150163463374607431768211455u128,hit_chance:232545501550095163463374607431768211455u128,critical_chance:156356448960807563463374607431768211455u128,melee_damage:283846638997548863463374607431768211455u128},primary_equipment:{id:3u128,type:1field,consumption_rate:17u128,critical_chance:0u128,damage:182u128,dura_ammo:132u128,hit_chance:125941150263042963463374607431768211455u128,number_of_hits:3u128,is_broken:false}}}'

# leo run start_game "${TEAM_A}" "${TEAM_B}" "111u128"

# START_GAME_OUTPUT='{
#   owner: aleo15g9c69urtdhvfml0vjl8px07txmxsy454urhgzk57szmcuttpqgq5cvcdy.private,
#   main_team: {
#     player_1: {
#       primary_stats: {
#         strength: 100u128.private
#       },
#       secondary_stats: {
#         health: 100u128.private,
#         dodge_chance: 100u128.private,
#         hit_chance: 100u128.private,
#         critical_chance: 100u128.private,
#         melee_damage: 100u128.private
#       },
#       primary_equipment: {
#         id: 1u128.private,
#         type: 1u128.private,
#         consumption_rate: 1u128.private,
#         critical_chance: 10u128.private,
#         dura_ammo: 10u128.private,
#         damage: 10u128.private,
#         hit_chance: 10u128.private,
#         number_of_hits: 10u128.private,
#         is_broken: false.private
#       },
#       multipliers: {
#         dodge_chance: 1u128.private
#       }
#     }
#   },
#   target_team: {
#     player_1: {
#       primary_stats: {
#         strength: 100u128.private
#       },
#       secondary_stats: {
#         health: 100u128.private,
#         dodge_chance: 100u128.private,
#         hit_chance: 100u128.private,
#         critical_chance: 100u128.private,
#         melee_damage: 100u128.private
#       },
#       primary_equipment: {
#         id: 1u128.private,
#         type: 1u128.private,
#         consumption_rate: 1u128.private,
#         critical_chance: 10u128.private,
#         dura_ammo: 10u128.private,
#         damage: 10u128.private,
#         hit_chance: 10u128.private,
#         number_of_hits: 10u128.private,
#         is_broken: false.private
#       },
#       multipliers: {
#         dodge_chance: 1u128.private
#       }
#     }
#   },
#   _nonce: 5604718261090670130292987274251985861109876420140538846704238357955010390929group.public
# }'

# leo run game_loop "${START_GAME_OUTPUT}" "222u128"

# leo run game_loop "{owner:aleo15g9c69urtdhvfml0vjl8px07txmxsy454urhgzk57szmcuttpqgq5cvcdy.private,main_team:{player_1:{primary_stats:{strength:268u128},secondary_stats:{health:1343u128,dodge_chance:3.7949463068894163e+52463463374607431768211455u128,hit_chance:1.1368257660192704e+53463463374607431768211455u128,critical_chance:2.7963720117594377e+52463463374607431768211455u128,melee_damage:8.896642500375137e+52463463374607431768211455u128},primary_equipment:{id:12u128,w_type:2u128,consumption_rate:11u128,critical_chance:2.7269931243960143e+52463463374607431768211455u128,dura_ammo:129u128,damage:112u128,hit_chance:4.501467086826059e+52463463374607431768211455u128,number_of_hits:1u128,is_broken:false}}},target_team:{player_1:{primary_stats:{strength:226u128},secondary_stats:{health:824u128,dodge_chance:5.26797599705249e+52463463374607431768211455u128,hit_chance:6.098486357141384e+52463463374607431768211455u128,critical_chance:5.296242279606343e+52463463374607431768211455u128,melee_damage:1.0793070912369077e+53463463374607431768211455u128},primary_equipment:{id:14u128,w_type:2u128,consumption_rate:14u128,critical_chance:2.4050970334526693e+52463463374607431768211455u128,dura_ammo:110u128,damage:182u128,hit_chance:6.918268195802457e+52463463374607431768211455u128,number_of_hits:7u128,is_broken:false}}},_nonce:7697914027705046119265019171659877373607344417434981342261691829961177459439group.public}" 42u128

# leo run game_loop "{owner:aleo15g9c69urtdhvfml0vjl8px07txmxsy454urhgzk57szmcuttpqgq5cvcdy.private,main_team:{player_1:{primary_stats:{strength:295u128},secondary_stats:{health:1356u128,dodge_chance:144943679740528463463374607431768211455u128,hit_chance:213696022462997463463374607431768211455u128,critical_chance:121487486030251463463374607431768211455u128,melee_damage:159257744155030463463374607431768211455u128},primary_equipment:{id:2u128,w_type:1u128,consumption_rate:17u128,critical_chance:72494193303460463463374607431768211455u128,dura_ammo:133u128,damage:110u128,hit_chance:106359973329271463463374607431768211455u128,number_of_hits:1u128,is_broken:false}}},target_team:{player_1:{primary_stats:{strength:264u128},secondary_stats:{health:1247u128,dodge_chance:115127422487312463463374607431768211455u128,hit_chance:243579111340465463463374607431768211455u128,critical_chance:88279395803638463463374607431768211455u128,melee_damage:230881083945275463463374607431768211455u128},primary_equipment:{id:11u128,w_type:2u128,consumption_rate:10u128,critical_chance:96694098211431463463374607431768211455u128,dura_ammo:175u128,damage:150u128,hit_chance:174887150672237463463374607431768211455u128,number_of_hits:7u128,is_broken:false}}},_nonce:1417202506337155494562749818601318077816680522192172030453097836149389145029group.public}" 42u128

leo run game_loop "{owner:aleo15g9c69urtdhvfml0vjl8px07txmxsy454urhgzk57szmcuttpqgq5cvcdy.private,main_team:{player_1:{primary_stats:{strength:207u128.private},secondary_stats:{health:1619u128.private,dodge_chance:167476005702971463463374607431768211455u128.private,hit_chance:307336678760862463463374607431768211455u128.private,critical_chance:48766315319392463463374607431768211455u128.private,melee_damage:236348136933749463463374607431768211455u128.private},primary_equipment:{id:8u128.private,w_type:2u128.private,consumption_rate:14u128.private,critical_chance:1630802128506463463374607431768211455u128.private,dura_ammo:170u128.private,damage:124u128.private,hit_chance:110505917635997463463374607431768211455u128.private,number_of_hits:8u128.private,is_broken:false.private}}},target_team:{player_1:{primary_stats:{strength:238u128.private},secondary_stats:{health:1433u128.private,dodge_chance:164400091117552463463374607431768211455u128.private,hit_chance:329557455660062463463374607431768211455u128.private,critical_chance:126527394110911463463374607431768211455u128.private,melee_damage:275641482389885463463374607431768211455u128.private},primary_equipment:{id:9u128.private,w_type:2u128.private,consumption_rate:12u128.private,critical_chance:50210036946920463463374607431768211455u128.private,dura_ammo:177u128.private,damage:181u128.private,hit_chance:177992805947120463463374607431768211455u128.private,number_of_hits:7u128.private,is_broken:false.private}}},_nonce:4401153733596105769382903081096192331672141286072356419999955043679016334759group.public}" 42u128