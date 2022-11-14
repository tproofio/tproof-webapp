import {useEffect} from "react";
import {Prices, ProofToMint} from "../../../utils/ProjectTypes/Project.types";
import {useAccount, useContractWrite, useNetwork, usePrepareContractWrite} from "wagmi";
import {CONTRACTS_DETAILS} from "../../../utils/constants";
import {ethers} from "ethers";
import {useBaseAsyncHookState} from "../../utils/useBaseAsyncHook";
import {useBaseSmartContractWrite} from "../../utils/useBaseSmartContractWrite";

export type GenerateProofParams = {
  proofs: ProofToMint[],
  delegatorAddress: string,
  price: Prices
}

/**
 * @param {function} loadPrices
 */
export interface UseGenerateProofsResponse extends useBaseAsyncHookState<undefined> {
  generateProofs: (params: GenerateProofParams) => void
}

export const useGenerateProofs = (): UseGenerateProofsResponse => {
  const {completed, error, loading, result, endAsyncActionError, endAsyncActionSuccess, startAsyncAction,
    startAsyncActionWithTxHash} = useBaseSmartContractWrite<undefined>();

  const network = useNetwork();
  const userAccount = useAccount();
  const prepareContractWrite = usePrepareContractWrite({
    address: CONTRACTS_DETAILS[network.chain.id].TPROOF_ROUTER_ADDRESS,
    abi: CONTRACTS_DETAILS[network.chain.id].TPROOF_ROUTER_ABI,
    functionName: 'generateProofs',
    onError: (error) => { endAsyncActionError(error.message); },
    onSuccess: (data) => { endAsyncActionSuccess(undefined); }
  });
  const contractWrite = useContractWrite(prepareContractWrite.config);
  useEffect(() => {
    startAsyncActionWithTxHash(contractWrite.data.hash);
  }, [contractWrite.data.hash]);
  const generateProofs = (params: GenerateProofParams): void => {
    startAsyncAction();
    new Promise( async (resolve, reject) => {
      let totalAmountEth = (
              params.proofs.map((proof): number => proof.toBeVerified ? 1 : 0)
                  .reduce((a, b) => a + b)
          ) * params.price.verification
          + (params.proofs.length * params.price.mint);

      let hash: string[] = [];
      let title: string[] = [];
      let withFileUrl: boolean[] = [];
      let storageType: number[] = [];

      //eval the params
      for (let p of params.proofs) {
        hash.push("0x" + p.hash);
        title.push(p.title);
        withFileUrl.push(p.toBeVerified);
        storageType.push(0);  // currently we support only ArweaveV1
      }

      await contractWrite.writeAsync({
        recklesslySetUnpreparedArgs: [
            hash, title, withFileUrl, storageType, userAccount.address, params.delegatorAddress],
        recklesslySetUnpreparedOverrides: {
          value: ethers.utils.parseEther(totalAmountEth.toString())
        }
      });
    }).then(() => {});
  };
  return { completed, error, loading, result, generateProofs};
}
