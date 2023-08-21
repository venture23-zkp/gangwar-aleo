import { Account } from "../../aleo-sdk";
import { LeoAddress, LeoPrivateKey, LeoViewKey } from "../../types";
import { fetchUnspentRecords } from "./util";

export const create = async () => {
  const account = new Account();

  return {
    privateKey: account._privateKey.to_string(),
    viewKey: account._viewKey.to_string(),
    address: account._address.to_string(),
  };
};

export const account = { create };
