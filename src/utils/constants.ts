export enum aTokens {
  DAI = "0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d",
  ETH = "0x3a3A65aAb0dd2A17E3F1947bA16138cd37d08c04",
}

export enum Tokens {
  DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  LINK = "0x514910771AF9Ca656af840dff83E8264EcF986CA",
  TUSD = "0x0000000000085d4780B73119b644AE5ecd22b376",
}

export enum AaveContracts {
  LendingPool = "0x398ec7346dcd622edc5ae82352f02be94c62d119",
  LendingPoolCore = "0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3",
  LendingPoolAddress = "0x24a42fD28C976A61Df5D00D0599C34c4f90748c8",
  Oracle = "0x76B47460d7F7c5222cFb6b6A75615ab10895DDe4",
  OracleOwner = "0xCd8393b5b0Ec5Ab8DAD4e648F709Be6Bac11874D",
  AaveOracleFallback = "0xd6d88f2eba3d9a27b24bf77932fdeb547b93df58",
  Sybil = "0xea7a98133424041461c0784affd708ef7ddc77d9",
}

export const abiOracle = [
  {
    constant: true,
    inputs: [{ name: "_sybil", type: "address" }],
    name: "isSybilWhitelisted",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "", type: "address" }],
    name: "prophecies",
    outputs: [
      { name: "timestamp", type: "uint64" },
      { name: "sybilProphecy", type: "uint96" },
      { name: "oracleProphecy", type: "uint96" },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_asset", type: "address" },
      { name: "_sybilProphecy", type: "uint96" },
      { name: "_oracleProphecy", type: "uint96" },
    ],
    name: "submitProphecy",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_asset", type: "address" }],
    name: "getAssetPrice",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_asset", type: "address" }],
    name: "getProphecy",
    outputs: [
      { name: "", type: "uint64" },
      { name: "", type: "uint96" },
      { name: "", type: "uint96" },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_sybils", type: "address[]" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "_sybil", type: "address" },
      { indexed: true, name: "_asset", type: "address" },
      { indexed: false, name: "_sybilProphecy", type: "uint96" },
      { indexed: false, name: "_oracleProphecy", type: "uint96" },
    ],
    name: "ProphecySubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "sybil", type: "address" }],
    name: "SybilWhitelisted",
    type: "event",
  },
];
