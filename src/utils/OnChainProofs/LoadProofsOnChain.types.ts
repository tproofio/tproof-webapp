/**
 * Minimal NFT shape returned to the proofs hook.
 * Mirrors the fields the app used to read from the removed Alchemy/Lambda
 * response, so the existing proof mapping can stay untouched.
 */
export interface OnChainNftAttribute {
  /** OpenSea-style trait name (e.g. "Hash", "Created At", "Verified"). */
  trait_type: string;
  /** Trait value stored on-chain inside the token metadata. */
  value: string;
}

/**
 * Metadata embedded in the tokenURI as a base64 JSON data URI.
 */
export interface OnChainNftMetadata {
  /** Attributes written by the minting contract. */
  attributes: OnChainNftAttribute[];
  /** Optional external URL of the pinned file. */
  external_url?: string;
}

/**
 * A single proof NFT owned by the connected wallet.
 */
export interface OnChainOwnedNft {
  /** Decimal token id, encoded as chain * 10^50 + nftNum. */
  tokenId: string;
  /** Human readable proof title. */
  title: string;
  /** Proof description. */
  description: string;
  /** Raw metadata used by the proof mapper. */
  rawMetadata: OnChainNftMetadata;
}

/**
 * Result shape expected by the proofs hook.
 */
export interface LoadProofsOnChainResult {
  /** Proofs currently owned by the wallet on Polygon. */
  ownedNfts: OnChainOwnedNft[];
}
