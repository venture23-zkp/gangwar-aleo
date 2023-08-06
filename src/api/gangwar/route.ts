import { Router } from "express";
import asyncHandler from "express-async-handler";

import { validate } from "../middlewares";
import { gangwarController } from "./controller";
import { schemas } from "./schemas";

export const router = Router();

router.post("/create-game", validate({ body: schemas.body.createGame }), asyncHandler(gangwarController.createGame));
router.get("/settings", validate({ body: schemas.body.fetchGameSettings }), asyncHandler(gangwarController.fetchSettings));
router.post("/sign", validate({ body: schemas.body.sign }), asyncHandler(gangwarController.sign));
router.post("/join-game", validate({ body: schemas.body.joinGame }), asyncHandler(gangwarController.joinGame));
