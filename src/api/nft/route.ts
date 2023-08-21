import { Router } from "express";
import asyncHandler from "express-async-handler";

import { validate } from "../middlewares";
import { nftController } from "./controller";
import { schemas } from "./schemas";

export const router = Router();

router.get("/collection-info", asyncHandler(nftController.collectionInfo));
router.post(
  "/initialize-collection",
  validate({ body: schemas.body.initializeCollection }),
  asyncHandler(nftController.initializeCollection)
);
router.post("/add-nft", validate({ body: schemas.body.addNft }), asyncHandler(nftController.addNft));
router.post("/add-minter", validate({ body: schemas.body.addMinter }), asyncHandler(nftController.addMinter));
router.post(
  "/update-toggle-settings",
  validate({ body: schemas.body.updateToggleSettings }),
  asyncHandler(nftController.updateToggleSettings)
);
router.post("/set-mint-block", validate({ body: schemas.body.setMintBlock }), asyncHandler(nftController.setMintBlock));
router.post("/update-symbol", validate({ body: schemas.body.updateSymbol }), asyncHandler(nftController.updateSymbol));
router.post("/update-baseURI", validate({ body: schemas.body.updateBaseURI }), asyncHandler(nftController.updateBaseURI));
router.post("/open-mint", validate({ body: schemas.body.openMint }), asyncHandler(nftController.openMint));
router.post("/mint", validate({ body: schemas.body.mint }), asyncHandler(nftController.mint));
router.post("/claim-nft", validate({ body: schemas.body.claimNft }), asyncHandler(nftController.claimNft));
router.post("/fetch/nft-mint-records", validate({ body: schemas.body.fetch }), asyncHandler(nftController.fetchNftMintRecords));
router.post("/fetch/nft-claim-records", validate({ body: schemas.body.fetch }), asyncHandler(nftController.fetchNftClaimRecords));
router.post("/fetch/nft-records", validate({ body: schemas.body.fetch }), asyncHandler(nftController.fetchNftRecords));
