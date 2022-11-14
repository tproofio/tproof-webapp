import {useState} from "react";
import {useContract, useNetwork, useProvider} from "wagmi";
import {CONTRACTS_DETAILS} from "../../../utils/constants";

/**
 * @param {number} mint
 * @param {number} verification
 */
export interface LoadPricesResult {
  mint: number,
  verification: number
}

/**
 * @param {boolean} completed
 * @param {string} error
 * @param {LoadPricesResult} result
 */
export interface UseLoadPricesState {
  completed: boolean,
  error: string,
  result: LoadPricesResult | undefined
}

/**
 * @param {function} loadPrices
 */
export interface UseLoadPricesResponse extends UseLoadPricesState {
  loadPrices: () => void
}

/**
 * Hook used to load mint and verification prices.
 */
export const useLoadPrices = (): UseLoadPricesResponse => {
  const [status, setStatus] = useState<UseLoadPricesState>({completed: false, error: "", result: undefined});
  const network = useNetwork();
  const contract = useContract({
    address: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_ROUTER_ADDRESS,
    abi: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_ROUTER_ABI
  });
  const provider = useProvider();
  const loadPrices = (): void => {
    new Promise( async (resolve, reject) => {
      let error = ""; let result: LoadPricesResult = undefined;
      try {
        const mintPrice = await contract.connect(provider).MINT_PRICE();
        const verificationPrice = await contract.connect(provider).VERIFICATION_PRICE();
        result = {mint: mintPrice, verification: verificationPrice};
      } catch (e) {
        error = e.toString();
      }
      setStatus({ completed: true, error, result });
    }).then(() => {});
  };
  return {
    ...status, loadPrices
  };
}
