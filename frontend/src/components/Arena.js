import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../constants";
import myEpicGame from "../utils/Invasion.json";
import "./Arena.css";

const Arena = ({ characterNFT, setCharacterNFT, weaponNFT }) => {
  const [gameContract, setGameContract] = useState(null);
  const [invador, setInvador] = useState(null);
  const [attackState, setAttackState] = useState("");

  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState("attacking");
        console.log("Attacking invador...");
        const attackTxn = await gameContract.attackInvador();
        await attackTxn.wait();
        console.log("attackTxn:", attackTxn);
        setAttackState("hit");
      }
    } catch (error) {
      console.error("Error attacking invador:", error);
      setAttackState("");
    }
  };

  const runHealAction = async () => {
    try {
      if (gameContract) {
        setAttackState("healing");
        const healCost = await gameContract.healCost();
        console.log("healCost", healCost);
        const cost = ethers.utils.formatEther(healCost);
        console.log("cost", cost);
        const healTxn = await gameContract.heal({ value: healCost });
        await healTxn.wait();
        console.log("healTxn:", healTxn);
        setAttackState("healed");
      }
    } catch (error) {
      console.error("Error healing player:", error);
      setAttackState("");
    }
  };

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log("Ethereum object not found");
    }
  }, []);

  useEffect(() => {
    const fetchInvador = async () => {
      const incadorTxn = await gameContract.getInvador();
      console.log("Invador:", incadorTxn);
      setInvador(transformCharacterData(incadorTxn));
    };

    const onAttackComplete = (newBossHp, newPlayerHp) => {
      setInvador((prevState) => ({ ...prevState, hp: newBossHp.toNumber() }));
      setCharacterNFT((prevState) => ({
        ...prevState,
        hp: newPlayerHp.toNumber(),
      }));
    };

    const onHealComplete = (newPlayerIndex, newPlayerHp) => {
      setCharacterNFT((prevState) => ({
        ...prevState,
        hp: newPlayerHp.toNumber(),
      }));
    };

    if (gameContract) {
      fetchInvador();
      gameContract.on("AttackComplete", onAttackComplete);
      gameContract.on("HealComplete", onHealComplete);
    }

    return () => {
      if (gameContract) {
        gameContract.off("AttackComplete", onAttackComplete);
        gameContract.off("HealComplete", onHealComplete);
      }
    };
  }, [gameContract, setCharacterNFT]);

  const mintWeaponNFTAction = (weaponId) => async () => {
    console.log("weaponId", weaponId);
    try {
      console.log("try");
      if (gameContract) {
        console.log("gameContract", gameContract);
        console.log("Minting weapon in progress...");
        const mintTxn = await gameContract.mintWeaponNFT(weaponId);
        await mintTxn.wait();
        console.log("mintTxn:", mintTxn);
      }
    } catch (error) {
      console.warn("MintWeaponAction Error:", error);
    }
  };

  useEffect(() => {
    const onWeaponMint = async (sender, tokenId, weaponIndex) => {
      console.log(
        `WeaponNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} weaponIndex: ${weaponIndex.toNumber()}`
      );
    };

    if (gameContract) {
      gameContract.on("WeaponNFTMinted", onWeaponMint);
    }

    return () => {
      /*
       * When your component unmounts, let;s make sure to clean up this listener
       */
      if (gameContract) {
        gameContract.off("WeaponNFTMinted", onWeaponMint);
      }
    };
  }, [gameContract]);

  return (
    <div className="arena-container">
      {invador && (
        <div className="boss-container">
          <div className={`boss-content ${attackState}`}>
            <h2>🔥 {invador.name} 🔥</h2>
            <div className="image-content">
              <img src={invador.imageURI} alt={`invador ${invador.name}`} />
              <div className="health-bar">
                <progress value={invador.hp} max={invador.maxHp} />
                <p>{`${invador.hp} / ${invador.maxHp} HP`}</p>
              </div>
            </div>
          </div>
          <div className="attack-container">
            <button className="cta-button" onClick={runAttackAction}>
              {`💥 Attack ${invador.name}`}
            </button>
          </div>
        </div>
      )}

      {characterNFT && (
        <div className="players-container">
          <div className="player-container">
            <h2>Your Character</h2>
            <div className="player">
              <div className="image-content">
                <h2>{characterNFT.name}</h2>
                <img
                  src={characterNFT.imageURI}
                  alt={`Character ${characterNFT.name}`}
                />
                <div className="health-bar">
                  <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                  <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
              </div>
              <button
                className="cta-button heal-button"
                onClick={runHealAction}
              >
                {`❤️ Heal ❤️`}
              </button>
              {weaponNFT && (
                <div className="weapons">
                  <img
                    className="weapon-image"
                    src={weaponNFT.imageURI}
                    alt={`Weapon ${weaponNFT.name}`}
                  />
                </div>
              )}
              {/* <button
                className="cta-button mint-weapon-button"
                onClick={mintWeaponNFTAction(0)}
              >
                Mint Weapon
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arena;
