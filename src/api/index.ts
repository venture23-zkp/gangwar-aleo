import { Router } from "express";

import { router as accountRouter } from "./account/route";
import { router as gangwarEngineRouter } from "./gangwarEngine/route";

import { handleError } from "./middlewares";

export const router = Router();

router.use("/account", accountRouter);
router.use("/gangwar-engine", gangwarEngineRouter);

router.use(handleError);
