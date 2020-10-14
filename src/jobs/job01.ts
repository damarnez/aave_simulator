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

    //
    const signer01 = provider.getSigner(user.address);
    const signer02 = provider.getSigner(user.extra[0]);
    const addressSigner01 = await signer01.getAddress();
    const addressSigner02 = await signer02.getAddress();

    // Get heath factor
    const lpContractu01: LendingPool = await LendingPoolFactory.connect(
      AaveContracts.LendingPool, // LENDING POOL
      signer01
    );

    const userData = await lpContractu01.getUserAccountData(addressSigner01);
    //************** DEBUG *********/
    printBigNumers("PREV HF : ", userData.healthFactor);
    //************************/

    // Update health factor to 1.1
    const interestRateMode = 1;
    const referralCode = "0";
    const borrowSize = caculateNewBorrorHFToOneDotOne(userData);
    const borrow = await lpContractu01.borrow(
      Tokens.DAI,
      borrowSize,
      interestRateMode,
      referralCode
    );

    //************** DEBUG *********/
    // Check the updated HF
    const userDataUpdated = await lpContractu01.getUserAccountData(
      addressSigner01
    );
    printBigNumers("After add a borrow HF : ", userDataUpdated.healthFactor);
    //*****************************/

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
    // Force oracle check the price in aave oracle
    oracleContract.setAssetSources(
      [Tokens.DAI],
      ["0x0000000000000000000000000000000000000000"]
    );
    // GET PRICE DAI
    const originalPriceDAI = await oracleContract.getAssetPrice(Tokens.DAI);
    const sybilSigner = provider.getSigner(AaveContracts.Sybil);
    // UPDATE THE PRICE ORACLE
    // TODO: I don't found the contract of this oracle deployed. Thats why I use the abi to load.
    const contractAaveOracle = new ethers.Contract(
      AaveContracts.AaveOracleFallback,
      abiOracle,
      sybilSigner
    );

    // Bump the price and move the healt factor down 0.5
    await contractAaveOracle.submitProphecy(
      Tokens.DAI,
      originalPriceDAI.mul(10),
      originalPriceDAI.mul(10)
    );

    //************** DEBUG *********/
    // Check the updated HF
    const userDataPriceDown = await lpContractu01.getUserAccountData(
      addressSigner01
    );
    printBigNumers(
      "After bump the price HF : ",
      userDataPriceDown.healthFactor
    );
    //*************************/

    // Liquidate user 01 with user 02
    const coinContract: Erc20 = Erc20Factory.connect(Tokens.USDC, signer02);
    await coinContract.approve(
      AaveContracts.LendingPoolCore,
      ethers.constants.MaxUint256
    );

    const lpContractu02: LendingPool = await LendingPoolFactory.connect(
      AaveContracts.LendingPool, // LENDING POOL
      signer02
    );
    try {
      await lpContractu02.liquidationCall(
        Tokens.ETH,
        Tokens.DAI,
        addressSigner01,
        ethers.constants.MaxUint256,
        true
      );
    } catch (error) {
      console.error("ERROR LIQUIDATION : ", error);
    }
    super.endLog();
    return;
  }
}

export default Job01;