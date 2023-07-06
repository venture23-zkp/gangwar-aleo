// The 'gangstabet_engine' program.
program gangstabet_engine.aleo {

    struct PrimaryStats {
        strength: u128,
        // accuracy: u128,
        // mastery: u128,
        // agility: u128,
        // luck: u128
    }

    struct SecondaryStats {
        health: u128,
        dodge_chance: u128,
        hit_chance: u128,
        critical_chance: u128,
        melee_damage: u128
    }

    struct Weapon {
        id: u128,
        w_type: u128, // Normal | Default??
        consumption_rate: u128,
        critical_chance: u128,
        dura_ammo: u128,
        damage: u128,
        hit_chance: u128,
        number_of_hits: u128,
        is_broken: bool
    }

    struct Item {
        item_id: u128,
        item_count: u128,
        stat_boost: bool,
        rank: bool
    }

    struct IHitData {
        total_normal_hits: u128,
        total_critical_hits: u128,
        total_hits: u128,
        new_random_number: u128
    }

    struct IPhysicalAttackResponse {
        damage: u128,
        new_random_number: u128
    }

    struct Character {
        // name: u128, // string,
        // u_type: u128 // can be 'HUMAN', 'ROBOT' ..
        // nft_id: u16, // 1..5555
        primary_stats: PrimaryStats,
        secondary_stats: SecondaryStats,
        primary_equipment: Weapon,
        // secondary_equipment: Weapon,
        // multipliers: Multipliers
        // item_1: Item,
        // item_2: Item,
        // item_3: Item
        // passive_ability: u128
    }

    struct Multipliers {
        // attack: u128,
        // defence: u128,
        // strength: u128,
        // accuracy: u128,
        // mastery: u128,
        // agility: u128,
        // luck: u128,
        // health: u128,
        // speed: u128,
        // dura_ammo: u128,
        dodge_chance: u128,
        // hit_chance: u128,
        // critical_chance: u128,
    }

    struct CoinFlip {
        result: bool,
        new_random_number: u128
    }

    struct Team {
        player_1: Character,
        // player_2: Character,
        // player_3: Character
    }

    record War {
        owner: address,
        // room_id: u128,
        // simulation_id: u128,
        // duration: u128,
        // objectives: u128 // ??,
        main_team: Team,
        target_team: Team
    }

    // Represents the public settings for the program
    // settings[0u128] = random_seed
    // can be extended for settings[0u1..0u255]
    mapping settings: u128 => u128;

    transition initialize(random_seed: u128) {
        // assert_eq(self.caller, '');
        return then finalize(random_seed);
    }

    finalize initialize(random_seed: u128) {
        // maybe replace block.height with rand_chacha in aleo opcode?
        let scalar_block_height: scalar = block.height as scalar; // block.height is u32
        let random_number: u128 = BHP256::commit_to_field(random_seed, scalar_block_height) as u128;
        Mapping::set(settings, 0u128, random_number);
    }

    transition start_game(team_a: Team, team_b: Team, random_seed: u128) -> War {
        let half_u128: u128 = 170141183460469231731687303715884105728u128; // u128::MAX.div(2)
        let coin_flip_output: CoinFlip = flip_a_coin(random_seed, half_u128);
        let team_b_starts: bool = coin_flip_output.result;

        let main_team: Team = team_a;
        let target_team: Team = team_b;
        if (team_b_starts) {
            main_team = team_b;
            target_team = team_a;
        }

        let war: War = War {
            owner: self.caller, // TODO: Server address
            // room_id: 0u128,
            // simulation_id: 0u128,
            // duration: 0u128,
            // objectives: 0u128,
            main_team,
            target_team
        };

        // TODO: Also sample events here
        // For now assume we only have a single event

        return war then finalize(random_seed, coin_flip_output.new_random_number);
    }

    finalize start_game(initial_random_seed: u128, new_random_seed: u128) {
        let saved_random_seed: u128 = Mapping::get_or_use(settings, 0u128, 0u128);
        assert_eq(initial_random_seed, saved_random_seed);
        let scalar_block_height: scalar = block.height as scalar; // block.height is u32
        let new_random_number: u128 = BHP256::commit_to_field(new_random_seed, scalar_block_height) as u128;
        Mapping::set(settings, 0u128, new_random_number);
    }

    transition game_loop(w: War, random_seed: u128) -> War {
        let physical_attack: IPhysicalAttackResponse = physical_attack_sequence(w.main_team.player_1, w.target_team.player_1, random_seed);

        let war: War = War {
            owner: self.caller, // TODO: Server address
            // room_id: w.room_id,
            // simulation_id: w.simulation_id,
            // duration: w.duration,
            // objectives: w.objectives,
            main_team: w.target_team,
            target_team: w.main_team
        };

        return war then finalize(random_seed, physical_attack.new_random_number);
    }

    finalize game_loop(initial_random_seed: u128, new_random_seed: u128) {
        let saved_random_seed: u128 = Mapping::get_or_use(settings, 0u128, 0u128);
        assert_eq(initial_random_seed, saved_random_seed);
        let scalar_block_height: scalar = block.height as scalar; // block.height is u32
        let new_random_number: u128 = BHP256::commit_to_field(new_random_seed, scalar_block_height) as u128;
        Mapping::set(settings, 0u128, new_random_number);
    }

    /// Returns weighted random
    inline flip_a_coin(random_number: u128, weight_for_true: u128) -> CoinFlip {
        // random_number needs to be distributed between 0 to 2^128 - 1
        // 0 < weight for true < MAX_U128
        let new_random_number: u128 = BHP256::hash_to_u128(random_number);
        if (random_number < weight_for_true) {
            return CoinFlip {
                result: true,
                new_random_number
            };
        } else {
            return CoinFlip{
                result: false,
                new_random_number
            };
        }
    }

    // TODO: for generalized inputs
    inline get_total_hits(max_hits: u128, main: Character, target: Character, random_number: u128) -> IHitData {
        let total_normal_hits: u128 = 0u128;
        let total_critical_hits: u128 = 0u128;
        let total_hits: u128 = 0u128;

        let coin_flip_output: CoinFlip = CoinFlip {
            result: false,
            new_random_number: random_number
        };

        for i: u128 in 0u128..5u128{
            if (i.lt(max_hits)) {
                // TODO: represent probabilities between 0 and 1 to probabilities between 0 to MAX_U128
                // Needs to work with multiplication and addition of probabilities
                // let boost_dc: u128 = target.secondary_stats.dodge_chance.mul(target.multipliers.dodge_chance);
                let target_final_dodge_chance: u128 = target.secondary_stats.dodge_chance;

                coin_flip_output = flip_a_coin(coin_flip_output.new_random_number, target_final_dodge_chance);
                let is_dodged: bool = coin_flip_output.result;

                // Note: When setting characters, a case in handled on game_engine where there is no primary equipment
                // For now let us consider that player always has a primary equipment
                if (!is_dodged) {
                    let main_final_hit_chance: u128 = main.secondary_stats.hit_chance + main.primary_equipment.hit_chance;
                    coin_flip_output = flip_a_coin(coin_flip_output.new_random_number, main_final_hit_chance);
                    let is_hit: bool = coin_flip_output.result;

                    if (is_hit) {
                        let main_critical_chance: u128 = main.secondary_stats.critical_chance + main.primary_equipment.critical_chance;
                        coin_flip_output = flip_a_coin(coin_flip_output.new_random_number, main_critical_chance);
                        let is_critical: bool = coin_flip_output.result;
                        if (is_critical) {
                            total_critical_hits += 1u128;
                        } else {
                            total_normal_hits += 1u128;
                        }
                        total_hits += 1u128;
                    }
                }
            }
        }

        let hit_data: IHitData = IHitData{
             total_normal_hits,
             total_critical_hits,
             total_hits,
             new_random_number: coin_flip_output.new_random_number
        };

        return hit_data;
    }

    function physical_attack_sequence(main: Character, target: Character, random_number: u128) -> IPhysicalAttackResponse {
        let damage: u128 = 0u128;

        let total_normal_hits: u128 = 0u128;
        let total_critical_hits: u128 = 0u128;
        let total_hits: u128 = 0u128;

        let coin_flip_output: CoinFlip = CoinFlip {
            result: false,
            new_random_number: random_number
        };

        let target_final_dodge_chance: u128 = target.secondary_stats.dodge_chance;
        coin_flip_output = flip_a_coin(coin_flip_output.new_random_number, target_final_dodge_chance);
        let is_dodged: bool = coin_flip_output.result;

        if (is_dodged) {
            // Add other info for narration
            damage = 2u128;
        }

        // Assume we always have a main.primary_equipment
        let main_final_hit_chance: u128 = main.secondary_stats.hit_chance + main.primary_equipment.hit_chance;
        coin_flip_output = flip_a_coin(coin_flip_output.new_random_number, main_final_hit_chance);
        let is_hit: bool = coin_flip_output.result;

        if (!is_hit) {
            // Add other info for narration
            damage = 2u128;
        }

        let main_critical_chance: u128 = main.secondary_stats.critical_chance + main.primary_equipment.critical_chance;
        coin_flip_output = flip_a_coin(coin_flip_output.new_random_number, main_critical_chance);
        let is_critical: bool = coin_flip_output.result;

        // ignore options
        if (main.primary_equipment.is_broken) {
            damage = main.primary_stats.strength / 5u128;
            // if primary equipment is broken use punch
        } else {
            // todo: check if primary equipment is special
            // special weapon includes: 
            // Normal: remington_870, grenade, pr_flame_bottles
            // Default: molotov_cocktail, sawed_off_shotgun, shotgun

            // for now assume special_weapon = true

            // primay_equipment.w_type = 0u128 (Range)
            if (main.primary_equipment.w_type == 0u128) {
                damage = main.primary_equipment.damage;
            
            // else if primary_equipment.w_type = 1u128
            } else if (main.primary_equipment.w_type == 1u128) {
                let extra_damage: u128 = main.secondary_stats.melee_damage * main.primary_equipment.damage; // percentange TODO: handle percentage multiplication
                damage = extra_damage + main.primary_equipment.damage;
            }

            let hit_data: IHitData = get_total_hits(main.primary_equipment.number_of_hits, main, target, coin_flip_output.new_random_number);
            total_normal_hits = hit_data.total_normal_hits;
            total_critical_hits = hit_data.total_critical_hits;
            total_hits = hit_data.total_hits;

            if (is_critical) {
                total_critical_hits += 1u128;
            } else {
                total_normal_hits += 1u128;
            }

            // assume isCollateral = false
            // TODO: double check; handle when negative; there's more logic
            let is_equipment_broken: bool = main.primary_equipment.dura_ammo - main.primary_equipment.consumption_rate == 0u128;

            let normal_hit_damage: u128 = 0u128;
            let critical_hit_damage: u128 = 0u128;

            if (total_normal_hits >= 1u128) {
                let hit_increase_by: u128 = total_normal_hits * damage;
                normal_hit_damage = hit_increase_by;
            }

            if (total_critical_hits >= 1u128) {
                critical_hit_damage = total_critical_hits * damage * 2u128;
            }

            damage = normal_hit_damage + critical_hit_damage;
        }
        // Damage Boost Ignored
        return IPhysicalAttackResponse {
            damage,
            new_random_number: coin_flip_output.new_random_number
        };
    }
}
