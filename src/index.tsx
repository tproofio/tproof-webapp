import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {Provider} from "react-redux";
import {store} from "./store";
import {CssBaseline, StyledEngineProvider, ThemeProvider} from "@mui/material";
import {theme} from "./GlobalStyles";
import {chain, createClient, WagmiConfig} from "wagmi";
import {ConnectKitProvider, getDefaultClient} from "connectkit";


const chains = [chain.goerli, chain.polygon, chain.hardhat];
const client = createClient(
  getDefaultClient({
    appName: "tProof",
    autoConnect: false,
    chains
  }),
);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  // <React.StrictMode>
    <Provider store={store}>
      <WagmiConfig client={client}>
        <ConnectKitProvider>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <App />
            </ThemeProvider>
          </StyledEngineProvider>
        </ConnectKitProvider>
      </WagmiConfig>
    </Provider>
  // </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
