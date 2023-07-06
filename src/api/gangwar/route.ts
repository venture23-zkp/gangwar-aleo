import { Router } from "express";
import asyncHandler from "express-async-handler";

import { validate } from "../middlewares";
import { gangwarController } from "./controller";
import { schemas } from "./schemas";

export const router = Router();

router.post("/initialize", validate({ body: schemas.body.initialize }), asyncHandler(gangwarController.initialize));
router.post("/start-game", validate({ body: schemas.body.startGame }), asyncHandler(gangwarController.startGame));
router.post("/game-loop", validate({ body: schemas.body.gameLoop }), asyncHandler(gangwarController.gameLoop));
