import { number, z } from "zod";

import { leoAddressSchema, leoPrivateKeySchema, leoU128Schema, leoViewKeySchema, teamSchema, uuidSchema, warSchema } from "../../types";

export const schemas = {
  body: {
    initialize: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
    }),
    // startGame: z.object({
    //   privateKey: leoPrivateKeySchema,
    //   viewKey: leoViewKeySchema,
    //   owner: leoAddressSchema,
    //   simulationId: z.number(),
    //   teamA: teamSchema,
    //   teamB: teamSchema,
    // }),
    // gameLoop: z.object({
    //   privateKey: leoPrivateKeySchema,
    //   viewKey: leoViewKeySchema,
    //   owner: leoAddressSchema,
    //   war: warSchema,
    // }),
  },
};
