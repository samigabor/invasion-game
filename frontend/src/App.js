import { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import SelectCharacter from "./components/SelectCharacter";
import { CONTRACT_ADDRESS, transformCharacterData } from "./constants";
import invasion from "./utils/Invasion.json";
import { ethers } from "ethers";
import Arena from "./components/Arena";
import { useWallet } from "./context";

// Constants
const TWITTER_HANDLE = "sami_gabor";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const { account, balance, connectWallet } = useWallet();

  // const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [weaponNFT, setWeaponNFT] = useState(null);
  const [gameContract, setGameContract] = useState(null);

  const renderContent = () => {
    if (!account) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://data.whicdn.com/images/300781885/original.gif"
            alt="Loki"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWallet}
          >
            Connect Wallet To Get Started
          </button>
        </div>
      );
    } else if (account && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else {
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

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log("Checking for Character NFT on address:", account);

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

    if (account) {
      console.log("account:", account);
      fetchNFTMetadata();
    }
  }, [account]);

  useEffect(() => {
    const fetchWeaponNFTMetadata = async () => {
      console.log("Checking for Character NFT on address:", account);

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

    if (account) {
      console.log("account:", account);
      fetchWeaponNFTMetadata();
    }
  }, [account]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Invasion ⚔️</p>
          <p className="sub-text">Team up to protect the Planet Earth!</p>
          {window.ethereum && window.ethereum.networkVersion === "4" ? (
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
