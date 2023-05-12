import React, { useEffect, useState } from "react";
import { useEthers } from "../context";
import "../styles/SelectCharacter.css";
import { transformCharacterData } from "../utils/helper-functions";

const SelectCharacter = ({ setCharacterNFT, setWeaponNFT }) => {
  const { contract } = useEthers();

  const [defaultCharacters, setDefaultCharacters] = useState([]);

  const mintCharacterNFTAction =
    ({ setCharacterNFT, setWeaponNFT, index }) =>
    async () => {
      try {
        if (contract) {
          let mintTxn;
          if (setCharacterNFT) {
            mintTxn = await contract.mintCharacterNFT(index);
          }
          if (setWeaponNFT) {
            mintTxn = await contract.mintWeaponNFT(index);
          }
          await mintTxn.wait();
          console.log("mintTxn:", mintTxn);
        }
      } catch (error) {
        console.warn("MintCharacterAction Error:", error);
      }
    };

  useEffect(() => {
    const getDefaultCharacters = async () => {
      let characters;
      if (setCharacterNFT) {
        characters = await contract.getDefaultCharacters();
      }
      if (setWeaponNFT) {
        characters = await contract.getDefaultWeapons();
      }
      setDefaultCharacters(
        characters.map((character) => transformCharacterData(character))
      );
    };

    const onMintNFT = async (sender, tokenId, characterIndex) => {
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      );

      if (contract) {
        const nft = await contract.checkIfUserHasNFTCharacter();
        if (setCharacterNFT) {
          setCharacterNFT(transformCharacterData(nft));
        }
        if (setWeaponNFT) {
          setWeaponNFT(transformCharacterData(nft));
        }
        alert(
          `Your NFT is all done -- see it here: https://opensea.io/assets/matic/${
            contract.address
          }/${tokenId.toNumber()} or here: https://rarible.com/token/polygon/${
            contract.address
          }:${tokenId.toNumber()}`
        );
      }
    };

    if (contract) {
      getDefaultCharacters();
      contract.on("CharacterNFTMinted", onMintNFT);
      contract.on("WeaponNFTMinted", onMintNFT);
    }

    return () => {
      if (contract) {
        contract.off("CharacterNFTMinted", onMintNFT);
        contract.off("WeaponNFTMinted", onMintNFT);
      }
    };
  }, [contract, setCharacterNFT, setWeaponNFT]);

  return (
    <>
      {defaultCharacters.length > 0 && (
        <div className="select-character-container">
          <h2>
            Mint Your {setCharacterNFT ? "Hero. Choose wisely." : "Weapon:"}
          </h2>
          <div className="character-grid">
            {defaultCharacters.map((character, index) => (
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
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default SelectCharacter;
