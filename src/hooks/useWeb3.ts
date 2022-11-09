import Web3 from "web3";

/**
 * Stores the global web3 provider variable, that is generated once provider connects and its retrievable
 * with the useWeb3 hook.
 *
 * When provider is generated, load web3 with loadWeb3() function, then hook to web3 from anywhere using useWeb3()
 */

export let web3: Web3;
export let provider: any;

export const loadWeb3 = (intProvider:any) => {
  provider = intProvider;
  web3 = new Web3(intProvider);
}

export const closeProvider = () => {
  if (provider.disconnect) {
    provider.disconnect();
  }
  provider = null;
}

export const useWeb3 = () => {
  return web3;
}
