import { createConfig } from "@ponder/core";
import { http } from "viem";

import { BetFactoryAbi } from "./abis/BetFactoryAbi";

export default createConfig({
  networks: {
    // arbitrum: {
    //   chainId: 42161,
    //   transport: http(process.env.PONDER_RPC_URL_42161),
    // },
    base: {
      chainId: 8453,
      transport: http(process.env.PONDER_RPC_URL_8453),
    },
  },
  contracts: {
    // BetFactoryArb: {
    //   abi: BetFactoryAbi,
    //   address: "0xc1c9046d6356c68b478092fb907cd256efc0dda2",
    //   network: "arbitrum",
    //   startBlock: 224316484,
    // },
    BetFactoryBase: {
      abi: BetFactoryAbi,
      address: "0x304Ac36402D551fBba8e53E04e770337022e8757",
      network: "base",
      startBlock: 16499739,
    },
  },
});
