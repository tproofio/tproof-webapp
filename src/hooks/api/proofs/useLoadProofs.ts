import {Proof} from "../../../utils/ProjectTypes/Project.types";
import {useState} from "react";
import axios, {AxiosResponse} from "axios";
import {OwnedNftsResponse} from "alchemy-sdk";
import {useAccount, useNetwork} from "wagmi";
import {fromTokenIdToChain} from "../../../utils/Tools/Web3Management";
import {Chain, ProofVerificationStatus} from "../../../utils/ProjectTypes/Project.enum";

/**
 * @param {boolean} completed
 * @param {string} error
 * @param {Proof[]} result
 */
export interface UseLoadProofsState {
  completed: boolean,
  error: string,
  result: Proof[] | undefined
}

/**
 * @param {function} loadPrices
 */
export interface UseLoadProofsResponse extends UseLoadProofsState {
  loadProofs: () => void
}

export const useLoadProofs = ():  UseLoadProofsResponse => {
  const [status, setStatus] = useState<UseLoadProofsState>({completed: false, error: "", result: undefined});
  const userAccount = useAccount();
  const network = useNetwork();
  const loadProofs = (): void => {
    new Promise( async (resolve, reject) => {
      // run the GET calling the lambda function
      const alchemyResp: AxiosResponse<OwnedNftsResponse> = await axios.get("https://og6meua7fqc6c7qjxuezxma6uq0wcvjq.lambda-url.eu-west-1.on.aws", {
        params: {
          owner: userAccount.address,
          network: network.chain.id
        }
      });
      let proofs: Proof[] = [];
      // iterate on the response and generate the reply
      for (let r of alchemyResp.data.ownedNfts) {
        let {chain, nftNum} = fromTokenIdToChain(r.tokenId);
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
          chain: Chain.Goerli,
          nftNum: nftNum,
          hash: r.rawMetadata.attributes.find(e => e.trait_type === "Hash").value,
          title: r.title,
          createdAt: parseInt(createdAt.value),
          description: r.description,
          verificationStatus: verificationStatus,
          MIMEType: r.rawMetadata.attributes.find(e => e.trait_type === "MIME Type").value,
          fileUrl: r.rawMetadata.external_url,
          storageType: r.rawMetadata.attributes.find(e => e.trait_type === "Storage Type").value,
          verificationFailed: verificationFailedString === "true"
        })
      }

      // order by most recent to the least recent
      proofs = proofs.sort((a, b) => a.id < b.id ? 1 : -1);
      setStatus({
        completed: true,
        error: "",
        result: proofs
      });
    }).then(() => {});
  }
  return { ...status, loadProofs };
}
