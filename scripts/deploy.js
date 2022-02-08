const hre = require("hardhat");

async function main() {
  const Invasion = await hre.ethers.getContractFactory("Invasion");
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
    50
  );
  // https://static.wikia.nocookie.net/avengers-assemble/images/e/ea/Revo-Cap.png/revision/latest/scale-to-width-down/1200?cb=20170615073447

  await invasion.deployed();

  console.log("Invasion deployed to:", invasion.address);

  let txn;
  // there are 3 NFT types: ["Protos", "Terran", "Zerg"] with IDs: 0, 1, 2
  txn = await invasion.mintCharacterNFT(0);
  await txn.wait();
  console.log("Minted NFT #1", await invasion.tokenURI(1));

  txn = await invasion.mintCharacterNFT(1);
  await txn.wait();
  console.log("Minted NFT #2", await invasion.tokenURI(2));

  txn = await invasion.mintCharacterNFT(2);
  await txn.wait();
  console.log("Minted NFT #3", await invasion.tokenURI(3));

  txn = await invasion.attackInvador();
  await txn.wait();

  // txn = await invasion.attackInvador();
  // await txn.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
