import { apiError } from "../../utils";

const PRIVATE = ".private";
const PUBLIC = ".public";

const replaceValue = (value: string, searchValue = "") => value.replace(searchValue, "").replace(PRIVATE, "").replace(PUBLIC, "");

export const address = (value: string): string => replaceValue(value);

function getProbSignificantDigits(prob: number, precision: number): number {
  /// If prob = 0.11111111 and precision=2
  if (prob > 1) {
    throw Error("probability must be less than 1");
  }
  // Adding +2 to precision because first two characters are `0.`
  const significantProbability = prob.toString().substring(0, precision + 2);
  return Number(significantProbability);
}

function prob(repr: string, maxValue: BigInt, prob: string): number {
  if (Number(maxValue) > Number.MAX_SAFE_INTEGER) {
    const probInBigInt = BigInt(prob.replace(repr, ""));
    // Use the decimal bits of MAX_SAFE_INTEGER as precision
    const precision = Number.MAX_SAFE_INTEGER.toString().length - 1;

    const maxValueLength = maxValue.toString().length;

    const portionToExtract = probInBigInt.toString().length - (maxValueLength - precision);

    // Extract the most significant digits of probability to generate probability in safe range
    const probInNum = Number(probInBigInt.toString().substring(0, portionToExtract));
    const maxValueInNum = Number(maxValue.toString().substring(0, precision));

    const probInNumber = probInNum / maxValueInNum;

    return probInNumber;
  } else {
    // Using maxValue length as precision since it is smaller
    // Subtracting 1 is not necessary if all the digits in maxValue is 9
    const probInNumber = Number(prob) / Number(maxValue);
    return probInNumber;
  }
}

export const field = (value: string): bigint => {
  const parsed = BigInt(replaceValue(value, "field"));
  return parsed;
};

export const scalar = (value: string): bigint => {
  const parsed = BigInt(replaceValue(value, "scalar"));
  return parsed;
};

export const group = (value: string): bigint => {
  const parsed = BigInt(replaceValue(value, "group"));
  return parsed;
};

export const fieldToString = (value: string): string => {
  const parsed = replaceValue(value, "field");
  return parsed;
};

export const u8 = (value: string): number => {
  const parsed = Number(replaceValue(value, "u8"));
  if (isNaN(parsed)) throw apiError("u8 parsing failed");
  return parsed;
};

export const u16 = (value: string): number => {
  const parsed = Number(replaceValue(value, "u16"));
  if (isNaN(parsed)) throw apiError("u16 parsing failed");
  return parsed;
};

export const u32 = (value: string): number => {
  const parsed = Number(replaceValue(value, "u32"));
  if (isNaN(parsed)) throw apiError("u32 parsing failed");
  return parsed;
};

export const u64 = (value: string): number => {
  const parsed = Number(replaceValue(value, "u64"));
  if (isNaN(parsed)) throw apiError("u64 parsing failed");
  return parsed;
};

export const u128 = (value: string): bigint => {
  const parsed = BigInt(replaceValue(value, "u128"));
  // if (isNaN(parsed)) throw apiError("u128 parsing failed");
  return parsed;
};

export const bool = (value: string): boolean => {
  const parsed = replaceValue(value, "");
  if (parsed === "true") {
    return true;
  } else if (parsed === "false") {
    return false;
  } else {
    throw apiError("bool parsing failed");
  }
};

export const fieldProb = (value: string): number => {
  const MAX_FIELD = BigInt("8444461749428370424248824938781546531375899335154063827935233455917409239040");
  const parsed = replaceValue(value, "field");
  const valueInProb = prob("field", MAX_FIELD, parsed);
  if (isNaN(valueInProb)) throw apiError("field probability parsing failed");
  return valueInProb;
};

export const u128Prob = (value: string): number => {
  const MAX_UINT128 = BigInt("340282366920938463463374607431768211455"); // 2^128 - 1
  const parsed = replaceValue(value, "u128");
  const valueInProb = prob("u128", MAX_UINT128, parsed);
  if (isNaN(valueInProb)) throw apiError("u128 probability parsing failed");
  return valueInProb;
};

export const u16Prob = (value: string): number => {
  const MAX_UINT16 = BigInt(Math.pow(2, 16) - 1);
  const parsed = replaceValue(value, "u16");
  const valueInProb = prob("u16", MAX_UINT16, parsed);
  if (isNaN(valueInProb)) throw apiError("u16 probability parsing failed");
  return valueInProb;
};
