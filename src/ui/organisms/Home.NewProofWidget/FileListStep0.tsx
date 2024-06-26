import React, {useState} from 'react';
import {useAppDispatch, useAppSelector} from '../../../hooks/redux/reduxHooks';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography
} from "@mui/material";
import prettyBytes from 'pretty-bytes';
import {proofReducerActions} from "../../../store/reducers/proof";
import {useFileListCache} from "../../../hooks/utils/fileListHook";
import {Clear} from "@mui/icons-material";
import {useNetwork} from "wagmi";
import {useProofs} from "../../../context/Proofs/ProofsProvider";
import {ProofToMint} from "../../../utils/ProjectTypes/Project.types";
import {fileToHash} from "../../../utils/Tools/FileManagement";

/**
 *
 * @param {React.PropsWithChildren<IFileListStep0>} props
 * @return {JSX.Element}
 * @constructor
 */
const FileListStep0: React.FC<IFileListStep0> = (props) => {

  const dispatch = useAppDispatch();
  const fileListCache = useFileListCache();
  const { chain } = useNetwork();
  const proofs = useProofs();

  const [showPublishHelpDialog, setShowPublishHelpDialog, ] = useState<boolean>(false);

  const uploadingFileToPublish = useAppSelector(state => state.proof.uploadingFileToPublish);

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
   * Turns on/off the publishing of a given file
   * @param {number} pos - the number of the element in the array list
   */
  const toggleFilePublish = (pos: number) => {
    if (uploadingFileToPublish) return;
    dispatch(proofReducerActions.toggleFileVerificationToProofToMint(pos));
  }

  /**
   * removes a file from the list (and the fileListCache too
   * @param {number} pos - the number of the element in the array list
   */
  const removeFileElement = (pos: number) => {
    fileListCache.removeFileFromListCache(proofs.data.proofToBeMinted[pos].id);
    let currentElements = proofs.data.proofToBeMinted;
    currentElements.splice(pos, 1);
    proofs.setProofToBeMinted(JSON.parse(JSON.stringify(currentElements)));
  }

  /**
   * Turns on/off the publishing of all the files
   */
  const turnOnOffAllFilePublish = () => {
    if (uploadingFileToPublish) return;
    // check if they're all on
    let allOn = true;
    for (let p of proofs.data.proofToBeMinted) {
      if (!p.toBeVerified) {
        allOn = false;
        break;
      }
    }
    dispatch(proofReducerActions.toggleFileVerificationToProofToMint_All(!allOn));
  }

  return (
    <Box width={"100%"}>
      <Grid container sx={{width: "100%"}}>
        <Grid item xs={9}>
          <Typography variant="h4">File</Typography>
        </Grid>
        <Grid item xs={3} display={"flex"} alignItems={"center"}>
          {/*
             // disable all the upload of files until a more stable version of the Chainlink node is set up
           */}
          {/*<Tooltip title={`Click to publish/unpublish all the files`} placement={"top"} arrow followCursor>*/}
          {/*  <Typography variant="h4" sx={{cursor: "pointer"}} onClick={turnOnOffAllFilePublish}>*/}
          {/*    Publish*/}
          {/*  </Typography>*/}
          {/*</Tooltip>*/}
          {/*<InfoOutlined sx={{ml: 1, fontSize: 16, mb: "4px", cursor: "help"}} onClick={() => {setShowPublishHelpDialog(true)}}/>*/}
        </Grid>
      </Grid>

      {
        proofs.data.proofToBeMinted.map((p, pos) => {
          let title = p.fileName;
          if (title.length > 30) {
            title = title.substring(0, 11) + "..." + title.substring(title.length - 11, title.length);
          }
          return (
            <Grid container sx={{mt: 2}} key={p.id}>
              <Grid item xs={9}>
                <Box display="flex" flexDirection={"row"}>
                  <Tooltip title={"Remove"} placement={"top"} arrow followCursor>
                    <IconButton color="primary" size={"small"} disabled={uploadingFileToPublish}
                                disableRipple onClick={() => {removeFileElement(pos)}}>
                      <Clear />
                    </IconButton>
                  </Tooltip>
                  <Box pl={0.5} width="100%">
                    <Typography variant="body1">{title}</Typography>
                    <Typography variant="body2" color={"textSecondary"}>{prettyBytes(p.size)}</Typography>
                    {
                      uploadingFileToPublish ?
                        p.toBeVerified ?
                          p.uploadPerc > 0 ?
                            <Box sx={{ width: '100%' }}>
                              <LinearProgress variant="determinate" value={p.uploadPerc} />
                            </Box>
                            :
                            "Upload pending ..."
                          :
                          "Upload not necessary"
                        :
                        ""
                    }

                  </Box>
                </Box>
              </Grid>
              {/* Publish checkbox */}
              <Grid item xs={3}>
                {/*
                    // disable all the upload of files until a more stable version of the Chainlink node is set up
                */}
                {/*<Tooltip title={p.size > MAX_FILE_SIZE_SUPPORTED_BYTES ? "Currently supporting only files up to 100MB. Need more space? Contact Us!" : ""}*/}
                {/*         placement={"top"} arrow followCursor>*/}
                {/*  <span>*/}
                {/*    <Checkbox checked={p.toBeVerified}*/}
                {/*              onChange={() => {toggleFilePublish(pos)}}*/}
                {/*              disabled={p.size > MAX_FILE_SIZE_SUPPORTED_BYTES}/>*/}
                {/*  </span>*/}
                {/*</Tooltip>*/}
              </Grid>
            </Grid>
          )
        })
      }

      {/* ADD MORE FILEs button*/}
      {
        proofs.data.proofToBeMinted.length > 0 || proofs.data.proofsToBeMintedHasEvaluationPending ?
          <Box mt={2}>
            {
              proofs.data.proofsToBeMintedHasEvaluationPending ?
                <Box width={"100%"} display={"flex"} justifyContent={"center"}>
                  <CircularProgress/>
                </Box>
                :
                <Button variant={"outlined"}component="label" disabled={uploadingFileToPublish}>
                  + Add more files
                  <input hidden accept="*/*" multiple type="file" onChange={(e) => fileSelectedAppend(e).then(() => {})} />
                </Button>
            }
          </Box>
          :
          ""
      }

      {/* Publish help dialog */}
      <Dialog open={showPublishHelpDialog} onClose={() => {setShowPublishHelpDialog(false)}}>
        <Typography variant={"h4"} sx={{pt: 3, pl: 3}}>
          Publish Files
        </Typography>
        <DialogContent>
          <Typography variant={"body1"}>
            If a file is published, it's content will be made <strong>publicly available on Arweave chain, forever.</strong> In this way anyone will be able to find out the file, without the need for you to provide it.
          </Typography>
          <Typography variant={"body1"} sx={{mt: 1}}>
            Due to the decentralized nature of tProof protocol, once the file is published on Arweave, a <strong>ChainLink node</strong> will take care of downloading the file and checking it matches the given hash.
          </Typography>
          <Typography variant={"body1"} sx={{mt: 1}}>
            While the simple hash publication costs {(proofs.data.price.mint).toFixed(2)} Ξ, the add of <strong>file publications</strong> brings the cost to {(proofs.data.price.mint + proofs.data.price.verification).toFixed(2)} Ξ.
          </Typography>
          <Typography variant={"body1"} sx={{mt: 1}}>
            Read more about it <a href ="https://docs.tproof.io" target={"_blank"}>on our Documentation</a>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setShowPublishHelpDialog(false)}}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export interface IFileListStep0 {

}

export default FileListStep0;
