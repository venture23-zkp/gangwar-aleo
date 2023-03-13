import { RequestHandler } from "express";

import { leo } from "../../services";

interface RandomController {
  generateNumber: RequestHandler;
  generateHashChainRecord: RequestHandler;
}

export const randomController: RandomController = {
  generateNumber: async (req, res) => {
    const { seed, min, max, owner } = req.body;
    const value = await leo.rng.getRandomNumber(owner, seed, min, max);
    res.send(value);
  },
  generateHashChainRecord: async (req, res) => {
    const { owner, seed } = req.body;
    const value = await leo.hashChain.getHashChainRecord(owner, seed);
    res.send(value);
  },
};
