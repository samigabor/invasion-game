import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

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

  const { provider, signer } = useMemo(() => {
    let provider = null;
    let signer = null;
    if (ethereum) {
      provider = new ethers.providers.Web3Provider(ethereum);
      signer = provider.getSigner();
    }
    return { provider, signer };
  }, [ethereum]);

  return (
    <EthersContext.Provider value={{ provider, signer }}>
      {children}
    </EthersContext.Provider>
  );
};

const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0.0");
  const [isLoading, setIsLoading] = useState(false);

  const ethereum = useContext(EthereumContext);
  const { provider } = useContext(EthersContext);

  const checkIfWalletIsConnected = async () => {
    if (!ethereum) {
      return;
    }

    setIsLoading(true);
    const accounts = await ethereum.request({ method: "eth_accounts" });
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

  useEffect(() => {
    checkIfWalletIsConnected();
  });

  return (
    <WalletContext.Provider
      value={{ account, balance, isLoading, connectWallet }}
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
