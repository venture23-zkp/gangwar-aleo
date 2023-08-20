// The 'gangwar' program.

import lootcrate_nft_v1.leo;

program gangwar_v1.aleo {

    ///////////////////////////////////
    //////////// STRUCTS //////////////
    ///////////////////////////////////

    struct PrimaryStats {
        strength: u16,
    }

    struct SecondaryStats {
        health: u16,
        dodge_chance: u16,
        hit_chance: u16,
        critical_chance: u16,
        melee_damage: u16
    }

    struct Weapon {
        id: u16,
        w_type: u16, // Melee | Range | Support
        consumption_rate: u16,
        critical_chance: u16,
        dura_ammo: u16, // For default weapon (weapon on NFT), dura_ammo is infinity
        damage: u16,
        hit_chance: u16,
        number_of_hits: u16,
        is_broken: bool
    }

    struct Character {
        nft_id: u16,
        player_addr: address,
        primary_stats: PrimaryStats,
        secondary_stats: SecondaryStats,
        primary_equipment: Weapon,
    }

    struct Team {
        p1: Character,
        p2: Character,
        p3: Character
    }

    struct GangwarSettings {
        created_at: u32,
        deadline_to_register: u32,
        max_number_of_players: u8,
        max_rounds: u8,
        registered_players: u8,
        random_number: u16
    }

    struct PhysicalAttack {
        main: u8,
        target: u8,
        is_dodged: bool,
        is_critical: bool,
        total_normal_hits: u16,
        total_critical_hits: u16,
        damage: u16
    }

    struct Damage {
        is_dodged: bool,
        is_critical: bool,
        total_critical_hits: u16,
        total_normal_hits: u16,
        damage: u16
    }


    struct Signature {
        r: group,
        s: group,
        validity_timestamp: u32
    }

    struct HashStruct {
        m: Character,
        r: group,
        validity_timestamp: u32
    }


    struct CoinFlip {
        result: bool,
        new_random_number: u16
    }

    struct IPhysicalAttackResponse {
        updated_main_character: Character,
        updated_target_character: Character,
        physical_attack: Damage,
        new_random_number: u16
    }

    ///////////////////////////////////
    //////////// RECORDS //////////////
    ///////////////////////////////////

    record War {
        owner: address,
        simulation_id: u32,
        round: u8,
        main_team: Team,
        target_team: Team,
        physical_attack: PhysicalAttack
    }

    record Player {
        owner: address,
        simulation_id: u32,
        char: Character
    }


    ///////////////////////////////////
    //////////// MAPPINGS /////////////
    ///////////////////////////////////

    mapping gangwar_settings: u32 => GangwarSettings;

    ///////////////////////////////////
    /////////// TRANSITIONS ///////////
    ///////////////////////////////////

    /// 8 constraints
    transition create_game(simulation_id: u32, registration_time: u32, max_number_of_players: u8, max_rounds: u8) {
        assert_eq(self.caller, aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px); // TODO: SERVER ADDRESS
        // TODO: add other asserts
        // 1. Check if the time is sufficient for other to join
        // 2. Check if the max_number_of_players is upto how much we support
        return then finalize(simulation_id, registration_time, max_number_of_players, max_rounds);
    }

    finalize create_game(simulation_id: u32, registration_time: u32, max_number_of_players: u8, max_rounds: u8) {
        // Ensure game with same simulation_id has not been created previously
        let game_exists: bool = Mapping::contains(gangwar_settings, simulation_id);
        assert(!game_exists);

        let deadline_to_register: u32 = block.height + registration_time;
        let random_number: u16 = ChaCha::rand_u16();
        let settings: GangwarSettings = GangwarSettings {
            created_at: block.height,
            deadline_to_register,
            max_number_of_players,
            max_rounds,
            registered_players: 0u8,
            random_number
        };
        Mapping::set(gangwar_settings, simulation_id, settings);
    }

    transition update_registration_time(simulation_id: u32, registration_time: u32) {
        assert_eq(self.caller, aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px); // TODO: SERVER ADDRESS
        return then finalize(simulation_id, registration_time);
    }

    finalize update_registration_time(simulation_id: u32, registration_time: u32) {
        // Ensure that the game exists
        let game_exists: bool = Mapping::contains(gangwar_settings, simulation_id);
        assert(game_exists);

        let settings: GangwarSettings = Mapping::get(gangwar_settings, simulation_id);

        // Ensure settings cannot be updated after game can be started
        assert(settings.deadline_to_register > block.height);

        let deadline_to_register: u32 = block.height + registration_time;

        let updated_settings: GangwarSettings = GangwarSettings {
            created_at: settings.created_at,
            deadline_to_register,
            max_number_of_players: settings.max_number_of_players,
            max_rounds: settings.max_rounds,
            registered_players: settings.registered_players + 1u8,
            random_number: settings.random_number,
        };
        Mapping::set(gangwar_settings, simulation_id, updated_settings);
    }


    /// 28,100 constraints
    transition sign(m: Character, sk: scalar, k: scalar, validity_timestamp: u32) -> Signature {
        let r: group = k * group::GEN;
        let h: HashStruct = HashStruct {
            m,
            r,
            validity_timestamp
        };
        let e: scalar = BHP256::hash_to_scalar(h);

        let s: group = k*group::GEN + e.mul(group::GEN).mul(sk); 

        let signature: Signature = Signature{
            r,
            s,
            validity_timestamp
        };
        
        return signature;
    }


    /// To join a game, submit a Character and it's corresponding signature by the server address
    /// signature should be valid for time
    /// 21,377 constraints
    transition join_game(simulation_id: u32, char: Character, signature: Signature) -> Player {
        assert(verify(char, 1540945439182663264862696551825005342995406165131907382295858612069623286213group, signature)); // SERVER SCHNORR SIGNING PUBLIC KEY
        assert_eq(char.player_addr, self.caller);
        return Player {
            owner: aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px, // TODO: SERVER ADDRESS
            simulation_id,
            char
        } then finalize(simulation_id, signature.validity_timestamp);
    }

    finalize join_game(simulation_id: u32, validity_timestamp: u32) {

        // Ensure signature is valid till given time
        assert(validity_timestamp > block.height);

        let settings: GangwarSettings = Mapping::get(gangwar_settings, simulation_id);

        // Ensure there is room to join
        assert(settings.registered_players < settings.max_number_of_players);

        // Ensure deadline has not passed
        assert(settings.deadline_to_register > block.height);

        let new_random_number: u16 = ChaCha::rand_u16();
        let random_number: u16 = new_random_number.xor(settings.random_number);

        let updated_settings: GangwarSettings = GangwarSettings {
            created_at: settings.created_at,
            deadline_to_register: settings.deadline_to_register,
            max_number_of_players: settings.max_number_of_players,
            max_rounds: settings.max_rounds,
            registered_players: settings.registered_players + 1u8,
            random_number,
        };
        Mapping::set(gangwar_settings, simulation_id, updated_settings);
    }



    /// 5,686 constraints
    transition start_game(simulation_id: u32, random_seed: u16, p1: Player, p2: Player, p3: Player, p4: Player, p5: Player, p6: Player) -> War {
        assert(
            p1.simulation_id == simulation_id && 
            p2.simulation_id == simulation_id && 
            p3.simulation_id == simulation_id && 
            p4.simulation_id == simulation_id && 
            p5.simulation_id == simulation_id && 
            p6.simulation_id == simulation_id
        );

        let no_attack: PhysicalAttack = PhysicalAttack {
            main: 0u8,
            target: 0u8,
            is_dodged: true,
            is_critical: false,
            total_critical_hits: 0u16,
            total_normal_hits: 0u16,
            damage: 0u16,
        };


        let (team_a, team_b): (Team, Team) = divide_into_teams(p1.char, p2.char, p3.char, p4.char, p5.char, p6.char);

        let main_team: Team = Team{
                p1: team_a.p1,
                p2: team_a.p2,
                p3: team_a.p3
            };
        let target_team: Team = Team{
                p1: team_b.p1,
                p2: team_b.p2,
                p3: team_b.p3
            };

        let half_u16: u16 = 32767u16; // u16::MAX.div(2)
        let coin_flip_output: CoinFlip = flip_a_coin(random_seed, half_u16);
        let team_b_starts: bool = coin_flip_output.result;

        if (team_b_starts) {
            main_team = Team{
                p1: team_b.p1,
                p2: team_b.p2,
                p3: team_b.p3
            };
            target_team = Team{
                p1: team_a.p1,
                p2: team_a.p2,
                p3: team_a.p3
            };
        } 

        let war: War = War {
            owner: self.caller, // TODO: Server address
            simulation_id,
            round: 0u8,
            main_team,
            target_team,
            physical_attack: no_attack
        };

        return war then finalize(simulation_id, random_seed, coin_flip_output.new_random_number);
    }
    
    finalize start_game(simulation_id: u32, initial_random_seed: u16, new_random_seed: u16) {
        let settings: GangwarSettings = Mapping::get(gangwar_settings, simulation_id);

        // Ensure admin can start game after deadline to join has passed
        assert(settings.deadline_to_register < block.height);

        // Ensure same random number is used  
        assert_eq(initial_random_seed, settings.random_number);

        let new_random_number: u16 = ChaCha::rand_u16();
        let random_number: u16 = new_random_number.xor(new_random_seed);

        let updated_settings: GangwarSettings = GangwarSettings {
            created_at: settings.created_at,
            deadline_to_register: settings.deadline_to_register,
            max_number_of_players: settings.max_number_of_players,
            max_rounds: settings.max_rounds,
            registered_players: settings.registered_players,
            random_number,
        };
        Mapping::set(gangwar_settings, simulation_id, updated_settings);
    }

   
    /// 61,332 constraints
    transition simulate1vs1(w: War, random_seed: u16) -> War {

        let alive_players_in_main_team: u8 = get_alive_players(w.main_team);
        assert(alive_players_in_main_team > 0u8);

        let alive_players_in_target_team: u8 = get_alive_players(w.target_team);
        assert(alive_players_in_target_team > 0u8);

        let eligible_player_in_main_team: u8 = get_eligible_player_index(alive_players_in_main_team, 0u8, random_seed);

        let new_random_seed: u16 = BHP256::hash_to_u16(random_seed);
        let eligible_player_in_target_team: u8 = get_eligible_player_index(alive_players_in_target_team, 0u8, new_random_seed);
        new_random_seed = BHP256::hash_to_u16(new_random_seed);

        let dummy_attack: Damage = Damage {
            is_dodged: true,
            is_critical: false,
            total_critical_hits: 0u16,
            total_normal_hits: 0u16,
            damage: 0u16
        };

        let par: IPhysicalAttackResponse = IPhysicalAttackResponse {
            updated_main_character: w.main_team.p1, 
            updated_target_character: w.main_team.p1, 
            physical_attack: dummy_attack, 
            new_random_number: 0u16
        };

        let updated_main_team: Team = Team {
            p1 : w.main_team.p1,     
            p2: w.main_team.p2, 
            p3: w.main_team.p3, 
        };
        let updated_target_team: Team = Team{
            p1 : w.target_team.p1,
            p2: w.target_team.p2, 
            p3: w.target_team.p3,
        };

        // TODO: Use array when it's available

        if (eligible_player_in_main_team == 1u8 && eligible_player_in_target_team == 1u8) {
            // p1 vs p1
            par = physical_attack_sequence(w.main_team.p1, w.target_team.p1, new_random_seed);
            updated_main_team = Team {
                p1: par.updated_main_character,
                p2: w.main_team.p2,
                p3: w.main_team.p3
            };
            updated_target_team = Team {
                p1: par.updated_target_character,
                p2: w.target_team.p2,
                p3: w.target_team.p3
            };
        } else if (eligible_player_in_main_team == 1u8 && eligible_player_in_target_team == 2u8) {
            // p1 vs p2
            par = physical_attack_sequence(w.main_team.p1, w.target_team.p2, new_random_seed);
            updated_main_team = Team {
                p1: par.updated_main_character,
                p2: w.main_team.p2,
                p3: w.main_team.p3
            };
            updated_target_team = Team {
                p1: w.target_team.p1,
                p2: par.updated_target_character,
                p3: w.target_team.p3
            };
        } else if (eligible_player_in_main_team == 1u8 && eligible_player_in_target_team == 3u8) {
            // p1 vs p3
            par = physical_attack_sequence(w.main_team.p1, w.target_team.p3, new_random_seed);
            updated_main_team = Team {
                p1: par.updated_main_character,
                p2: w.main_team.p2,
                p3: w.main_team.p3
            };
            updated_target_team = Team {
                p1: w.target_team.p1,
                p2: w.target_team.p2,
                p3: par.updated_target_character
            };
        } else if (eligible_player_in_main_team == 2u8 && eligible_player_in_target_team == 1u8) {
            // p2 vs p1
            par = physical_attack_sequence(w.main_team.p2, w.target_team.p1, new_random_seed);
            updated_main_team = Team {
                p1: w.main_team.p1,
                p2: par.updated_main_character,
                p3: w.main_team.p3
            };
            updated_target_team = Team {
                p1: par.updated_target_character,
                p2: w.target_team.p2,
                p3: w.target_team.p3
            };
        } else if (eligible_player_in_main_team == 2u8 && eligible_player_in_target_team == 2u8) {
            // p2 vs p2
            par = physical_attack_sequence(w.main_team.p2, w.target_team.p2, new_random_seed);
            updated_main_team = Team {
                p1: w.main_team.p1,
                p2: par.updated_main_character,
                p3: w.main_team.p3
            };
            updated_target_team = Team {
                p1: w.target_team.p1,
                p2: par.updated_target_character,
                p3: w.target_team.p3
            };
        } else if (eligible_player_in_main_team == 2u8 && eligible_player_in_target_team == 3u8) {
            // p2 vs p3
            par = physical_attack_sequence(w.main_team.p2, w.target_team.p3, new_random_seed);
            updated_main_team = Team {
                p1: w.main_team.p1,
                p2: par.updated_main_character,
                p3: w.main_team.p3
            };
            updated_target_team = Team {
                p1: w.target_team.p1,
                p2: w.target_team.p2,
                p3: par.updated_target_character
            };
        } else if (eligible_player_in_main_team == 3u8 && eligible_player_in_target_team == 1u8) {
            // p3 vs p1
            par = physical_attack_sequence(w.main_team.p3, w.target_team.p1, new_random_seed);
            updated_main_team = Team {
                p1: w.main_team.p1,
                p2: w.main_team.p2,
                p3: par.updated_main_character,
            };
            updated_target_team = Team {
                p1: par.updated_target_character,
                p2: w.target_team.p2,
                p3: w.target_team.p3
            };
        } else if (eligible_player_in_main_team == 3u8 && eligible_player_in_target_team == 2u8) {
            // p3 vs p2
            par = physical_attack_sequence(w.main_team.p3, w.target_team.p2, new_random_seed);
            updated_main_team = Team {
                p1: w.main_team.p1,
                p2: w.main_team.p2,
                p3: par.updated_main_character,
            };
            updated_target_team = Team {
                p1: w.target_team.p1,
                p2: par.updated_target_character,
                p3: w.target_team.p3
            };
        } else if (eligible_player_in_main_team == 3u8 && eligible_player_in_target_team == 3u8) {
            // p3 vs p3
            par = physical_attack_sequence(w.main_team.p3, w.target_team.p3, new_random_seed);
            updated_main_team = Team {
                p1: w.main_team.p1,
                p2: w.main_team.p2,
                p3: par.updated_main_character
            };
            updated_target_team = Team {
                p1: w.target_team.p1,
                p2: w.target_team.p2,
                p3: par.updated_target_character
            };
        }

        let physical_attack: PhysicalAttack = PhysicalAttack {
            main: eligible_player_in_main_team,
            target: eligible_player_in_target_team,
            is_dodged: par.physical_attack.is_dodged,
            is_critical: par.physical_attack.is_critical,
            total_critical_hits: par.physical_attack.total_critical_hits,
            total_normal_hits: par.physical_attack.total_normal_hits,
            damage: par.physical_attack.damage
        };
        
        return War {
            owner: self.caller, // TODO: Server address
            simulation_id: w.simulation_id,
            round: w.round.add(1u8),
            main_team: updated_target_team,
            target_team: updated_main_team,
            physical_attack
        } then finalize(w.simulation_id, w.round, random_seed, par.new_random_number);

    }

    finalize simulate1vs1(simulation_id: u32, round: u8, initial_random_seed: u16, new_random_seed: u16) {
        let settings: GangwarSettings = Mapping::get(gangwar_settings, simulation_id);

        // Ensure max number of rounds is not exceeded
        assert(round < settings.max_rounds);

        // Ensure same random number is used  
        assert_eq(initial_random_seed, settings.random_number);

        // Generate a new random number
        let new_random_number: u16 = ChaCha::rand_u16();
        let random_number: u16 = new_random_number.xor(new_random_seed);

        // Update the settings with new random number
        let updated_settings: GangwarSettings = GangwarSettings {
            created_at: settings.created_at,
            deadline_to_register: settings.deadline_to_register,
            max_number_of_players: settings.max_number_of_players,
            max_rounds: settings.max_rounds,
            registered_players: settings.registered_players,
            random_number,
        };
        Mapping::set(gangwar_settings, simulation_id, updated_settings);
    }

    /// 31,422 constraints
    /// 2,028 constraints (add_minter)
    transition finish_game(w: War, random_number: u16) -> (lootcrate_nft_v1.leo/NFT_mint, lootcrate_nft_v1.leo/NFT_mint, lootcrate_nft_v1.leo/NFT_mint, lootcrate_nft_v1.leo/NFT_mint, lootcrate_nft_v1.leo/NFT_mint, lootcrate_nft_v1.leo/NFT_mint ) {
        let (winning_team, losing_team, losing_team_health): (Team, Team, u16) = get_winners(w.main_team, w.target_team, random_number);

        // Provide 2 NFTs to each player of the winning team
        let nft_mint_winner_p1: NFT_mint = lootcrate_nft_v1.leo/add_minter(winning_team.p1.player_addr, 2u8);
        let nft_mint_winner_p2: NFT_mint = lootcrate_nft_v1.leo/add_minter(winning_team.p2.player_addr, 2u8);
        let nft_mint_winner_p3: NFT_mint = lootcrate_nft_v1.leo/add_minter(winning_team.p3.player_addr, 2u8);

        // Provide 1 NFT to each player of the losing team
        let nft_mint_loser_p1: NFT_mint = lootcrate_nft_v1.leo/add_minter(losing_team.p1.player_addr, 1u8);
        let nft_mint_loser_p2: NFT_mint = lootcrate_nft_v1.leo/add_minter(losing_team.p2.player_addr, 1u8);
        let nft_mint_loser_p3: NFT_mint = lootcrate_nft_v1.leo/add_minter(losing_team.p3.player_addr, 1u8);

        return (nft_mint_winner_p1,nft_mint_winner_p2, nft_mint_winner_p3, nft_mint_loser_p1, nft_mint_loser_p2, nft_mint_loser_p3) then finalize(w.simulation_id, w.round, losing_team_health, random_number);
    }

    finalize finish_game(simulation_id: u32, round: u8, min_health: u16, initial_random_seed: u16) {
        let settings: GangwarSettings = Mapping::get(gangwar_settings, simulation_id);

        // Ensure that either max rounds have reached
        // or all members of one team has died
        assert(round >= settings.max_rounds || min_health == 0u16);

        // Ensure same random number is used  
        assert_eq(initial_random_seed, settings.random_number);

        // Update the settings with new random number
        let updated_settings: GangwarSettings = GangwarSettings {
            created_at: settings.created_at,
            deadline_to_register: settings.deadline_to_register,
            max_number_of_players: settings.max_number_of_players,
            max_rounds: settings.max_rounds,
            registered_players: settings.registered_players,
            random_number: settings.random_number,
        };
        Mapping::set(gangwar_settings, simulation_id, updated_settings);

    }


    ///////////////////////////////////
    /////////// FUNCTIONS /////////////
    ///////////////////////////////////

    /// 10,318 constraints
    function verify(m: Character, pk: group, signature: Signature) -> bool {
        let h: HashStruct = HashStruct {
            m,
            r: signature.r,
            validity_timestamp: signature.validity_timestamp
        };
        let e: scalar = BHP256::hash_to_scalar(h);

        let right: group = signature.r + pk.mul(e);
        let verified:bool = right.eq(signature.s);

        return verified;
    }

    /// 1609 constraints
    function divide_into_teams(p1: Character, p2: Character, p3: Character, p4: Character, p5: Character, p6: Character) -> (Team, Team) {

        // Instead of sorting manually, use a sorted list
        // Verify sorted list
        assert(
            p1.primary_stats.strength >= p2.primary_stats.strength &&
            p2.primary_stats.strength >= p3.primary_stats.strength &&
            p3.primary_stats.strength >= p4.primary_stats.strength &&
            p4.primary_stats.strength >= p5.primary_stats.strength &&
            p5.primary_stats.strength >= p6.primary_stats.strength
       );

        // TODO: Compare ABAB method and use the one that results in the least different of strength between two team
        /*
            METHOD II: ABBA METHOD 
            1     4       Team A
              2 3         Team B
            Whichever is the weakest team assign 5th player to that team and remaining to another team
        */
        let team_a_strength: u16 = p1.primary_stats.strength + p4.primary_stats.strength;
        let team_b_strength: u16 = p2.primary_stats.strength + p3.primary_stats.strength;

        let team_a: Team = Team {
            p1: p1,
            p2: p4,
            p3: p5
        };

        let team_b: Team = Team {
            p1: p2,
            p2: p3,
            p3: p6
        };

        if (team_a_strength > team_b_strength) {
            // then 5th player goes to team B
            // 6th player comes to team A
            team_a = Team {
                p1: p1,
                p2: p4,
                p3: p6
            };
            team_b = Team {
                p1: p2,
                p2: p3,
                p3: p5
            };

        } else {
            // 5th player goes to team A
            // 6th player comes to team B
            team_a = Team {
                p1: p1,
                p2: p4,
                p3: p5
            };
            team_b = Team {
                p1: p2,
                p2: p3,
                p3: p6
            };
        }

        return (team_a, team_b);
    }

    /// Constraints: 4,157
    function physical_attack_sequence(main: Character, target: Character, random_number: u16) -> IPhysicalAttackResponse {
        let damage: u16 = 0u16;

        let total_normal_hits: u16 = 0u16;
        let total_critical_hits: u16 = 0u16;
        let total_hits: u16 = 0u16;
        let is_equipment_broken: bool = false;

        let coin_flip_output: CoinFlip = CoinFlip {
            result: false,
            new_random_number: random_number
        };

        let target_final_dodge_chance: u16 = target.secondary_stats.dodge_chance;
        coin_flip_output = flip_a_coin(coin_flip_output.new_random_number, target_final_dodge_chance);
        let is_dodged: bool = coin_flip_output.result;

        if (is_dodged) {
            // Add other info for narration
            let physical_attack: Damage = Damage {
                is_dodged: true,
                is_critical: false,
                total_critical_hits,
                total_normal_hits,
                damage,
            };

            return IPhysicalAttackResponse{
                updated_main_character: main,
                updated_target_character: target,
                physical_attack,
                new_random_number: coin_flip_output.new_random_number
            };
        }

        // Assume we always have a main.primary_equipment
        let main_final_hit_chance: u16 = add_to_max(main.secondary_stats.hit_chance, main.primary_equipment.hit_chance);
        coin_flip_output = flip_a_coin(coin_flip_output.new_random_number, main_final_hit_chance);
        let is_hit: bool = coin_flip_output.result;

        if (!is_hit) {
            // Add other info for narration
            let physical_attack: Damage = Damage {
                is_dodged: false,
                is_critical: false,
                total_critical_hits,
                total_normal_hits,
                damage: 0u16,
            };

            return IPhysicalAttackResponse{
                updated_main_character: main,
                updated_target_character: target,
                physical_attack,
                new_random_number: coin_flip_output.new_random_number
            };
        }

        let main_critical_chance: u16 = add_to_max(main.secondary_stats.critical_chance,  main.primary_equipment.critical_chance);
        coin_flip_output = flip_a_coin(coin_flip_output.new_random_number, main_critical_chance);
        let is_critical: bool = coin_flip_output.result;

        // ignore options
        if (main.primary_equipment.is_broken) {
            // if primary equipment is broken use punch
            damage = main.primary_stats.strength / 5u16;
        } else {
            // todo: check if primary equipment is special
            // special weapon includes: 
            // Normal: remington_870, grenade, pr_flame_bottles
            // Default: molotov_cocktail, sawed_off_shotgun, shotgun

            // for now assume special_weapon = true

            // primay_equipment.w_type = 1 = Range
            // primay_equipment.w_type = 2 = Support
            damage = main.primary_equipment.damage;
            // if primary_equipment.w_type = 0 = Melee ; add extra damage
            if(main.primary_equipment.w_type == 0u16) {
                let extra_damage: u16 = multiply_with_probability(main.primary_equipment.damage, main.secondary_stats.melee_damage); // percentange TODO: handle percentage multiplication
                damage += extra_damage;
            } 

            total_hits = multiply_with_probability(multiply_with_probability(main.primary_equipment.number_of_hits, main_final_hit_chance), 65535u16 - target_final_dodge_chance);
            if (is_critical) {
                total_critical_hits = multiply_with_probability(total_hits, main_critical_chance);
            }
            total_normal_hits = total_hits - total_critical_hits;

            // assume isCollateral = false
            // TODO: double check; handle when negative; there's more logic
            is_equipment_broken = sub_to_zero(main.primary_equipment.dura_ammo, main.primary_equipment.consumption_rate) == 0u16;

            let normal_hit_damage: u16 = total_normal_hits * damage;
            let critical_hit_damage: u16 = total_critical_hits * damage * 2u16;

            damage = normal_hit_damage + critical_hit_damage;
        }
        // Damage Boost Ignored

        let updated_secondary_stats: SecondaryStats = SecondaryStats{
            health: sub_to_zero(target.secondary_stats.health, damage),
            dodge_chance: target.secondary_stats.dodge_chance,
            hit_chance: target.secondary_stats.hit_chance,
            critical_chance: target.secondary_stats.critical_chance,
            melee_damage: target.secondary_stats.melee_damage
        };

        let updated_weapon: Weapon = Weapon{
            id: main.primary_equipment.id,
            w_type: main.primary_equipment.w_type,
            consumption_rate: main.primary_equipment.consumption_rate,
            critical_chance: main.primary_equipment.critical_chance,
            dura_ammo: sub_to_zero(main.primary_equipment.dura_ammo, total_hits),
            damage: main.primary_equipment.damage,
            hit_chance: main.primary_equipment.hit_chance,
            number_of_hits: main.primary_equipment.number_of_hits,
            is_broken: is_equipment_broken
        };

        let updated_main_character: Character = Character{
            nft_id: main.nft_id,
            player_addr: main.player_addr,
            primary_stats: main.primary_stats,
            secondary_stats: main.secondary_stats,
            primary_equipment: updated_weapon
        };

        let updated_target_character: Character = Character{
            nft_id: target.nft_id,
            player_addr: target.player_addr,
            primary_stats: target.primary_stats,
            secondary_stats: updated_secondary_stats,
            primary_equipment: target.primary_equipment
        };

        let physical_attack: Damage = Damage {
            is_dodged,
            is_critical,
            total_critical_hits,
            total_normal_hits,
            damage,
        };

        return IPhysicalAttackResponse {
            updated_main_character,
            updated_target_character,
            physical_attack,
            new_random_number: coin_flip_output.new_random_number
        };
    }

    /// 5,418 constraints
    function get_winners(team_a: Team, team_b: Team, random_number: u16) -> (Team, Team, u16) {

        // TODO: Ensure that the sum of the players is less than u16::MAX
        let team_a_health: u16 = team_a.p1.secondary_stats.health + team_a.p2.secondary_stats.health + team_a.p3.secondary_stats.health;
        let team_b_health: u16 = team_b.p1.secondary_stats.health + team_b.p2.secondary_stats.health + team_b.p3.secondary_stats.health;

        if (team_a_health > team_b_health) {
            return (
                team_a,
                team_b,
                team_b_health
            );
        } else if (team_b_health > team_a_health) {
            return (
                team_b,
                team_a,
                team_a_health,
            );
        } else {
            let coin_flip_output: CoinFlip = flip_a_coin(random_number, 32768u16);
            let team_a_wins: bool = coin_flip_output.result;

            if (team_a_wins) {
                return (
                    team_a,
                    team_b,
                    team_b_health
                );
            } else {
                return (
                    team_b,
                    team_a,
                    team_a_health
                );
            }
        }
    }


    ///////////////////////////////////
    ///// INLINE HELPER FUNCTIONS /////
    ///////////////////////////////////

    /// If a>b returns a-b, else returns 0
    /// 52 constraints
    inline sub_to_zero(a: u16, b:u16) -> u16 {
        if (a > b) {
            return a.sub_wrapped(b);
        } else {
            return 0u16;
        }
    }
    
    /// If ((a+b > a) && (a+b > b)) return a+b else returns u16::MAX
    /// TODO: Since this addition is in case of probability, maybe name the function to add_probabilities?
    /// 71 constraints
    inline add_to_max(a: u16, b:u16) -> u16 {
        let u16_max: u16 = 65535u16;
        let sum: u16 = a.add_wrapped(b);
        if ((a > sum) || (b > sum)) {
            return u16_max;
        } else {
            return sum;
        }
    }

    // Multiply a value with probability
    // Split into precision to prevent overflow
    /// 154 constraints
    inline multiply_with_probability(value: u16, probability: u16) -> u16 {
        let first_precision: u16 = 256u16;
        let second_precision: u16 = 256u16;
        let newValue: u16 = (value.mul(probability.div(first_precision))).div(second_precision);
        return newValue;
    }

    /// Returns weighted random
    /// 575 constraints
    inline flip_a_coin(random_number: u16, weight_for_true: u16) -> CoinFlip {
        // random_number needs to be distributed between 0 to 2^16 - 1
        // 0 < weight for true < MAX_U16
        let new_random_number: u16 = BHP256::hash_to_u16(random_number);
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

    /// 57 constraints
    inline get_alive_players(team:Team)-> u8{

        /// Representation of players is in u8 as LSBs (Least Significant Bits)
        /// For example: 7u8 => 00000111 => Represent all three players
        /// For example: 4u8 => 00000100 => Represent all third player

        let alive : u8 = 0u8;
        if(team.p1.secondary_stats.health > 0u16){
            alive = alive | 1u8;
        }
        if(team.p2.secondary_stats.health > 0u16){
            alive = alive | 2u8;
        }
        if(team.p3.secondary_stats.health > 0u16){
            alive = alive | 4u8;
        }
        return alive;
    }


    /// 1,233 constraints
    inline get_eligible_player_index(alive_players: u8, already_selected_players: u8, random_seed: u16) -> u8 {
        /// Representation of players is in u8 as LSBs (Least Significant Bits)
        /// For example: 7u8 => 00000111 => Represent all three players
        /// For example: 4u8 => 00000100 => Represent all third player

        /// Selects an eligible player based on a random_number
        /// A player is eligible if he is alive and has not been selected previously

        let eligible_player_index: u8 = 8u8; // Starting with an out of range value

        // Select a random index to denote the player
        // Since we have 3 players, mod by 3u8
        let random_player_index: u8 = BHP256::hash_to_u8(random_seed).mod(3u8);

        // Get a random player
        // If random_player_index = 0u8 => random_player = 00000001 (p1)
        // If random_player_index = 1u8 => random_player = 00000010 (p2)
        // If random_player_index = 2u8 => random_player = 00000100 (p3)
        let random_player: u8 = 1u8<<(random_player_index);

        // Ensure the random_player is eligible
        if (( 
            (random_player & already_selected_players) == 0u8 ) && // Random player is not selected previously
            ((random_player & alive_players) != 0u8 )) // Random player is alive
            {
                eligible_player_index = random_player_index;
            }
        else { // search for a random player
            for i:u8 in 0u8..2u8{
                random_player = random_player<< 1u8;   // try with next player
                random_player_index += 1u8;
                if (random_player == 8u8) { 
                    random_player = 1u8;
                    random_player_index = 0u8;
                }
                if ((random_player & already_selected_players)== 0u8 ) && ((random_player & alive_players) != 0u8 ){
                    eligible_player_index = random_player_index;
                }
            }
        }
        return eligible_player_index + 1u8;
    }

}