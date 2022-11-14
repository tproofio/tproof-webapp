import {useContract, useNetwork, useProvider} from "wagmi";
import {CONTRACTS_DETAILS} from "../../../utils/constants";
import {useBaseAsyncHook, useBaseAsyncHookState} from "../../utils/useBaseAsyncHook";

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
  const contract = useContract({
    address: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_ROUTER_ADDRESS,
    abi: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_ROUTER_ABI
  });
  const provider = useProvider();
  const loadPrices = (): void => {
    startAsyncAction();
    new Promise( async (resolve, reject) => {
      try {
        const mintPrice = await contract.connect(provider).MINT_PRICE();
        const verificationPrice = await contract.connect(provider).VERIFICATION_PRICE();
        endAsyncActionSuccess({mint: mintPrice, verification: verificationPrice});
      } catch (e) {
        endAsyncActionError(e.toString());
      }
    }).then(() => {});
  };
  return { completed, error, loading, result, loadPrices };
}
