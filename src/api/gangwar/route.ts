import { Router } from "express";
import asyncHandler from "express-async-handler";

import { validate } from "../middlewares";
import { gangwarController } from "./controller";
import { schemas } from "./schemas";

export const router = Router();

router.get("/settings", validate({ body: schemas.body.fetchGameSettings }), asyncHandler(gangwarController.fetchSettings));
router.post("/create-game", validate({ body: schemas.body.createGame }), asyncHandler(gangwarController.createGame));
router.post("/sign", validate({ body: schemas.body.sign }), asyncHandler(gangwarController.sign));
router.post("/join-game", validate({ body: schemas.body.joinGame }), asyncHandler(gangwarController.joinGame));
router.post("/start-game", validate({ body: schemas.body.startGame }), asyncHandler(gangwarController.startGame));
router.post("/fetch/players", validate({ body: schemas.body.fetchPlayerRecords }), asyncHandler(gangwarController.fetchPlayerRecords));
router.post("/fetch/war", validate({ body: schemas.body.fetchWarRecord }), asyncHandler(gangwarController.fetchWarRecord));
