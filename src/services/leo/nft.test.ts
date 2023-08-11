import { characterSchema, GangwarSettings, Player, War } from "../../types";
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
    nft.initializeCollection(privateKey, viewKey, totalSupply, symbol, baseUri);
  });
});
