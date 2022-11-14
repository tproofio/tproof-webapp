import {useState} from "react";
import {useAccount, useContractWrite, useNetwork, usePrepareContractWrite} from "wagmi";
import {CONTRACTS_DETAILS} from "../../../utils/constants";

export type EditProofTitleParams = {
  nftId: string,
  newTitle: string
}

/**
 * @param {boolean} completed
 * @param {string} error
 * @param {LoadPricesResult} result
 */
export interface UseEditProofTitleState {
  completed: boolean,
  error: string,
  transactionHash: string
}

/**
 * @param {function} loadPrices
 */
export interface UseEditProofTitleResponse extends UseEditProofTitleState {
  editProofTitle: (params: EditProofTitleParams) => void
}

export const useEditProofTitle = (): UseEditProofTitleResponse => {
  const [status, setStatus] = useState<UseEditProofTitleState>({
    completed: false, error: "", transactionHash: ""});
  const network = useNetwork();
  const userAccount = useAccount();
  const { config, error } = usePrepareContractWrite({
    address: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_ROUTER_ADDRESS,
    abi: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_ROUTER_ABI,
    functionName: 'updateTitle',
    onError: (error) => { setStatus({completed: true, transactionHash: "", error: error.message}); },
    onSuccess: (data) => { setStatus({completed: true, transactionHash: "", error: ""})}
  });
  const contractWrite = useContractWrite(config);
  const editProofTitle = (params: EditProofTitleParams): void => {
    new Promise(async (resolve, reject) => {
      await contractWrite.writeAsync({
        recklesslySetUnpreparedArgs: [
          [params.nftId], [params.newTitle]],
        recklesslySetUnpreparedOverrides: {
          from: userAccount.address
        }
      });
    }).then(() => {});
  };
  return {
    ...status, editProofTitle
  };
}
