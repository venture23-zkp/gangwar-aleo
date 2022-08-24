import { dirname, join } from "path";
import { promisify } from "util";
import { exec } from "child_process";

const appPath = dirname(require.main?.filename || "");
const contractPath = join(appPath, "..", "..", "contracts", "gamingTk");

const execute = promisify(exec);

const parseOutput = (stdout: string) => {
  const lines = stdout.split("\n");

  const outputs: string[] = [];

  let isAfterOutputsLine = false;
  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (isAfterOutputsLine && trimmedLine.startsWith("•")) {
      const value = trimmedLine.substring(2);
      outputs.push(value);
    } else if (trimmedLine.includes("Outputs")) {
      isAfterOutputsLine = true;
    }
  });

  return outputs;
};

const parseU32 = (value: string) => {
  const [parsed] = value.split("u");
  return Number(parsed);
};

const createAccount = async () => {
  const { stdout } = await execute(`cd ${contractPath} && aleo account new`);

  const PRIVATE_KEY = "Private Key";
  const VIEW_KEY = "View Key";
  const ADDRESS = "Address";

  const parsed = stdout.split("\n").reduce(
    (accountInfo, line) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith(PRIVATE_KEY)) {
        const [, , , privateKey] = trimmedLine.split(" ");
        return { ...accountInfo, privateKey };
      } else if (trimmedLine.startsWith(VIEW_KEY)) {
        const [, , , viewKey] = trimmedLine.split(" ");
        return { ...accountInfo, viewKey };
      } else if (trimmedLine.startsWith(ADDRESS)) {
        const [, , address] = trimmedLine.split(" ");
        return { ...accountInfo, address };
      } else {
        return accountInfo;
      }
    },
    { privateKey: "", viewKey: "", address: "" }
  );

  return parsed;
};

const throwDice = async (a: number, b: number) => {
  const { stdout } = await execute(`cd ${contractPath} && aleo run throwDice ${a}u32 ${b}u32`);
  const [output] = parseOutput(stdout);
  const parsed = parseU32(output);
  return parsed;
};

const generateKey = async (a: number, b: number) => {
  const { stdout } = await execute(`cd ${contractPath} && aleo run generateKey ${a}u32 ${b}u32`);
  const [output] = parseOutput(stdout);
  const parsed = parseU32(output);
  return parsed;
};

const generateProof = async (a: number, b: number) => {
  const { stdout } = await execute(`cd ${contractPath} && aleo run generateProof ${a}u32 ${b}u32`);
  const [output] = parseOutput(stdout);
  const parsed = parseU32(output);
  return parsed;
};

const random = async (a: number, b: number) => {
  const { stdout } = await execute(`cd ${contractPath} && aleo run random ${a}u32 ${b}u32`);
  const [output] = parseOutput(stdout);
  const parsed = parseU32(output);
  return parsed;
};

const powerup = async (a: number, b: number) => {
  const { stdout } = await execute(`cd ${contractPath} && aleo run powerup ${a}u32 ${b}u32`);
  const [output] = parseOutput(stdout);
  const parsed = parseU32(output);
  return parsed;
};

export const aleoExec = {
  build: () => execute(`cd ${contractPath} && aleo build`),
  createAccount,

  // TODO: redefine functions after contracts real implementation
  call: { throwDice, generateKey, generateProof, random, powerup },
};
