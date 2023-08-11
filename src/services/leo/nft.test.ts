import { characterSchema, GangwarSettings, Player, ToggleSettings, War } from "../../types";
import { nft } from "./nft";
import { createCharacters } from "../../core/gangwar";
import { leoParse } from "../../utils";

jest.setTimeout(600000);

describe("NFT Service", () => {
  const keys = {
    owner: "aleo17m5xn97matnqe688dcfcaffyzeutnh6a74nsfhzjch4a6rf8xgrqkx59qx",
    privateKey: "APrivateKey1zkp38uWL76fvuDhHpk2jbHAs4EYcds88eekvx4Ys1kNz75p",
    viewKey: "AViewKey1gCZXMvC6EnBbo9sS2VpX35gyUp2BBzwpRpPcDqdSj7M1",
  };

  it("Initialize collection", async () => {
    const { owner, privateKey, viewKey } = keys;

    const totalSupply = 100;
    const baseUri = "http://this_is_a_test_uri/";
    const symbol = "TEST";
    await nft.initializeCollection(privateKey, viewKey, totalSupply, symbol, baseUri);
  });

  it("Add NFT", async () => {
    const { owner, privateKey, viewKey } = keys;

    const edition = "1";
    const tokenId = "test_token_id";
    await nft.addNft(privateKey, viewKey, tokenId, edition);
  });

  it("Add minter", async () => {
    const { owner, privateKey, viewKey } = keys;

    const minterAddress = owner;
    const amount = 5;
    await nft.addMinter(privateKey, viewKey, minterAddress, amount);
  });

  it("Update toggle settings", async () => {
    const { owner, privateKey, viewKey } = keys;

    const settings: ToggleSettings = {
      frozen: false,
      active: false,
      whiteList: false,
      initialized: true,
    };

    await nft.updateToggleSettings(privateKey, viewKey, settings);
  });

  it("Set Mint Block", async () => {
    const { owner, privateKey, viewKey } = keys;
    const mintBlock = 100;
    await nft.setMintBlock(privateKey, viewKey, mintBlock);
  });

  it("Update Symbol", async () => {
    const { owner, privateKey, viewKey } = keys;
    const newSymbol = "TEST1";
    await nft.updateSymbol(privateKey, viewKey, newSymbol);
  });

  it("Update Base URI", async () => {
    const { owner, privateKey, viewKey } = keys;
    const newBaseUri = "http://this_is_an_updated_test_uri/";
    await nft.updateBaseURI(privateKey, viewKey, newBaseUri);
  });

  it("Open Mint", async () => {
    const { owner, privateKey, viewKey } = keys;
    await nft.openMint(privateKey, viewKey);
  });

  it("Mint", async () => {
    const { owner, privateKey, viewKey } = keys;
    const nftMintRecord = {
      owner: "aleo17m5xn97matnqe688dcfcaffyzeutnh6a74nsfhzjch4a6rf8xgrqkx59qx",
      amount: 5,
      _nonce: "5524320542432222112841491635660055122702370579403838540366134620464737677652",
    };

    await nft.mint(privateKey, viewKey, nftMintRecord);
  });
});
