import {useEffect, useState} from "react";
import {Prices, ProofToMint} from "../../../utils/ProjectTypes/Project.types";
import {useAccount, useContractWrite, useNetwork, usePrepareContractWrite} from "wagmi";
import {CONTRACTS_DETAILS} from "../../../utils/constants";
import {ethers} from "ethers";

export type GenerateProofParams = {
  proofs: ProofToMint[],
  delegatorAddress: string,
  price: Prices
}

/**
 * @param {boolean} completed
 * @param {string} error
 * @param {LoadPricesResult} result
 */
export interface UseGenerateProofsState {
  completed: boolean,
  error: string,
  transactionHash: string
}

/**
 * @param {function} loadPrices
 */
export interface UseGenerateProofsResponse extends UseGenerateProofsState {
  generateProofs: (params: GenerateProofParams) => void
}

export const useGenerateProofs = (): UseGenerateProofsResponse => {
  const [status, setStatus] = useState<UseGenerateProofsState>({
    completed: false, error: "", transactionHash: ""});
  const network = useNetwork();
  const userAccount = useAccount();
  const { config, error } = usePrepareContractWrite({
    address: CONTRACTS_DETAILS[network.chain.id].TPROOF_ROUTER_ADDRESS,
    abi: CONTRACTS_DETAILS[network.chain.id].TPROOF_ROUTER_ABI,
    functionName: 'generateProofs',
    onError: (error) => { setStatus({completed: true, transactionHash: "", error: error.message}); },
    onSuccess: (data) => { setStatus({completed: true, transactionHash: "", error: ""})}
  });
  const contractWrite = useContractWrite(config);
  useEffect(() => {
    setStatus({...status, transactionHash: contractWrite.data.hash});
  }, [contractWrite.data.hash]);
  const generateProofs = (params: GenerateProofParams): void => {
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
  return {
    ...status, generateProofs
  };
}
