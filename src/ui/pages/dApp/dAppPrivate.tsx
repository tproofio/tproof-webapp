import React from 'react';
import {Box, Grid, Typography, useMediaQuery} from "@mui/material";
import {theme} from "../../../GlobalStyles";
import HomeProofList from "../../organisms/Home.ProofList/Home.ProofList";
import HomeNewProofWidget from "../../organisms/Home.NewProofWidget/Home.NewProofWidget";

/**
 *
 * @param {React.PropsWithChildren<IDAppPrivate>} props
 * @return {JSX.Element}
 * @constructor
 */
const DAppPrivate: React.FC<IDAppPrivate> = (props) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

export interface IDAppPrivate {

}

export default DAppPrivate;
