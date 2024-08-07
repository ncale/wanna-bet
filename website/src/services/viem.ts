import { createPublicClient, http } from "viem";
import { mainnet, arbitrum, base } from "viem/chains";
import { MAINNET_ALCHEMY_URL, ARB_ALCHEMY_URL, BASE_ALCHEMY_URL } from "@/config/server";

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(MAINNET_ALCHEMY_URL),
});
const arbitrumClient = createPublicClient({
  chain: arbitrum,
  transport: http(ARB_ALCHEMY_URL),
});
const baseClient = createPublicClient({
  chain: base,
  transport: http(BASE_ALCHEMY_URL),
});

export { mainnetClient, arbitrumClient, baseClient };
