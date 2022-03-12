import React, { useEffect, useState } from "react";
import { useEthers } from "../context";
import { transformCharacterData } from "../utils/helper-functions";
import "../styles/Arena.css";

const Arena = ({ characterNFT, setCharacterNFT, weaponNFT }) => {
  const { contract } = useEthers();

  const [invador, setInvador] = useState(null);
  const [attackState, setAttackState] = useState("");

  const runAttackAction = async () => {
    try {
      if (contract) {
        setAttackState("attacking");
        const attackTxn = await contract.attackInvador();
        await attackTxn.wait();
        setAttackState("hit");
      }
    } catch (error) {
      console.error("Error attacking invador:", error);
      setAttackState("");
    }
  };

  const runHealAction = async () => {
    try {
      if (contract) {
        setAttackState("healing");
        const healCost = await contract.healCost();
        const healTxn = await contract.heal({ value: healCost });
        await healTxn.wait();
        setAttackState("healed");
      }
    } catch (error) {
      console.error("Error healing player:", error);
      setAttackState("");
    }
  };

  useEffect(() => {
    const fetchInvador = async () => {
      const incadorTxn = await contract.getInvador();
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

    if (contract) {
      fetchInvador();
      contract.on("AttackComplete", onAttackComplete);
      contract.on("HealComplete", onHealComplete);
    }

    return () => {
      if (contract) {
        contract.off("AttackComplete", onAttackComplete);
        contract.off("HealComplete", onHealComplete);
      }
    };
  }, [contract, setCharacterNFT]);

  useEffect(() => {
    const onWeaponMint = async (sender, tokenId, weaponIndex) => {
      console.log(
        `WeaponNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} weaponIndex: ${weaponIndex.toNumber()}`
      );
    };

    if (contract) {
      contract.on("WeaponNFTMinted", onWeaponMint);
    }

    return () => {
      if (contract) {
        contract.off("WeaponNFTMinted", onWeaponMint);
      }
    };
  }, [contract]);

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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arena;
