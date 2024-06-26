import React from 'react';
import {Box, Chip, Typography, useMediaQuery} from "@mui/material";
import {Biotech} from "@mui/icons-material";
import {theme} from "../../../GlobalStyles";
import {useNetwork} from "wagmi";

/**
 *
 * @param {React.PropsWithChildren<ICommonHeader>} props
 * @return {JSX.Element}
 * @constructor
 */
const CommonHeader: React.FC<ICommonHeader> = (props) => {

  const { chain } = useNetwork();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const goToUrl = (_url: string) => {
    window.open(_url, "_blank");
  }

  return (
    <React.Fragment>
      <Box width={"100%"} height={90} display={"flex"} flexDirection={"row"}
           alignItems={"center"} justifyContent={"center"}>
        <Typography sx={{mr: isMobile ? 1 : 3, fontSize: isMobile ? 16 : 18, cursor: "pointer"}}
                    onClick={() => {goToUrl("https://docs.tproof.io")}}>
          How it works?
        </Typography>
        <img src={"/img/full_logo.png"} style={{maxHeight: isMobile ? 50 : 60, cursor: "pointer"}}
             onClick={() => {goToUrl("https://tproof.io")}}/>
        <Typography sx={{ml: isMobile ? 1 : 3, fontSize: isMobile ? 16 : 18, cursor: "pointer"}}
                    onClick={() => {goToUrl("https://twitter.com/tproofio")}}>
                    Contact Us
        </Typography>
      </Box>
      {
        chain?.id === 5 ?
          <Box width={"100%"} display={"flex"} alignItems={"center"} justifyContent={"center"}>
            <Chip icon={<Biotech />} color={"secondary"} label="Currently connected on Goerlii Testnet" />
          </Box>
          :
          ""
      }
      {
        chain?.id === 80001 ?
          <Box width={"100%"} display={"flex"} alignItems={"center"} justifyContent={"center"}>
            <Chip icon={<Biotech />} color={"secondary"} label="Currently connected on Mumbai Testnet" />
          </Box>
          :
          ""
      }
    </React.Fragment>
  );
};

export interface ICommonHeader {

}

export default CommonHeader;
