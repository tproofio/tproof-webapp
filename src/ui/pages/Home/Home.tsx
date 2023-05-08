import {Box, Button, Grid, Typography, useMediaQuery} from '@mui/material';
import React, {useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import CommonHeader from "../../organisms/Common.Header/Common.Header";
import {theme} from "../../../GlobalStyles";
import {RouteKey} from "../../../App.Routes";
import {useAccount} from "wagmi";
import {useWeb3Modal} from "@web3modal/react";

/**
 *
 * @param {React.PropsWithChildren<IHome>} props
 * @return {JSX.Element}
 * @constructor
 */
const Home: React.FC<IHome> = (props) => {

  const navigate = useNavigate();
  const location = useLocation(); // Add this line to get the current location
  const queryParams = new URLSearchParams(location.search); // Create a URLSearchParams instance
  const redirectUrl = queryParams.get('redirect'); // Get the 'redirect' query parameter

  const { isOpen, open, close, setDefaultChain } = useWeb3Modal();
  const { address: connectedWalletAddress } = useAccount();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (connectedWalletAddress) {
      if (redirectUrl) {
        // If 'redirect' query parameter exists, navigate to that URL
        navigate(decodeURIComponent(redirectUrl));
      } else {
        // If 'redirect' query parameter doesn't exist, navigate to RouteKey.dApp
        navigate(RouteKey.dApp);
      }
    }
  }, [connectedWalletAddress]);

  return (
    <Box width={"100%"} minHeight={"100vh"}
         display={"flex"} flexDirection={"column"}>
      <CommonHeader/>
      <Grid container sx={{mt: 10, mb: 8}}>
        <Grid item xs={12}>
          <Typography variant="h2" sx={{textAlign: "center", fontWeight: "bold"}}>Choose where to start!</Typography>
        </Grid>
      </Grid>
      <Grid container sx={{mb: 5}} direction={isMobile ? "column" : "row"} alignItems={isMobile ? "center" : "start"}>

        {/* Blockchain native section*/}
        <Grid item xs={12} sm={6} display={"flex"} justifyContent={"end"} alignItems={"start"}
              sx={{pr: isMobile ? 0 : 8, pt: 10, pb: isMobile ? 0 : 20, borderRight: `${isMobile ? 0 : 1}px #B7B7B7 solid`}}>
          <Box maxWidth={500}
              display={"flex"} flexDirection={"column"}
              justifyContent={"center"} alignItems={"center"}
               sx={{pb: isMobile ? 10 : 0, borderBottom: `${isMobile ? 1 : 0}px #B7B7B7 solid`}}
          >
            <Typography variant="h3" sx={{textAlign: "center"}}>Blockchain Native</Typography>
            <Typography variant="body1" sx={{textAlign: "center", mt: 2, mb: 2}}>
              Connect your <strong>Web3 wallet</strong> and interact directly with smart contracts. No registration required.
            </Typography>
            <Button variant="contained" onClick={() => open()}>
              Connect wallet
            </Button>
          </Box>
        </Grid>

        {/* Cloud Platform section*/}
        <Grid item xs={12} sm={6} display={"flex"} justifyContent={"start"} alignItems={"start"}
              sx={{pl: isMobile ? 0 : 8, pt: 10}}>
          <Box maxWidth={500}
               display={"flex"} flexDirection={"column"}
               justifyContent={"center"} alignItems={"center"}>
            <Typography variant="h3" sx={{textAlign: "center"}}>Cloud Platform</Typography>
            <Typography variant="body1" sx={{textAlign: "center", mt: 2, mb: 2}}>
              Easiest way to manage certifications: pay with <strong>credit card</strong> and leave on us on chain transactions.<br/>
              {/*<a href={""}>Find out more!</a>*/}
            </Typography>
            <Typography variant="body1" sx={{textAlign: "center", mt: 2, mb: 1, maxWidth: 300}}>
              Platform current in <strong>Private Beta</strong>. Request a free Demo to get access!
            </Typography>
            <Button variant="contained" onClick={() => { window.open("https://calendly.com/tproof-demo/30min")}}>
              Request a Demo
            </Button>
          </Box>
        </Grid>

      </Grid>

    </Box>
  );
};

export interface IHome {

}

export default Home;
