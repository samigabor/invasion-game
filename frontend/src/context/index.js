import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, SUPPORTED_NETWORK } from "../constants";
import invasion from "../utils/Invasion.json";
import { mumbai, rinkeby } from "../utils/networks";

const EthereumContext = createContext(null);
const EthersContext = createContext({});
const WalletContext = createContext({});

const EthereumProvider = ({ children }) => {
  const [ethereum, setEthereum] = useState(null);

  useEffect(() => {
    const windowEthereum = window.ethereum;
    if (windowEthereum) {
      setEthereum(windowEthereum);
    }
  }, []);
  return (
    <EthereumContext.Provider value={ethereum}>
      {children}
    </EthereumContext.Provider>
  );
};

const EthersProvider = ({ children }) => {
  const ethereum = useContext(EthereumContext);

  const { provider, signer, contract } = useMemo(() => {
    let provider = null;
    let signer = null;
    let contract = null;
    if (ethereum) {
      provider = new ethers.providers.Web3Provider(ethereum, "any");
      signer = provider.getSigner();
      provider.on("network", (newNetwork, oldNetwork) => {
        // When a Provider makes its initial connection, it emits a "network" event with a null oldNetwork along with the newNetwork.
        // So, if the oldNetwork exists, it represents a changing network
        if (oldNetwork) {
          window.location.reload();
        }
      });
      contract = new ethers.Contract(CONTRACT_ADDRESS, invasion.abi, signer);
    }
    return { provider, signer, contract };
  }, [ethereum]);

  return (
    <EthersContext.Provider value={{ provider, signer, contract }}>
      {children}
    </EthersContext.Provider>
  );
};

const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0.0");
  const [isLoading, setIsLoading] = useState(false);
  const [chainId, setChainId] = useState("");

  const ethereum = useContext(EthereumContext);
  const { provider } = useContext(EthersContext);

  const checkIfWalletIsConnected = async () => {
    if (!ethereum) {
      return;
    }

    setIsLoading(true);
    const accounts = await ethereum.request({ method: "eth_accounts" });
    setChainId(ethereum.chainId);
    if (accounts.length !== 0) {
      setAccount(accounts[0]);
      const balanceBigNumber = await provider.getBalance(accounts[0]);
      const balance = ethers.utils.formatUnits(balanceBigNumber);
      setBalance(balance);
    } else {
      console.log("No authorized account found");
    }
    setIsLoading(true);

    ethereum.on("accountsChanged", function (accounts) {
      setAccount(accounts[0]);
      window.location.reload();
    });
  };

  const connectWallet = async () => {
    if (!ethereum) {
      return;
    }

    setIsLoading(true);
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
    setIsLoading(false);
  };

  const switchNetwork = async () => {
    if (!ethereum) {
      return;
    }

    try {
      // Try to switch to the Mumbai testnet
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SUPPORTED_NETWORK.chainId }], // Check chainIds.js for hexadecimal network ids
      });
    } catch (error) {
      // The error code 4902 means that the chain has not been added to MetaMask
      // In this case we ask the user to add it to their MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SUPPORTED_NETWORK],
          });
        } catch (error) {
          console.log(error);
        }
      }
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  });

  return (
    <WalletContext.Provider
      value={{
        account,
        balance,
        isLoading,
        connectWallet,
        chainId,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const Web3Provider = ({ children }) => {
  return (
    <EthereumProvider>
      <EthersProvider>
        <WalletProvider>{children}</WalletProvider>
      </EthersProvider>
    </EthereumProvider>
  );
};

export const useEthers = () => useContext(EthersContext);
export const useWallet = () => useContext(WalletContext);
