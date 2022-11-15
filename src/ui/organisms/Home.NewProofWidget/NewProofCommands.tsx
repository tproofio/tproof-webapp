import React, {useEffect} from 'react';
import {Box, Button, Typography} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../../../hooks/redux/reduxHooks";
import {proofReducerActions} from "../../../store/reducers/proof";
import {useFileListCache} from "../../../hooks/utils/fileListHook";
import {CHAIN_DETAILS, CONTRACTS_DETAILS} from "../../../utils/constants";
import {useAccount, useNetwork} from "wagmi";
import {useUploadFiles} from "../../../hooks/aws/s3/useUploadFiles";
import {useGenerateProofs} from "../../../hooks/contracts/tProofRouter/useGenerateProofs";
import {useLoadProofs} from "../../../hooks/api/proofs/useLoadProofs";

/**
 *
 * @param {React.PropsWithChildren<INewProofCommands>} props
 * @return {JSX.Element}
 * @constructor
 */
const NewProofCommands: React.FC<INewProofCommands> = (props) => {

  const dispatch = useAppDispatch();
  const fileListCache = useFileListCache();

  const proofToBeMinted = useAppSelector(state => state.proof.proofToBeMinted);
  const activeStepNum = useAppSelector(state => state.proof.newProofActiveStep);
  const uploadingFileToPublish = useAppSelector(state => state.proof.uploadingFileToPublish);
  const mintingTx = useAppSelector(state => state.proof.mintingTx);
  const price = useAppSelector(state => state.proof.price);

  const { address: connectedWalletAddress } = useAccount();
  const { chain } = useNetwork();
  const useUploadFilesObj = useUploadFiles();
  const generateProofs = useGenerateProofs({
    proofs: proofToBeMinted,
    delegatorAddress: CONTRACTS_DETAILS[chain?.id]?.DELEGATOR_ADDRESS,
    price
  });
  const loadProofs = useLoadProofs();

  // launch the upload of objects on S3
  useEffect(() => {
    if (uploadingFileToPublish) {
      let uploadObjects = [];
      for (let pi in proofToBeMinted) {
        let p = proofToBeMinted[pi];
        if (p.toBeVerified)
          uploadObjects.push({
            pos: pi,
            file: fileListCache.getFileItem(p.id),
            hash: p.hash,
            MIMEType: "-",
            storageType: "ArweaveV1"
          });
      }
      useUploadFilesObj.upload(uploadObjects);
    }
  }, [uploadingFileToPublish]);

  // update the upload percentage
  useEffect(() => {
    useUploadFilesObj.uploadPerc.forEach( el =>
      dispatch(proofReducerActions.setUploadPerc({pos: el.pos, perc: el.perc}))
    )
  }, [useUploadFilesObj.uploadPerc]);

  // when upload completes, go to step 1 and set the upload files completed
  useEffect(() => {
    if (useUploadFilesObj.completed) {
      dispatch(proofReducerActions.toggleUploadingFileToPublish(false));
      dispatch(proofReducerActions.setNewProofActiveStep(1));
    }
  }, [useUploadFilesObj.completed])

  // manages the states of tx minting
  useEffect(() => {
    if (generateProofs.loading)
      dispatch(proofReducerActions.setMintTxHash(generateProofs.txHash));
    else if (generateProofs.completed) {
      dispatch(proofReducerActions.setNewProofActiveStep(0));
      dispatch(proofReducerActions.emptyProofToBeMinted());
      loadProofs.loadProofs();
    }
  }, [generateProofs.completed, generateProofs.loading, generateProofs.txHash])

  /**
   * Appends the files selected by the user to the list of files to remember
   * @param e
   */
  const fileSelectedAppend = (e) => {
    if (e && e.target && e.target.files) {
      let fileList = e.target.files as FileList;
      let ids = fileListCache.appendToFileListCache(fileList);
      dispatch(proofReducerActions.addProofsToBeMinted({ fileList: e.target.files as FileList, ids} ));
    }
  }

  /**
   * Starts the upload file process
   */
  const uploadFiles = () => {
    dispatch(proofReducerActions.toggleUploadingFileToPublish(true));
    // the start to the upload is triggered by the useState that listens for the change on uploadingFileToPublish variable
  }

  /**
   * Starts the mint transaction
   */
  const generateProofsAction = () => {
    generateProofs.generateProofs();
  }


  return (
    <Box width={"100%"}>

      {
        proofToBeMinted.length > 0 ?
          <Box width="100%" display="flex" alignItems={"center"} justifyContent={"center"} flexDirection={"column"}>
            {
              activeStepNum===0 ?
                <Button variant="contained" sx={{mt: 4, width: 200}}
                        onClick={uploadFiles}
                        disabled={uploadingFileToPublish}>
                  {uploadingFileToPublish ? "Uploading Files ..." : "Continue"}
                </Button>
                :
                <Button variant="contained" sx={{mt: 4, width: 200}} onClick={generateProofsAction} disabled={mintingTx !== ""}>
                  {
                    mintingTx !== "" ?
                      "Transaction pending ..."
                      :
                      "Generate Proof"
                  }
                </Button>
            }

            {
              // show tx ID if we're minting, with a link to Etherescan
              mintingTx !== "" ?
                <Typography variant="body2" sx={{mt: 1}}>
                  Follow your transaction on <a href={`${CHAIN_DETAILS[chain?.id].EXPLORER_URL}/tx/${mintingTx}`} target={"_blank"}>Etherscan</a>
                </Typography>
                :
                ""
            }
          </Box>
          :
          ""
      }

      {
        proofToBeMinted.length === 0 && activeStepNum===0 ?
          <Box width="100%" display="flex" alignItems={"center"} justifyContent={"center"}>
            <Button variant="contained" component="label" disabled={connectedWalletAddress === undefined} sx={{width: 200}}>
              Select File
              <input hidden accept="*/*" multiple type="file" onChange={fileSelectedAppend} />
            </Button>
          </Box>
          :
          ""
      }


    </Box>
  );
};

export interface INewProofCommands {

}

export default NewProofCommands;
