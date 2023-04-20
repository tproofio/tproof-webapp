import React, {createContext, useContext, useState} from "react";
import {Proof, ProofToMint} from "../../utils/ProjectTypes/Project.types";

/**
 * Data stored in this Provider
 *
 * @param {Proof[]} mintedProofs - list of the proofs already minted
 * @param {ProofToMint[]} proofToBeMinted - list of file user would like to mint as tProofs
 * @param {boolean} mintedProofsLoading - true when a loading of minted proofs is pending
 * @param {number} newProofActiveStep - 0 if we're in the file selection/upload part. 1 if we're in the mint list reminted
 * @param {string} mintingTx - tx of the mint. Empty if mint completed
 */
export interface ProofsContextData {
  mintedProofs: Proof[];
  proofToBeMinted: ProofToMint[],
  mintedProofsLoading: boolean,
  newProofActiveStep: number,
  mintingTx: string,
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
  setProofsContextData: React.Dispatch<React.SetStateAction<ProofsContextData>> | undefined;
}

export const ProofsContext =
  createContext<ProofsProvider>
  ({
    data: {
      mintedProofs: [],
      proofToBeMinted: [],
      mintedProofsLoading: false,
      newProofActiveStep: 0,
      mintingTx: ""
    },
    setMintedProofs: undefined,
    setMintedProofsLoading: undefined,
    setProofsContextData: undefined
  });

export const useProofs = () => {
  return useContext(ProofsContext);
};

const ProofsProvider: React.FC<IProofsProvider> = (props) => {

  const [mintedProofs, setMintedProofs] = useState<Proof[]>([]);
  const [mintedProofsLoading, setMintedProofsLoading] = useState<boolean>(false);

  const [proofsContextData, setProofsContextData] = useState<ProofsContextData>({
    mintedProofs: undefined,
    proofToBeMinted: [],
    mintedProofsLoading: false,
    newProofActiveStep: 0,
    mintingTx: ""
  });

  return (
    <ProofsContext.Provider
        value={{
          data: {...proofsContextData, mintedProofs, mintedProofsLoading},
          setMintedProofs,
          setMintedProofsLoading,
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
