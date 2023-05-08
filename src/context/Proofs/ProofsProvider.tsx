import React, {createContext, useContext, useState} from "react";
import {address, Prices, Proof, ProofToMint} from "../../utils/ProjectTypes/Project.types";

/**
 * Data stored in this Provider
 *
 * @param {Proof[]} mintedProofs - list of the proofs already minted
 * @param {ProofToMint[]} proofToBeMinted - list of file user would like to mint as tProofs
 * @param {boolean} proofsToBeMintedHasEvaluationPending - true if the hash evaluation is in progress, false once is done
 * @param {boolean} mintedProofsLoading - true when a loading of minted proofs is pending
 * @param {number} newProofActiveStep - 0 if we're in the file selection/upload part. 1 if we're in the mint list reminted
 * @param {string} mintingTx - tx of the mint. Empty if mint completed
 * @param {Prices} price - prices of the operations, read from the chain. Price are in wei
 * @param {boolean} uploadingFileToPublish - true if the upload is in progress, false otherwise
 * @param {number | undefined} prepaidMint - number of prepaid mint (in case of private projects)
 * @param {number | undefined} totalSupply - number of NFTs minted in total (used only in case of private projects)
 * @param {address | undefined} privateCollectionAddress - address of the private collection (used only in case of private projects)
 */
export interface ProofsContextData {
  mintedProofs: Proof[];
  proofToBeMinted: ProofToMint[],
  proofsToBeMintedHasEvaluationPending: boolean,
  mintedProofsLoading: boolean,
  newProofActiveStep: number,
  mintingTx: string,
  price: Prices | undefined,
  uploadingFileToPublish: boolean,
  prepaidMint: number | undefined,
  totalSupply: number | undefined,
  privateCollectionAddress: address | undefined
}

/**
 * Interface to represent the Context global object for Proofs. `isModerator` and `isOwner` values are
 * updated inside this component, ignoring any external edits
 *
 * @param data {ProofsContextData} - The data stored in the ProofsContext
 * @param setProofsContextData {React.Dispatch<React.SetStateAction<ProofsContextData>> | undefined} - Function to update the ProofsContextData
 */
export interface ProofsProvider {
  data: ProofsContextData;
  setMintedProofs: React.Dispatch<React.SetStateAction<Proof[]>> | undefined;
  setMintedProofsLoading: React.Dispatch<React.SetStateAction<boolean>> | undefined;
  setProofToBeMinted: React.Dispatch<React.SetStateAction<ProofToMint[]>> | undefined;
  setProofsToBeMintedHasEvaluationPending: React.Dispatch<React.SetStateAction<boolean>> | undefined;
  setMintPrices: React.Dispatch<React.SetStateAction<Prices>> | undefined;
  setMintingTx: React.Dispatch<React.SetStateAction<string>> | undefined;
  setNewProofActiveStep: React.Dispatch<React.SetStateAction<number>> | undefined;
  setPrepaidMint: React.Dispatch<React.SetStateAction<number>> | undefined;
  setTotalSupply: React.Dispatch<React.SetStateAction<number>> | undefined;
  setPrivateCollectionAddress: React.Dispatch<React.SetStateAction<address>> | undefined;
  setProofsContextData: React.Dispatch<React.SetStateAction<ProofsContextData>> | undefined;
}

export const ProofsContext =
  createContext<ProofsProvider>
  ({
    data: {
      mintedProofs: [],
      proofToBeMinted: [],
      proofsToBeMintedHasEvaluationPending: false,
      mintedProofsLoading: false,
      newProofActiveStep: 0,
      mintingTx: "",
      price: undefined,
      uploadingFileToPublish: false,
      prepaidMint: undefined,
      totalSupply: undefined,
      privateCollectionAddress: undefined
    },
    setMintedProofs: undefined,
    setMintedProofsLoading: undefined,
    setProofToBeMinted: undefined,
    setProofsToBeMintedHasEvaluationPending: undefined,
    setMintPrices: undefined,
    setMintingTx: undefined,
    setNewProofActiveStep: undefined,
    setPrepaidMint: undefined,
    setTotalSupply: undefined,
    setPrivateCollectionAddress: undefined,
    setProofsContextData: undefined
  });

export const useProofs = () => {
  return useContext(ProofsContext);
};

const ProofsProvider: React.FC<IProofsProvider> = (props) => {

  const [mintedProofs, setMintedProofs] = useState<Proof[]>([]);
  const [mintedProofsLoading, setMintedProofsLoading] = useState<boolean>(false);
  const [proofToBeMinted, setProofToBeMinted] = useState<ProofToMint[]>([]);
  const [proofsToBeMintedHasEvaluationPending, setProofsToBeMintedHasEvaluationPending] = useState<boolean>(false);
  const [price, setMintPrices] = useState<Prices>(undefined);
  const [newProofActiveStep, setNewProofActiveStep] = useState<number>(0);
  const [mintingTx, setMintingTx] = useState<string>("");
  const [prepaidMint, setPrepaidMint] = useState<number | undefined>(undefined);
  const [totalSupply, setTotalSupply] = useState<number | undefined>(undefined);
  const [privateCollectionAddress, setPrivateCollectionAddress] = useState<address | undefined>(undefined);

  const [proofsContextData, setProofsContextData] = useState<ProofsContextData>({
    mintedProofs: undefined,
    proofToBeMinted: [],
    proofsToBeMintedHasEvaluationPending: false,
    mintedProofsLoading: false,
    newProofActiveStep: 0,
    mintingTx: "",
    price: undefined,
    uploadingFileToPublish: false,
    prepaidMint: undefined,
    totalSupply: undefined,
    privateCollectionAddress: undefined
  });

  return (
    <ProofsContext.Provider
        value={{
          data: {...proofsContextData, mintedProofs, mintedProofsLoading,
            proofToBeMinted, proofsToBeMintedHasEvaluationPending, price,
            newProofActiveStep, mintingTx, prepaidMint, totalSupply, privateCollectionAddress},
          setMintedProofs,
          setMintedProofsLoading,
          setProofToBeMinted,
          setProofsToBeMintedHasEvaluationPending,
          setMintPrices,
          setNewProofActiveStep,
          setMintingTx,
          setPrepaidMint,
          setTotalSupply,
          setPrivateCollectionAddress,
          setProofsContextData
        }}>
    {props.children}
    </ProofsContext.Provider>
  );
};

export interface IProofsProvider {
  children: React.ReactNode
}

export default ProofsProvider;
