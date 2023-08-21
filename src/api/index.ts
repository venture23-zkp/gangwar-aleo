import { Router } from "express";

import { router as accountRouter } from "./account/route";
import { router as gangwarRouter } from "./gangwar/route";
import { router as nftRouter } from "./nft/route";

import { handleError } from "./middlewares";

export const router = Router();

router.use("/account", accountRouter);
router.use("/gangwar", gangwarRouter);
router.use("/nft", nftRouter);

router.use(handleError);
