import React, {useEffect} from 'react';
import {Box, Button, Typography} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../../../hooks/reduxHooks";
import {proofReducerActions} from "../../../store/reducers/proof";
import {useFileListCache} from "../../../hooks/fileListHook";
import {useWeb3} from "../../../hooks/useWeb3";
import {CHAIN_DETAILS, CONTRACTS_DETAILS} from "../../../utils/constants";

/**
 *
 * @param {React.PropsWithChildren<INewProofCommands>} props
 * @return {JSX.Element}
 * @constructor
 */
const NewProofCommands: React.FC<INewProofCommands> = (props) => {

  const dispatch = useAppDispatch();
  const fileListCache = useFileListCache();
  const web3 = useWeb3();

  const connectedWalletAddress = useAppSelector(state => state.userAccount.connectedWalletAddress);
  const proofToBeMinted = useAppSelector(state => state.proof.proofToBeMinted);
  const activeStepNum = useAppSelector(state => state.proof.newProofActiveStep);
  const uploadingFileToPublish = useAppSelector(state => state.proof.uploadingFileToPublish);
  const mintingTx = useAppSelector(state => state.proof.mintingTx);
  const chainId = useAppSelector(state => state.userAccount.chainId);
  const price = useAppSelector(state => state.proof.price);

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
      dispatch(proofReducerActions.uploadFilesToS3(uploadObjects));
    }
  }, [uploadingFileToPublish]);

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
  const generateProofs = () => {
    dispatch(proofReducerActions.generateProofs({
      web3: web3,
      address: connectedWalletAddress,
      proofs: proofToBeMinted,
      delegatorAddress: CONTRACTS_DETAILS[chainId].DELEGATOR_ADDRESS,
      nftAbi: CONTRACTS_DETAILS[chainId].TPROOF_NFT_FACTORY_ABI,
      nftAddress: CONTRACTS_DETAILS[chainId].TPROOF_NFT_FACTORY_ADDRESS,
      routerAddress: CONTRACTS_DETAILS[chainId].TPROOF_ROUTER_ADDRESS,
      routerAbi: CONTRACTS_DETAILS[chainId].TPROOF_ROUTER_ABI,
      price
    }));
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
                <Button variant="contained" sx={{mt: 4, width: 200}} onClick={generateProofs} disabled={mintingTx !== ""}>
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
                  Follow your transaction on <a href={`${CHAIN_DETAILS[chainId].EXPLORER_URL}/tx/${mintingTx}`} target={"_blank"}>Etherscan</a>
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
            <Button variant="contained" component="label" disabled={connectedWalletAddress === ""} sx={{width: 200}}>
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
