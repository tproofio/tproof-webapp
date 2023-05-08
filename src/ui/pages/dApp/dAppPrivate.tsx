import React, {useEffect} from 'react';
import {Box, Grid, Typography, useMediaQuery} from "@mui/material";
import {theme} from "../../../GlobalStyles";
import HomeProofList from "../../organisms/Home.ProofList/Home.ProofList";
import HomeNewProofWidget from "../../organisms/Home.NewProofWidget/Home.NewProofWidget";
import {useAccount, useNetwork} from "wagmi";
import {useProofs} from "../../../context/Proofs/ProofsProvider";
import {isSupportedChainId} from "../../../utils/Tools/Web3Management";
import {useParams} from "react-router-dom";
import {useLoadAddressFromProjectId} from "../../../hooks/contracts/tProofRouter/useLoadAddressFromProjectId";
import {ethers} from "ethers";
import {useLoadPrivateProofsUI} from "../../../hooks/ui/useLoadPrivateProofsUI";
import {address} from "../../../utils/ProjectTypes/Project.types";

/**
 *
 * @param {React.PropsWithChildren<IDAppPrivate>} props
 * @return {JSX.Element}
 * @constructor
 */
const DAppPrivate: React.FC<IDAppPrivate> = (props) => {
  const { chain } = useNetwork();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const proofs = useProofs();
  const account = useAccount();
  const { projectId } = useParams();
  const loadAddressFromProjectId = useLoadAddressFromProjectId(chain?.id, projectId);
  const loadProofs = useLoadPrivateProofsUI(loadAddressFromProjectId.result);

  console.log(proofs.data);
  console.log(loadAddressFromProjectId.completed);

  useEffect(() => {
    proofs.setMintPrices({
      mint: 0,
      verification: 0
    })
  }, []);

  useEffect(() => {
    if (account.address && account.isConnected && isSupportedChainId(chain?.id) && loadAddressFromProjectId.completed) {
      if (!proofs.data.privateCollectionAddress)
        proofs.setPrivateCollectionAddress(loadAddressFromProjectId.result as address);
      else loadProofs.loadMore();
    }
  }, [chain?.id, loadAddressFromProjectId.completed, loadAddressFromProjectId.result, proofs.data.privateCollectionAddress]);


  return (
    <Grid container  sx={{mt: 3, mb: 5}} direction={isMobile ? "column-reverse" : "row"}>
      {
        loadAddressFromProjectId.completed && loadAddressFromProjectId.result === ethers.constants.AddressZero ?
          <>
            <Grid item md={1} sm={0}/>
            <Grid item md={10} sm={12} xs={12}
                  display={"flex"} flexDirection={"column"}
                  paddingX={isMobile ? 1 : 4}
                  marginTop={6} textAlign={"center"}>
              <Typography variant="h3">Invalid ProjectD</Typography>
              <Typography variant="body1" mt={2}>The ProjectD <strong>{projectId}</strong> is not a valid project ID registered</Typography>
            </Grid>
          </>
          :
          <>
            <Grid item xs={12} display={"flex"} flexDirection={"column"} alignItems={"center"} mb={3}>
              <Typography variant="h2">Private Collection <strong>{projectId}</strong></Typography>
              <Typography variant="body1">Remaining certifications: <strong>{proofs.data.prepaidMint}</strong></Typography>
            </Grid>
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
          </>
      }
      <Grid item md={1} sm={0}/>
    </Grid>
  );
};

export interface IDAppPrivate {

}

export default DAppPrivate;
