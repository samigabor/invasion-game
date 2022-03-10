const CONTRACT_ADDRESS = "0xF0306C899d9F93dCF6068246Fb4d54aB5376c462";
const OPENSEA_COLLECTION_RINKEBY =
  "https://testnets.opensea.io/collection/heroes-ppiectmfuc";

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
