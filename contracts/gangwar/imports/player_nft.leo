// The 'player_nft' program.
program player_nft.aleo {

    // dummy address, ie the aleo address equivalent of 0: aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc
    struct PlayerTokenId {
        data1: u128, // Part 1 of the image data -- i.e., a way to link this nft to image or aws
        data2: u128,
    }

    // base uri ascii bits. Include as many data pieces as necessary to encapsulate the uri. Padded with 0s at the end.
    struct PlayerBaseURI {
        data0: u128, // Part 1 of the base uri in bits. Bits should be the representation of the hexadecimal bytes for the ASCII text of the URL
        data1: u128,
        data2: u128,
        data3: u128
    }

    struct PlayerSymbolBits {
        data: u128 // The sybmol's ascii text represented in bits, and the u128 value of the bitstring.
    }

    struct PlayerStats {
        strength: u128,
        health: u128,
        dodge_chance: u128,
        hit_chance: u128,
        critical_chance: u128,
        melee_damage: u128
    }

    record PlayerNFT {
        private owner: address,
        private data: PlayerTokenId,
        private edition: scalar, // which edition of the nft this particular one is -- will be 0 for unique NFTs
        private stats: PlayerStats
    }

    // a way to prove ownership of an nft privately
    record Player_NFT_ownership {
        private owner: address,
        private nft_owner: address,
        private data: PlayerTokenId,
        private stats: PlayerStats,
        private edition: scalar, // which edition of the nft this particular one is -- will be 0 for unique NFTs
    }

    mapping player_nft_totals: field => u8;
    mapping player_nft_owners: field => address;
    mapping player_nft_stats: field => PlayerStats;
    mapping player_settings: u8 => u128;
    mapping player_whitelist: address => u8;

    transition initialize_player_collection(
        public total: u128,
        public symbol: u128,
        public base_uri: PlayerBaseURI,
    ) {
        assert_eq(self.caller, aleo1gy3d0s00s2k7rmgqznnx2q8htmjm2p5rk8q40u5yklqhe44utvys0dmzdy);
        return then finalize(total, symbol, base_uri);
    }

    finalize initialize_player_collection(
        public total: u128,
        public symbol: u128,
        public base_uri: PlayerBaseURI,
    ) {
        // Ensure initialize cannot be called twice!
        let is_initialized: u128 = player_settings.get_or_use(0u8, 0u128);
        assert_eq(is_initialized, 0u128); 

        player_settings.set(0u8, 1u128); // Collection has been initialized
        player_settings.set(1u8, total); // Number of total NFTs (first-editions) that can be minted
        player_settings.set(2u8, 0u128); // Is the mint live
        player_settings.set(3u8, symbol); // Symbol for the PlayerNFT
        player_settings.set(4u8, base_uri.data0); // Base URI for PlayerNFT
        player_settings.set(5u8, base_uri.data1);
        player_settings.set(6u8, base_uri.data2);
        player_settings.set(7u8, base_uri.data3);
        player_settings.set(8u8, 0u128); // Block height for mint to go live (given mint is live setting)
        player_settings.set(9u8, 0u128); // If collection is frozen
    }
    
    // Load the data into the mapping
    // Enables someone to mint an PlayerNFT with provided image data
    transition add_player_nft(public tokenId: PlayerTokenId, public edition: scalar) {
        assert_eq(self.caller, aleo1gy3d0s00s2k7rmgqznnx2q8htmjm2p5rk8q40u5yklqhe44utvys0dmzdy);
        let tokenHash: field = BHP256::hash_to_field(tokenId);
        let tokenEditionHash: field = BHP256::commit_to_field(tokenHash, edition);
        return then finalize(tokenEditionHash);
    }

    finalize add_player_nft(public tokenEditionHash: field) {
        let frozen: u128 = player_settings.get(9u8);
        assert_eq(frozen, 0u128);

        let existing_editions: u8 = player_nft_totals.get_or_use(tokenEditionHash, 255u8);
        assert_eq(existing_editions, 255u8);
        player_nft_totals.set(tokenEditionHash, 1u8);

        // Reduce the amount of total nfts that can be minted
        let remaining: u128 = player_settings.get(1u8);
        player_settings.set(1u8, remaining - 1u128);
    }

    transition add_player_minter(public minter: address, public amount: u8) {
        assert_eq(self.caller, aleo1gy3d0s00s2k7rmgqznnx2q8htmjm2p5rk8q40u5yklqhe44utvys0dmzdy);
        return then finalize(minter, amount);
    }

    finalize add_player_minter(
        public minter: address,
        public amount: u8
        )
    {
        let frozen: u128 = player_settings.get(9u8);
        assert_eq(frozen, 0u128);

        player_whitelist.set(minter, amount);
    }

    transition set_player_mint_stats(public status: u128) {
        assert_eq(self.caller, aleo1gy3d0s00s2k7rmgqznnx2q8htmjm2p5rk8q40u5yklqhe44utvys0dmzdy);
        return then finalize(status);
    }

    finalize set_player_mint_stats(public status: u128) {
        let frozen: u128 = player_settings.get(9u8);
        assert_eq(frozen, 0u128);

        player_settings.set(2u8, status);
    }

    transition set_player_mint_block(public mint_block: u128) {
        assert_eq(self.caller, aleo1gy3d0s00s2k7rmgqznnx2q8htmjm2p5rk8q40u5yklqhe44utvys0dmzdy);
        return then finalize(mint_block);
    }

    finalize set_player_mint_block(public mint_block: u128) {
        let frozen: u128 = player_settings.get(9u8);
        assert_eq(frozen, 0u128);

        player_settings.set(8u8, mint_block);
    }

    transition update_player_symbol(public symbol: u128) {
        assert_eq(self.caller, aleo1gy3d0s00s2k7rmgqznnx2q8htmjm2p5rk8q40u5yklqhe44utvys0dmzdy);
        return then finalize(symbol);
    }

    finalize update_player_symbol(public symbol: u128) {
        let frozen: u128 = player_settings.get(9u8);
        assert_eq(frozen, 0u128);

        player_settings.set(3u8, symbol);
    }

    transition update_player_base_uri(public base_uri: PlayerBaseURI) {
        assert_eq(self.caller, aleo1gy3d0s00s2k7rmgqznnx2q8htmjm2p5rk8q40u5yklqhe44utvys0dmzdy);
        return then finalize(base_uri);
    }

    finalize update_player_base_uri(public base_uri: PlayerBaseURI) {
        let frozen: u128 = player_settings.get(9u8);
        assert_eq(frozen, 0u128);

        player_settings.set(4u8, base_uri.data0); // Base URI for PlayerNFT
        player_settings.set(5u8, base_uri.data1);
        player_settings.set(6u8, base_uri.data2);
        player_settings.set(7u8, base_uri.data3);
    }

    transition freeze_player() {
        assert_eq(self.caller, aleo1gy3d0s00s2k7rmgqznnx2q8htmjm2p5rk8q40u5yklqhe44utvys0dmzdy);
        return then finalize();
    }

    finalize freeze_player() {
        let frozen: u128 = player_settings.get(9u8);
        assert_eq(frozen, 0u128);

        player_settings.set(9u8, 1u128);
    }

    // TODO: Relace mint with claim
    // Merkle root needs to be stored in player_settings as u128

    // transition mint(public tokenId: PlayerTokenId, public edition: scalar) -> PlayerNFT {
    //     let tokenHash: field = BHP256::hash_to_field(tokenId);
    //     let tokenEditionHash: field = BHP256::commit_to_field(tokenHash, edition);
    //     return PlayerNFT {
    //         owner: self.caller,
    //         data: tokenId,
    //         edition
    //     } then finalize(self.caller, tokenEditionHash);
    // }

    // finalize mint(public owner: address, public tokenEditionHash: field) {
    //     // Ensure mint is live
    //     let is_live: u128 = player_settings.get(2u8);
    //     assert_eq(is_live, 1u128);

    //     // Ensure owner can mint and decrease remaining mints (overflow protection)
    //     let remaining: u8 = player_whitelist.get(owner);
    //     player_whitelist.set(owner, remaining - 1u8);

    //     // Ensure more editions can be made and decrease remaining editions (overflow protection)
    //     let amount: u8 = player_nft_totals.get(tokenEditionHash);
    //     player_nft_totals.set(tokenEditionHash, amount - 1u8);
    // }

    transition transfer_player_private(
        nft: PlayerNFT,
        private receiver: address
    ) -> PlayerNFT
    {
        return PlayerNFT {
            owner: receiver,
            data: nft.data,
            edition: nft.edition,
            stats: nft.stats
        };
    }

    transition transfer_player_public(
        private receiver: address,
        private data: PlayerTokenId,
        private edition: scalar
    )
    {
        let tokenHash: field = BHP256::hash_to_field(data);
        let tokenEditionHash: field = BHP256::commit_to_field(tokenHash, edition);
        let caller: address = self.caller;
        return then finalize(receiver, tokenEditionHash, caller);
    }

    finalize transfer_player_public(
        public receiver: address,
        public tokenEditionHash: field,
        public caller: address
    )
    {
        assert_eq(caller, player_nft_owners.get(tokenEditionHash));
        player_nft_owners.set(tokenEditionHash, receiver);
    }

    transition convert_player_to_public(
        nft: PlayerNFT
    )
    {
        let tokenHash: field = BHP256::hash_to_field(nft.data);
        let tokenEditionHash: field = BHP256::commit_to_field(tokenHash, nft.edition);
        return then finalize(nft.owner, tokenEditionHash, nft.stats);
    }

    finalize convert_player_to_public(
        public owner: address,
        public tokenEditionHash: field,
        public stats: PlayerStats
    )
    {
        player_nft_owners.set(tokenEditionHash, owner);
        player_nft_stats.set(tokenEditionHash, stats);
    }

    transition convert_player_to_private(
        private owner: address,
        private data: PlayerTokenId,
        private edition: scalar,
        private stats: PlayerStats,
    ) -> PlayerNFT
    {
        assert_eq(owner, self.caller);
        let tokenHash: field = BHP256::hash_to_field(data);
        let tokenEditionHash: field = BHP256::commit_to_field(tokenHash, edition);
        return PlayerNFT {
            owner,
            data,
            edition,
            stats
        } then finalize(owner, tokenEditionHash, stats);
    }

    finalize convert_player_to_private(
        public owner: address,
        public tokenEditionHash: field,
        public stats: PlayerStats
    )
    {
        assert_eq(owner, player_nft_owners.get(tokenEditionHash));
        assert_eq(stats, player_nft_stats.get(tokenEditionHash));
        // mapping::remove is not implemented yet, so instead we set the owner to be a dummy address that cannot publicly transfer or convert to private
        player_nft_owners.set(tokenEditionHash, aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc);
    }

    transition prove_ownership_of_player(private nft: PlayerNFT, private prove_to: address) -> (PlayerNFT, Player_NFT_ownership) {
        return (
            PlayerNFT {
                owner: nft.owner,
                data: nft.data,
                edition: nft.edition,
                stats: nft.stats
            },
            Player_NFT_ownership {
                owner: prove_to,
                nft_owner: nft.owner,
                data: nft.data,
                edition: nft.edition,
                stats: nft.stats
            }
        );
    }

}





