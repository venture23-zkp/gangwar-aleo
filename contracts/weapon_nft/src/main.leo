// The 'weapon_nft' program.
program weapon_nft.aleo {

    // dummy address, ie the aleo address equivalent of 0: aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc
    struct TokenId {
        data1: u128, // Part 1 of the image data -- i.e., a way to link this nft to image or aws
        data2: u128,
    }

    // base uri ascii bits. Include as many data pieces as necessary to encapsulate the uri. Padded with 0s at the end.
    struct BaseURI {
        data0: u128, // Part 1 of the base uri in bits. Bits should be the representation of the hexadecimal bytes for the ASCII text of the URL
        data1: u128,
        data2: u128,
        data3: u128
    }

    struct SymbolBits {
        data: u128 // The sybmol's ascii text represented in bits, and the u128 value of the bitstring.
    }

    struct Stats {
        w_type: u16, // Melee | Range | Support
        consumption_rate: u16,
        critical_chance: u16,
        dura_ammo: u16, // For default weapon (weapon on NFT), dura_ammo is infinity
        damage: u16,
        hit_chance: u16,
        number_of_hits: u16,
    }

    record NFT {
        private owner: address,
        private data: TokenId,
        private edition: scalar, // which edition of the nft this particular one is -- will be 0 for unique NFTs
        private stats: Stats
    }

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


    // a way to prove ownership of an nft privately
    record NFT_ownership {
        private owner: address,
        private nft_owner: address,
        private data: TokenId,
        private stats: Stats,
        private edition: scalar, // which edition of the nft this particular one is -- will be 0 for unique NFTs
    }

    mapping nft_totals: field => u8;
    mapping nft_owners: field => address;
    mapping nft_stats: field => Stats;
    mapping settings: u8 => u128;
    mapping whitelist: address => u8;

    transition initialize_collection(
        public total: u128,
        public symbol: u128,
        public base_uri: BaseURI,
    ) {
        assert_eq(self.caller, aleo1gy3d0s00s2k7rmgqznnx2q8htmjm2p5rk8q40u5yklqhe44utvys0dmzdy); // TODO: change server address
        return then finalize(total, symbol, base_uri);
    }

    finalize initialize_collection(
        public total: u128,
        public symbol: u128,
        public base_uri: BaseURI,
    ) {
        // Ensure initialize cannot be called twice!
        let is_initialized: u128 = settings.get_or_use(0u8, 0u128);
        assert_eq(is_initialized, 0u128); 

        settings.set(0u8, 1u128); // Collection has been initialized
        settings.set(1u8, total); // Number of total NFTs (first-editions) that can be minted
        settings.set(2u8, 0u128); // Is the mint live
        settings.set(3u8, symbol); // Symbol for the NFT
        settings.set(4u8, base_uri.data0); // Base URI for NFT
        settings.set(5u8, base_uri.data1);
        settings.set(6u8, base_uri.data2);
        settings.set(7u8, base_uri.data3);
        settings.set(8u8, 0u128); // Block height for mint to go live (given mint is live setting)
        settings.set(9u8, 0u128); // If collection is frozen
    }
    
    // Load the data into the mapping
    // Enables someone to mint an NFT with provided image data
    transition add_nft(public tokenId: TokenId, public edition: scalar) {
        assert_eq(self.caller, aleo1gy3d0s00s2k7rmgqznnx2q8htmjm2p5rk8q40u5yklqhe44utvys0dmzdy); // TODO: change server address
        let tokenHash: field = BHP256::hash_to_field(tokenId);
        let tokenEditionHash: field = BHP256::commit_to_field(tokenHash, edition);
        return then finalize(tokenEditionHash);
    }

    finalize add_nft(public tokenEditionHash: field) {
        let frozen: u128 = settings.get(9u8);
        assert_eq(frozen, 0u128);

        let existing_editions: u8 = nft_totals.get_or_use(tokenEditionHash, 255u8);
        assert_eq(existing_editions, 255u8);
        nft_totals.set(tokenEditionHash, 1u8);

        // Reduce the amount of total nfts that can be minted
        let remaining: u128 = settings.get(1u8);
        settings.set(1u8, remaining - 1u128);
    }

    transition add_minter(public minter: address, public amount: u8) {
        assert_eq(self.caller, aleo1gy3d0s00s2k7rmgqznnx2q8htmjm2p5rk8q40u5yklqhe44utvys0dmzdy); // TODO: change server address
        return then finalize(minter, amount);
    }

    finalize add_minter(
        public minter: address,
        public amount: u8
        )
    {
        let frozen: u128 = settings.get(9u8);
        assert_eq(frozen, 0u128);

        whitelist.set(minter, amount);
    }

    transition set_mint_status(public status: u128) {
        assert_eq(self.caller, aleo1gy3d0s00s2k7rmgqznnx2q8htmjm2p5rk8q40u5yklqhe44utvys0dmzdy); // TODO: change server address
        return then finalize(status);
    }

    finalize set_mint_status(public status: u128) {
        let frozen: u128 = settings.get(9u8);
        assert_eq(frozen, 0u128);

        settings.set(2u8, status);
    }

    transition set_mint_block(public mint_block: u128) {
        assert_eq(self.caller, aleo1gy3d0s00s2k7rmgqznnx2q8htmjm2p5rk8q40u5yklqhe44utvys0dmzdy); // TODO: change server address
        return then finalize(mint_block);
    }

    finalize set_mint_block(public mint_block: u128) {
        let frozen: u128 = settings.get(9u8);
        assert_eq(frozen, 0u128);

        settings.set(8u8, mint_block);
    }

    transition update_symbol(public symbol: u128) {
        assert_eq(self.caller, aleo1gy3d0s00s2k7rmgqznnx2q8htmjm2p5rk8q40u5yklqhe44utvys0dmzdy); // TODO: change server address
        return then finalize(symbol);
    }

    finalize update_symbol(public symbol: u128) {
        let frozen: u128 = settings.get(9u8);
        assert_eq(frozen, 0u128);

        settings.set(3u8, symbol);
    }

    transition update_base_uri(public base_uri: BaseURI) {
        assert_eq(self.caller, aleo1gy3d0s00s2k7rmgqznnx2q8htmjm2p5rk8q40u5yklqhe44utvys0dmzdy); // TODO: change server address
        return then finalize(base_uri);
    }

    finalize update_base_uri(public base_uri: BaseURI) {
        let frozen: u128 = settings.get(9u8);
        assert_eq(frozen, 0u128);

        settings.set(4u8, base_uri.data0); // Base URI for NFT
        settings.set(5u8, base_uri.data1);
        settings.set(6u8, base_uri.data2);
        settings.set(7u8, base_uri.data3);
    }

    transition freeze() {
        assert_eq(self.caller, aleo1gy3d0s00s2k7rmgqznnx2q8htmjm2p5rk8q40u5yklqhe44utvys0dmzdy); // TODO: change server address
        return then finalize();
    }

    finalize freeze() {
        let frozen: u128 = settings.get(9u8);
        assert_eq(frozen, 0u128);

        settings.set(9u8, 1u128);
    }

    // TODO: Relace mint with claim
    // Merkle root needs to be stored in settings as u128

    transition mint(public tokenId: TokenId, public edition: scalar, stats: Stats) -> NFT {
        let tokenHash: field = BHP256::hash_to_field(tokenId);
        let tokenEditionHash: field = BHP256::commit_to_field(tokenHash, edition);
        return NFT {
            owner: self.caller,
            data: tokenId,
            edition,
            stats
        } then finalize(self.caller, tokenEditionHash);
    }

    finalize mint(public owner: address, public tokenEditionHash: field) {
        // Ensure mint is live
        let is_live: u128 = settings.get(2u8);
        assert_eq(is_live, 1u128);

        // Ensure owner can mint and decrease remaining mints (overflow protection)
        let remaining: u8 = whitelist.get(owner);
        whitelist.set(owner, remaining - 1u8);

        // Ensure more editions can be made and decrease remaining editions (overflow protection)
        let amount: u8 = nft_totals.get(tokenEditionHash);
        nft_totals.set(tokenEditionHash, amount - 1u8);
    }

    transition transfer_private(
        nft: NFT,
        private receiver: address
    ) -> NFT
    {
        return NFT {
            owner: receiver,
            data: nft.data,
            edition: nft.edition,
            stats: nft.stats
        };
    }

    transition transfer_public(
        private receiver: address,
        private data: TokenId,
        private edition: scalar
    )
    {
        let tokenHash: field = BHP256::hash_to_field(data);
        let tokenEditionHash: field = BHP256::commit_to_field(tokenHash, edition);
        let caller: address = self.caller;
        return then finalize(receiver, tokenEditionHash, caller);
    }

    finalize transfer_public(
        public receiver: address,
        public tokenEditionHash: field,
        public caller: address
    )
    {
        assert_eq(caller, nft_owners.get(tokenEditionHash));
        nft_owners.set(tokenEditionHash, receiver);
    }

    transition convert_private_to_public(
        nft: NFT
    )
    {
        let tokenHash: field = BHP256::hash_to_field(nft.data);
        let tokenEditionHash: field = BHP256::commit_to_field(tokenHash, nft.edition);
        return then finalize(nft.owner, tokenEditionHash, nft.stats);
    }

    finalize convert_private_to_public(
        public owner: address,
        public tokenEditionHash: field,
        public stats: Stats
    )
    {
        nft_owners.set(tokenEditionHash, owner);
        nft_stats.set(tokenEditionHash, stats);
    }

    transition convert_public_to_private(
        private owner: address,
        private data: TokenId,
        private edition: scalar,
        private stats: Stats,
    ) -> NFT
    {
        assert_eq(owner, self.caller);
        let tokenHash: field = BHP256::hash_to_field(data);
        let tokenEditionHash: field = BHP256::commit_to_field(tokenHash, edition);
        return NFT {
            owner,
            data,
            edition,
            stats
        } then finalize(owner, tokenEditionHash, stats);
    }

    finalize convert_public_to_private(
        public owner: address,
        public tokenEditionHash: field,
        public stats: Stats
    )
    {
        assert_eq(owner, nft_owners.get(tokenEditionHash));
        assert_eq(stats, nft_stats.get(tokenEditionHash));
        // mapping::remove is not implemented yet, so instead we set the owner to be a dummy address that cannot publicly transfer or convert to private
        nft_owners.set(tokenEditionHash, aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc);
    }

    transition prove_ownership(private nft: NFT, private prove_to: address) -> (NFT, NFT_ownership) {
        return (
            NFT {
                owner: nft.owner,
                data: nft.data,
                edition: nft.edition,
                stats: nft.stats
            },
            NFT_ownership {
                owner: prove_to,
                nft_owner: nft.owner,
                data: nft.data,
                edition: nft.edition,
                stats: nft.stats
            }
        );
    }

    transition lock_nft_for_play(private nft: NFT) -> LockedNFT {
        return LockedNFT {
            owner: aleo1gy3d0s00s2k7rmgqznnx2q8htmjm2p5rk8q40u5yklqhe44utvys0dmzdy, // TODO: Change server address
            token_owner: nft.owner,
            token_id_data1: nft.data.data1,
            token_id_data2: nft.data.data2,
            edition: nft.edition,
            w_type: nft.stats.w_type, // Melee | Range | Support
            consumption_rate: nft.stats.consumption_rate,
            critical_chance: nft.stats.critical_chance,
            dura_ammo: nft.stats.dura_ammo, // For default weapon (weapon on NFT), dura_ammo is infinity
            damage: nft.stats.damage,
            hit_chance: nft.stats.hit_chance,
            number_of_hits: nft.stats.number_of_hits,
        };
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

    transition claim_unlocked_nft(private nft: UnlockedNFT) -> NFT {
        return NFT{
            owner: nft.owner,
            data: TokenId{
                data1: nft.token_id_data1,
                data2: nft.token_id_data2
            },
            edition: nft.edition,
            stats: Stats {
                w_type: nft.w_type, // Melee | Range | Support
                consumption_rate: nft.consumption_rate,
                critical_chance: nft.critical_chance,
                dura_ammo: nft.dura_ammo, // For default weapon (weapon on NFT), dura_ammo is infinity
                damage: nft.damage,
                hit_chance: nft.hit_chance,
                number_of_hits: nft.number_of_hits,
            }
        };
    }

}

