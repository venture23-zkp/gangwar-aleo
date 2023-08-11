import { characterSchema, GangwarSettings, Player, ToggleSettings, War } from "../../types";
import { nft } from "./nft";
import { createCharacters } from "../../core/gangwar";
import { leoParse } from "../../utils";

jest.setTimeout(600000);

describe("NFT Service", () => {
  const keys = {
    owner: "aleo1z9rkh2xecmpnx9jxkvnyq08mfeddrsrccny0j2hgw4yfhnxpxyqqp42329",
    privateKey: "APrivateKey1zkp3WTnfDxUchbLeHqwGrgdkTNieykUP72UPNmv4uQngjwf",
    viewKey: "AViewKey1fvqnzQ9nYfFMAkhjdcz5UEtDD1JjpbtG8kMXBLJKAHbd",
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
});
