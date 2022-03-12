const mumbai = {
  chainId: "0x13881",
  chainName: "Polygon Mumbai Testnet",
  rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
  nativeCurrency: {
    name: "Mumbai Matic",
    symbol: "MATIC",
    decimals: 18,
  },
  blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
};

const rinkeby = {
  chainId: "0x4",
  chainName: "Rinkeby Test Network",
  rpcUrls: ["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
  nativeCurrency: {
    name: "Rinkeby Ether",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorerUrls: ["https://rinkeby.etherscan.io"],
};

export { mumbai, rinkeby };
