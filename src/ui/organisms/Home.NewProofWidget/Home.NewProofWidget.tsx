import React from 'react';
import {Box, Button, Step, StepLabel, Stepper, Typography} from "@mui/material";
import {useAppDispatch, useAppSelector} from '../../../hooks/redux/reduxHooks';
import FileListStep0 from "./FileListStep0";
import NewProofCommands from "./NewProofCommands";
import FileListStep1 from "./FileListStep1";
import {useProofs} from "../../../context/Proofs/ProofsProvider";

/**
 *
 * @param {React.PropsWithChildren<IHomeNewProofWidget>} props
 * @return {JSX.Element}
 * @constructor
 */
const HomeNewProofWidget: React.FC<IHomeNewProofWidget> = (props) => {

  const dispatch = useAppDispatch();
  const proofs = useProofs();
  const mintingTx = useAppSelector(state => state.proof.mintingTx);

  const backToStep0 = () => {
    proofs.setNewProofActiveStep(0);
  }

  return (
    <Box display="flex" flexDirection={"column"}
         alignItems={"center"} justifyContent={"center"} width="100%" mt={3}>

      <Stepper activeStep={proofs.data.newProofActiveStep} alternativeLabel>
        <Step>
          <StepLabel>
            <Typography sx={{fontWeight: proofs.data.newProofActiveStep === 0 ? "bold" : undefined}} >
              Select file {proofs.data.proofToBeMinted.length>0 ? `(${proofs.data.proofToBeMinted.length})` : ""}
            </Typography>
          </StepLabel>
        </Step>
        <Step>
          <StepLabel>
            <Typography sx={{fontWeight: proofs.data.newProofActiveStep === 1 ? "bold" : undefined}}>
              Generate tProof
            </Typography>
          </StepLabel>
        </Step>
      </Stepper>

      <Box mt={3} width="80%">
        {
          proofs.data.proofToBeMinted.length > 0 ?
            proofs.data.newProofActiveStep === 0 ?
              <FileListStep0/>
              :
              <Box width="100%">
                <Button variant="outlined" size={"small"} sx={{mb: 2}}
                        disabled={mintingTx !== ""}
                        onClick={backToStep0}>
                  Back to files
                </Button>
                <FileListStep1/>
              </Box>
            :
            ""
        }

        {/* Buttons to manage commands in the generate proofs process */}
        <NewProofCommands/>
      </Box>

    </Box>
  );
};

export interface IHomeNewProofWidget {

}

export default HomeNewProofWidget;
