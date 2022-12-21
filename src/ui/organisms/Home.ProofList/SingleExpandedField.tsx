import React, {useEffect, useState} from 'react';
import {Box, Tooltip, Typography} from "@mui/material";
import {Edit} from "@mui/icons-material";
import {useAppSelector} from "../../../hooks/redux/reduxHooks";
import ReactMarkdown from 'react-markdown';

/**
 *
 * @param {React.PropsWithChildren<ISingleExpandedField>} props
 * @return {JSX.Element}
 * @constructor
 */
const SingleExpandedField: React.FC<ISingleExpandedField> = (props) => {

  const [mouseHover, setMouseHover] = useState<boolean>(false);
  const [anotherTxInProgress, setAnotherTxInProgress] = useState<boolean>(false);


  const mintingTx = useAppSelector(state => state.proof.mintingTx);

  useEffect(() => {
    if (mintingTx !== "") setAnotherTxInProgress(true);
    else setAnotherTxInProgress(false);
  }, [mintingTx]);

  return (
    <Box display={"flex"} flexDirection="column" mt={2}>
      <Box display={"flex"} flexDirection={"row"} sx={{cursor: props.editable && !anotherTxInProgress ? "pointer" : ""}}
           onClick={() => {if (props.editable && !anotherTxInProgress) props.onEditRequest() }}
           onMouseEnter={() => {setMouseHover(true)}} onMouseLeave={() => {setMouseHover(false)}}>
        <Typography variant="body1" sx={{fontWeight: "bold"}}>
          {props.title}
        </Typography>
        {
          props.editable && mouseHover ?
            <Tooltip title={anotherTxInProgress ? "There's another transaction already pending" : ""}
                     placement={"top"} arrow followCursor>
              <Edit sx={{width: 12, pb: "3px", ml: 1}} color={anotherTxInProgress ? "disabled" : "primary"}/>
            </Tooltip>
            :
            ""
        }
      </Box>
      <Box sx={{ fontSize: 16, mt: "-5px"}}>
        {
          props.markdown && typeof props.value === "string" ?
            <Box sx={{pl: 2}}><i><ReactMarkdown children={props.value.trim()} /></i></Box>
            :
            props.value
        }
      </Box>
    </Box>
  );
};

export interface ISingleExpandedField {
  title: string,
  value: string | React.ReactNode,
  markdown?: boolean,  // if we want to render the inner text as markdown
  editable?: boolean,
  onEditRequest?: () => void
}

export default SingleExpandedField;

