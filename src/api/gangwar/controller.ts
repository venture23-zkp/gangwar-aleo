import { RequestHandler } from "express";

import { leo } from "../../services";
import { logger } from "../../utils";

interface GangwarController {
  createGame: RequestHandler;
  sign: RequestHandler;
  joinGame: RequestHandler;
  fetchSettings: RequestHandler;
}

export const gangwarController: GangwarController = {
  createGame: async (req, res) => {
    const { owner, privateKey, viewKey, simulationId, registrationDuration, maxNumberOfPlayers, gameloopCount } = req.body;
    const gameSettings = await leo.gangwar.createGame(
      privateKey,
      viewKey,
      simulationId,
      registrationDuration,
      maxNumberOfPlayers,
      gameloopCount
    );
    logger.info(gameSettings);
    res.send({ gameSettings });
  },
  fetchSettings: async (req, res) => {
    const { simulationId } = req.body;
    const gameSettings = await leo.gangwar.fetchGangwarSettings(simulationId);
    res.send({ gameSettings });
  },
  sign: async (req, res) => {
    const { owner, privateKey, viewKey, character, sk, k, validityTimestamp } = req.body;
    const signature = await leo.gangwar.sign(privateKey, viewKey, character, sk, k, validityTimestamp);
    res.send({ signature });
  },
  joinGame: async (req, res) => {
    const { owner, privateKey, viewKey, simulationId, character, signature } = req.body;
    const playerRecord = await leo.gangwar.joinGame(privateKey, viewKey, simulationId, character, signature);
    res.send({ playerRecord });
  },
};
