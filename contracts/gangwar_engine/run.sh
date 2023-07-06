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



TEAM_A='{player_1:{primary_stats:{strength:289u128},secondary_stats:{health:1007u128,speed:1197u128,dura_ammo:1u128,dodge_chance:148193045380736063463374607431768211455u128,hit_chance:142476168764691463463374607431768211455u128,critical_chance:97886783864153863463374607431768211455u128,melee_damage:272304252579574463463374607431768211455u128},primary_equipment:{id:13u128,type:1field,consumption_rate:11u128,critical_chance:0u128,damage:177u128,dura_ammo:180u128,hit_chance:177122105436891563463374607431768211455u128,number_of_hits:3u128,is_broken:false}}}'
# TEAM_A='{ player_1: { primary_stats: { strength: 100u128 }, secondary_stats: { health: 100u128, dodge_chance: 100u128, hit_chance: 100u128, critical_chance: 100u128, melee_damage: 100u128 }, primary_equipment: { id: 1u128, w_type: 1u128, consumption_rate: 100u128, critical_chance: 10u128, dura_ammo: 1000u128, damage: 10u128, hit_chance: 10u128, number_of_hits: 10u128, is_broken: false }, multipliers: { dodge_chance: 1u128 } } }'
TEAM_B='{player_1:{primary_stats:{strength:213u128,accuracy:236u128,agility:191u128,mastery:284u128,luck:175u128},secondary_stats:{health:761u128,speed:589u128,dura_ammo:1u128,dodge_chance:151983403762150163463374607431768211455u128,hit_chance:232545501550095163463374607431768211455u128,critical_chance:156356448960807563463374607431768211455u128,melee_damage:283846638997548863463374607431768211455u128},primary_equipment:{id:3u128,type:1field,consumption_rate:17u128,critical_chance:0u128,damage:182u128,dura_ammo:132u128,hit_chance:125941150263042963463374607431768211455u128,number_of_hits:3u128,is_broken:false}}}'

leo run start_game "${TEAM_A}" "${TEAM_B}" "111u128"

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
#         w_type: 1u128.private,
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
#         w_type: 1u128.private,
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