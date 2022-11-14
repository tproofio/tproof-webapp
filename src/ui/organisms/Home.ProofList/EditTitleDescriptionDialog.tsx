import React, {useEffect, useState} from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  InputAdornment,
  TextField,
  Typography
} from "@mui/material";
import {theme} from "../../../GlobalStyles";
import {CHAIN_DETAILS} from "../../../utils/constants";
import {useNetwork} from "wagmi";
import {useEditProofTitle} from "../../../hooks/contracts/tProofRouter/useEditProofTitle";
import {useLoadProofsUI} from "../../../hooks/ui/useLoadProofsUI";

/**
 *
 * @param {React.PropsWithChildren<IEditTitleDescriptionDialog>} props
 * @return {JSX.Element}
 * @constructor
 */
const EditTitleDescriptionDialog: React.FC<IEditTitleDescriptionDialog> = (props) => {

  const [newTitleTmp, setNewTitleTmp] = useState<string>("");
  const { chain } = useNetwork();
  const editTitle = useEditProofTitle();
  const loadProofs = useLoadProofsUI();

  const mintingTx = editTitle.txHash;

  useEffect(() => {
    setNewTitleTmp("");
  }, []);

  // listen when mint tx is over and closes the modal
  useEffect(() => {
    if (editTitle.completed) {
      props.handleClose();
      loadProofs.loadProofs();
    }
  }, [editTitle.completed]);

  const setNewTitle = () => {
    if (newTitleTmp.length > 0) {
      editTitle.editProofTitle({
        nftId: props.nftId,
        newTitle: newTitleTmp
      })
    }
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
    >
      <Typography variant={"h4"} sx={{pt: 3, pl: 3}}>
        Edit Name
      </Typography>
      {
        mintingTx === "" ?
          <DialogContent>
            <Typography variant={"body1"} sx={{mt: 1}}>You can always edit the name of an NFT you own.</Typography>
            <Box mt={2} mb={2} display="flex" alignItems={"center"} justifyContent={"center"} flexDirection={"column"}>
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
            </Box>
            <Typography variant={"body2"} sx={{mt: 1}}><strong>Tip</strong>: You pay a fixed gas cost every 32 chars, so try to stay below 32 to save gas! ;)</Typography>
          </DialogContent>
          :
          <DialogContent sx={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <CircularProgress/>
            <Typography variant={"body1"} sx={{mt: 1}}>
              Follow your transaction on <a href={`${CHAIN_DETAILS[chain?.id].EXPLORER_URL}/tx/${mintingTx}`} target={"_blank"}>Etherscan</a>
            </Typography>
          </DialogContent>
      }

      <DialogActions>
        <Button onClick={props.handleClose}>Close</Button>
        <Button onClick={setNewTitle} autoFocus disabled={mintingTx !== ""}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export interface IEditTitleDescriptionDialog {
  nftId: string,
  defaultTitle: string,
  open: boolean,
  handleClose: ()=>void
}

export default EditTitleDescriptionDialog;
