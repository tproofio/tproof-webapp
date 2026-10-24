import React, {useEffect} from 'react';
import {Box, Button, Typography} from "@mui/material";
import {useFileListCache} from "../../../hooks/utils/fileListHook";
import {CHAIN_DETAILS, CONTRACTS_DETAILS} from "../../../utils/constants";
import {useAccount, useNetwork} from "wagmi";
import {useGenerateProofs} from "../../../hooks/contracts/tProofRouter/useGenerateProofs";
import {useLoadPublicProofsUI} from "../../../hooks/ui/useLoadPublicProofsUI";
import {useProofs} from "../../../context/Proofs/ProofsProvider";
import {ProofToMint} from "../../../utils/ProjectTypes/Project.types";
import {fileToHash} from "../../../utils/Tools/FileManagement";
import {useGenerateProofsPrivate} from "../../../hooks/contracts/tProofRouter/useGenerateProofsPrivate";
import {useLoadPrivateProofsUI} from "../../../hooks/ui/useLoadPrivateProofsUI";

/**
 *
 * @param {React.PropsWithChildren<INewProofCommands>} props
 * @return {JSX.Element}
 * @constructor
 */
const NewProofCommands: React.FC<INewProofCommands> = (props) => {

  const fileListCache = useFileListCache();

  const proofs = useProofs();

  const { address: connectedWalletAddress } = useAccount();
  const { chain } = useNetwork();
  const generateProofs = useGenerateProofs({
    proofs: proofs.data.proofToBeMinted,
    delegatorAddress: CONTRACTS_DETAILS[chain?.id]?.DELEGATOR_ADDRESS,
    price: proofs.data.price
  });
  const generateProofsPrivate = useGenerateProofsPrivate({
    proofs: proofs.data.proofToBeMinted,
    collectionAddress: proofs.data.privateCollectionAddress
  })
  const loadProofs = useLoadPublicProofsUI();
  const loadProofsPrivate = useLoadPrivateProofsUI(proofs.data.privateCollectionAddress);

  // The off-chain S3 upload was removed together with the tproof backend, so
  // file-backed proofs are no longer pinned. Creating proofs remains hash-only.
  // manages the states of public tx minting
  useEffect(() => {
    if (generateProofs.loading)
      proofs.setMintingTx(generateProofs.txHash);
    else if (generateProofs.completed) {
      proofs.setNewProofActiveStep(0);
      proofs.setProofToBeMinted([]);
      proofs.setMintingTx("");
      loadProofs.loadProofs();
    }
  }, [generateProofs.completed, generateProofs.loading, generateProofs.txHash])

  // manages the states of private tx minting
  useEffect(() => {
    if (generateProofsPrivate.loading)
      proofs.setMintingTx(generateProofsPrivate.txHash);
    else if (generateProofsPrivate.completed) {
      proofs.setNewProofActiveStep(0);
      proofs.setProofToBeMinted([]);
      proofs.setMintingTx("");
      proofs.setMintedProofs([]);
      loadProofsPrivate.reloadEverything();
    }
  }, [generateProofsPrivate.completed, generateProofsPrivate.loading, generateProofsPrivate.txHash])

  /**
   * Appends the files selected by the user to the list of files to remember
   * @param e
   */
  const fileSelectedAppend = async (e) => {
    if (e && e.target && e.target.files) {
      proofs.setProofsToBeMintedHasEvaluationPending(true);
      let fileList = e.target.files as FileList;
      let ids = fileListCache.appendToFileListCache(fileList);
      let filesToBeMinted: ProofToMint[] = proofs.data.proofToBeMinted;
      for (let fi = 0; fi < e.target.files.length; fi++) {
        let file: File = e.target.files.item(fi);
        filesToBeMinted.push({
          id: ids[fi],
          title: "",
          fileName: file.name,
          size: file.size,
          toBeVerified: false,
          hash: await fileToHash(file),
          uploadPerc: 0
        })
      }
      proofs.setProofToBeMinted(filesToBeMinted);
      proofs.setProofsToBeMintedHasEvaluationPending(false);
    }
  }

  /**
   * Starts the upload file process
   */
  const uploadFiles = () => {
    // dispatch(proofReducerActions.toggleUploadingFileToPublish(true));
    // // the start to the upload is triggered by the useState that listens for the change on uploadingFileToPublish variable

    // the upload of files has bene disabled, and so we can immediately go to the next step
    // TODO improve the logic of the hook to upload files
    proofs.setNewProofActiveStep(1);
  }

  /**
   * Starts the mint transaction
   */
  const generateProofsAction = () => {
    if (proofs.data.privateCollectionAddress)
      generateProofsPrivate.generateProofs();
    else generateProofs.generateProofs();
  }


  return (
    <Box width={"100%"}>

      {
        proofs.data.proofToBeMinted.length > 0 ?
          <Box width="100%" display="flex" alignItems={"center"} justifyContent={"center"} flexDirection={"column"}>
            {
              proofs.data.newProofActiveStep===0 ?
                <Button variant="contained" sx={{mt: 4, width: 200}}
                        onClick={uploadFiles}
                        disabled={proofs.data.uploadingFileToPublish}>
                  {proofs.data.uploadingFileToPublish ? "Uploading Files ..." : "Continue"}
                </Button>
                :
                <Button variant="contained" sx={{mt: 4, width: 200}} onClick={generateProofsAction} disabled={proofs.data.mintingTx !== ""}>
                  {
                    proofs.data.mintingTx !== "" ?
                      "Transaction pending ..."
                      :
                      "Generate Proof"
                  }
                </Button>
            }

            {
              // show tx ID if we're minting, with a link to Etherescan
              proofs.data.mintingTx !== "" ?
                <Typography variant="body2" sx={{mt: 1}}>
                  Follow your transaction on <a href={`${CHAIN_DETAILS[chain?.id].EXPLORER_URL}/tx/${proofs.data.mintingTx}`} target={"_blank"}>{CHAIN_DETAILS[chain?.id].EXPLORER_NAME}</a>
                </Typography>
                :
                ""
            }
          </Box>
          :
          ""
      }

      {
        proofs.data.proofToBeMinted.length === 0 && proofs.data.newProofActiveStep===0 ?
          <Box width="100%" display="flex" alignItems={"center"} justifyContent={"center"}>
            <Button variant="contained" component="label" disabled={connectedWalletAddress === undefined} sx={{width: 200}}>
              Select File
              <input hidden accept="*/*" multiple type="file" onChange={(e) => fileSelectedAppend(e).then(()=>{})} />
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
