import { RequestHandler } from "express";

import { leo } from "../../services";
import { logger } from "../../utils";

interface NftController {
  collectionInfo: RequestHandler;
  initializeCollection: RequestHandler;
  addNft: RequestHandler;
  addMinter: RequestHandler;
  updateToggleSettings: RequestHandler;
  setMintBlock: RequestHandler;
  updateSymbol: RequestHandler;
  updateBaseURI: RequestHandler;
  openMint: RequestHandler;
  mint: RequestHandler;
  claimNft: RequestHandler;
  fetchNftMintRecords: RequestHandler;
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
  addNft: async (req, res) => {
    const { owner, privateKey, viewKey, tokenId, edition } = req.body;
    const collectionInfo = await leo.nft.addNft(privateKey, viewKey, tokenId, edition);
    res.send({ collectionInfo });
  },
  addMinter: async (req, res) => {
    const { owner, privateKey, viewKey, minter, amount } = req.body;
    const collectionInfo = await leo.nft.addMinter(privateKey, viewKey, minter, amount);
    res.send({ collectionInfo });
  },
  updateToggleSettings: async (req, res) => {
    const { owner, privateKey, viewKey, settings } = req.body;
    const collectionInfo = await leo.nft.updateToggleSettings(privateKey, viewKey, settings);
    res.send({ collectionInfo });
  },
  setMintBlock: async (req, res) => {
    const { owner, privateKey, viewKey, mintBlock } = req.body;
    const collectionInfo = await leo.nft.setMintBlock(privateKey, viewKey, mintBlock);
    res.send({ collectionInfo });
  },
  updateSymbol: async (req, res) => {
    const { owner, privateKey, viewKey, newSymbol } = req.body;
    const collectionInfo = await leo.nft.updateSymbol(privateKey, viewKey, newSymbol);
    res.send({ collectionInfo });
  },
  updateBaseURI: async (req, res) => {
    const { owner, privateKey, viewKey, newBaseURI } = req.body;
    const collectionInfo = await leo.nft.updateBaseURI(privateKey, viewKey, newBaseURI);
    res.send({ collectionInfo });
  },
  openMint: async (req, res) => {
    const { owner, privateKey, viewKey } = req.body;
    const collectionInfo = await leo.nft.openMint(privateKey, viewKey);
    res.send({ collectionInfo });
  },
  mint: async (req, res) => {
    const { owner, privateKey, viewKey, mintRecord } = req.body;
    const collectionInfo = await leo.nft.mint(privateKey, viewKey, mintRecord);
    res.send({ collectionInfo });
  },
  claimNft: async (req, res) => {
    const { owner, privateKey, viewKey, claimRecord, tokenId, edition } = req.body;
    const collectionInfo = await leo.nft.claimNFT(privateKey, viewKey, claimRecord, tokenId, edition);
    res.send({ collectionInfo });
  },
  fetchNftMintRecords: async (req, res) => {
    const { owner, privateKey, viewKey, claimRecord, tokenId, edition } = req.body;
    const collectionInfo = await leo.nft.fetchUnspentNftMintReocrds(privateKey, viewKey);
    res.send({ collectionInfo });
  },
};
