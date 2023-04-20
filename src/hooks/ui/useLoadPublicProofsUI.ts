import {useLoadProofs} from "../api/proofs/useLoadProofs";
import {useEffect} from "react";
import {proofReducerActions} from "../../store/reducers/proof";
import {useAppDispatch} from "../redux/reduxHooks";
import {isSupportedChainId} from "../../utils/Tools/Web3Management";
import { useNetwork } from "wagmi";
import {useProofs} from "../../context/Proofs/ProofsProvider";


/**
 * Calls the load proofs and manages the state changes in the Proofs Context.
 *
 * USe this hook only inside ProofContext
 */
export const useLoadPublicProofsUI = (): {loadProofs: () => void} => {

  const network = useNetwork();
  const proofs = useProofs();
  const loadProofsObj = useLoadProofs(network.chain?.id);

  useEffect(() => {
    if (loadProofsObj.completed)
      proofs.setMintedProofs(loadProofsObj.result);
    proofs.setMintedProofsLoading(loadProofsObj.loading);
  }, [loadProofsObj.completed, loadProofsObj.loading, loadProofsObj.result])

  const loadProofs = () => {
    if (!loadProofsObj.loading)
      loadProofsObj.loadProofs();
  }

  return {
    loadProofs
  }

}
