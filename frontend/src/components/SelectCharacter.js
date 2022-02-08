import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { CONTRACT_ADDRESS, transformCharacterData } from "../constants";
import "./SelectCharacter.css";
import invasion from "../utils/Invasion.json";

/*
 * Don't worry about setCharacterNFT just yet, we will talk about it soon!
 */
const SelectCharacter = ({ setCharacterNFT }) => {
  const [defaultCharacters, setDefaultCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);

  const renderCharacters = () =>
    defaultCharacters.map((character, index) => (
      <div className="character-item" key={character.name}>
        <div className="name-container">
          <p>{character.name}</p>
        </div>
        <img src={character.imageURI} alt={character.name} />
        <button
          type="button"
          className="character-mint-button"
          onClick={mintCharacterNFTAction(index)}
        >{`Mint ${character.name}`}</button>
      </div>
    ));

  const mintCharacterNFTAction = (characterId) => async () => {
    try {
      if (gameContract) {
        console.log("Minting character in progress...");
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
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
      const characters = await gameContract.getDefaultCharacters();
      setDefaultCharacters(
        characters.map((character) => transformCharacterData(character))
      );
    };

    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      );

      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT();
        console.log("CharacterNFT: ", characterNFT);
        setCharacterNFT(transformCharacterData(characterNFT));
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
      /*
       * When your component unmounts, let;s make sure to clean up this listener
       */
      if (gameContract) {
        gameContract.off("CharacterNFTMinted", onCharacterMint);
      }
    };
  }, [gameContract, setCharacterNFT]);

  return (
    <div className="select-character-container">
      <h2>Mint Your Hero. Choose wisely.</h2>
      {defaultCharacters.length > 0 && (
        <div className="character-grid">{renderCharacters()}</div>
      )}
    </div>
  );
};

export default SelectCharacter;
