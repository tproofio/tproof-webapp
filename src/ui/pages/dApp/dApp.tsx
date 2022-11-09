import React, {useEffect} from 'react';
import {useAppDispatch} from "../../../hooks/redux/reduxHooks";
import {useWeb3} from "../../../hooks/useWeb3";
import {Box, Grid, Typography, useMediaQuery} from "@mui/material";
import {theme} from "../../../GlobalStyles";
import {isSupportedChainId} from "../../../utils/Tools/Web3Management";
import {proofReducerActions} from "../../../store/reducers/proof";
import CommonHeader from "../../organisms/Common.Header/Common.Header";
import HomeProofList from "../../organisms/Home.ProofList/Home.ProofList";
import HomeNewProofWidget from "../../organisms/Home.NewProofWidget/Home.NewProofWidget";
import UnsupportedChainErrorMessage from "../Home/UnsupportedChainErrorMessage";
import {useNavigate} from "react-router-dom";
import {RouteKey} from "../../../App.Routes";
import {CONTRACTS_DETAILS} from "../../../utils/constants";
import {useAccount, useNetwork} from "wagmi";

/**
 *
 * @param {React.PropsWithChildren<IDApp>} props
 * @return {JSX.Element}
 * @constructor
 */
const DApp: React.FC<IDApp> = (props) => {

  const dispatch = useAppDispatch();
  const web3 = useWeb3();
  const navigate = useNavigate();

  const { address: connectedWalletAddress } = useAccount();
  const { chain } = useNetwork();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (connectedWalletAddress && isSupportedChainId(chain?.id)) {

      // TODO implement event listener subscription to avoid reload all proof, but just the newly minted proof, or listen to status changes
      dispatch(proofReducerActions.loadProofs({
        address: connectedWalletAddress,
        network: chain?.id
      }));

      dispatch(proofReducerActions.loadPrices({
        web3: web3,
        routerAbi: CONTRACTS_DETAILS[chain?.id].TPROOF_ROUTER_ABI,
        routerAddress: CONTRACTS_DETAILS[chain?.id].TPROOF_ROUTER_ADDRESS
      }))

    } else if (!connectedWalletAddress) {
      // wallet not connected, send back to homepage
      navigate(RouteKey.Home);
    }
  }, [connectedWalletAddress, chain?.id]);

  return (
    <Box width={"100%"} minHeight={"100vh"}
         display={"flex"} flexDirection={"column"}>
      <CommonHeader/>
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
      {
        !isSupportedChainId(chain?.id) ?
          <UnsupportedChainErrorMessage/>
          :
          ""
      }
    </Box>
  );
};

export interface IDApp {

}

export default DApp;
