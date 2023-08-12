import { Router } from "express";
import asyncHandler from "express-async-handler";

import { validate } from "../middlewares";
import { nftController } from "./controller";
import { schemas } from "./schemas";

export const router = Router();

router.post(
  "/initialize-collection",
  validate({ body: schemas.body.initializeCollection }),
  asyncHandler(nftController.initializeCollection)
);
