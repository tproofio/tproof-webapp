import {BaseReducer} from "./index";
import {createSlice} from "@reduxjs/toolkit";
import {clearError} from "../actions/basicActions";
import {
  setUploadPerc,
  toggleFileVerificationToProofToMint,
  toggleFileVerificationToProofToMint_All,
  toggleUploadingFileToPublish
} from "../actions/proofActions";
import {Prices, Proof} from "../../utils/ProjectTypes/Project.types";

/** -- DEFINITIONS */

/**
 * Define the shape of the reducer, by specifying the type of element accepted in each reducer elements
 *
 * @param {Proof[]} mintedProofs - list of the proofs already minted
 * @param {boolean} mintedProofsLoading - true when a loading of minted proofs is pending
 * @param {boolean} uploadingFileToPublish - true if the upload is in progress, false otherwise
 * @param {string} mintingTx - tx of the mint. Empty if mint completed
 * @param {Prices} price - prices of the operations, read from the chain. Price are in wei
 *
 */
export interface ProofReducer extends BaseReducer {
  mintedProofs: Proof[],
  mintedProofsLoading: boolean,
  uploadingFileToPublish: boolean,  // remove
  mintingTx: string,  // remove
  price: Prices | undefined
}


/** -- INITIAL STATE */

const initialState: ProofReducer = {
  dispatchError: undefined,
  mintedProofsLoading: false,
  mintedProofs: [],
  uploadingFileToPublish: false,
  mintingTx: "",
  price: undefined
};



/** --- CREATE THE REDUCER */

export const proofReducerSlice = createSlice({
  name: 'proof',
  initialState,
  reducers: {
    clearError,
    toggleFileVerificationToProofToMint,
    toggleFileVerificationToProofToMint_All,
    setUploadPerc,
    toggleUploadingFileToPublish,
  }
})

export const proofReducerActions = {
  clearError: proofReducerSlice.actions.clearError,
  toggleFileVerificationToProofToMint: proofReducerSlice.actions.toggleFileVerificationToProofToMint,
  toggleFileVerificationToProofToMint_All: proofReducerSlice.actions.toggleFileVerificationToProofToMint_All,
  setUploadPerc: proofReducerSlice.actions.setUploadPerc,
  toggleUploadingFileToPublish: proofReducerSlice.actions.toggleUploadingFileToPublish,
}

export default proofReducerSlice.reducer
