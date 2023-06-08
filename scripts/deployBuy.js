const { ethers } = require('hardhat');
const hre = require("hardhat");

async function main() {
  const tokenPrice = ethers.utils.parseEther("0.02");
  const BuyToken = await hre.ethers.getContractFactory("BuyToken");
  const buyToken = await BuyToken.deploy("0xED5A8c7a731D181a381f78064bd9bd4B129cB567",tokenPrice);

  await buyToken.deployed();

  console.log(
    `buyToken contract deploye to ${buyToken.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});