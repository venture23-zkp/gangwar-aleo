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
    }),
    fetchGameSettings: z.object({
      simulationId: z.number(),
    }),
    sign: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      character: characterSchema,
      sk: z.string(), // Secret key
      k: z.string(), // Nonce for signing
      validityTimestamp: z.number(),
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
      players: z.array(playerSchema),
    }),
    fetchPlayerRecords: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      simulationId: z.number(),
    }),
  },
};
