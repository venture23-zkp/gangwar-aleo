// The 'gangwar' program.

import player_nft.leo;
import creditsb.leo;

program gangwar.aleo {

    struct GangwarPlayerStats {
        strength: u128,
        health: u128,
        dodge_chance: u128,
        hit_chance: u128,
        critical_chance: u128,
        melee_damage: u128
    }

    struct GangwarWeaponStats {
        w_type: u128, // Melee | Range | Support
        consumption_rate: u128,
        critical_chance: u128,
        dura_ammo: u128, // For default weapon (weapon on NFT), dura_ammo is infinity
        damage: u128,
        hit_chance: u128,
        number_of_hits: u128,
        is_broken: bool
    }


    record GangwarPlayer {
        owner: address,
        simulation_id: u128,
        nft_id: u128,
        player_stats: GangwarPlayerStats,
        primary_equipment: GangwarWeaponStats,
    }

    transition mint_public(
        public token_mint_id: u8,
        public payment: creditsb.leo/credits_with_struct,
        public treasury: address,
        public price: u64,
    ) -> (creditsb.leo/credits_with_struct, creditsb.leo/credits_with_struct) {
        let (out_seller, out_buyer): (credits_with_struct, credits_with_struct) 
            = creditsb.leo/transfer_private_with_struct(
                payment,
                treasury,
                price
            );
        return (out_buyer, out_seller) ;
    } 

}
