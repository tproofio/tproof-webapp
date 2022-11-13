import {ethers} from "ethers";
import axios from "axios";
import {useState} from "react";
import {BigNumber} from "@ethersproject/bignumber";

export interface LoadMaxFeesResult {
  maxFeePerGas: BigNumber,
  maxPriorityFeePerGas: BigNumber
}

/**
 * @param {boolean} completed
 * @param {string} error
 * @param {LoadMaxFeesResult | undefined} result
 */
export interface UseLoadMaxFeesState {
  completed: boolean,
  error: string,
  result: LoadMaxFeesResult | undefined
}

/**
 * @param {function} loadPrices
 */
export interface UseLoadMaxFeesResponse extends UseLoadMaxFeesState {
  loadMaxFees: () => void
}

export const useLoadMaxFees = (): UseLoadMaxFeesResponse => {
  const [status, setStatus] = useState<UseLoadMaxFeesState>({
    completed: false, error: "", result: undefined});
  const loadMaxFees = (): void => {
    new Promise(async (resolve, reject) => {
      // get max fees from gas station
      let maxFeePerGas = ethers.BigNumber.from(40000000000); // fallback to 40 gwei
      let maxPriorityFeePerGas = ethers.BigNumber.from(40000000000); // fallback to 40 gwei
      let error: string = "";
      try {
        const {data} = await axios.get('https://gasstation-mainnet.matic.network/v2');
        maxFeePerGas = ethers.utils.parseUnits(
            Math.ceil(data.fast.maxFee) + '',
            'gwei'
        );
        maxPriorityFeePerGas = ethers.utils.parseUnits(
            Math.ceil(data.fast.maxPriorityFee) + '',
            'gwei'
        );
      } catch (e) {
        error = e.toString();
      }
      setStatus({completed: true, error: error, result: {maxFeePerGas, maxPriorityFeePerGas}});
    }).then(() => {});
  };
  return {...status, loadMaxFees};
}
