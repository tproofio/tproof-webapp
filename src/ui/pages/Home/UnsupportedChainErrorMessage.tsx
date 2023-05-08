import React from 'react';
import {Box, Paper} from "@mui/material";

/**
 *
 * @param {React.PropsWithChildren<IUnsupportedChainErrorMessage>} props
 * @return {JSX.Element}
 * @constructor
 */
const UnsupportedChainErrorMessage: React.FC<IUnsupportedChainErrorMessage> = (props) => {
  return (
    <Box position="absolute" width="100vw" height="100vh"
         display={"flex"} justifyContent={"center"} alignItems={"center"}
         sx={{backgroundColor: "rgba(255, 255, 255, 0.61)", backdropFilter: "blur(5px)"}}>
      <Paper sx={{p: 3, textAlign: "center"}}>
        You're connected to an unsupported chain!<br/><br/>
        Please connect to <strong>Polygon</strong> (chain ID 137)<br/><br/>
        If you need to test the solution, use <strong>Mumbai Testnet</strong> (chain ID 80001) or <strong>Goerli Testnet</strong> (chain ID 5)<br/>
        Make sure to follow us on <a href={"https://twitter.com/tproofio"} target={"_blank"}>Twitter</a>!
      </Paper>
    </Box>
  );
};

export interface IUnsupportedChainErrorMessage {

}

export default UnsupportedChainErrorMessage;
