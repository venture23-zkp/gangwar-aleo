import { RequestHandler } from "express";

import { leo } from "../../services";
import { logger } from "../../utils";

interface GangwarController {
  createGame: RequestHandler;
  updateRegistrationTime: RequestHandler;
  sign: RequestHandler;
  verify: RequestHandler;
  joinGame: RequestHandler;
  fetchSettings: RequestHandler;
  startGame: RequestHandler;
  fetchPlayerRecords: RequestHandler;
  fetchWarRecord: RequestHandler;
  simulate: RequestHandler;
  finish: RequestHandler;
}

export const gangwarController: GangwarController = {
  createGame: async (req, res) => {
    const {
      owner,
      privateKey,
      viewKey,
      simulationId,
      registrationDuration,
      maxNumberOfPlayers,
      maxRounds,
      participationLootcrateCount,
      winnerLootcrateCount,
    } = req.body;
    const gameSettings = await leo.gangwar.createGame(
      privateKey,
      viewKey,
      simulationId,
      registrationDuration,
      maxNumberOfPlayers,
      maxRounds,
      participationLootcrateCount,
      winnerLootcrateCount
    );
    logger.info(gameSettings);
    res.send({ gameSettings });
  },
  updateRegistrationTime: async (req, res) => {
    const { owner, privateKey, viewKey, simulationId, registrationDuration } = req.body;
    const gameSettings = await leo.gangwar.updateRegistrationTime(privateKey, viewKey, simulationId, registrationDuration);
    // logger.info(gameSettings);
    res.send({ gameSettings });
  },
  fetchSettings: async (req, res) => {
    const { simulationId } = req.body;
    const gameSettings = await leo.gangwar.fetchGangwarSettings(simulationId);
    res.send({ gameSettings });
  },
  sign: async (req, res) => {
    const { character, sk, k } = req.body;
    const signature = await leo.gangwar.sign(character, sk);
    res.send({ signature });
  },
  verify: async (req, res) => {
    const { character, signature } = req.body;
    const valid = await leo.gangwar.verifySig(character, signature);
    res.send({ valid });
  },
  joinGame: async (req, res) => {
    const { owner, privateKey, viewKey, simulationId, character, signature } = req.body;
    const playerRecord = await leo.gangwar.joinGame(privateKey, viewKey, simulationId, character, signature);
    res.send({ playerRecord });
  },
  fetchPlayerRecords: async (req, res) => {
    const { owner, privateKey, viewKey, simulationId } = req.body;
    const playerRecords = await leo.gangwar.fetchPlayerRecords(privateKey, viewKey, simulationId);
    res.send({ playerRecords });
  },
  startGame: async (req, res) => {
    const { owner, privateKey, viewKey, simulationId } = req.body;
    const warRecord = await leo.gangwar.startGame(privateKey, viewKey, simulationId);
    res.send({ warRecord });
  },
  fetchWarRecord: async (req, res) => {
    const { owner, privateKey, viewKey, simulationId } = req.body;
    const warRecord = await leo.gangwar.fetchWarRecord(privateKey, viewKey, simulationId);
    res.send({ warRecord });
  },
  simulate: async (req, res) => {
    const { owner, privateKey, viewKey, war } = req.body;
    const warRecord = await leo.gangwar.simulate1vs1(privateKey, viewKey, war);
    res.send({ warRecord });
  },
  finish: async (req, res) => {
    const { owner, privateKey, viewKey, war } = req.body;
    const warRecord = await leo.gangwar.finishGame(privateKey, viewKey, war);
    res.send({ warRecord });
  },
};
