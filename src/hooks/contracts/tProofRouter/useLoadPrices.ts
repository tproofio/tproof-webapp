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
 * Hook used to load mint and verification prices.
 */
export const useLoadPrices = (chainId: number): useBaseAsyncHookState<LoadPricesResult> => {
  const {completed, error, loading, result,
    startAsyncAction, endAsyncActionSuccess, endAsyncActionError} = useBaseAsyncHook<LoadPricesResult>();

  const contractReadMintPrice = useContractRead({
    address: CONTRACTS_DETAILS[chainId]?.TPROOF_ROUTER_ADDRESS,
    abi: CONTRACTS_DETAILS[chainId]?.TPROOF_ROUTER_ABI,
    functionName: "MINT_PRICE"
  });

  const contractReadVerificationPrice = useContractRead({
    address: CONTRACTS_DETAILS[chainId]?.TPROOF_ROUTER_ADDRESS,
    abi: CONTRACTS_DETAILS[chainId]?.TPROOF_ROUTER_ABI,
    functionName: "VERIFICATION_PRICE"
  });

  useEffect(() => {
    if (contractReadMintPrice.data && contractReadVerificationPrice.data) {
      const mintPrice = contractReadMintPrice.data as BigNumber;
      const verificationPrice = contractReadVerificationPrice.data as BigNumber;
      endAsyncActionSuccess({
        mint: parseFloat(ethers.utils.formatEther(mintPrice)),
        verification: parseFloat(ethers.utils.formatEther(verificationPrice))
      });
    }
  }, [contractReadMintPrice.data, contractReadVerificationPrice.data])

  useEffect(() => {
    if (contractReadMintPrice.isLoading || contractReadVerificationPrice.isLoading)
      startAsyncAction();
  }, [contractReadMintPrice.isLoading, contractReadVerificationPrice.isLoading])

  return { completed, error, loading, result };
}
