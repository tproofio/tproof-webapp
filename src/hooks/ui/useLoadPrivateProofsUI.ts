import {useCallback, useEffect, useMemo, useState} from "react";
import {useContractRead, useContractReads, useNetwork} from "wagmi";
import {useProofs} from "../../context/Proofs/ProofsProvider";
import {CONTRACTS_DETAILS} from "../../utils/constants";
import {Chain, ProofVerificationStatus} from "../../utils/ProjectTypes/Project.enum";
import {Proof} from "../../utils/ProjectTypes/Project.types";
import {Buffer} from 'buffer';
import {ethers} from "ethers";


/**
 * Loads the proofs calling the chain, and going backward, with a max of 30 proofs a time.
 *
 * USe this hook only inside ProofContext
 */
export const useLoadPrivateProofsUI = (addr): { loadMore: () => void } => {
  const network = useNetwork();
  const proofs = useProofs();

  const NftFactoryContract = {
    address: addr,
    abi: CONTRACTS_DETAILS[network.chain?.id]?.TPROOF_PRIVATE_NFT_FACTORY_ABI
  };

  const [fetching, setFetching] = useState(false);

  const readPrepaidMints = useContractRead({
    ...NftFactoryContract,
    functionName: "prepaidMints",
    enabled: !!addr || !ethers.utils.isAddress(addr)
  });

  const readTotalSupplyNft = useContractRead({
    ...NftFactoryContract,
    functionName: "totalSupply",
    enabled: !!addr || !ethers.utils.isAddress(addr)
  });

  const nextFetchList = useMemo((): any[] => {
    const fetchLength = 20;
    if (!proofs.data.totalSupply) return [];
    if (readTotalSupplyNft.isLoading || !readTotalSupplyNft.data) return [];
    const totalSupply = proofs.data.totalSupply;
    if (totalSupply === 0) return [];  // no proofs generated yet
    let startPos = totalSupply-1;
    if (proofs.data.mintedProofs.length === totalSupply) return [];  // we have already read all the proofs
    if (proofs.data.mintedProofs.length > 0) startPos = startPos - proofs.data.mintedProofs.length;
    let endPos = (startPos-fetchLength) < 0 ? 0 : startPos-fetchLength;
    const fetchArrayList = [];
    for (let i = startPos; i>= endPos; i--) {
      fetchArrayList.push({
        ...NftFactoryContract,
        functionName: "tokenURI",
        args: [i],
      });
    }
    return fetchArrayList;
  }, [readTotalSupplyNft, proofs.data.mintedProofs, proofs.data.totalSupply]);

  const readTokenUris = useContractReads({
    contracts: nextFetchList,
    enabled: fetching
  });

  // store the loaded prepaid mints
  useEffect(() => {
    if (!readPrepaidMints.isLoading && readPrepaidMints.isSuccess) {
      proofs.setPrepaidMint(parseInt(readPrepaidMints.data as unknown as string));
    }
  }, [readPrepaidMints])

  // store the loaded total supply
  useEffect(() => {
    if (!readTotalSupplyNft.isLoading && readTotalSupplyNft.isSuccess) {
      proofs.setTotalSupply(parseInt(readTotalSupplyNft.data as unknown as string));
    }
  }, [readTotalSupplyNft])

  // store in the Proof Context the list of loaded proofs
  useEffect(() => {
    if (!readTokenUris.isLoading && readTokenUris.data) {
      // stop fetching
      setFetching(false);
      // if we have no data read, return
      if (readTokenUris.data.length === 0) return;
      const minProofFetched = proofs.data.mintedProofs.length === 0 ? proofs.data.totalSupply : Math.min( ...proofs.data.mintedProofs.map(e => e.nftNum));
      // transform base64 encoded data array into a Proof[]
      const loadedProofs: Proof[] = readTokenUris.data.map((d: string, pos): Proof => {
        let dJson = d.replace("data:application/json;base64,", "");
        const decodedString = Buffer.from(dJson, "base64").toString('utf-8');
        const jsonObject = JSON.parse(decodedString);
        const nftNumber = minProofFetched - pos - 1;
        return {
          id: nftNumber.toString(),
          chain: network.chain.id === 5 ? Chain.Goerli : Chain.PolygonMainnet,
          nftNum: nftNumber,
          title: jsonObject.name,
          description: jsonObject.description,
          hash: jsonObject.attributes.find(k => k.trait_type === "Hash")['value'],
          verificationStatus: ProofVerificationStatus.NotVerified,
          createdAt: parseInt(jsonObject.attributes.find(k => k.trait_type === "Created At")['value']),
          verificationFailed: false
        }
      });
      // combine new proofs with old ones
      proofs.setMintedProofs([
        ...proofs.data.mintedProofs,
        ...loadedProofs
      ]);
    }
  }, [readTokenUris]);

  // triggers the load of next 20 proofs
  const loadMore = useCallback(() => {
    setFetching(true);
  }, []);

  return {
    loadMore,
  };
};

