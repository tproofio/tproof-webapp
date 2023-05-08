import React, {useEffect} from 'react';
import {Box} from "@mui/material";
import {isSupportedChainId} from "../../../utils/Tools/Web3Management";
import CommonHeader from "../../organisms/Common.Header/Common.Header";
import UnsupportedChainErrorMessage from "../Home/UnsupportedChainErrorMessage";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {RouteKey} from "../../../App.Routes";
import {useAccount, useNetwork} from "wagmi";
import ProofsProvider from "../../../context/Proofs/ProofsProvider";
import DAppPrivate from "./dAppPrivate";
import DAppPublic from "./dAppPublic";

/**
 *
 * @param {React.PropsWithChildren<IDApp>} props
 * @return {JSX.Element}
 * @constructor
 */
const DApp: React.FC<IDApp> = (props) => {

  const navigate = useNavigate();
  const { chain } = useNetwork();
  const { projectId } = useParams();

  const location = useLocation();
  const currentUrl = encodeURIComponent(location.pathname + location.search); // Encode current URL


  const { address: connectedWalletAddress } = useAccount();

  useEffect(() => {
    if (!connectedWalletAddress) {
      // wallet not connected, send back to homepage and include current URL in the query string
      navigate(`${RouteKey.Home}?redirect=${currentUrl}`);
    }
  }, [connectedWalletAddress]);

  return (
    <Box width={"100%"} minHeight={"100vh"}
         display={"flex"} flexDirection={"column"}>
      <ProofsProvider>
        <CommonHeader/>
        {
          !!projectId ?
            <DAppPrivate/>
            :
            <DAppPublic/>
        }
        {
          !isSupportedChainId(chain?.id) ?
            <UnsupportedChainErrorMessage/>
            :
            ""
        }
      </ProofsProvider>
    </Box>
  );
};

export interface IDApp {

}

export default DApp;
