import React from 'react';
import {Button, ButtonProps} from "@mui/material";
import {makeStyles} from '@mui/styles';

const useStyles = makeStyles({
  contained: {
    borderRadius: 12,
    textTransform: "capitalize"
  },
});

/**
 *
 * @param {React.PropsWithChildren<ButtonProps>} props
 * @return {JSX.Element}
 * @constructor
 */
const ContainedButton: React.FC<ButtonProps> = (props) => {
  const classes = useStyles();
  return (
    <Button variant={"contained"}
            classes={{
              contained: classes.contained
            }}
            color={"primary"}
            disableElevation
            {...props}
    >
      {props.children}
    </Button>
  );
};


export default ContainedButton;
