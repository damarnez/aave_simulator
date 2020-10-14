import { ethers } from "ethers";

import { LendingPoolFactory } from "../types/LendingPoolFactory";
import { LendingPool } from "../types/LendingPool";
import { Erc20Factory } from "../types/Erc20Factory";
import { Erc20 } from "../types/Erc20";
import { Tokens, AaveContracts, abiOracle } from "../utils/constants";
import { LendingPoolAddressesProviderFactory } from "../types/LendingPoolAddressesProviderFactory";
import { LendingPoolAddressesProvider } from "../types/LendingPoolAddressesProvider";
import { ChainlinkProxyPriceProviderFactory } from "../types/ChainlinkProxyPriceProviderFactory";
import { ChainlinkProxyPriceProvider } from "../types/ChainlinkProxyPriceProvider";

import { caculateNewBorrorHFToOneDotOne } from "../utils/calculations";
import { printBigNumers } from "../utils/debug";
import Job from "../helpers/job";

class Job01 extends Job {
  public async exec(): Promise<void> {
    super.startLog();
    const user = super.getUser();

    // Add extra unlock accounts
    super.addUnlockAccounts([
      AaveContracts.Oracle,
      AaveContracts.OracleOwner,
      AaveContracts.Sybil,
      user.extra[0],
    ]);

    const provider = super.connect();

    const signer01 = provider.getSigner(user.address);
    const signer02 = provider.getSigner(user.extra[0]);

    const addressSigner01 = await signer01.getAddress();
    const addressSigner02 = await signer02.getAddress();

    /************** DEBUG *********/

    // This is the liquidator (my new friend) user and need to have DAI and ETH because
    // ganache don't allow transfer from the generated accounts ETH to the
    // mainnet accounts.

    const daiContract: Erc20 = Erc20Factory.connect(Tokens.DAI, signer02);
    const balanceHolderDAI = await daiContract.balanceOf(addressSigner02);

    const balanceEth = await signer02.getBalance();
    printBigNumers("BALANCE DAI : ", balanceHolderDAI);
    printBigNumers("BALANCE ETH : ", balanceEth);
    /********************/
    // Get heath factor
    const lpContractu01: LendingPool = await LendingPoolFactory.connect(
      AaveContracts.LendingPool, // LENDING POOL
      signer01
    );

    const userData = await lpContractu01.getUserAccountData(addressSigner01);
    /************** DEBUG *********/
    printBigNumers("PREV HF : ", userData.healthFactor);
    printBigNumers("totalBorrowsETH ", userData.totalBorrowsETH);

    /************************/

    // Get Address ORACLE
    const LendingPollAddress: LendingPoolAddressesProvider = LendingPoolAddressesProviderFactory.connect(
      AaveContracts.LendingPoolAddress,
      provider
    );
    const addressOracle: string = await LendingPollAddress.getPriceOracle();
    if (addressOracle !== AaveContracts.Oracle) {
      // Check is the same oracle
      throw new Error("Different Oracle");
    }
    // Load oracle Chainlink
    const oracleOwnerSigner = provider.getSigner(AaveContracts.OracleOwner);
    const oracleContract: ChainlinkProxyPriceProvider = ChainlinkProxyPriceProviderFactory.connect(
      addressOracle,
      oracleOwnerSigner
    );
    const originalPriceDAI = await oracleContract.getAssetPrice(Tokens.DAI);

    // Update health factor to 1.1
    const interestRateMode = 1;
    const referralCode = "0";
    const borrowSize = caculateNewBorrorHFToOneDotOne(
      {
        totalBorrowsEth: userData.totalBorrowsETH,
        healthFactor: userData.healthFactor,
      },
      originalPriceDAI
    );
    await lpContractu01.borrow(
      Tokens.DAI,
      borrowSize,
      interestRateMode,
      referralCode
    );

    /******* DEBUG *********/
    // Check the updated HF
    const userDataUpdated = await lpContractu01.getUserAccountData(
      addressSigner01
    );
    printBigNumers("After add a borrow HF : ", userDataUpdated.healthFactor);
    printBigNumers("totalBorrowsETH ", userDataUpdated.totalBorrowsETH);
    /*****************************/

    // Force oracle check the price in aave oracle
    oracleContract.setAssetSources(
      [Tokens.DAI],
      ["0x0000000000000000000000000000000000000000"]
    );

    const sybilSigner = provider.getSigner(AaveContracts.Sybil);
    // UPDATE THE PRICE ORACLE
    // TODO: I don't found the contract of this oracle deployed. Thats why I use the abi to load the smartcontract.
    const contractAaveOracle = new ethers.Contract(
      AaveContracts.AaveOracleFallback,
      abiOracle,
      sybilSigner
    );

    // Bump the price of the DAI and move the healt factor down 0.5
    await contractAaveOracle.submitProphecy(
      Tokens.DAI,
      originalPriceDAI.mul(10),
      originalPriceDAI.mul(10)
    );

    /************** DEBUG *********/
    // Check the updated HF
    const userDataPriceDown = await lpContractu01.getUserAccountData(
      addressSigner01
    );
    printBigNumers(
      "After bump the price HF : ",
      userDataPriceDown.healthFactor
    );

    printBigNumers("Total liquidity : ", userDataPriceDown.totalLiquidityETH);
    /*************************/

    // Liquidate user 01 with user 02
    const coinContract: Erc20 = Erc20Factory.connect(Tokens.DAI, signer02);
    await coinContract.approve(
      AaveContracts.LendingPoolCore,
      ethers.constants.MaxUint256
    );
    const amount = await coinContract.balanceOf(addressSigner02);
    printBigNumers("DAI USER : ", amount);

    const lpContractu02: LendingPool = await LendingPoolFactory.connect(
      AaveContracts.LendingPool, // LENDING POOL
      signer02
    );

    await lpContractu02.liquidationCall(
      Tokens.ETH,
      Tokens.DAI,
      addressSigner01,
      ethers.constants.MaxUint256,
      true
    );

    super.endLog();
    return;
  }
}

export default Job01;
