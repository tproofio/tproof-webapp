import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {Provider} from "react-redux";
import {store} from "./store";
import {CssBaseline, StyledEngineProvider, ThemeProvider} from "@mui/material";
import {theme} from "./GlobalStyles";
import {configureChains, createClient, goerli, WagmiConfig} from "wagmi";
import {hardhat, polygon} from "@wagmi/chains";
import {EthereumClient, w3mConnectors, w3mProvider} from "@web3modal/ethereum";
import {Web3Modal} from "@web3modal/react";

// ----------------
// WAGMI CLIENT
// ----------------
const chains = [polygon, goerli, hardhat];
const { provider } = configureChains(chains, [
  w3mProvider({ projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID as string }),
]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({
    projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID as string,
    version: 1,
    chains,
  }),
  provider,
});

// Web3Modal Ethereum Client
const ethereumClient = new EthereumClient(wagmiClient, chains);


const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <WagmiConfig client={wagmiClient}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </StyledEngineProvider>
      </WagmiConfig>
      <Web3Modal
        projectId={process.env.REACT_APP_WALLETCONNECT_PROJECT_ID as string}
        ethereumClient={ethereumClient}
        themeMode={"light"}
        termsOfServiceUrl={"https://tproof.io/privacy-policy"}
      />
    </Provider>
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
