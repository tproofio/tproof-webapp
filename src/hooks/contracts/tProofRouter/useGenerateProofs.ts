import {useEffect, useMemo, useState} from "react";
import {Prices, ProofToMint} from "../../../utils/ProjectTypes/Project.types";
import {useAccount, useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction} from "wagmi";
import {CONTRACTS_DETAILS} from "../../../utils/constants";
import {ethers} from "ethers";
import {useBaseSmartContractWrite, useBaseSmartContractWriteState} from "../../utils/useBaseSmartContractWrite";

/**
 * @param {ProofToMint[]} proofs - proofs to be minted
 * @param {string} delegatorAddress - address of the delegator to verify the hash if file is made public
 * @param {Prices} price - the prices for this network
 */
export type UseGenerateProofParams = {
  proofs: ProofToMint[],
  delegatorAddress: string,
  price: Prices
}

/**
 * @param {function} generateProofs
 */
export interface UseGenerateProofsResponse extends useBaseSmartContractWriteState<undefined> {
  generateProofs: () => void
}

/**
 * Generates the proofs
 */
export const useGenerateProofs = (params: UseGenerateProofParams): UseGenerateProofsResponse => {
  const {completed, error, loading, result, txHash, endAsyncActionError, endAsyncActionSuccess, startAsyncAction,
    startAsyncActionWithTxHash} = useBaseSmartContractWrite<undefined>();
  const network = useNetwork();
  const userAccount = useAccount();
  const [doCall, setDoCall] = useState<boolean>(false);


  const args = useMemo(() => {

    let hash: string[] = [];
    let title: string[] = [];
    let withFileUrl: boolean[] = [];
    let storageType: number[] = [];

    // eval the params
    for (let p of params.proofs) {
      hash.push("0x" + p.hash);
      title.push(p.title);
      withFileUrl.push(p.toBeVerified);
      storageType.push(0);  // currently we support only ArweaveV1
    }
    return [
      hash, title, withFileUrl, storageType, userAccount.address, params.delegatorAddress
    ]
  }, [params]);

  let totalAmountEth = useMemo(() => {
    if (params.proofs.length === 0 || !params.price) return 0;
    return (
        params.proofs.map((proof): number => proof.toBeVerified ? 1 : 0)
          .reduce((a, b) => a + b, 0)
      ) * params.price.verification
      + (params.proofs.length * params.price.mint)
  }, [params]);

  const prepareContractWrite = usePrepareContractWrite({
    address: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_ROUTER_ADDRESS,
    abi: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_ROUTER_ABI,
    functionName: 'createProofs',
    enabled: doCall,
    args: args,
    overrides: {
      value: ethers.utils.parseEther(totalAmountEth.toString()),
    }
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
