import { z } from "zod";
import { leoAddressSchema, leoPrivateKeySchema, leoViewKeySchema } from "../../types";

export const schemas = {
  body: {
    verify: z.object({
      message: z.string(),
      playerSign: z.string(),
      pubAddress: z.string(),
    }),
    fetch: z.object({
      privateKey: leoPrivateKeySchema,
      viewKey: leoViewKeySchema,
      owner: leoAddressSchema,
    }),
  },
};
