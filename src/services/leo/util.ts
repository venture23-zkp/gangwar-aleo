import { exec } from "child_process";
import { readFile } from "fs/promises";
import { join } from "path";
import { promisify } from "util";

import { Address, AleoNetworkClient, DevelopmentClient, PrivateKey, ViewKey } from "../../aleo-sdk";
import { env, FEE, LOCAL_NETWORK_PRIVATE_KEY, programNames } from "../../constants";
import { LeoTx, leoTxSchema, LeoRecord, LeoViewKey } from "../../types";
import { attemptFetch, logger, wait } from "../../utils";

export const developmentClient = new DevelopmentClient(env.DEVELOPMENT_SERVER_URL);
const baseRoute = env.ZK_MODE === "testnet_public" ? "https://vm.aleo.org/api" : "http://127.0.0.1:3030";
export const networkClient = new AleoNetworkClient(baseRoute);

export const execute = promisify(exec);

export const contractsPath = join(env.NODE_PATH, "contracts");

const immediatelyRepeatingNumberClosingBracket = (value: string) => {
  let count = 0;
  let repeatingStop = false;
  for (let i = 0; i < value.length; i++) {
    if (!repeatingStop) {
      if (value[i] === "}") {
        count += 1;
      } else if (value[i] !== "}") {
        repeatingStop = true;
      }
    }
  }
  return count;
};

const correctRecordBracketIssue = (recordString: string, bracketPattern: string): string => {
  // console.log("Trying to correct record bracket issue");
  let correctedRecordStringArray = [];
  let correctedString = "";
  for (let i = 0, j = 0; i < recordString.length; i++) {
    let recordChar = recordString[i];
    let patternChar = bracketPattern[j];
    let uptoPattern = bracketPattern.substring(0, j);

    correctedString = correctedRecordStringArray.join("");
    correctedString.replace(" ", "");
    if (recordChar === "{" && patternChar === "{") {
      correctedRecordStringArray.push(recordChar);
      j++;
    } else if (patternChar === "}" && recordChar === "}") {
      let immediatelyRepeatingClosingBracketOfRecord = immediatelyRepeatingNumberClosingBracket(
        recordString.substring(i, recordString.length)
      );
      let immediatelyRepeatingClosingBracketOfPattern = immediatelyRepeatingNumberClosingBracket(
        bracketPattern.substring(j, bracketPattern.length)
      );

      if (immediatelyRepeatingClosingBracketOfRecord > immediatelyRepeatingClosingBracketOfPattern) {
        // skip a closing bracket of record
        continue;
      } else if (immediatelyRepeatingClosingBracketOfRecord === immediatelyRepeatingClosingBracketOfPattern) {
        correctedRecordStringArray.push(recordChar);
        j++;
      }
    } else if (recordChar !== "{" && patternChar === "{") {
      correctedRecordStringArray.push(recordChar);
    } else if (recordChar !== "}" && recordChar !== "{" && patternChar !== "{" && patternChar !== "}") {
      correctedRecordStringArray.push(recordChar);
      j++;
    } else if (patternChar === "}" && recordChar !== "}") {
      correctedRecordStringArray.push(recordChar);
    } else {
      correctedRecordStringArray.push(recordChar);
    }
  }
  const correctedRecordString = correctedRecordStringArray.join("");
  return correctedRecordString;
};

export const parseRecordString = (recordString: string, correctBracketPattern?: string): Record<string, unknown> => {
  const json = recordString.replace(/(['"])?([a-z0-9A-Z_.]+)(['"])?/g, '"$2" ');
  let correctJson = json;
  // console.log(json);
  // console.log(correctBracketPattern);
  if (correctBracketPattern) {
    correctJson = correctRecordBracketIssue(json, correctBracketPattern);
  }
  // console.log(correctJson);
  return JSON.parse(correctJson);
};

const parseCmdOutput = (cmdOutput: string, correctBracketPattern?: string): Record<string, unknown> => {
  const lines = cmdOutput.split("\n");

  let res: Record<string, unknown> = {};

  let objectStarted = false;
  let objectFinished = false;
  let done = false;
  let toParse = "";

  lines.forEach((line) => {
    if (done) return;

    if (objectStarted && objectFinished) {
      res = parseRecordString(toParse, correctBracketPattern);
      done = true;
    } else if (objectStarted) {
      if (line.startsWith("}")) {
        objectFinished = true;
      }
      const trimmedLine = line.trim();
      toParse = toParse + trimmedLine;
    } else if (line.includes("• {") || line.startsWith("{")) {
      toParse = toParse + "{";
      objectStarted = true;
    }
  });

  return res;
};

export const getRandomAleoScalar = (): BigInt => {
  const EDWARDS_BLS12_SCALAR_FIELD = "2111115437357092606062206234695386632838870926408408195193685246394721360383";
  let hidingNonce = EDWARDS_BLS12_SCALAR_FIELD;

  // while (Number(hidingNonce) >= Number(EDWARDS_BLS12_SCALAR_FIELD)) {
  //   var buf = new Uint32Array(8);
  //   const hidingNonceArray = crypto.getRandomValues(buf);
  //   hidingNonce = hidingNonceArray.join("");
  // }

  const randomNumber = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
  return BigInt(randomNumber);
};

const getTxResult = (tx: LeoTx): string | undefined => {
  return tx.execution.transitions.at(0)?.outputs.at(0)?.value;
};

export const decryptRecord = async (
  encryptedRecord: LeoRecord,
  viewKey: LeoViewKey,
  correctBracketPattern?: string
): Promise<Record<string, unknown>> => {
  // console.log("trying to decrypt", encryptedRecord);
  let decrypted = ViewKey.from_string(viewKey).decrypt(encryptedRecord).replaceAll("\n", "").replaceAll(" ", "");
  // console.log("decrypted", decrypted);
  try {
    return parseRecordString(decrypted, correctBracketPattern);
  } catch {
    return parseRecordString(`{ "correct": false }`);
  }
};

interface LeoRunParams {
  contractPath: string;
  params?: string[];
  transition?: string;
}

export const leoRun = async (
  { contractPath, params = [], transition = "main" }: LeoRunParams,
  correctBracketPattern?: string
): Promise<Record<string, unknown>> => {
  const stringedParams = params.join(" ");
  const cmd = `cd ${contractPath} && leo run ${transition} ${stringedParams}`;
  console.log(cmd);
  const { stdout } = await execute(cmd);
  console.log(stdout);
  const parsed = parseCmdOutput(stdout, correctBracketPattern);

  return parsed;
};

interface SnarkOsExecuteParams {
  privateKey: string;
  viewKey: string;
  appName: string;
  params?: string[];
  transition?: string;
  fee: number;
}

const snarkOsExecute = async (
  { privateKey, viewKey, appName, params = [], transition = "main", fee }: SnarkOsExecuteParams,
  correctBracketPattern?: string
): Promise<Record<string, unknown>> => {
  // when running locally, transfer some credits to the account in order to facilitate the developer experience
  if (env.ZK_MODE === "testnet_local") {
    await transferCredits(FEE + 6, Address.from_private_key(PrivateKey.from_string(privateKey)).to_string());
    await wait();
  }

  let txId = "";
  let attemptsLeft = 5;
  let executed = false;

  while (!executed && attemptsLeft > 0) {
    try {
      console.log(`Executing via Aleo development server for ${viewKey}`);
      txId = (await developmentClient.executeProgram(`${appName}.aleo`, transition, fee, params, privateKey)).replaceAll('"', "");
      executed = true;
    } catch (error) {
      attemptsLeft--;
      if (attemptsLeft === 0) {
        throw error;
      }
    }
  }

  const baseRoute = env.ZK_MODE === "testnet_public" ? "https://vm.aleo.org/api" : "http://127.0.0.1:3030";
  const url = `${baseRoute}/testnet3/transaction/${txId}`;
  console.log("Tx URL", url);

  const res = await attemptFetch(url);

  const tx: Record<string, unknown> = res.data;
  const parsedTx = leoTxSchema.parse(tx);
  const result = getTxResult(parsedTx);

  // I know a ternary would be cool, but it creates some weird concurrency issues sometimes
  let parsed = {};
  if (result) {
    parsed = await decryptRecord(result, viewKey, correctBracketPattern);
    // console.log("decrypted", parsed);
  }

  return parsed;
};

interface SnarkOsMappingValueRequestParams {
  appName: string;
  mappingName: string;
  mappingKey: string;
}

export const snarkOsFetchMappingValue = async ({ appName, mappingName, mappingKey }: SnarkOsMappingValueRequestParams): Promise<string> => {
  // when running locally, transfer some credits to the account in order to facilitate the developer experience
  const baseRoute = env.ZK_MODE === "testnet_public" ? "https://vm.aleo.org/api" : "http://127.0.0.1:3030";
  const url = `${baseRoute}/testnet3/program/${appName}.aleo/mapping/${mappingName}/${mappingKey}`;
  // console.log("Trying to fetch from", url);
  const res = await attemptFetch(url);
  // console.log(res.data);
  const value = res.data;
  return value;
};

type ExecuteZkLogicParams = LeoRunParams & SnarkOsExecuteParams;

export const zkRun = (params: ExecuteZkLogicParams, bracketPattern?: string): Promise<Record<string, unknown>> => {
  // console.log("ZK_MODE", env.ZK_MODE);
  if (env.ZK_MODE === "leo") {
    return leoRun(params, bracketPattern);
  } else {
    return snarkOsExecute(params, bracketPattern);
  }
};

/**
 * Deploys programs to the public or local Aleo testnet, using the Aleo TS SDK.
 * Before calling this function, make sure to execute "build_local_programs.sh" from the root directory
 * and make sure your account holds at least the required fee amount (56 credits).
 */
export const deployPrograms = async () => {
  const privateKey = env.DEPLOY_PRIVATE_KEY;
  // console.log(privateKey);
  if (!privateKey) return;

  const fees = {
    gangwar: 15,
    lootcrate_nft: 15,
  };

  const successfulPrograms: string[] = [];

  for (const programName of Object.values(programNames)) {
    logger.info(`Deploying ${programName}`);

    const path = join(contractsPath, programName, "build", "main.aleo");

    const program = await readFile(path, "utf-8");

    let attemptsLeft = 5;
    let deployed = false;

    while (!deployed && attemptsLeft > 0) {
      try {
        await developmentClient.deployProgram(program, fees[programName as keyof typeof fees], privateKey);
        logger.info(`Successfully deployed ${programName}`);
        successfulPrograms.push(programName);
        deployed = true;
      } catch (error) {
        attemptsLeft--;
        if (attemptsLeft === 0) {
          logger.info(`${programName} deployment failed. Check the dev server logs to see if it was already deployed.`);
        }
      }
    }
  }

  logger.info(`Successfully deployed programs: ${successfulPrograms.toString()}`);
};

/**
 * Transfer credits from the account identified by the private key to the account specified as recipient.
 * ! use this function only when the app is connected to a local node
 * @param amount - amount of credits to transfer to the recipient
 * @param recipient - address of the receiver account
 * @param privateKey - private key of the sender account, defaults to the private key of the local chain owner
 * @returns
 */
export const transferCredits = async (amount: number, recipient: string, privateKey = LOCAL_NETWORK_PRIVATE_KEY) => {
  let attemptsLeft = 5;
  let transferred = false;

  while (!transferred && attemptsLeft > 0) {
    try {
      await developmentClient.transfer(amount, FEE, recipient, privateKey);
      logger.info(`Successfully transferred ${amount} credits to ${recipient}`);
      transferred = true;
    } catch (error) {
      attemptsLeft--;
      if (attemptsLeft === 0) {
        logger.info(`Transfer of ${amount} credits to ${recipient} failed.`);
      }
    }
  }
};

export const getLatestHeight = async () => {
  const latestHeight = await networkClient.getLatestHeight();
  return latestHeight;
};

export const fetchUnspentRecords = async (
  privateKey: string,
  viewKey: string,
  program: string,
  recordName: string,
  startHeight: number,
  endHeight?: number,
  bracketPattern?: string
) => {
  console.log("Fetching unspent records");
  const unspentRecords = await networkClient.findUnspentRecords(
    startHeight,
    endHeight,
    privateKey,
    undefined,
    undefined,
    program,
    recordName
  );
  const decryptedUnspentRecords = [];
  for (let record of unspentRecords) {
    console.log(`${baseRoute}/testnet3/transaction/${record.txId}`);
    const decrypted = await decryptRecord(record.value, viewKey, bracketPattern);
    decryptedUnspentRecords.push(decrypted);
  }
  return decryptedUnspentRecords;
};
