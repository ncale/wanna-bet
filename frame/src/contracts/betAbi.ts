export const betAbi = [
  {
    inputs: [
      { internalType: "uint256", name: "_betId", type: "uint256" },
      { internalType: "address", name: "_creator", type: "address" },
      { internalType: "address", name: "_participant", type: "address" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
      { internalType: "address", name: "_token", type: "address" },
      { internalType: "string", name: "_message", type: "string" },
      { internalType: "address", name: "_judge", type: "address" },
      { internalType: "uint256", name: "_validFor", type: "uint256" },
      { internalType: "address", name: "_factoryContract", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "BET__BadInput", type: "error" },
  { inputs: [], name: "BET__Expired", type: "error" },
  { inputs: [], name: "BET__FailedEthTransfer", type: "error" },
  { inputs: [], name: "BET__FailedTransfer", type: "error" },
  { inputs: [], name: "BET__FeeNotEnough", type: "error" },
  { inputs: [], name: "BET__FundsAlreadyWithdrawn", type: "error" },
  { inputs: [], name: "BET__InvalidStatus", type: "error" },
  { inputs: [], name: "BET__Unauthorized", type: "error" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "factoryContract",
        type: "address",
      },
    ],
    name: "BetAccepted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "factoryContract",
        type: "address",
      },
    ],
    name: "BetDeclined",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "factoryContract",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "winner",
        type: "address",
      },
    ],
    name: "BetSettled",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptBet",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "betDetails",
    outputs: [
      { internalType: "uint256", name: "betId", type: "uint256" },
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "address", name: "participant", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "contract IERC20", name: "token", type: "address" },
      { internalType: "string", name: "message", type: "string" },
      { internalType: "address", name: "judge", type: "address" },
      { internalType: "uint256", name: "validUntil", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "declineBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getStatus",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "retrieveTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_winner", type: "address" }],
    name: "settleBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "winner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
