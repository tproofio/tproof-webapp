import {BaseReducer} from "./index";
import {createSlice} from "@reduxjs/toolkit";
import {clearError} from "../actions/basicActions";
import {
  addProofsToBeMinted,
  editTitleProofToMint,
  emptyProofToBeMinted,
  removeProofToBeMinted,
  setMintedProofLoading,
  setMintPrices,
  setMintTxHash,
  setNewProofActiveStep,
  setUploadPerc,
  setUserMintedProofs,
  toggleFileVerificationToProofToMint,
  toggleFileVerificationToProofToMint_All,
  toggleUploadingFileToPublish
} from "../actions/proofActions";
import {ErrorsEnum} from "../../utils/ProjectTypes/Errors.enum";
import {Prices, Proof, ProofToMint} from "../../utils/ProjectTypes/Project.types";

/** -- DEFINITIONS */

/**
 * Define the shape of the reducer, by specifying the type of element accepted in each reducer elements
 *
 * @param {Proof[]} mintedProofs - list of the proofs already minted
 * @param {boolean} mintedProofsLoading - true when a loading of minted proofs is pending
 * @param {ProofToMint[]} proofToBeMinted - list of file user would like to mint as tProofs
 * @param {boolean} proofsToBeMintedHasEvaluationPending - true if the hash evaluation is in progress, false once is done
 * @param {boolean} uploadingFileToPublish - true if the upload is in progress, false otherwise
 * @param {number} newProofActiveStep - 0 if we're in the file selection/upload part. 1 if we're in the mint list reminted
 * @param {string} mintingTx - tx of the mint. Empty if mint completed
 * @param {Prices} price - prices of the operations, read from the chain. Price are in wei
 *
 */
export interface ProofReducer extends BaseReducer {
  mintedProofs: Proof[],
  mintedProofsLoading: boolean,
  proofToBeMinted: ProofToMint[],
  proofsToBeMintedHasEvaluationPending: boolean,  // remove
  uploadingFileToPublish: boolean,  // remove
  newProofActiveStep: number,  // why?
  mintingTx: string,  // remove
  price: Prices | undefined
}


/** -- INITIAL STATE */

const initialState: ProofReducer = {
  dispatchError: undefined,
  mintedProofsLoading: false,
  mintedProofs: [],
  proofToBeMinted: [],
  proofsToBeMintedHasEvaluationPending: false,
  uploadingFileToPublish: false,
  newProofActiveStep: 0,
  mintingTx: "",
  price: undefined
};



/** --- CREATE THE REDUCER */

export const proofReducerSlice = createSlice({
  name: 'proof',
  initialState,
  reducers: {
    clearError,
    removeProofToBeMinted,
    emptyProofToBeMinted,
    toggleFileVerificationToProofToMint,
    toggleFileVerificationToProofToMint_All,
    setUploadPerc,
    toggleUploadingFileToPublish,
    setNewProofActiveStep,
    setMintTxHash,
    editTitleProofToMint,
    setUserMintedProofs,
    setMintedProofLoading,
    setMintPrices
  },
  extraReducers:
    (builder) => {

      /** Add proofs to be minted */
      builder.addCase(addProofsToBeMinted.fulfilled, (state, action) => {
        for (let p of action.payload) {
          state.proofToBeMinted.push(p);
        }
        state.proofsToBeMintedHasEvaluationPending = false;
      })
      builder.addCase(addProofsToBeMinted.pending, (state, action) => {
        state.proofsToBeMintedHasEvaluationPending = true;
      })
      builder.addCase(addProofsToBeMinted.rejected, (state, action) => {
        state.dispatchError = { code: ErrorsEnum.PROOF_0002, message: "", action: "proof/addProofsToBeMinted"};
        state.proofsToBeMintedHasEvaluationPending = false;
      })

    }
})

export const proofReducerActions = {
  clearError: proofReducerSlice.actions.clearError,
  removeProofToBeMinted: proofReducerSlice.actions.removeProofToBeMinted,
  emptyProofToBeMinted: proofReducerSlice.actions.emptyProofToBeMinted,
  toggleFileVerificationToProofToMint: proofReducerSlice.actions.toggleFileVerificationToProofToMint,
  toggleFileVerificationToProofToMint_All: proofReducerSlice.actions.toggleFileVerificationToProofToMint_All,
  setUploadPerc: proofReducerSlice.actions.setUploadPerc,
  toggleUploadingFileToPublish: proofReducerSlice.actions.toggleUploadingFileToPublish,
  setNewProofActiveStep: proofReducerSlice.actions.setNewProofActiveStep,
  setMintTxHash: proofReducerSlice.actions.setMintTxHash,
  editTitleProofToMint: proofReducerSlice.actions.editTitleProofToMint,
  setUserMintedProofs: proofReducerSlice.actions.setUserMintedProofs,
  setMintedProofLoading: proofReducerSlice.actions.setMintedProofLoading,
  setMintPrices: proofReducerSlice.actions.setMintPrices,
  addProofsToBeMinted: addProofsToBeMinted
}

export default proofReducerSlice.reducer
