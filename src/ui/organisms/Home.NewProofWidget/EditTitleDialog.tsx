import React, {useEffect, useState} from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import {theme} from "../../../GlobalStyles";
import {CopyAll} from "@mui/icons-material";
import {useProofs} from "../../../context/Proofs/ProofsProvider";

/**
 *
 * @param {React.PropsWithChildren<IEditTitleDialog>} props
 * @return {JSX.Element}
 * @constructor
 */
const EditTitleDialog: React.FC<IEditTitleDialog> = (props) => {

  const [newTitleTmp, setNewTitleTmp] = useState<string>("");
  const proofs = useProofs();

  /**
   * When opens, set the title as the custom one (if empty, is sets to empty as we want).
   * This is necessary in case user opens / close the modal.
   */
  useEffect(() => {
    setNewTitleTmp(props.customTitle);
  }, []);

  const setNewTitle = () => {
    if (newTitleTmp.length > 0) {
      const proofsToBeMinted = proofs.data.proofToBeMinted;
      proofsToBeMinted[props.position].title = newTitleTmp;
      proofs.setProofToBeMinted(JSON.parse(JSON.stringify(proofsToBeMinted)));
    }
    props.handleClose();
  }

  /**
   * Sets the file name as the current name for the file
   */
  const setFileName = () => {
    setNewTitleTmp(props.fileName);
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
    >
      <Typography variant={"h4"} sx={{pt: 3, pl: 3}}>
        Edit Name
      </Typography>
      <DialogContent>
        <Typography variant={"body1"}>It's the public name of your Proof and is set by default as a portion of file hash. We do that as it doesn't consume additional gas.</Typography>
        <Typography variant={"body1"} sx={{mt: 1}}><strong>You can edit it</strong>, giving a meaningful name for you to remember! Just remember, this costs more gas.</Typography>
        <Box mt={2} mb={2} display="flex" flexDirection={"column"}>
          <Box width="100%" display={"flex"} alignItems={"center"} justifyContent={"center"}>
            <TextField placeholder={props.defaultTitle}
                       fullWidth
                       InputProps={{
                         endAdornment: <InputAdornment position={"end"} sx={{color: newTitleTmp.length > 32 ? theme.palette.warning.main : undefined}}>
                           {newTitleTmp.length}
                         </InputAdornment>
                       }}
                       value={newTitleTmp}
                       onChange={e => setNewTitleTmp(e.target.value)}
                       sx={{width: "80%"}}
                       variant="standard" />
            <IconButton color="primary" sx={{ml: 1}} onClick={setFileName}>
              <Tooltip title={"Use File Name"}>
                <CopyAll/>
              </Tooltip>
            </IconButton>
          </Box>
          {
            newTitleTmp.length >= 64 ?
              <Typography sx={{mt: 1, fontWeight: "bold"}}>You love long names 😎</Typography>
              :
              ""
          }
        </Box>
        <Typography variant={"body2"} sx={{mt: 1}}><strong>Tip</strong>: first 32 chars adds extra 50k gas units (no matter the amount of chars you use). After, you pay 22k extra gas every 32 chars. To help you, we've placed a counter. Try to stay below 32! ;)</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose}>Close</Button>
        <Button onClick={setNewTitle} autoFocus>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export interface IEditTitleDialog {
  position: number,  // position of the element in the list of ProofsToMint
  defaultTitle: string,
  customTitle: string,  // if a custom title has been set for this component
  fileName: string,
  open: boolean,
  handleClose: ()=>void
}

export default EditTitleDialog;
