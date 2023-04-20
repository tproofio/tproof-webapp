import React, {useEffect} from 'react';
import {Box, Grid, Typography, useMediaQuery} from "@mui/material";
import {theme} from "../../../GlobalStyles";
import HomeProofList from "../../organisms/Home.ProofList/Home.ProofList";
import HomeNewProofWidget from "../../organisms/Home.NewProofWidget/Home.NewProofWidget";
import {useLoadProofs} from "../../../hooks/api/proofs/useLoadProofs";
import {useAccount, useNetwork} from "wagmi";
import {useProofs} from "../../../context/Proofs/ProofsProvider";
import {isSupportedChainId} from "../../../utils/Tools/Web3Management";
import {useLoadPrices} from "../../../hooks/contracts/tProofRouter/useLoadPrices";
import {useLoadPublicProofsUI} from "../../../hooks/ui/useLoadPublicProofsUI";

/**
 *
 * @param {React.PropsWithChildren<IDAppPublic>} props
 * @return {JSX.Element}
 * @constructor
 */
const DAppPublic: React.FC<IDAppPublic> = (props) => {
  const { chain } = useNetwork();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const loadProofs = useLoadPublicProofsUI();
  const proofs = useProofs();
  const account = useAccount();
  const loadPrices = useLoadPrices(chain?.id);

  useEffect(() => {
    if (account.address && account.isConnected && isSupportedChainId(chain?.id)) {
      loadProofs.loadProofs();
      // loadPrices.loadPrices();  -  TODO should we load here or in the main component (?) - I think here as in the ain component we don't know yet anything
    }
  }, [chain?.id]);

  return (
    <Grid container  sx={{mt: 3, mb: 5}} direction={isMobile ? "column-reverse" : "row"}>
      <Grid item md={1} sm={0}/>
      <Grid item md={5} sm={12} xs={12} display={"flex"} flexDirection={"column"} paddingX={isMobile ? 1 : 4} marginTop={isMobile ? 6 : 0}>
        <Typography variant="h3">Your Proofs</Typography>
        <Box width={"100%"} height={2} sx={{background: theme.palette.text.primary}}/>
        <HomeProofList/>
      </Grid>
      <Grid item md={5} sm={12} xs={12} display={"flex"} flexDirection={"column"} paddingX={isMobile ? 1 : 4}>
        <Typography variant="h3">Create a new Proof</Typography>
        <Box width={"100%"} height={2} sx={{background: theme.palette.text.primary}}/>
        <HomeNewProofWidget/>
      </Grid>
      <Grid item md={1} sm={0}/>
    </Grid>
  );
};

export interface IDAppPublic {

}

export default DAppPublic;
