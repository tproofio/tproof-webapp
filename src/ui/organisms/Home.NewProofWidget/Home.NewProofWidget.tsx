import React from 'react';
import {Box, Button, Step, StepLabel, Stepper, Typography} from "@mui/material";
import {useAppDispatch, useAppSelector} from '../../../hooks/reduxHooks';
import FileListStep0 from "./FileListStep0";
import NewProofCommands from "./NewProofCommands";
import FileListStep1 from "./FileListStep1";
import {proofReducerActions} from "../../../store/reducers/proof";

/**
 *
 * @param {React.PropsWithChildren<IHomeNewProofWidget>} props
 * @return {JSX.Element}
 * @constructor
 */
const HomeNewProofWidget: React.FC<IHomeNewProofWidget> = (props) => {

  const dispatch = useAppDispatch()
  const proofToBeMinted = useAppSelector(state => state.proof.proofToBeMinted);
  const activeStepNum = useAppSelector(state => state.proof.newProofActiveStep);
  const mintingTx = useAppSelector(state => state.proof.mintingTx);

  const backToStep0 = () => {
    dispatch(proofReducerActions.setNewProofActiveStep(0));
  }

  return (
    <Box display="flex" flexDirection={"column"}
         alignItems={"center"} justifyContent={"center"} width="100%" mt={3}>

      <Stepper activeStep={activeStepNum} alternativeLabel>
        <Step>
          <StepLabel>
            <Typography sx={{fontWeight: activeStepNum === 0 ? "bold" : undefined}} >
              Select file {proofToBeMinted.length>0 ? `(${proofToBeMinted.length})` : ""}
            </Typography>
          </StepLabel>
        </Step>
        <Step>
          <StepLabel>
            <Typography sx={{fontWeight: activeStepNum === 1 ? "bold" : undefined}}>
              Generate tProof
            </Typography>
          </StepLabel>
        </Step>
      </Stepper>

      <Box mt={3} width="80%">
        {
          proofToBeMinted.length > 0 ?
            activeStepNum === 0 ?
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

        <NewProofCommands/>
      </Box>

    </Box>
  );
};

export interface IHomeNewProofWidget {

}

export default HomeNewProofWidget;
