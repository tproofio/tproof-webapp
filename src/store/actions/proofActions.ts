import {CaseReducer, PayloadAction} from "@reduxjs/toolkit";
import {ProofReducer} from "../reducers/proof";


/** -- ACTIONS */


/**
 * Turns true/false the file verification for the given file
 * @param {Draft<ProofReducer>} state
 * @param {PayloadAction<number>} action - position of the element to toggle file verification
 */
export const toggleFileVerificationToProofToMint: CaseReducer<ProofReducer, PayloadAction<number>> =
  (state, action) => {
    // state.proofToBeMinted[action.payload].toBeVerified = !state.proofToBeMinted[action.payload].toBeVerified;
}

/**
 * Turns true/false the file verification for all the elements
 * @param {Draft<ProofReducer>} state
 * @param {PayloadAction<boolean>} action - true to set all to true, false otherwise
 */
export const toggleFileVerificationToProofToMint_All: CaseReducer<ProofReducer, PayloadAction<boolean>> =
  (state, action) => {
    // for (let pi in state.proofToBeMinted) {
    //   state.proofToBeMinted[pi].toBeVerified = action.payload;
    // }
}

/**
 * Sets the uploading percentage of a single element
 * @param {Draft<ProofReducer>} state
 * @param {PayloadAction<{ pos: number, perc: number }>} action - number of the position of the element in the list
 */
export const setUploadPerc: CaseReducer<ProofReducer, PayloadAction<{ pos: number, perc: number }>> =
  (state, action) => {
    // state.proofToBeMinted[action.payload.pos] = {
    //   ...state.proofToBeMinted[action.payload.pos],
    //   uploadPerc: action.payload.perc
    // };
}

/**
 * Set true / false the status of the current upload
 * @param {Draft<ProofReducer>} state
 * @param {PayloadAction<boolean>} action
 */
export const toggleUploadingFileToPublish: CaseReducer<ProofReducer, PayloadAction<boolean>> =
  (state, action) => {
    state.uploadingFileToPublish = action.payload;
}
