import {Proof} from "../../../utils/ProjectTypes/Project.types";
import {useAccount} from "wagmi";
import {fromTokenIdToChain} from "../../../utils/Tools/Web3Management";
import {FileMIMEType, ProofVerificationStatus, StorageType} from "../../../utils/ProjectTypes/Project.enum";
import {useBaseAsyncHook, useBaseAsyncHookState} from "../../utils/useBaseAsyncHook";
import {loadProofsOnChain} from "../../../utils/OnChainProofs/LoadProofsOnChain";

/**
 * @param {function} loadProofs
 */
export interface UseLoadProofsResponse extends useBaseAsyncHookState<Proof[]> {
  loadProofs: () => void
}

/**
 * Loads the proofs owned by the connected wallet straight from the Polygon contracts.
 * The old Lambda/Alchemy backend has been removed: metadata is decoded from tokenURI.
 * @param {number} chainId - active chain id (only Polygon mainnet is supported)
 */
export const useLoadProofs = (chainId: number):  UseLoadProofsResponse => {

  const {completed, error, loading, result,
    startAsyncAction, endAsyncActionSuccess, endAsyncActionError} = useBaseAsyncHook<Proof[]>();
  const userAccount = useAccount();

  /**
   * Reads the owned proof NFTs from chain and maps them to the UI proof model.
   */
  const loadProofs = (): void => {
    startAsyncAction();
    new Promise( async (resolve) => {
      try {
        // No backend call: the loader talks to public Polygon RPCs directly.
        const onChainResp = await loadProofsOnChain(userAccount.address, chainId);

        let proofs: Proof[] = [];
        // iterate on the response and generate the reply
        for (let r of onChainResp.ownedNfts) {
          let {nftNum} = fromTokenIdToChain(r.tokenId);
          let createdAt = r.rawMetadata.attributes.find(e => e.trait_type === "Created At");
          let verifiedStr = r.rawMetadata.attributes.find(e => e.trait_type === "Verified").value;
          let verificationFailedString = r.rawMetadata.attributes.find(e => e.trait_type === "Verification Failed").value;
          let verificationStatus: ProofVerificationStatus;
          if (verifiedStr === "True") verificationStatus = ProofVerificationStatus.Verified;
          else if (verifiedStr === "Pending") verificationStatus = ProofVerificationStatus.Pending;
          else if (verificationFailedString === "true") verificationStatus = ProofVerificationStatus.Failed;
          else verificationStatus = ProofVerificationStatus.NotVerified;
          proofs.push({
            id: r.tokenId,
            chain: chainId,
            nftNum: nftNum,
            hash: r.rawMetadata.attributes.find(e => e.trait_type === "Hash").value,
            title: r.title,
            createdAt: parseInt(createdAt.value),
            description: r.description,
            verificationStatus: verificationStatus,
            // tokenURI returns plain strings; the proof model uses the enum for MIME types.
            MIMEType: r.rawMetadata.attributes.find(e => e.trait_type === "MIME Type").value as unknown as FileMIMEType,
            fileUrl: r.rawMetadata.external_url,
            storageType: r.rawMetadata.attributes.find(e => e.trait_type === "Storage Type").value as unknown as StorageType,
            verificationFailed: verificationFailedString === "true"
          })
        }

        // order by most recent to the least recent
        proofs = proofs.sort((a, b) => a.id < b.id ? 1 : -1);

        endAsyncActionSuccess(proofs);
      } catch (e) {
        // Surface the failure instead of leaving the hook in a perpetual loading state.
        endAsyncActionError(String(e));
      }
      resolve(null);
    }).then(() => {});
  }

  return { completed, error, loading, result, loadProofs };
}
