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
        nft_id: u16,
        player_addr: address,
        primary_stats: PrimaryStats,
        secondary_stats: SecondaryStats,
        primary_equipment: Weapon,
    }

    struct Signature {
        r: group,
        s: group,
        validity_timestamp: u32
    }

    struct HashStruct {
        m: Character,
        r: group
    }

    struct GangwarSettings {
        deadline_to_register: u32,
        max_number_of_players: u8,
        gameloop_count: u8,
        registered_players: u8,
    }

    mapping gangwar_settings: u32 => GangwarSettings;

    transition create_game(simulation_id: u32, registration_time: u32, max_number_of_players: u8, gameloop_count: u8) {
        assert_eq(self.caller, aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px); // SERVER ADDRESS
        // TODO: add other asserts
        // 1. Check if the time is sufficient for other to join
        // 2. Check if the max_number_of_players is upto how much we support
        return then finalize(simulation_id, registration_time, max_number_of_players, gameloop_count);
    }

    finalize create_game(simulation_id: u32, registration_time: u32, max_number_of_players: u8, gameloop_count: u8) {
        // TODO: add asserts
        // 1. Check if the simulation id already exist
        let deadline_to_register: u32 = block.height + registration_time;
        let settings: GangwarSettings = GangwarSettings {
            deadline_to_register,
            max_number_of_players,
            gameloop_count,
            registered_players: 0u8
        };
        Mapping::set(gangwar_settings, simulation_id, settings);
    }


    function verify(m: Character, pk: group, signature: Signature) -> bool {
        let h: HashStruct = HashStruct {
            m,
            r: signature.r
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
            r
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
        return Player {
            owner: aleo1vhztlwxmqphujgq4j8cxqaqvpevujghnk02g5vjvsl3yx0n3sgyq0uxhnl,
            simulation_id,
            nft_id: char.nft_id,
            player_addr: self.caller,
            primary_stats: char.primary_stats,
            secondary_stats: char.secondary_stats,
            primary_equipment: char.primary_equipment,
        } then finalize(simulation_id, signature.validity_timestamp);
    }

    finalize join_game(simulation_id: u32, validity_timestamp: u32) {
        assert(validity_timestamp < block.height);
        let settings: GangwarSettings = Mapping::get(gangwar_settings, simulation_id);
        assert(settings.registered_players < settings.max_number_of_players);
        assert(settings.deadline_to_register > block.height);

        let updated_settings: GangwarSettings = GangwarSettings {
            deadline_to_register: settings.deadline_to_register,
            max_number_of_players: settings.max_number_of_players,
            gameloop_count: settings.gameloop_count,
            registered_players: settings.registered_players + 1u8,
        };
        Mapping::set(gangwar_settings, simulation_id, updated_settings);
    }

}
