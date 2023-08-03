// The 'weapon_nft' program.
program weapon_nft.aleo {

    record LockedNFT {
        owner: address,
        token_owner: address,
        token_id_data1: u128,
        token_id_data2: u128,
        edition: scalar,
        w_type: u16, // Melee | Range | Support
        consumption_rate: u16,
        critical_chance: u16,
        dura_ammo: u16, // For default weapon (weapon on NFT), dura_ammo is infinity
        damage: u16,
        hit_chance: u16,
        number_of_hits: u16,
    }

    record UnlockedNFT {
        owner: address,
        token_id_data1: u128,
        token_id_data2: u128,
        edition: scalar,
        w_type: u16, // Melee | Range | Support
        consumption_rate: u16,
        critical_chance: u16,
        dura_ammo: u16, // For default weapon (weapon on NFT), dura_ammo is infinity
        damage: u16,
        hit_chance: u16,
        number_of_hits: u16,
    }

    transition unlock_nft(private nft: LockedNFT) -> UnlockedNFT {
        return UnlockedNFT{
            owner: nft.owner,
            token_id_data1: nft.token_id_data1,
            token_id_data2: nft.token_id_data2,
            edition: nft.edition,
            w_type: nft.w_type, // Melee | Range | Support
            consumption_rate: nft.consumption_rate,
            critical_chance: nft.critical_chance,
            dura_ammo: nft.dura_ammo, // For default weapon (weapon on NFT), dura_ammo is infinity
            damage: nft.damage,
            hit_chance: nft.hit_chance,
            number_of_hits: nft.number_of_hits,
        };
    }

}
