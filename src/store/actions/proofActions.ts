import {CaseReducer, createAsyncThunk, PayloadAction} from "@reduxjs/toolkit";
import {address, GenerateProofActionParams, Prices, Proof, ProofToMint} from "../../utils/ProjectTypes/Project.types";
import Web3 from "web3";
import {ProofReducer, proofReducerActions} from "../reducers/proof";
import {AbiItem} from 'web3-utils';
import {Chain, ProofVerificationStatus} from "../../utils/ProjectTypes/Project.enum";
import {fileToHash} from "../../utils/Tools/FileManagement";
import S3Manager from "../../utils/aws/s3Manager";
import {OwnedNftsResponse} from "alchemy-sdk";
import {fromTokenIdToChain} from "../../utils/Tools/Web3Management";
import axios, {AxiosResponse} from "axios";
import {RootState} from "../index";


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
 * Performs the upload of files that will require public verification on S3
 * @type {AsyncThunk<ProofToMint[], { pos: number, file: File, hash: string, MIMEType: string, storageType: string }>} - pos is the position of file in the list of files
 */
export const uploadFilesToS3 = createAsyncThunk<boolean, { pos: number, file: File, hash: string, MIMEType: string, storageType: string }[]>(
  'proof/uploadFilesToS3',
  async (params, thunkAPI) => {

    // creates all the promises, one for each file
    for (let fi=0; fi<params.length; fi++) {
      let f = params[fi];
      let sourceFileUpload = await S3Manager.createS3ManagedUpload(
        "temporary-files-tproof-io",
        "0x" + f.hash,
        f.file,
        {"Content-Type": f.MIMEType, "sotrageType": f.storageType}  // TODO Content-Type should be a string in the format */*
      );
      sourceFileUpload.on("httpUploadProgress", (progress) => {
        // TODO re-enable the abort of uploads
        // if (shouldStopUpload()) { sourceFileUpload.abort(); }
        thunkAPI.dispatch(proofReducerActions.setUploadPerc({pos: f.pos, perc: Math.round(progress.loaded * 100 / progress.total)}))
      });
      await sourceFileUpload.done();
    }

    // when completed, go to step1 (minting)
    thunkAPI.dispatch(proofReducerActions.setNewProofActiveStep(1));

    return true;
  });

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
 * Load all the NFTs minted by a user
 * @type {AsyncThunk<Token, {address: address, web3: Web3}>}
 */
export const loadProofs = createAsyncThunk<Proof[], {address: address, network: Chain}>(
  'proof/loadProofs',
  async (params, thunkAPI) => {

    // run the GET calling the lambda function
    const alchemyResp: AxiosResponse<OwnedNftsResponse> = await axios.get("https://4hxyksb43alzpuu7fphgfdfa4q0scsgl.lambda-url.eu-west-1.on.aws", {
      params: {
        owner: params.address,
        network: params.network
      }
    })

    let proofs: Proof[] = [];

    // iterate on the response and generate the reply
    for (let r of alchemyResp.data.ownedNfts) {
      let {chain, nftNum} = fromTokenIdToChain(r.tokenId);
      let createdAt = r.rawMetadata.attributes.find(e => e.trait_type === "Created At");
      let verifiedStr = r.rawMetadata.attributes.find(e => e.trait_type === "Verified").value;
      let verificationFailedString = r.rawMetadata.attributes.find(e => e.trait_type === "Verification Failed").value;
      let verificationStatus: ProofVerificationStatus;
      if (verifiedStr === "True") verificationStatus = ProofVerificationStatus.Verified;
      else if (verifiedStr === "Pending") verificationStatus = ProofVerificationStatus.Pending;
      else if (verificationFailedString === "true") verificationStatus = ProofVerificationStatus.Failed;
      else verificationStatus = ProofVerificationStatus.NotVerified;
      proofs.push({
        id: r.tokenId,
        chain: Chain.Goerli,
        nftNum: nftNum,
        hash: r.rawMetadata.attributes.find(e => e.trait_type === "Hash").value,
        title: r.title,
        createdAt: parseInt(createdAt.value),
        description: r.description,
        verificationStatus: verificationStatus,
        MIMEType: r.rawMetadata.attributes.find(e => e.trait_type === "MIME Type").value,
        fileUrl: r.rawMetadata.external_url,
        storageType: r.rawMetadata.attributes.find(e => e.trait_type === "Storage Type").value,
        verificationFailed: verificationFailedString === "true"
      })
    }

    // order by most recent to the least recent
    proofs = proofs.sort((a, b) => a.id < b.id ? 1 : -1);

    return proofs;
  }
)

/**
 * Load the current prices to mint on the chain we're connected at
 * @type {AsyncThunk<Token, {web3: Web3, routerAbi: AbiItem, routerAddress: string}>}
 */
export const loadPrices = createAsyncThunk<Prices, {web3: Web3, routerAbi: AbiItem, routerAddress: string}>(
  'proof/loadPrices',
  async (params, thunkAPI) => {

    let router = new params.web3.eth.Contract(params.routerAbi, params.routerAddress);

    // get how many NFTs has a user
    let mintPrice = await router.methods.MINT_PRICE().call();
    let verifyPice = await router.methods.VERIFICATION_PRICE().call();

    return {
      mint: parseFloat(params.web3.utils.fromWei(mintPrice)),
      verification: parseFloat(params.web3.utils.fromWei(verifyPice))
    };
  }
)

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
          thunkAPI.dispatch(proofReducerActions.loadProofs({address: params.address, network: (thunkAPI.getState() as RootState).userAccount.chainId}));
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
          thunkAPI.dispatch(proofReducerActions.loadProofs({address: params.address, network: params.chainId}));
        })
        .on('error', (e: any) => {
          reject(e)
        });
    }));

  }

)

