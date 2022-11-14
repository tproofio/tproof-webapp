import {useEffect, useState} from "react";
import {useAccount, useContractWrite, useNetwork, usePrepareContractWrite} from "wagmi";
import {CONTRACTS_DETAILS} from "../../../utils/constants";
import {useBaseSmartContractWrite, useBaseSmartContractWriteState} from "../../utils/useBaseSmartContractWrite";

export type EditProofTitleParams = {
  nftId: string,
  newTitle: string
}

/**
 * @param {function} editProofTitle
 */
export interface UseEditProofTitleResponse extends useBaseSmartContractWriteState<undefined> {
  editProofTitle: (params: EditProofTitleParams) => void
}

export const useEditProofTitle = (): UseEditProofTitleResponse => {
  const {completed, error, loading, result, txHash, endAsyncActionError, endAsyncActionSuccess, startAsyncAction,
    startAsyncActionWithTxHash} = useBaseSmartContractWrite<undefined>();
  const network = useNetwork();
  const userAccount = useAccount();
  const prepareContractWrite = usePrepareContractWrite({
    address: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_ROUTER_ADDRESS,
    abi: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_ROUTER_ABI,
    functionName: 'updateTitle',
    onError: (error) => { endAsyncActionError(error.message); },
    onSuccess: (data) => { endAsyncActionSuccess(undefined); }
  });
  const contractWrite = useContractWrite(prepareContractWrite.config);
  useEffect(() => {
    startAsyncActionWithTxHash(contractWrite.data.hash);
  }, [contractWrite.data.hash]);
  const editProofTitle = (params: EditProofTitleParams): void => {
    startAsyncAction();
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
  return { completed, error, loading, result, txHash, editProofTitle };
}
