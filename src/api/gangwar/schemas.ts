import { number, z } from "zod";

import {
  characterSchema,
  leoAddressSchema,
  leoPrivateKeySchema,
  leoU128Schema,
  leoViewKeySchema,
  playerSchema,
  teamSchema,
  uuidSchema,
  warSchema,
} from "../../types";
import { schnorrSignatureSchema } from "../../types/dsa";

export const schemas = {
  body: {
    createGame: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      simulationId: z.number(),
      registrationDuration: z.number(),
      maxNumberOfPlayers: z.number(),
      maxRounds: z.number(),
      participationLootcrateCount: z.number(),
      winnerLootcrateCount: z.number(),
    }),
    fetchGameSettings: z.object({
      simulationId: z.number(),
    }),
    sign: z.object({
      character: characterSchema,
      sk: z.string(), // Secret key
      k: z.string(), // Not required
    }),
    verify: z.object({
      character: characterSchema,
      signature: schnorrSignatureSchema,
    }),
    joinGame: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      simulationId: z.number(),
      character: characterSchema,
      signature: schnorrSignatureSchema,
    }),
    startGame: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      simulationId: z.number(),
    }),
    fetchPlayerRecords: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      simulationId: z.number(),
      startHeight: z.number().optional(),
    }),
    fetchWarRecord: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      simulationId: z.number(),
    }),
    simulate: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      war: warSchema,
    }),
    updateRegistrationTime: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      simulationId: z.number(),
      registrationDuration: z.number(),
    }),
    updateMaxRounds: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      simulationId: z.number(),
      maxRounds: z.number(),
    }),
  },
};
