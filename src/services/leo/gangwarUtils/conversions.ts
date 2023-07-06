function convertTo(repr: string, value: number) {
  return value.toString() + repr;
}

function convertProbTo(repr: string, maxValue: BigInt, prob: number) {
  // Use the decimal bits of MAX_SAFE_INTEGER as precision
  const precision = Number.MAX_SAFE_INTEGER.toString().length;

  // Split the field value into two parts: first & second
  const first_part = maxValue.toString().substring(0, precision);

  // Note: Although second part won't ever be considered in practice
  // it can be randomized to give a sense of randomness to users
  // In gangstabet, the probabilites are set before-hand so randomness is not needed
  const second_part = maxValue.toString().substring(precision, maxValue.toString().length);

  let updated_first_part_after_probability = Math.round(Number(first_part) * prob);

  const final = updated_first_part_after_probability + second_part + repr;

  // console.log(prob);
  // console.log(MAX_VALUE);
  // console.log(final_field);
  return final;
}

export function convertProbToField(prob: number) {
  // Base field - 1 of Edwards BLS12
  // https://developer.aleo.org/advanced/the_aleo_curves/edwards_bls12#base-field
  const MAX_FIELD = BigInt("8444461749428370424248824938781546531375899335154063827935233455917409239040");

  return convertProbTo("field", MAX_FIELD, prob);
}

export function convertProbToUInt128(prob: number) {
  const MAX_UINT128 = BigInt("340282366920938463463374607431768211455"); // 2^128 - 1

  return convertProbTo("u128", MAX_UINT128, prob);
}

export function convertToUInt128(value: number) {
  return convertTo("u128", value);
}

export function convertToField(value: number) {
  return convertTo("field", value);
}
