import {useContractRead} from "wagmi";
import {CONTRACTS_DETAILS} from "../../../utils/constants";
import {useBaseAsyncHook, useBaseAsyncHookState} from "../../utils/useBaseAsyncHook";
import {useEffect} from "react";
import {address} from "../../../utils/ProjectTypes/Project.types";


/**
 * Hook used to load the address of a project, given its projectId.
 * Returns address(0) (or 0x00...000) if projectId has not been registered
 */
export const useLoadAddressFromProjectId = (chainId: number, alias: string): useBaseAsyncHookState<address> => {
  const {completed, error, loading, result,
    startAsyncAction, endAsyncActionSuccess, endAsyncActionError} = useBaseAsyncHook<address>();

  const contractReadAlias = useContractRead({
    address: CONTRACTS_DETAILS[chainId]?.TPROOF_PRIVATE_COLLECTION_ALIAS_ADDRESS,
    abi: CONTRACTS_DETAILS[chainId]?.TPROOF_PRIVATE_COLLECTION_ALIAS_ABI,
    functionName: "aliasToAddress",
    args: [alias]
  });

  // once data il loaded, return
  useEffect(() => {
    if (contractReadAlias.data) {
      endAsyncActionSuccess(contractReadAlias.data as unknown as address);
    }
  }, [contractReadAlias.data])

  // set as loading while data is fetching
  useEffect(() => {
    if (contractReadAlias.isLoading)
      startAsyncAction();
  }, [contractReadAlias.isLoading])

  return { completed, error, loading, result };
}
