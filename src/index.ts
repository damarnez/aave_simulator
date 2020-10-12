import { ethers } from "ethers";

import ganache from "ganache-cli";

import { LendingPoolFactory } from "./types/LendingPoolFactory";
import { LendingPool } from "./types/LendingPool";
import { Erc20Factory } from "./types/Erc20Factory";
import { Erc20 } from "./types/Erc20";
import { aTokens, AaveContracts } from "./utils/constants";

const wait = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });

const connect = async () => {
  try {
    const user01 = "0x0056D1fd2ca3c0F3A7B6ed6CDd1F1F104B4BF9A9";
    // console.log("GANACHE : ", ganache);
    // @WARNING  INFURA DOESN'T WORK
    // https://infura.io/docs/ethereum/add-ons/archiveData

    const web3Prov = ganache.provider({
      fork:
        "https://eth-mainnet.alchemyapi.io/v2/k1Q5U-oo9EbEVTFTTQBNJRJZ86suQuO9",
      fork_block_number: "9248349",
      unlocked_accounts: [user01],
      db_path: `./db/${user01}`,
      forkCacheSize: -1,
      locked: false,
      default_balance_ether: 10,
    });

    await wait();

    const provider = new ethers.providers.Web3Provider(web3Prov);
    const listAddress = await provider.listAccounts();

    console.log("LIST: ", listAddress);

    await wait();
    const signer01 = provider.getSigner(user01);
    const signer02 = provider.getSigner(0);

    await wait();
    const lpContract: LendingPool = await LendingPoolFactory.connect(
      AaveContracts.LeendingPool, // LENDING POOL
      signer01
    );
    await wait();
    const ethBalance01 = await signer01.getBalance();
    const ethBalance02 = await signer02.getBalance();
    console.log(
      "USER01 - ETH BALANCE : ",
      ethers.utils.formatEther(ethBalance01),
      "\n",
      "USER02 - ETH BALANCE : ",
      ethers.utils.formatEther(ethBalance02)
    );

    // Factory ADAI from Owner
    const aDAIContract: Erc20 = Erc20Factory.connect(aTokens.DAI, signer01);

    // GET addresses
    const addressSigner01 = await signer01.getAddress();
    const addressSigner02 = await signer02.getAddress();

    await wait();
    // GEt Balances
    const balanceBefore01 = await aDAIContract.balanceOf(addressSigner01);
    const balanceBefore02 = await aDAIContract.balanceOf(addressSigner02);

    console.log(`
    USER 1 - ${balanceBefore01.toString()}
    USER01 - BALANCE ${ethers.utils.formatUnits(balanceBefore01, 18)}
    USER02 - BALANCE ${ethers.utils.formatUnits(balanceBefore02, 18)}
  `);
    // Approve
    // await aDAIContract.approve(addressSigner01, ethers.constants.MaxUint256);
    // console.log("- APPROVE -");
    // const allowance = await aDAIContract.allowance(
    //   addressSigner01,
    //   addressSigner02
    // );
    // console.log("ALLOWANCE : ", allowance.toString());
    const transferAmount = "1";
    console.log("TRANSFER: ", transferAmount);

    await wait();
    console.log(
      `TransferFrom: ${addressSigner01} to ${addressSigner02} value ${transferAmount}`
    );
    const resp2 = await aDAIContract.transfer(addressSigner02, transferAmount);
    console.log("TRANSFER DONE!", resp2);
    await wait();
    const balanceAfter01 = await aDAIContract.balanceOf(addressSigner01);
    const balanceAfter02 = await aDAIContract.balanceOf(addressSigner02);
    console.log("USER01 - BALANCE UPDATED", balanceAfter01.toString());
    console.log("USER02 - BALANCE UPDATED", balanceAfter02.toString());

    // const res = await lpContract.setUserUseReserveAsCollateral(
    //   "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    //   useAsCollateral
    // );
    // console.log("RESERVES : ", res);
    // const blockNumber = await provider.getBlockNumber();

    // console.log("PROVICER", provider);
  } catch (error) {
    console.log("ERROR: ", error);
  }
};

connect().then(console.log).catch(console.log);
