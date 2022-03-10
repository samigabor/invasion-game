import { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import SelectCharacter from "./components/SelectCharacter";
import { CONTRACT_ADDRESS, transformCharacterData } from "./constants";
import invasion from "./utils/Invasion.json";
import { ethers } from "ethers";
import Arena from "./components/Arena";

// Constants
const TWITTER_HANDLE = "sami_gabor";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [weaponNFT, setWeaponNFT] = useState(null);
  const [gameContract, setGameContract] = useState(null);
  const [isRinkeby, setIsRinkeby] = useState(false);

  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);

        const accounts = await ethereum.request({ method: "eth_accounts" });
        checkNetwork();

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account);
        } else {
          console.log("No authorized account found");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderContent = () => {
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://data.whicdn.com/images/300781885/original.gif"
            alt="Loki"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet To Get Started
          </button>
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else {
      console.log("weaponNFT", weaponNFT);
      return (
        <>
          <Arena
            characterNFT={characterNFT}
            setCharacterNFT={setCharacterNFT}
            weaponNFT={weaponNFT}
          />
          {!weaponNFT && <SelectCharacter setWeaponNFT={setWeaponNFT} />}
        </>
      );
    }
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
       * Request access to account.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const checkNetwork = async () => {
    try {
      if (
        window.ethereum.networkVersion === "4" ||
        window.ethereum.networkVersion === "31337"
      ) {
        setIsRinkeby(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log("Checking for Character NFT on address:", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const newGameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        invasion.abi,
        signer
      );

      setGameContract(newGameContract);

      const txn = await newGameContract.checkIfUserHasNFTCharacter();
      if (txn.name) {
        console.log("User has character NFT");
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log("No character NFT found");
      }
    };

    if (currentAccount) {
      console.log("CurrentAccount:", currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  useEffect(() => {
    const fetchWeaponNFTMetadata = async () => {
      console.log("Checking for Character NFT on address:", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const newGameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        invasion.abi,
        signer
      );

      setGameContract(newGameContract);

      const txn = await newGameContract.checkIfUserHasNFTWeapon();
      if (txn.name) {
        console.log("User has weapon NFT");
        setWeaponNFT(transformCharacterData(txn));
      } else {
        console.log("No weapon NFT found");
      }
    };

    if (currentAccount) {
      console.log("CurrentAccount:", currentAccount);
      fetchWeaponNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Invasion ⚔️</p>
          <p className="sub-text">Team up to protect the Planet Earth!</p>
          {isRinkeby ? (
            renderContent()
          ) : (
            <h1 style={{ color: "white" }}>
              Network not supported. Please switch to Rinkeby!
            </h1>
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
