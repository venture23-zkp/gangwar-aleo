import { Router } from "express";

import { router as accountRouter } from "./account/route";
import { router as gangwarEngineRouter } from "./gangwarEngine/route";
import { router as gangwarRouter } from "./gangwar/route";

import { handleError } from "./middlewares";

export const router = Router();

router.use("/account", accountRouter);
router.use("/gangwar-engine", gangwarEngineRouter);
router.use("/gangwar", gangwarRouter);

router.use(handleError);
