import {useState} from "react";
import {useBaseAsyncHook, useBaseAsyncHookReturn} from "./useBaseAsyncHook";


/**
 * @param {string} txHash - hash of the tx, empty if not set
 * @param {(_txHash: string) => void} startAsyncActionWithTxHash - starts the async action setting the tx hash
 */
export interface useBaseSmartContractWriteReturn<T> extends useBaseAsyncHookReturn<T> {
  txHash: string,
  startAsyncActionWithTxHash: (_txHash: string) => void
}

/**
 * Extension of useBaseAsyncHook, studied to implement actions on the blockchain (with tx hash)
 */
export const useBaseSmartContractWrite = <T>(): useBaseSmartContractWriteReturn<T> => {
  const [txHash, setTxHash] = useState<string>("");
  const baseAsyncHookState = useBaseAsyncHook<T>();

  /**
   * Starts an async action
   */
  const startAsyncActionWithTxHash = (_txHash: string) => {
    baseAsyncHookState.startAsyncAction();
    setTxHash(_txHash);
  }

  /**
   * Ends an async tx action with success
   * @param {T} _result - the response to return
   */
  const endAsyncActionSuccess = (_result: T) => {
    setTxHash("");
    baseAsyncHookState.endAsyncActionSuccess(_result);
  }

  /**
   * Ends an async tx action with error
   * @param {string} _error - the error to set
   */
  const endAsyncActionError = (_error: string) => {
    setTxHash("");
    baseAsyncHookState.endAsyncActionError(_error);
  }

  return {
    ...baseAsyncHookState,
    endAsyncActionSuccess,
    endAsyncActionError,
    txHash,
    startAsyncActionWithTxHash
  }

}
