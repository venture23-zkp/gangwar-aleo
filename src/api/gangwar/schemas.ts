import { number, z } from "zod";

import { leoAddressSchema, leoPrivateKeySchema, leoU128Schema, leoViewKeySchema, teamSchema, uuidSchema, warSchema } from "../../types";

export const schemas = {
  body: {
    initialize: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      randomSeed: leoU128Schema,
    }),
    startGame: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      simulationId: z.number(),
      teamA: teamSchema,
      teamB: teamSchema,
      randomSeed: z.number(),
    }),
    gameLoop: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
      randomSeed: z.number(),
      war: warSchema,
    }),
  },
};
