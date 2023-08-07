// The 'gangwar' program.

program gangwar.aleo {

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

    record Player {
        owner: address,
        simulation_id: u32,
        char: Character
    }

    struct Team {
        p1: Character,
        p2: Character,
        p3: Character
    }

    struct ITeams {
        team_a: Team,
        team_b: Team
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

    struct GangwarSettings {
        deadline_to_register: u32,
        max_number_of_players: u8,
        gameloop_count: u8,
        registered_players: u8,
        random_number: u16
    }

    struct CoinFlip {
        result: bool,
        new_random_number: u16
    }

    struct PhysicalAttack {
        is_dodged: bool,
        is_hit: bool,
        is_critical: bool,
        total_critical_hits: u16,
        total_normal_hits: u16,
        total_hits: u16,
        damage: u16
    }

    record War {
        owner: address,
        simulation_id: u32,
        round: u8,
        main_team: Team,
        target_team: Team,
        physical_attack: PhysicalAttack
    }


    mapping gangwar_settings: u32 => GangwarSettings;

    transition create_game(simulation_id: u32, registration_time: u32, max_number_of_players: u8, gameloop_count: u8) {
        assert_eq(self.caller, aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px); // TODO: SERVER ADDRESS
        // TODO: add other asserts
        // 1. Check if the time is sufficient for other to join
        // 2. Check if the max_number_of_players is upto how much we support
        return then finalize(simulation_id, registration_time, max_number_of_players, gameloop_count);
    }

    finalize create_game(simulation_id: u32, registration_time: u32, max_number_of_players: u8, gameloop_count: u8) {
        // TODO: add asserts
        // 1. Check if the simulation id already exist
        let deadline_to_register: u32 = block.height + registration_time;
        let random_number: u16 = ChaCha::rand_u16();
        let settings: GangwarSettings = GangwarSettings {
            deadline_to_register,
            max_number_of_players,
            gameloop_count,
            registered_players: 0u8,
            random_number
        };
        Mapping::set(gangwar_settings, simulation_id, settings);
    }


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
        assert(validity_timestamp > block.height);
        let settings: GangwarSettings = Mapping::get(gangwar_settings, simulation_id);
        assert(settings.registered_players < settings.max_number_of_players);
        assert(settings.deadline_to_register > block.height);

        let new_random_number: u16 = ChaCha::rand_u16();
        let random_number: u16 = new_random_number.xor(settings.random_number);

        let updated_settings: GangwarSettings = GangwarSettings {
            deadline_to_register: settings.deadline_to_register,
            max_number_of_players: settings.max_number_of_players,
            gameloop_count: settings.gameloop_count,
            registered_players: settings.registered_players + 1u8,
            random_number,
        };
        Mapping::set(gangwar_settings, simulation_id, updated_settings);
    }

    /// Returns weighted random
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
            is_dodged: true,
            is_hit: false,
            is_critical: false,
            total_critical_hits: 0u16,
            total_normal_hits: 0u16,
            total_hits: 0u16,
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

        return war;

    }

    function divide_into_teams(p1: Character, p2: Character, p3: Character, p4: Character, p5: Character, p6: Character) -> (Team, Team) {

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

}
