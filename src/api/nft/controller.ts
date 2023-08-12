import { RequestHandler } from "express";

import { leo } from "../../services";
import { logger } from "../../utils";

interface NftController {
  collectionInfo: RequestHandler;
  initializeCollection: RequestHandler;
  // addNft: RequestHandler;
  // addMinter: RequestHandler;
  // updateToggleSettings: RequestHandler;
  // setMintBlock: RequestHandler;
  // updateSymbol: RequestHandler;
  // updateBaseURI: RequestHandler;
  // openMint: RequestHandler;
  // mint: RequestHandler;
  // claimNft: RequestHandler;
}

export const nftController: NftController = {
  collectionInfo: async (req, res) => {
    const collectionInfo = await leo.nft.getNftCollectionInfo();
    res.send({ collectionInfo });
  },
  initializeCollection: async (req, res) => {
    const { owner, privateKey, viewKey, maxSupply, symbol, baseURI } = req.body;
    const collectionInfo = await leo.nft.initializeCollection(privateKey, viewKey, maxSupply, symbol, baseURI);
    res.send({ collectionInfo });
  },
};
