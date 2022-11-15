import {useContract, useContractRead, useNetwork, useProvider} from "wagmi";
import {CONTRACTS_DETAILS} from "../../../utils/constants";
import {useBaseAsyncHook, useBaseAsyncHookState} from "../../utils/useBaseAsyncHook";
import {ethers} from "ethers";
import {useEffect, useState} from "react";
import {BigNumber} from "@ethersproject/bignumber";

/**
 * @param {number} mint
 * @param {number} verification
 */
export interface LoadPricesResult {
  mint: number,
  verification: number
}

/**
 * @param {function} loadPrices
 */
export interface UseLoadPricesResponse extends useBaseAsyncHookState<LoadPricesResult> {
  loadPrices: () => void
}

/**
 * Hook used to load mint and verification prices.
 */
export const useLoadPrices = (): UseLoadPricesResponse => {
  const {completed, error, loading, result,
    startAsyncAction, endAsyncActionSuccess, endAsyncActionError} = useBaseAsyncHook<LoadPricesResult>();
  const network = useNetwork();
  const [doCall, setDoCall] = useState<boolean>(false);
  const contractReadMintPrice = useContractRead({
    address: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_ROUTER_ADDRESS,
    abi: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_ROUTER_ABI,
    functionName: "MINT_PRICE",
    enabled: doCall
  });
  const contractReadVerificationPrice = useContractRead({
    address: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_ROUTER_ADDRESS,
    abi: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_ROUTER_ABI,
    functionName: "VERIFICATION_PRICE",
    enabled: doCall
  });

  useEffect(() => {
    if (doCall) {
      const mintPrice = contractReadMintPrice.data as BigNumber;
      const verificationPrice = contractReadVerificationPrice.data as BigNumber;
      endAsyncActionSuccess({
        mint: parseFloat(ethers.utils.formatEther(mintPrice)),
        verification: parseFloat(ethers.utils.formatEther(verificationPrice))
      });
      setDoCall(false);
    }
  }, [doCall]);

  const loadPrices = (): void => {
    startAsyncAction();
    setDoCall(true);
  };
  return { completed, error, loading, result, loadPrices };
}
