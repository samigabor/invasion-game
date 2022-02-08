const CONTRACT_ADDRESS = "0x2eD8EdD50FF19271F3fee9bC174a36CbA9F1d6e6";
const OPENSEA_COLLECTION_RINKEBY =
  "https://testnets.opensea.io/collection/heroes-a5ah4x2wks";

const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
  };
};

export { CONTRACT_ADDRESS, OPENSEA_COLLECTION_RINKEBY, transformCharacterData };
