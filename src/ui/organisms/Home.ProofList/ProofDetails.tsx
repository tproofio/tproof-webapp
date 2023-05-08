import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import React, {useState} from 'react';
import {ExpandMore, ImageSearch, PrecisionManufacturing} from "@mui/icons-material";
import {Proof} from "../../../utils/ProjectTypes/Project.types";
import VerificationStatusTag from "./VerificationStatusTag";
import {format} from 'date-fns';
import SingleExpandedField from "./SingleExpandedField";
import * as ellipsize from "ellipsize";
import {ProofVerificationStatus} from "../../../utils/ProjectTypes/Project.enum";
import EditTitleDescriptionDialog from "./EditTitleDescriptionDialog";
import {theme} from "../../../GlobalStyles";
import {CHAIN_DETAILS, CONTRACTS_DETAILS} from "../../../utils/constants";
import {useNetwork} from "wagmi";
import {useProofs} from "../../../context/Proofs/ProofsProvider";

/**
 *
 * @param {React.PropsWithChildren<IProofDetails>} props
 * @return {JSX.Element}
 * @constructor
 */
const ProofDetails: React.FC<IProofDetails> = (props) => {

  const proofs = useProofs();
  const [expanded, setExpanded] = useState<boolean>(false);
  const [openEditTitleDialog, setOpenEditTitleDialog] = useState<boolean>(false);

  const { chain } = useNetwork();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChange = () => {
    setExpanded(!expanded);
  }

  const goToEtherscan = () => {
    let collecttionAddress = proofs.data.privateCollectionAddress ? proofs.data.privateCollectionAddress : CONTRACTS_DETAILS[chain?.id].TPROOF_NFT_FACTORY_ADDRESS;
    window.open(`${CHAIN_DETAILS[chain?.id].EXPLORER_URL}/token/${collecttionAddress}?a=${props.proof.id}`, "_blank");
  }

  const goToOpenSea = () => {
    let testnetOs = CHAIN_DETAILS[chain?.id].IS_TESTNET ? "testnets." : "";
    let openseaChainNAme = CHAIN_DETAILS[chain?.id].OPENSEA_CHAIN_NAME;
    let collecttionAddress = proofs.data.privateCollectionAddress ? proofs.data.privateCollectionAddress : CONTRACTS_DETAILS[chain?.id].TPROOF_NFT_FACTORY_ADDRESS;
    window.open(`https://${testnetOs}opensea.io/assets/${openseaChainNAme}/${collecttionAddress}/${props.proof.id}`, "_blank");
  }

  return (
    <Box>
      <Accordion expanded={expanded} onChange={handleChange}
                 sx={{boxShadow: "0px 0px"}} square >
        <AccordionSummary
          expandIcon={<ExpandMore />}
        >
          <Typography sx={{ fontWeight: 'bold', fontSize: 26}}>
            {props.proof.nftNum}.
          </Typography>
          <Box display={"flex"} flexDirection={"column"} pl={2}>
            <Typography variant="h4">{props.proof.title}</Typography>
            <Typography variant="subtitle1" color={"textSecondary"}>
              Created {format(new Date(props.proof.createdAt * 1000), "d LLL yyyy @ hh:mm aaa")}
            </Typography>
            <Box display={"flex"}>
              <VerificationStatusTag verificationStatus={props.proof.verificationStatus}/>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{pb: 3, display: "flex", flexDirection: "row", mt: -1}}>
          <Typography sx={{ fontWeight: 'bold', fontSize: 26, color: "#FFF"}}>
            {props.proof.nftNum}.
          </Typography>
          <Box display={"flex"} flexDirection={"column"} pl={2}>

            {/* TITLE*/}
            <SingleExpandedField title={"Name"} value={props.proof.title} editable={true} onEditRequest={() => {setOpenEditTitleDialog(true)}}/>
            <EditTitleDescriptionDialog open={openEditTitleDialog} defaultTitle={props.proof.title}
                                        nftId={props.proof.id} handleClose={() => {setOpenEditTitleDialog(false)}}/>

            {/* DESCRIPTION */}
            {/* // TODO re-enable making sure that the hash and the content does not go in the "Create a new Proof" Column. Maybe Create a new proof column should become already a modal*/}
            {/*<SingleExpandedField title={"Description"} value={props.proof.description} markdown={true}/>*/}

            {/* PUBLIC FILE URL */}
            {
              props.proof.verificationStatus !== ProofVerificationStatus.NotVerified ?
                <SingleExpandedField title={"Public File Url"}
                                     value={props.proof.fileUrl ?
                                       <a href={props.proof.fileUrl} target={"_blank"}>{ellipsize(props.proof.fileUrl, 32)}</a>
                                       : "-"}/>
                :
                ""
            }

            {/* // TODO re-enable once MIMETypes are correctly sent */}
            {/*<SingleExpandedField title={"MIME Type"} value={props.proof.MIMEType}/>*/}

            {/* Icon for more actions */}
            <Box ml={"-5px"} mt={1} display={"flex"}>
              <Tooltip title={"View on OpenSea"} placement={"top"} arrow followCursor>
                <IconButton edge={"start"} color="primary" size={"small"} disableRipple onClick={goToOpenSea}>
                  <ImageSearch/>
                </IconButton>
              </Tooltip>
              <Tooltip title={"View on Etherscan"} placement={"top"} arrow followCursor>
                <IconButton color="primary" size={"small"} disableRipple onClick={goToEtherscan}>
                  <PrecisionManufacturing/>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export interface IProofDetails {
  proof: Proof
}

export default ProofDetails;
