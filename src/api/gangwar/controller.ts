import { RequestHandler } from "express";

import { leo } from "../../services";

interface GangwarController {
  initialize: RequestHandler;
  startGame: RequestHandler;
  gameLoop: RequestHandler;
}

export const gangwarController: GangwarController = {
  initialize: async (req, res) => {
    const { owner, randomSeed, privateKey, viewKey } = req.body;
    const initialized = await leo.gangwar.initialize(privateKey, viewKey, randomSeed);
    res.send({ initialized });
  },
  startGame: async (req, res) => {
    const { owner, simulationId, teamA, teamB, randomSeed, privateKey, viewKey } = req.body;
    const war = await leo.gangwar.startGame(privateKey, viewKey, owner, simulationId, teamA, teamB, randomSeed);
    res.send({ war });
  },
  gameLoop: async (req, res) => {
    const { owner, simulationId, war, randomSeed, privateKey, viewKey } = req.body;
    const warUpdate = await leo.gangwar.gameLoop(privateKey, viewKey, owner, simulationId, war, randomSeed);
    res.send({ warUpdate });
  },
};
