import { gangwar } from "./gangwar";
import { weaponNFT } from "./weaponNFT";

jest.setTimeout(600000);

describe("Gangwar Service", () => {
  const keys = {
    owner: "aleo1z9rkh2xecmpnx9jxkvnyq08mfeddrsrccny0j2hgw4yfhnxpxyqqp42329",
    privateKey: "APrivateKey1zkp3WTnfDxUchbLeHqwGrgdkTNieykUP72UPNmv4uQngjwf",
    viewKey: "AViewKey1fvqnzQ9nYfFMAkhjdcz5UEtDD1JjpbtG8kMXBLJKAHbd",
  };

  it("Initialize a collection", async () => {
    const { owner, privateKey, viewKey } = keys;
    const totalNFTs = 100;
    const symbol = "TEST";
    const baseURI = "https://ipfs.io/ipfs/QmYCQudEvXLbkgsnWj";
    // const baseURI = "https://ipfs.io/ipfs/QmYCQudEvXLbkgsnWjGKqBf6JVNREcV4Soni4CuQWxYQLt";
    await weaponNFT.initialize_collection(privateKey, viewKey, totalNFTs, symbol, baseURI);
    // TODO: test the mapping
  });
});
