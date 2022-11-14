import {CaseReducer, createAsyncThunk, PayloadAction} from "@reduxjs/toolkit";
import {address, GenerateProofActionParams, Prices, Proof, ProofToMint} from "../../utils/ProjectTypes/Project.types";
import Web3 from "web3";
import {ProofReducer, proofReducerActions} from "../reducers/proof";
import {AbiItem} from 'web3-utils';
import {Chain, ProofVerificationStatus} from "../../utils/ProjectTypes/Project.enum";
import {fileToHash} from "../../utils/Tools/FileManagement";
import {OwnedNftsResponse} from "alchemy-sdk";
import {fromTokenIdToChain} from "../../utils/Tools/Web3Management";
import axios, {AxiosResponse} from "axios";


/** -- ACTIONS */


/**
 * Removes all the proof to be minted
 * @param {Draft<ProofReducer>} state
 * @param {PayloadAction<void>} action
 */
export const emptyProofToBeMinted: CaseReducer<ProofReducer, PayloadAction<void>> =
  (state, action) => {
    state.proofToBeMinted = [];
}

/**
 * Removes one element from the proofs to be minted
 * @param {Draft<ProofReducer>} state
 * @param {PayloadAction<number>} action - position of the element to be removed
 */
export const removeProofToBeMinted: CaseReducer<ProofReducer, PayloadAction<number>> =
  (state, action) => {
    let currentElements = state.proofToBeMinted;
    if (action.payload >= currentElements.length) throw new Error ("Trying to remove an element after the end of the array");
    currentElements.splice(action.payload, 1);
    state.proofToBeMinted = currentElements;
}

/**
 * Turns true/false the file verification for the given file
 * @param {Draft<ProofReducer>} state
 * @param {PayloadAction<number>} action - position of the element to toggle file verification
 */
export const toggleFileVerificationToProofToMint: CaseReducer<ProofReducer, PayloadAction<number>> =
  (state, action) => {
    state.proofToBeMinted[action.payload].toBeVerified = !state.proofToBeMinted[action.payload].toBeVerified;
}

/**
 * Turns true/false the file verification for all the elements
 * @param {Draft<ProofReducer>} state
 * @param {PayloadAction<boolean>} action - true to set all to true, false otherwise
 */
export const toggleFileVerificationToProofToMint_All: CaseReducer<ProofReducer, PayloadAction<boolean>> =
  (state, action) => {
    for (let pi in state.proofToBeMinted) {
      state.proofToBeMinted[pi].toBeVerified = action.payload;
    }
}

/**
 * Sets the uploading percentage of a single element
 * @param {Draft<ProofReducer>} state
 * @param {PayloadAction<{ pos: number, perc: number }>} action - number of the position of the element in the list
 */
export const setUploadPerc: CaseReducer<ProofReducer, PayloadAction<{ pos: number, perc: number }>> =
  (state, action) => {
    state.proofToBeMinted[action.payload.pos] = {
      ...state.proofToBeMinted[action.payload.pos],
      uploadPerc: action.payload.perc
    };
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

/**
 * Set the current step for generating a new proof
 * @param {Draft<ProofReducer>} state
 * @param {PayloadAction<number>} action - the number of the step, can be 0 or 1
 */
export const setNewProofActiveStep: CaseReducer<ProofReducer, PayloadAction<number>> =
  (state, action) => {
    state.newProofActiveStep = action.payload;
}

/**
 * Sets the mint transaction hash. Pass an empty string to clear it
 * @param {Draft<ProofReducer>} state
 * @param {PayloadAction<string>} action -
 */
export const setMintTxHash: CaseReducer<ProofReducer, PayloadAction<string>> =
  (state, action) => {
    state.mintingTx = action.payload;
}

/**
 * Sets the minted proofs of the user
 * @param {Draft<ProofReducer>} state
 * @param {PayloadAction<Proof[]>} action - list of the proofs fetched
 */
export const setUserMintedProofs: CaseReducer<ProofReducer, PayloadAction<Proof[]>> =
  (state, action) => {
    state.mintedProofs = action.payload;
}

/**
 * Sets the prices loaded from SC
 * @param {Draft<ProofReducer>} state
 * @param {PayloadAction<Prices>} action - prices for the current chain
 */
export const setMintPrices: CaseReducer<ProofReducer, PayloadAction<Prices>> =
  (state, action) => {
    state.price = action.payload;
}

/**
 * Sets the title to a new proof
 * @param {Draft<ProofReducer>} state
 * @param {PayloadAction<string>} action
 */
export const editTitleProofToMint: CaseReducer<ProofReducer, PayloadAction<{ pos: number, newTitle: string }>> =
  (state, action) => {
    state.proofToBeMinted[action.payload.pos] = {
      ...state.proofToBeMinted[action.payload.pos],
      title: action.payload.newTitle
    }
}

/**
 * Sets true if minted proofs are loading, false otherwise
 * @param {Draft<ProofReducer>} state
 * @param {PayloadAction<boolean>} action
 */
export const setMintedProofLoading: CaseReducer<ProofReducer, PayloadAction<boolean>> =
  (state, action) => {
    state.mintedProofsLoading = action.payload;
}


/**
 * Add more files in the list of proofs to be minted
 * @type {AsyncThunk<ProofToMint[], { fileList: FileList, ids: string[] }>} - the list of ids to pass should match the files passed to be added, with their IDs
 */
export const addProofsToBeMinted = createAsyncThunk<ProofToMint[], { fileList: FileList, ids: string[] }>(
  'proof/addProofsToBeMinted',
  async (params, thunkAPI) => {
    let filesToBeMinted: ProofToMint[] = [];
    for (let fi = 0; fi < params.fileList.length; fi++) {
      let file: File = params.fileList.item(fi);
      filesToBeMinted.push({
        id: params.ids[fi],
        title: "",
        fileName: file.name,
        size: file.size,
        toBeVerified: false,
        hash: await fileToHash(file),
        uploadPerc: 0
      })
    }
    return filesToBeMinted;
  });


/**
 * Launch the mint transaction with the generation of proofs
 * @type {AsyncThunk<string,GenerateProofActionParams>} - returns the mint tx hash
 */
export const generateProofs = createAsyncThunk<string, GenerateProofActionParams>(
  'proof/generateProofs',
  async (params, thunkAPI) => {

    return await (new Promise<string>(async (resolve, reject)  => {

      let totalAmountEth = (
            params.proofs.map((proof): number => proof.toBeVerified ? 1 : 0)
            .reduce((a, b) => a+b)
      ) * params.price.verification
        + (params.proofs.length * params.price.mint);

      let contract = new params.web3.eth.Contract(params.routerAbi, params.routerAddress);

      let hash: string[] = [];
      let title: string[] = [];
      let withFileUrl: boolean[] = [];
      let storageType: number[] = [];

      //eval the params
      for (let p of params.proofs) {
        hash.push("0x" + p.hash);
        title.push(p.title);
        withFileUrl.push(p.toBeVerified);
        storageType.push(0);  // currently we support only ArweaveV1
      }

      let gas = await contract.methods.createProofs(hash, title, withFileUrl, storageType, params.address, params.delegatorAddress).estimateGas({
        value: params.web3.utils.toWei(totalAmountEth.toString(), 'ether'),
        from: params.address
      });

      contract.methods.createProofs(hash, title, withFileUrl, storageType, params.address, params.delegatorAddress).send({
        from: params.address,
        to: params.routerAddress,
        value: params.web3.utils.toWei(totalAmountEth.toString(), 'ether'),
        gas: Math.floor(parseInt(gas) * 1.1),
        maxPriorityFeePerGas: params.web3.utils.toWei("0.000000080", 'ether')  // TODO use a Gas Station, checking this issue https://github.com/ethers-io/ethers.js/issues/2828
      })
        .on('transactionHash', (hash: string) => {
          resolve(hash);
        })
        .on('receipt', function(receipt: string){
          thunkAPI.dispatch(proofReducerActions.setMintTxHash(""));
          thunkAPI.dispatch(proofReducerActions.setNewProofActiveStep(0));
          // thunkAPI.dispatch(proofReducerActions.loadProofs({address: params.address, network: 555 }));  // TODO insert the correct ChainId reading from the hook (do that before getting here, as if the user changes the chain after tx sends, this might generate strange behaviour)
          thunkAPI.dispatch(proofReducerActions.emptyProofToBeMinted());
        })
        .on('error', (e: any) => {
          reject(e)
        });
    }));

  }
)

/**
 * Launch the tx to edit the title of a given NFT
 * @type {AsyncThunk<string,{ address: address, web3: Web3, nftId: number, newTitle: string, nftAbi: AbiItem, nftAddress: address}>} - returns the mint tx hash
 */
export const editTile = createAsyncThunk<string, { address: address, web3: Web3, nftId: string, newTitle: string, nftAbi: AbiItem, nftAddress: address, chainId: Chain}>(
  'proof/editTile',
  async (params, thunkAPI) => {

    return await (new Promise<string>(async (resolve, reject)  => {

      let contract = new params.web3.eth.Contract(params.nftAbi, params.nftAddress);

      let gas = await contract.methods.updateTitle([params.nftId], [params.newTitle]).estimateGas({
        value: 0,
        from: params.address,
      });

      contract.methods.updateTitle([params.nftId], [params.newTitle]).send({
        from: params.address,
        to: params.nftAddress,
        value: 0,
        gas: Math.floor(parseInt(gas) * 1.1)
      })
        .on('transactionHash', (hash: string) => {
          resolve(hash);
        })
        .on('receipt', function(receipt: string){
          thunkAPI.dispatch(proofReducerActions.setMintTxHash(""));
          // thunkAPI.dispatch(proofReducerActions.loadProofs({address: params.address, network: params.chainId}));
        })
        .on('error', (e: any) => {
          reject(e)
        });
    }));

  }

)

