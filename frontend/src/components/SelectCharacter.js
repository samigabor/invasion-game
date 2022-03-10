import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { CONTRACT_ADDRESS, transformCharacterData } from "../constants";
import "./SelectCharacter.css";
import invasion from "../utils/Invasion.json";

const SelectCharacter = ({ setCharacterNFT, setWeaponNFT }) => {
  const [defaultCharacters, setDefaultCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);

  const renderCharacterList = ({
    defaultCharacters,
    setCharacterNFT,
    setWeaponNFT,
  }) => {
    console.log("defaultCharacters:", defaultCharacters);
    return defaultCharacters.map((character, index) => (
      <div className="character-item" key={character.name}>
        <div className="name-container">
          <p>{character.name}</p>
        </div>
        <img src={character.imageURI} alt={character.name} />
        <button
          type="button"
          className="character-mint-button"
          onClick={mintCharacterNFTAction({
            setCharacterNFT,
            setWeaponNFT,
            index,
          })}
        >{`Mint ${character.name}`}</button>
      </div>
    ));
  };

  const mintCharacterNFTAction =
    ({ setCharacterNFT, setWeaponNFT, index }) =>
    async () => {
      try {
        if (gameContract) {
          console.log("Minting character in progress...");
          let mintTxn;
          console.log("setCharacterNFT", setCharacterNFT);
          console.log("setWeaponNFT", setWeaponNFT);
          if (setCharacterNFT) {
            mintTxn = await gameContract.mintCharacterNFT(index);
          }
          if (setWeaponNFT) {
            mintTxn = await gameContract.mintWeaponNFT(index);
          }
          await mintTxn.wait();
          console.log("mintTxn:", mintTxn);
        }
      } catch (error) {
        console.warn("MintCharacterAction Error:", error);
      }
    };

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        invasion.abi,
        signer
      );
      setGameContract(contract);
    }
  }, []);

  useEffect(() => {
    const getDefaultCharacters = async () => {
      let characters;
      if (setCharacterNFT) {
        characters = await gameContract.getDefaultCharacters();
      }
      if (setWeaponNFT) {
        characters = await gameContract.getDefaultWeapons();
      }
      setDefaultCharacters(
        characters.map((character) => transformCharacterData(character))
      );
    };

    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      );

      if (gameContract) {
        const nft = await gameContract.checkIfUserHasNFTCharacter();
        if (setCharacterNFT) {
          console.log("character nft: ", nft);
          setCharacterNFT(transformCharacterData(nft));
        }
        if (setWeaponNFT) {
          console.log("weapon nft: ", nft);
          setWeaponNFT(transformCharacterData(nft));
        }
        alert(
          `Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${
            gameContract.address
          }/${tokenId.toNumber()} or here: https://rinkeby.rarible.com/token/${
            gameContract.address
          }:${tokenId.toNumber()}`
        );
      }
    };

    if (gameContract) {
      getDefaultCharacters();
      gameContract.on("CharacterNFTMinted", onCharacterMint);
    }

    return () => {
      if (gameContract) {
        gameContract.off("CharacterNFTMinted", onCharacterMint);
      }
    };
  }, [gameContract, setCharacterNFT, setWeaponNFT]);

  return (
    <>
      {defaultCharacters.length > 0 && (
        <div className="select-character-container">
          <h2>
            Mint Your {setCharacterNFT ? "Hero" : "Weapon"}. Choose wisely.
          </h2>
          <div className="character-grid">
            {renderCharacterList({
              defaultCharacters,
              setCharacterNFT,
              setWeaponNFT,
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default SelectCharacter;
