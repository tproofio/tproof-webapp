import React, {useMemo} from 'react';
import {Box, Typography} from "@mui/material";
import {ProofVerificationStatus} from "../../../utils/ProjectTypes/Project.enum";

/**
 *
 * @param {React.PropsWithChildren<IVerificationStatusTag>} props
 * @return {JSX.Element}
 * @constructor
 */
const VerificationStatusTag: React.FC<IVerificationStatusTag> = (props) => {

  const color: string = useMemo(() => {
    if (props.verificationStatus === ProofVerificationStatus.Verified) return "#12B536";
    else if (props.verificationStatus === ProofVerificationStatus.NotVerified) return "#EAB463";
    else if (props.verificationStatus === ProofVerificationStatus.Pending) return "#6391EA";
    else if (props.verificationStatus === ProofVerificationStatus.Failed) return "#ff0000";
    else throw new Error(`Verification status received is unknown. Received ${props.verificationStatus}`);
  }, [props.verificationStatus]);

  const message: string = useMemo(() => {
    if (props.verificationStatus === ProofVerificationStatus.Verified) return "Public file";
    else if (props.verificationStatus === ProofVerificationStatus.NotVerified) return "Private file";
    else if (props.verificationStatus === ProofVerificationStatus.Pending) return "Public file pending";
    else if (props.verificationStatus === ProofVerificationStatus.Failed) return "Failed file verification";
    else throw new Error(`Verification status received is unknown. Received ${props.verificationStatus}`);
  }, [props.verificationStatus]);

  return (
    <Box sx={{backgroundColor: color, pr: 1, pl: 1, pt: 0.5, pb: 0.3, borderRadius: 4}}>
      <Typography color="#FFF" sx={{fontWeight: 'bold'}} variant="body2">{message}</Typography>
    </Box>
  );
};

export interface IVerificationStatusTag {
  verificationStatus: ProofVerificationStatus
}

export default VerificationStatusTag;
