import { Account } from "../../aleo-sdk";
import { LeoPrivateKey, LeoViewKey } from "../../types";
import { fetchUnspentRecords } from "./util";

export const create = async () => {
  const account = new Account();

  return {
    privateKey: account._privateKey.to_string(),
    viewKey: account._viewKey.to_string(),
    address: account._address.to_string(),
  };
};

const fetchUnspentCredits = async (privateKey: LeoPrivateKey, viewKey: LeoViewKey): Promise<any> => {
  // TODO: add start block to the settings
  console.log("Fetch credit records");
  const startBlock = 0;
  const unspentRecords = await fetchUnspentRecords(privateKey, viewKey, "credits", "credits", startBlock);
  console.log(unspentRecords);
  return unspentRecords;
};

export const account = { create, fetchUnspentCredits };
