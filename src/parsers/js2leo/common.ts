import { env } from "../../constants";
import {
  leoBooleanSchema,
  LeoField,
  leoFieldSchema,
  LeoGroup,
  leoGroupSchema,
  LeoScalar,
  leoScalarSchema,
  LeoU128,
  leoU128Schema,
  LeoU16,
  leoU16Schema,
  LeoU32,
  leoU32Schema,
  LeoU64,
  leoU64Schema,
  LeoU8,
  leoU8Schema,
} from "../../types";
import { apiError } from "../../utils/error";
import { encodeId } from "../../utils/id";

export const stringifyLeoCmdParam = (value: unknown): string => {
  // if Leo will ever introduce strings, this will have to be updated
  const res = JSON.stringify(value).replaceAll('"', "");

  return env.ZK_MODE === "leo" ? `"${res}"` : `${res}`;
};

export const privateField = (value: string) => value + ".private";

export const publicField = (value: string) => value + ".public";

function getProbSignificantDigits(prob: number, precision: number): number {
  /// If prob = 0.11111111 and precision=2
  if (prob > 1) {
    throw Error("probability must be less than 1");
  }
  // Adding +2 to precision because first two characters are `0.`
  const significantProbability = prob.toString().substring(0, precision + 2);
  return Number(significantProbability);
}

function prob(repr: string, maxValue: BigInt, prob: number) {
  if (Number(maxValue) > Number.MAX_SAFE_INTEGER) {
    // Use the decimal digits of MAX_SAFE_INTEGER as precision
    const precision = Number.MAX_SAFE_INTEGER.toString().length - 1;

    // Split the field value into two parts: first & second
    const first_part = maxValue.toString().substring(0, precision);

    // Note: Although second part won't ever be considered in practice
    // it can be randomized to give a sense of randomness to users
    // In gangwar, the probabilites are set before-hand so randomness is not needed
    const second_part = maxValue.toString().substring(precision, maxValue.toString().length);

    let updated_first_part_after_probability = Math.round(Number(first_part) * prob);

    const final = updated_first_part_after_probability + second_part + repr;

    return final;
  } else {
    // Using maxValue length as precision since it is smaller
    // Subtracting 1 is not necessary if all the digits in maxValue is 9
    const probInUint = Math.round(prob * Number(maxValue));
    const final = probInUint + repr;
    return final;
  }
}

export const field = (value: BigInt): LeoField => {
  const parsed = value + "field";
  return leoFieldSchema.parse(parsed);
};

export const scalar = (value: BigInt): LeoScalar => {
  const parsed = value + "scalar";
  return leoScalarSchema.parse(parsed);
};

export const group = (value: BigInt): LeoGroup => {
  const parsed = value + "group";
  return leoGroupSchema.parse(parsed);
};

export const id = (value: string): LeoField => {
  const encoded = encodeId(value);
  if (!encoded) throw apiError("Leo ID parsing failed.");
  return field(encoded);
};

export const u8 = (value: number | string): LeoU8 => {
  const numVal = Number(value);
  if (isNaN(numVal)) throw apiError("u8 parsing failed");
  const parsed = numVal + "u8";
  return leoU8Schema.parse(parsed);
};

export const u16 = (value: number | string): LeoU16 => {
  const numVal = Number(value);
  if (isNaN(numVal)) throw apiError("u16 parsing failed");
  const parsed = numVal + "u16";
  return leoU16Schema.parse(parsed);
};

export const u32 = (value: number | string): LeoU32 => {
  const numVal = Number(value);
  if (isNaN(numVal)) throw apiError("u32 parsing failed");
  const parsed = numVal + "u32";
  return leoU32Schema.parse(parsed);
};

export const u64 = (value: number | string): LeoU64 => {
  const numVal = Number(value);
  if (isNaN(numVal)) throw apiError("u64 parsing failed");
  const parsed = numVal + "u64";
  return leoU64Schema.parse(parsed);
};

export const u128 = (value: string | number): LeoU128 => {
  const numVal = Number(value);
  if (isNaN(numVal)) throw apiError("u128 parsing failed");
  const parsed = value + "u128";
  return leoU128Schema.parse(parsed);
};

export const u128String = (value: string): LeoU128 => {
  const parsed = value + "u128";
  return leoU128Schema.parse(parsed);
};

export const bool = (value: boolean): LeoU128 => {
  const val = value ? "true" : "false";
  return leoBooleanSchema.parse(val);
};

const fieldProb = (value: number): LeoField => {
  // Base field - 1 of Edwards BLS12
  // https://developer.aleo.org/advanced/the_aleo_curves/edwards_bls12#base-field
  const MAX_FIELD = BigInt("8444461749428370424248824938781546531375899335154063827935233455917409239040");
  const parsed = prob("field", MAX_FIELD, value);
  return leoFieldSchema.parse(parsed);
};

export const u128Prob = (value: number): LeoU128 => {
  const MAX_UINT128 = BigInt("340282366920938463463374607431768211455"); // 2^128 - 1
  const parsed = prob("u128", MAX_UINT128, value);
  return leoU128Schema.parse(parsed);
};

export const u16Prob = (value: number): LeoU16 => {
  const MAX_UINT16 = BigInt(Math.pow(2, 16) - 1);
  const parsed = prob("u16", MAX_UINT16, value);
  return leoU16Schema.parse(parsed);
};

// TODO: rename this to something else
// export const common = {
//   field,
//   scalar,
//   id,
//   u8,
//   u16,
//   u16Prob,
//   u32,
//   u64,
//   u128,
//   stringifyLeoCmdParam,
//   //   character,
//   signature,
//   //   playerRecord,
//   //   team,
//   // war,
//   //   warRecord,
//   symbol,
//   baseURI,
//   edition,
//   tokenId,
//   toggleSettings,
//   nftMintRecord,
//   nftClaimRecord,
// };
