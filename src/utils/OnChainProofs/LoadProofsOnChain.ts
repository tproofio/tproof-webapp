import {CONTRACTS_DETAILS} from "../constants";
import {LoadProofsOnChainResult, OnChainOwnedNft} from "./LoadProofsOnChain.types";

/** Only Polygon mainnet is supported by this archived build. */
const POLYGON_CHAIN_ID = 137;

/** tokenId layout used by the contracts: chain * 10^50 + nftNum. */
const TOKEN_ID_CHAIN_FACTOR = BigInt(10) ** BigInt(50);

/** Public Polygon RPCs, tried in order. All of them expose CORS. */
const RPC_ENDPOINTS = [
  "https://polygon-bor-rpc.publicnode.com",
  "https://polygon-rpc.com",
];

/** eth_call selectors used to read the collection. */
const SELECTOR_TOTAL_SUPPLY = "0x18160ddd";
const SELECTOR_OWNER_OF = "0x6352211e";
const SELECTOR_TOKEN_URI = "0xc87b56dd";

/** Max calls per JSON-RPC batch, kept low to stay within public RPC limits. */
const BATCH_SIZE = 25;

/** A single JSON-RPC response entry. */
interface JsonRpcEntry {
  /** Request id, used to re-order batched responses. */
  id?: number;
  /** Hex result of a successful call. */
  result?: string;
  /** Error object of a failed call. */
  error?: { message?: string };
}

/** Pads a bigint as a 32-byte hex string without the 0x prefix. */
const toHex64 = (value: bigint): string => value.toString(16).padStart(64, "0");

/** Rebuilds the on-chain token id for a given collection index. */
const tokenIdOf = (chainId: number, index: number): bigint =>
    BigInt(chainId) * TOKEN_ID_CHAIN_FACTOR + BigInt(index);

/**
 * Executes a batch of eth_call requests against the first working RPC.
 * Batching keeps the ~140-token scan fast and avoids one HTTP round trip per id.
 * @param contractAddress - collection address to call
 * @param calls - ABI-encoded calldata list
 * @returns one JSON-RPC entry per call, in the same order
 */
const rpcBatch = async (contractAddress: string, calls: string[]): Promise<JsonRpcEntry[]> => {
  let lastError: unknown;

  for (const endpoint of RPC_ENDPOINTS) {
    try {
      // JSON-RPC batch: one HTTP request carries all ownerOf/tokenURI calls.
      const body = calls.map((data, index) => ({
        jsonrpc: "2.0",
        id: index,
        method: "eth_call",
        params: [{to: contractAddress, data}, "latest"],
      }));

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`RPC HTTP ${response.status}`);

      const entries = (await response.json()) as JsonRpcEntry[];
      // Re-index by id: RPCs are allowed to return batched responses out of order.
      const byId = new Map<number, JsonRpcEntry>();
      entries.forEach((entry) => byId.set(entry.id as number, entry));
      return calls.map((_, index) => byId.get(index) || {error: {message: "missing batch entry"}});
    } catch (error) {
      // Fall through to the next endpoint before giving up.
      lastError = error;
    }
  }

  throw lastError;
};

/** Reads a single eth_call through the batch helper. */
const rpcOne = async (contractAddress: string, call: string): Promise<JsonRpcEntry> => {
  const entries = await rpcBatch(contractAddress, [call]);
  return entries[0];
};

/** Extracts the 20-byte address from an ABI-encoded ownerOf result. */
const decodeOwner = (entry: JsonRpcEntry): string =>
    "0x" + (entry.result as string).slice(-40).toLowerCase();

/**
 * Decodes an ABI-encoded UTF-8 string (offset, length, payload).
 * tokenURI returns the metadata JSON this way.
 */
const decodeAbiString = (entry: JsonRpcEntry): string => {
  const hex = (entry.result as string).slice(2);
  const offset = parseInt(hex.slice(0, 64), 16) * 2;
  const length = parseInt(hex.slice(offset, offset + 64), 16);
  const payload = hex.slice(offset + 64, offset + 64 + length * 2);

  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) bytes[i] = parseInt(payload.substr(i * 2, 2), 16);
  return new TextDecoder().decode(bytes);
};

/**
 * Parses the base64 JSON carried inside tokenURI.
 * @param uri - data:application/json;base64,<json>
 * @returns the decoded metadata, or null when the URI is not decodable
 */
const parseMetadata = (uri: string): OnChainOwnedNft["rawMetadata"] & {name: string; description: string} | null => {
  if (!uri || uri.indexOf("base64,") < 0) return null;

  // atob works on latin1; re-decode the bytes as UTF-8 to keep accents intact.
  const binary = atob(uri.split("base64,")[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  return JSON.parse(new TextDecoder().decode(bytes));
};

/**
 * Loads the proofs owned by a wallet directly from the Polygon contracts.
 * Replaces the removed tproof Lambda/Alchemy backend: no server is involved.
 * Never throws, so the UI cannot stay stuck on an infinite loading spinner.
 * @param owner - connected wallet address
 * @param chainId - active chain id (only Polygon mainnet is supported)
 * @returns the owned proof NFTs in the legacy Alchemy result shape
 */
export const loadProofsOnChain = async (owner?: string, chainId?: number): Promise<LoadProofsOnChainResult> => {
  // Nothing to load without a wallet or on an unsupported chain.
  if (!owner || chainId !== POLYGON_CHAIN_ID) return {ownedNfts: []};

  const contractAddress = CONTRACTS_DETAILS[chainId]?.TPROOF_NFT_FACTORY_ADDRESS;
  if (!contractAddress) return {ownedNfts: []};

  try {
    const ownerLc = owner.toLowerCase();

    // totalSupply() bounds the scan: this collection has ~140 tokens.
    const supplyEntry = await rpcOne(contractAddress, SELECTOR_TOTAL_SUPPLY);
    if (!supplyEntry || supplyEntry.error || !supplyEntry.result) return {ownedNfts: []};
    const totalSupply = parseInt(supplyEntry.result, 16);

    const tokenIds: bigint[] = [];
    for (let index = 0; index < totalSupply; index++) tokenIds.push(tokenIdOf(chainId, index));

    // Find the ids owned by the wallet, in batches.
    const ownedIds: bigint[] = [];
    for (let start = 0; start < tokenIds.length; start += BATCH_SIZE) {
      const chunk = tokenIds.slice(start, start + BATCH_SIZE);
      const entries = await rpcBatch(
          contractAddress,
          chunk.map((tokenId) => SELECTOR_OWNER_OF + toHex64(tokenId)),
      );
      entries.forEach((entry, index) => {
        // Reverted or missing entries belong to non-existent ids: skip them.
        if (entry && entry.result && decodeOwner(entry) === ownerLc) ownedIds.push(chunk[index]);
      });
    }

    // Only the owned tokens need their metadata fetched.
    const ownedNfts: OnChainOwnedNft[] = [];
    for (const tokenId of ownedIds) {
      const uriEntry = await rpcOne(contractAddress, SELECTOR_TOKEN_URI + toHex64(tokenId));
      if (!uriEntry || uriEntry.error || !uriEntry.result) continue;

      let metadata: ReturnType<typeof parseMetadata> = null;
      try {
        metadata = parseMetadata(decodeAbiString(uriEntry));
      } catch (error) {
        // A malformed metadata must not hide the other proofs.
        metadata = null;
      }
      if (!metadata) continue;

      ownedNfts.push({
        tokenId: tokenId.toString(),
        title: metadata.name,
        description: metadata.description,
        rawMetadata: {
          attributes: metadata.attributes || [],
          external_url: metadata.external_url || "",
        },
      });
    }

    return {ownedNfts};
  } catch (error) {
    // Degrade to an empty list instead of rejecting: the hook has no catch.
    return {ownedNfts: []};
  }
};
