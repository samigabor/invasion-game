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

const polygon = {
  chainId: "0x89", // 137 in decimal
  chainName: "Polygon Mainnet",
  rpcUrls: ["https://polygon-rpc.com/"],
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  blockExplorerUrls: ["https://polygonscan.com"],
};

export { mumbai, rinkeby, polygon };
