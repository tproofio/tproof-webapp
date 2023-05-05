import {useEffect, useMemo, useState} from "react";
import {address, Prices, ProofToMint} from "../../../utils/ProjectTypes/Project.types";
import {useAccount, useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction} from "wagmi";
import {CONTRACTS_DETAILS} from "../../../utils/constants";
import {ethers} from "ethers";
import {useBaseSmartContractWrite, useBaseSmartContractWriteState} from "../../utils/useBaseSmartContractWrite";

/**
 * @param {ProofToMint[]} proofs - proofs to be minted
 */
export type UseGenerateProofPrivateParams = {
  proofs: ProofToMint[],
  collectionAddress
}

/**
 * @param {function} generateProofs
 */
export interface UseGenerateProofsResponse extends useBaseSmartContractWriteState<undefined> {
  generateProofs: () => void
}

/**
 * Generates the proofs for a private project ID
 */
export const useGenerateProofsPrivate = (params: UseGenerateProofPrivateParams): UseGenerateProofsResponse => {
  const {completed, error, loading, result, txHash, endAsyncActionError, endAsyncActionSuccess, startAsyncAction,
    startAsyncActionWithTxHash} = useBaseSmartContractWrite<undefined>();
  const network = useNetwork();
  const userAccount = useAccount();
  const [doCall, setDoCall] = useState<boolean>(false);


  const args = useMemo(() => {

    let hash: string[] = [];
    let title: string[] = [];

    // eval the params
    for (let p of params.proofs) {
      hash.push("0x" + p.hash);
      title.push(p.title);
    }
    return [
      userAccount.address, hash, title
    ]
  }, [params]);

  const prepareContractWrite = usePrepareContractWrite({
    address: params.collectionAddress,
    abi: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_PRIVATE_NFT_FACTORY_ABI,
    functionName: 'mint',
    enabled: doCall,
    args: args
  });

  const contractWrite = useContractWrite(prepareContractWrite.config);
  const waitForTx = useWaitForTransaction({
    hash: contractWrite.data?.hash,
  });

  useEffect(() => {
    if (waitForTx.status === "success") endAsyncActionSuccess(undefined)
    else if (waitForTx.status === "loading") startAsyncActionWithTxHash(contractWrite.data?.hash)
    else if (waitForTx.status === "error") endAsyncActionError(waitForTx.error.message)
  }, [waitForTx.status]);

  useEffect(() => {
    if (doCall && contractWrite.write) {
      setDoCall(false);
      contractWrite.write();
    }
  }, [prepareContractWrite]);

  const generateProofs = (): void => {
    startAsyncAction();
    setDoCall(true);
  };

  return { completed, error, loading, result, txHash, generateProofs};
}
