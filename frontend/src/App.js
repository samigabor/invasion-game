import { useEffect, useState } from "react";
import { useEthers, useWallet } from "./context";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import Arena from "./components/Arena";
import SelectCharacter from "./components/SelectCharacter";
import { TWITTER_LINK, TWITTER_HANDLE, SUPPORTED_NETWORK } from "./constants";
import { transformCharacterData } from "./utils/helper-functions";

const App = () => {
  const { contract } = useEthers();
  const { account, connectWallet, chainId, switchNetwork } = useWallet();

  const [characterNFT, setCharacterNFT] = useState(null);
  const [weaponNFT, setWeaponNFT] = useState(null);

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
    const fetchNFTsMetadata = async () => {
      const characterTxn = await contract.checkIfUserHasNFTCharacter();
      if (characterTxn.name) {
        setCharacterNFT(transformCharacterData(characterTxn));
      }

      const weaponTxn = await contract.checkIfUserHasNFTWeapon();
      if (weaponTxn.name) {
        setWeaponNFT(transformCharacterData(weaponTxn));
      }
    };

    if (account && contract) {
      fetchNFTsMetadata();
    }
  }, [account, contract]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Invasion ⚔️</p>
          <p className="sub-text">Team up to protect the Planet Earth!</p>
          {chainId === SUPPORTED_NETWORK.chainId ? (
            renderContent()
          ) : (
            <div>
              <h1 style={{ color: "white" }}>
                Please switch to {SUPPORTED_NETWORK.chainName}
              </h1>
              <button
                className="cta-button mint-button"
                onClick={switchNetwork}
              >
                Click here to switch
              </button>
            </div>
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
