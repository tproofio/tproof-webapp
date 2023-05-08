import React from 'react';
import {Box, CircularProgress, Typography} from "@mui/material";
import ProofDetails from "./ProofDetails";
import {useProofs} from "../../../context/Proofs/ProofsProvider";

/**
 *
 * @param {React.PropsWithChildren<IHomeProofList>} props
 * @return {JSX.Element}
 * @constructor
 */
const HomeProofList: React.FC<IHomeProofList> = (props) => {

  const proofs = useProofs();

  return (
    <Box>
      {
        proofs.data.mintedProofsLoading ?
          <Box mt={7} display={"flex"} alignItems={"center"} justifyContent={"center"}>
            <CircularProgress/>
          </Box>
          :
          proofs.data.mintedProofs.length === 0 ?
            // There are no proof int the wallet
            <Box mt={7} display={"flex"} alignItems={"center"} justifyContent={"center"}>
              <Typography maxWidth={250} variant="h4" sx={{textAlign: "center"}}>
                Looks like you don’t have a certification yet!<br/><br/>
                Create one with by clicking on "Select File" red button :)
              </Typography>
            </Box>
            :
            // List all the minted proofs
            <Box mt={2}>
              {
                proofs.data.mintedProofs.map((proof) =>
                  <Box key={proof.id}>
                    <ProofDetails proof={proof}/>
                  </Box>
                )
              }
            </Box>
      }
    </Box>
  );
};

export interface IHomeProofList {

}

export default HomeProofList;
