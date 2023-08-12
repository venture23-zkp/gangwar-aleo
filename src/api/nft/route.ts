import { Router } from "express";
import asyncHandler from "express-async-handler";

import { validate } from "../middlewares";
import { nftController } from "./controller";
import { schemas } from "./schemas";

export const router = Router();

router.get("/collection-info", asyncHandler(nftController.initializeCollection));
router.post(
  "/initialize-collection",
  validate({ body: schemas.body.initializeCollection }),
  asyncHandler(nftController.initializeCollection)
);
