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
import {useAppDispatch, useAppSelector} from "../../../hooks/redux/reduxHooks";
import {proofReducerActions} from "../../../store/reducers/proof";
import {useWeb3} from "../../../hooks/useWeb3";
import {CHAIN_DETAILS, CONTRACTS_DETAILS} from "../../../utils/constants";
import {useAccount, useNetwork} from "wagmi";

/**
 *
 * @param {React.PropsWithChildren<IEditTitleDescriptionDialog>} props
 * @return {JSX.Element}
 * @constructor
 */
const EditTitleDescriptionDialog: React.FC<IEditTitleDescriptionDialog> = (props) => {

  const dispatch = useAppDispatch();
  const web3 = useWeb3();

  const [newTitleTmp, setNewTitleTmp] = useState<string>("");
  const [nextChangeMintTxCloseModal, setNextChangeMintTxCloseModal] = useState<boolean>(false);

  const { address: connectedWalletAddress } = useAccount();
  const { chain } = useNetwork();
  const mintingTx = useAppSelector(state => state.proof.mintingTx);

  useEffect(() => {
    setNewTitleTmp("");
  }, []);

  // TODO Improve the logic of managing multiple txs in parallel - when listening to events that is solved
  // lsiten when mint tx is over and closes the modal
  useEffect(() => {
    if (mintingTx !== "")
      setNextChangeMintTxCloseModal(true);
    if (mintingTx === "" && nextChangeMintTxCloseModal)
      props.handleClose();
  }, [mintingTx]);

  const setNewTitle = () => {
    if (newTitleTmp.length > 0) {
      dispatch(proofReducerActions.editTile({
        web3: web3,
        address: connectedWalletAddress,
        newTitle: newTitleTmp,
        nftId: props.nftId,
        nftAddress: CONTRACTS_DETAILS[chain?.id].TPROOF_NFT_FACTORY_ADDRESS,
        nftAbi: CONTRACTS_DETAILS[chain?.id].TPROOF_NFT_FACTORY_ABI,
        chainId: chain?.id
      }));
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
