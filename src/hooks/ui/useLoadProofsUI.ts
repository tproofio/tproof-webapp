import {useLoadProofs} from "../api/proofs/useLoadProofs";
import {useEffect} from "react";
import {proofReducerActions} from "../../store/reducers/proof";
import {useAppDispatch} from "../redux/reduxHooks";
import {isSupportedChainId} from "../../utils/Tools/Web3Management";
import { useNetwork } from "wagmi";


/**
 * Calls the load proofs and manages the state changes in the redux store
 */
export const useLoadProofsUI = (): {loadProofs: () => void} => {

  const dispatch = useAppDispatch();
  const network = useNetwork();
  const loadProofsObj = useLoadProofs(network.chain?.id);

  useEffect(() => {
    if (loadProofsObj.completed)
      dispatch(proofReducerActions.setUserMintedProofs(loadProofsObj.result));
    dispatch(proofReducerActions.setMintedProofLoading(loadProofsObj.loading));
  }, [loadProofsObj.completed, loadProofsObj.loading, loadProofsObj.result])

  const loadProofs = () => {
    if (!loadProofsObj.loading)
      loadProofsObj.loadProofs();
  }

  return {
    loadProofs
  }

}
