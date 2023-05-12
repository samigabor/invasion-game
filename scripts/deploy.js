const hre = require("hardhat");

/**
 * npx hardhat run --network polygon scripts/deploy.js
 * npx hardhat flatten contracts/Invasion.sol > flatted.sol
 */
async function main() {
  const Invasion = await hre.ethers.getContractFactory("Invasion");
  console.log("Deploying Invasion...")

  const invasion = await Invasion.deploy(
    ["Iron Man", "Captain America", "Hulk"], // Names
    [
      "https://i.pinimg.com/originals/1a/26/63/1a2663ae5181e22babb719df3ad26c4c.jpg",
      "https://www.sideshow.com/storage/product-images/904685/captain-america__silo.png",
      "https://www.sainte-anastasie.org/img/images_3/el-sndrome-de-hulk-la-pesadilla-de-bruce-banner_4.jpg",
    ],
    [300, 250, 400], // HP values
    [100, 50, 175], // Attack damage values
    "Loki",
    "https://cdn.mos.cms.futurecdn.net/MEtSje52B26WQxrYJgdvx4-1200-80.jpg",
    10000,
    50,
    ["The Hammer", "Infinity Gauntlet"], // Weapon Names
    [
      "https://www.wonderlandcostumes.com.au/assets/full/R_35639.jpg?20210319174656",
      "https://mlpnk72yciwc.i.optimole.com/cqhiHLc.WqA8~2eefa/w:600/h:853/q:75/https://bleedingcool.com/wp-content/uploads/2018/02/MARVEL-LEGENDS-SERIES-INFINITY-GAUNTLET-oop-2.jpg",
    ], // weapon images
    [500, 1000] // Attack damage values
  );
  // https://static.wikia.nocookie.net/avengers-assemble/images/e/ea/Revo-Cap.png/revision/latest/scale-to-width-down/1200?cb=20170615073447
  console.log("Invasion deployed to:", invasion.address);

  await invasion.deployed();
  console.log("Invasion deployed already:", invasion.address);

  console.log("Invasion deployed to:", invasion.address);

  // let txn;
  // // there are 3 NFT types: ["Iron Man", "Captain America", "Hulk"] with IDs: 0, 1, 2
  // txn = await invasion.mintCharacterNFT(0);
  // await txn.wait();
  // console.log("Minted NFT #1", await invasion.tokenURI(1));

  // txn = await invasion.mintCharacterNFT(1);
  // await txn.wait();
  // console.log("Minted NFT #2", await invasion.tokenURI(2));

  // txn = await invasion.mintCharacterNFT(2);
  // await txn.wait();
  // console.log("Minted NFT #3", await invasion.tokenURI(3));

  // txn = await invasion.attackInvador();
  // await txn.wait();

  // txn = await invasion.mintWeaponNFT(0);
  // await txn.wait();
  // console.log("Minted NFT Weapon:", await invasion.tokenURI(0));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
