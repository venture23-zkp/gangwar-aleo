import { RequestHandler } from "express";

import { leo } from "../../services";
import { logger } from "../../utils";

interface GangwarController {
  createGame: RequestHandler;
  sign: RequestHandler;
  joinGame: RequestHandler;
  fetchSettings: RequestHandler;
  startGame: RequestHandler;
  fetchPlayerRecords: RequestHandler;
  fetchWarRecord: RequestHandler;
}

export const gangwarController: GangwarController = {
  createGame: async (req, res) => {
    const { owner, privateKey, viewKey, simulationId, registrationDuration, maxNumberOfPlayers, maxRounds } = req.body;
    const gameSettings = await leo.gangwar.createGame(
      privateKey,
      viewKey,
      simulationId,
      registrationDuration,
      maxNumberOfPlayers,
      maxRounds
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
    const { character, sk, k } = req.body;
    const signature = await leo.gangwar.sign(character, sk, k);
    res.send({ signature });
  },
  joinGame: async (req, res) => {
    const { owner, privateKey, viewKey, simulationId, character, signature } = req.body;
    const playerRecord = await leo.gangwar.joinGame(privateKey, viewKey, simulationId, character, signature);
    res.send({ playerRecord });
  },
  startGame: async (req, res) => {
    const { owner, privateKey, viewKey, simulationId, players } = req.body;
    const playerRecord = await leo.gangwar.startGame(privateKey, viewKey, simulationId, players);
    res.send({ playerRecord });
  },
  fetchPlayerRecords: async (req, res) => {
    const { owner, privateKey, viewKey, simulationId } = req.body;
    const playerRecords = await leo.gangwar.fetchPlayerRecords(privateKey, viewKey, simulationId);
    res.send({ playerRecords });
  },
  fetchWarRecord: async (req, res) => {
    const { owner, privateKey, viewKey, simulationId } = req.body;
    const warRecord = await leo.gangwar.fetchWarRecord(privateKey, viewKey, simulationId);
    res.send({ warRecord });
  },
};
