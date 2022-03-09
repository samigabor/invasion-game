const CONTRACT_ADDRESS = "0x4A7686AC03DF970F01E2699a710aAFbb13A05613";
const OPENSEA_COLLECTION_RINKEBY =
  "https://testnets.opensea.io/collection/heroes-r6sxy87cno";

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
