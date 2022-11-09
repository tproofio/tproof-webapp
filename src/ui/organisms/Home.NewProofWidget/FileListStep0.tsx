import React, {useState} from 'react';
import {useAppDispatch, useAppSelector} from '../../../hooks/reduxHooks';
import {
  Box,
  Button,
  Checkbox,
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
import {useFileListCache} from "../../../hooks/fileListHook";
import {Clear, InfoOutlined} from "@mui/icons-material";
import {MAX_FILE_SIZE_SUPPORTED_BYTES} from "../../../utils/constants";

/**
 *
 * @param {React.PropsWithChildren<IFileListStep0>} props
 * @return {JSX.Element}
 * @constructor
 */
const FileListStep0: React.FC<IFileListStep0> = (props) => {

  const dispatch = useAppDispatch();
  const fileListCache = useFileListCache();

  const [showPublishHelpDialog, setShowPublishHelpDialog, ] = useState<boolean>(false);

  const proofToBeMinted = useAppSelector(state => state.proof.proofToBeMinted);
  const proofsToBeMintedHasEvaluationPending = useAppSelector(state => state.proof.proofsToBeMintedHasEvaluationPending);
  const uploadingFileToPublish = useAppSelector(state => state.proof.uploadingFileToPublish);
  const price = useAppSelector(state => state.proof.price);
  const chainId = useAppSelector(state => state.userAccount.chainId);

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
    fileListCache.removeFileFromListCache(proofToBeMinted[pos].id);
    dispatch(proofReducerActions.removeProofToBeMinted(pos));
  }

  /**
   * Turns on/off the publishing of all the files
   */
  const turnOnOffAllFilePublish = () => {
    if (uploadingFileToPublish) return;
    // check if they're all on
    let allOn = true;
    for (let p of proofToBeMinted) {
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
          <Tooltip title={`Click to publish/unpublish all the files`} placement={"top"} arrow followCursor>
            <Typography variant="h4" sx={{cursor: "pointer"}} onClick={turnOnOffAllFilePublish}>
              Publish
            </Typography>
          </Tooltip>
          <InfoOutlined sx={{ml: 1, fontSize: 16, mb: "4px", cursor: "help"}} onClick={() => {setShowPublishHelpDialog(true)}}/>
        </Grid>
      </Grid>

      {
        proofToBeMinted.map((p, pos) => {
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
                <Tooltip title={p.size > MAX_FILE_SIZE_SUPPORTED_BYTES ? "Currently supporting only files up to 100MB. Need more space? Contact Us!" : ""}
                         placement={"top"} arrow followCursor>
                  <span>
                    <Checkbox checked={p.toBeVerified}
                              onChange={() => {toggleFilePublish(pos)}}
                              disabled={p.size > MAX_FILE_SIZE_SUPPORTED_BYTES || chainId !== 5}/>
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
          )
        })
      }

      {/* ADD MORE FILEs button*/}
      {
        proofToBeMinted.length > 0 || proofsToBeMintedHasEvaluationPending ?
          <Box mt={2}>
            {
              proofsToBeMintedHasEvaluationPending ?
                <Box width={"100%"} display={"flex"} justifyContent={"center"}>
                  <CircularProgress/>
                </Box>
                :
                <Button variant={"outlined"}component="label" disabled={uploadingFileToPublish}>
                  + Add more files
                  <input hidden accept="*/*" multiple type="file" onChange={fileSelectedAppend} />
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
            While the simple hash publication costs {(price.mint).toFixed(2)} Ξ, the add of <strong>file publications</strong> brings the cost to {(price.mint + price.verification).toFixed(2)} Ξ.
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
