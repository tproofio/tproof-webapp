import Web3 from "web3";
import {useProvider} from "wagmi";

/**
 * Stores the global web3 provider variable, that is generated once provider connects and its retrievable
 * with the useWeb3 hook.
 *
 * When provider is generated, load web3 with loadWeb3() function, then hook to web3 from anywhere using useWeb3()
 */

export let web3: Web3;

export const useWeb3 = () => {
  const provider = useProvider();
  return new Web3(provider as any);
}
