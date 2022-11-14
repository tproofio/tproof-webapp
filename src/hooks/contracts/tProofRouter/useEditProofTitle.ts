import {useEffect, useMemo, useState} from "react";
import {useAccount, useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction} from "wagmi";
import {CONTRACTS_DETAILS} from "../../../utils/constants";
import {useBaseSmartContractWrite, useBaseSmartContractWriteState} from "../../utils/useBaseSmartContractWrite";

/**
 * @param {string} nftId
 * @param {string} newTitle
 */
export type EditProofTitleParams = {
  nftId: string,
  newTitle: string
}

/**
 * @param {function} editProofTitle
 */
export interface UseEditProofTitleResponse extends useBaseSmartContractWriteState<undefined> {
  editProofTitle: () => void
}

/**
 * Hook used to edit the title of a proof
 */
export const useEditProofTitle = (params: EditProofTitleParams): UseEditProofTitleResponse => {
  const {completed, error, loading, result, txHash, endAsyncActionError, endAsyncActionSuccess, startAsyncAction,
    startAsyncActionWithTxHash} = useBaseSmartContractWrite<undefined>();
  const network = useNetwork();
  const [doCall, setDoCall] = useState<boolean>(false);

  const args = useMemo(() => {
    return [
      [params.nftId], [params.newTitle]
    ]
  }, [params]);

  const prepareContractWrite = usePrepareContractWrite({
    address: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_NFT_FACTORY_ADDRESS,
    abi: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_NFT_FACTORY_ABI,
    functionName: 'updateTitle',
    args: args,
    enabled: doCall
  });

  const contractWrite = useContractWrite(prepareContractWrite.config);

  const waitForTx = useWaitForTransaction({
    hash: contractWrite.data?.hash,
  });

  useEffect(() => {
    if (waitForTx.status === "success") endAsyncActionSuccess(undefined)
    else if (waitForTx.status === "loading") startAsyncActionWithTxHash(contractWrite.data?.hash)
    else if (waitForTx.status === "error") endAsyncActionError(waitForTx.error.message)
  }, [waitForTx.status])


  useEffect(() => {
    if (doCall) {
      contractWrite.write();
      setDoCall(false);
    }
  }, [doCall])

  const editProofTitle = (): void => {
    startAsyncAction();
    setDoCall(true);
  };

  return { completed, error, loading, result, txHash, editProofTitle };
}
