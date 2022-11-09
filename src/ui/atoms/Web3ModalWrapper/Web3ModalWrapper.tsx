import React, {useEffect, useState} from 'react';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import {useAppDispatch, useAppSelector} from "../../../hooks/reduxHooks";
import {userAccountReducerActions} from "../../../store/reducers/userAccount";
import {loadWeb3, useWeb3} from "../../../hooks/useWeb3";

/**
 * This component gets any onClick event on children components and shows the modal to connect to a provider
 *
 * @param {React.PropsWithChildren<IWeb3ModalWrapper>} props
 * @return {JSX.Element}
 * @constructor
 */
const Web3ModalWrapper: React.FC<IWeb3ModalWrapper> = (props) => {

  const dispatch = useAppDispatch();
  const userAccount = useAppSelector( state => state.userAccount.connectedWalletAddress);

  const [web3Modal, setWeb3Modal] = useState<Web3Modal | undefined>(undefined);

  useEffect(() => {
    if (userAccount === "" && web3Modal) {
      web3Modal.clearCachedProvider();
    }
  }, [userAccount, web3Modal])

  const connect = () => {
    const web3Modal = new Web3Modal({
      cacheProvider: false,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            rpc: {
              1: "https://mainnet.infura.io/v3/",
              5: "https://goerli.infura.io/v3/3c08ee8e567a4e5fa74480e5f80dd4ce"
            }
          }
        }
      }
    });
    setWeb3Modal(web3Modal);
    web3Modal.clearCachedProvider();
    web3Modal.connect().then(_onConnectionCompleted);
  }

  const _onConnectionCompleted = (provider: any) => {
    provider.on("accountsChanged", (accounts: string[]) => {
      dispatch(userAccountReducerActions.setConnectedAccount(accounts[0]));
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId: string) => {
      dispatch(userAccountReducerActions.setChainId(Number(chainId)));
      console.log("chainChanged", chainId);
    });

    // Subscribe to provider connection
    provider.on("connect", (info: { chainId: string }) => {
      console.log("provider connection connected", info);
      dispatch(userAccountReducerActions.setChainId(Number(info.chainId)));
      console.log("connect", info.chainId);
    });

    // Subscribe to provider disconnection
    provider.on("disconnect", (error: { code: number; message: string }) => {
      dispatch(userAccountReducerActions.setConnectedAccount(""));
    });

    // register the connected account
    loadWeb3(provider);
    const web3 = useWeb3();
    web3.eth.getAccounts().then(accounts => {
      dispatch(userAccountReducerActions.setConnectedAccount(accounts[0]))
    } );
    web3.eth.getChainId().then((chainId: number) => {
      dispatch(userAccountReducerActions.setChainId(chainId));
    })
  }

  return (
    <div onClick={props.disabled ? ()=>{} : connect}>
      {props.children}
    </div>
  );
};


export interface IWeb3ModalWrapper {
  disabled?: boolean,
  children?: React.ReactNode
}

export default Web3ModalWrapper;


