// The 'gangwar' program.

import weapon_nft.leo;
import creditsb.leo;

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
        w_type: u16, // Melee | Range | Support
        consumption_rate: u16,
        critical_chance: u16,
        dura_ammo: u16, // For default weapon (weapon on NFT), dura_ammo is infinity
        damage: u16,
        hit_chance: u16,
        number_of_hits: u16,
        is_broken: bool
    }

    record Player {
        owner: address,
        nft_owner: address,
        primary_stats: PrimaryStats,
        secondary_stats: SecondaryStats,
        primary_equipment: Weapon
    }



    // Users will be able to join game with their NFTs
    transition join_game(weapon: weapon_nft.leo/LockedNFT) -> Player {
        let primary_stats: PrimaryStats = PrimaryStats {
            strength: 100u16
        };

        let secondary_stats: SecondaryStats = SecondaryStats {
            health: 100u16,
            dodge_chance: 100u16,
            hit_chance: 100u16,
            critical_chance: 100u16,
            melee_damage: 100u16
        };

        let primary_equipment: Weapon = Weapon {
            w_type: weapon.w_type, // Melee | Range | Support
            consumption_rate: weapon.consumption_rate,
            critical_chance: weapon.critical_chance,
            dura_ammo: weapon.dura_ammo, // For default weapon (weapon on NFT), dura_ammo is infinity
            damage: weapon.damage,
            hit_chance: weapon.hit_chance,
            number_of_hits: weapon.number_of_hits,
            is_broken: false
        };

        let player: Player = Player {
            owner: aleo1vhztlwxmqphujgq4j8cxqaqvpevujghnk02g5vjvsl3yx0n3sgyq0uxhnl,
            nft_owner: weapon.token_owner,
            primary_stats,
            secondary_stats,
            primary_equipment
        };

        return player;
    }

}
