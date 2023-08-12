import { RequestHandler } from "express";

import { leo } from "../../services";
import { logger } from "../../utils";

interface NftController {
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
  initializeCollection: async (req, res) => {
    const { owner, privateKey, viewKey, maxSupply, symbol, baseURI } = req.body;
    const gameSettings = await leo.nft.initializeCollection(privateKey, viewKey, maxSupply, symbol, baseURI);
    logger.info(gameSettings);
    res.send({ gameSettings });
  },
};
