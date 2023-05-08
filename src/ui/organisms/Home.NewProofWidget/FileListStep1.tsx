import React, {useMemo, useState} from 'react';
import {Box, Grid, Tooltip, Typography} from "@mui/material";
import {Edit} from "@mui/icons-material";
import EditTitleDialog from "./EditTitleDialog";
import {useProofs} from "../../../context/Proofs/ProofsProvider";

/**
 *
 * @param {React.PropsWithChildren<IFileListStep1>} props
 * @return {JSX.Element}
 * @constructor
 */
const FileListStep1: React.FC<IFileListStep1> = (props) => {

  const [editToShow, setEditToShow] = useState<number | undefined>(undefined);
  const [showEditTitleDialog, setShowEditTitleDialog] = useState<number>(-1);

  const proofs = useProofs();

  const singleFileCost: number[] = useMemo(() => {

    return proofs.data.proofToBeMinted.map(p => p.toBeVerified ? (proofs.data.price.mint+proofs.data.price.verification) : proofs.data.price.mint)
  }, [proofs.data.proofToBeMinted]);

  const totalCost: number = useMemo(() => {
    return singleFileCost.reduce((a, b) => a+b);
  }, [singleFileCost]);

  /**
   * Sets the element which is hover, to show the edit button
   * @param {number} pos
   */
  const setHover = (pos: number) => {
    setEditToShow(pos)
  }

  /**
   * show/hide the modal to edit the title
   * @param {number} pos - the position of the element in the array to show
   */
  const toggleEditTitleDialog = (pos: number = -1) => {
    setShowEditTitleDialog(pos);
  }

  // TODO add the ETH to USD conversion below, reading the current USD price of ETH
  return (
    <Box width={"100%"}>
      <Grid container sx={{width: "100%"}}>
        <Grid item xs={9}>
          <Typography variant="h4">File</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="h4">Cost</Typography>
        </Grid>
      </Grid>
      {
        proofs.data.proofToBeMinted.map((p, pos) => {
          let hash = `0x${p.hash.substring(0,6)}...${p.hash.substring(p.hash.length-6, p.hash.length)}`;
          let fileName = p.fileName;
          if (fileName.length > 30) {
            fileName = fileName.substring(0, 11) + "..." + fileName.substring(fileName.length - 11, fileName.length);
          }
          return (
            <Grid container sx={{mt: 2}} key={p.id}>
              <Grid item xs={9}>
                <Box display="flex" flexDirection={"row"}>
                  <Box pl={0.5} width="100%">
                    <Tooltip title={"Edit Name"} placement={"top"} arrow followCursor>
                      <Box display={"flex"} flexDirection={"row"} sx={{cursor: "pointer"}}
                           onClick={() => {toggleEditTitleDialog(pos)}}
                           onMouseEnter={() => {setHover(pos)}} onMouseLeave={() => {setHover(undefined)}}>
                        <Typography variant="body1">{p.title.length > 0 ? p.title : hash}</Typography>
                          {
                            editToShow === pos ?
                              <Edit sx={{width: 12, pb: "3px", ml: 1}} color={"primary"}/>
                              :
                              ""
                          }
                      </Box>
                    </Tooltip>
                    <Typography variant="body2" color={"textSecondary"}><strong>File: </strong>{fileName}</Typography>
                    <EditTitleDialog open={showEditTitleDialog === pos} handleClose={toggleEditTitleDialog} fileName={p.fileName}
                                     position={pos} defaultTitle={hash} customTitle={p.title}/>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={3}>
                {singleFileCost[pos].toFixed(2)} Ξ
              </Grid>
            </Grid>
          )
        })
      }

      <Grid container sx={{width: "100%", borderTop: "1px solid black", mt: 4, pt: 3}}>
        <Grid item xs={9}>
          <Typography variant="h4">TOTAL</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="body1">{totalCost.toFixed(2)} Ξ</Typography>
          <Typography variant="body2"><strong>+ gas</strong></Typography>
        </Grid>
      </Grid>

    </Box>
  );
};

export interface IFileListStep1 {

}

export default FileListStep1;
