import { ethers } from "ethers";
import { LendingPoolFactory } from "../types/LendingPoolFactory";
import { LendingPool } from "../types/LendingPool";
import { ATokenFactory } from "../types/ATokenFactory";
import { AToken } from "../types/AToken";
import { Erc20Factory } from "../types/Erc20Factory";
import { Erc20 } from "../types/Erc20";
import { aTokens, Tokens, AaveContracts } from "../utils/constants";

import Job from "../helpers/job";

const wait = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });
class Job02 extends Job {
  public async exec(): Promise<void> {
    super.startLog();
    const provider = super.connect();
    const user = super.getUser();

    const signer01 = provider.getSigner(user.address);
    const signer02 = provider.getSigner(0);

    // Factory ADAI from Owner
    const aDAIContract: AToken = ATokenFactory.connect(aTokens.DAI, signer01);
    // GET addresses
    const addressSigner01 = await signer01.getAddress();
    const addressSigner02 = await signer02.getAddress();
    // GET BALANCE USER 01
    const balanceBefore01 = await aDAIContract.balanceOf(addressSigner01);
    // Transfer
    await aDAIContract.transfer(addressSigner02, balanceBefore01);

    const aDAIContractUser02: AToken = ATokenFactory.connect(
      aTokens.DAI,
      signer02
    );
    // GET BALANCE USER 02
    const balanceAfter02 = await aDAIContract.balanceOf(addressSigner02);
    // REDEM
    await aDAIContractUser02.redeem(balanceAfter02);

    const USDCContractu01: Erc20 = Erc20Factory.connect(Tokens.USDC, signer01);
    const usdcAmount = await USDCContractu01.balanceOf(addressSigner01);
    // console.log("USDC ---> ", usdcAmount.toString());
    await USDCContractu01.transfer(addressSigner02, usdcAmount);

    const DAIContractu02: Erc20 = Erc20Factory.connect(Tokens.DAI, signer02);
    const balance = await DAIContractu02.balanceOf(addressSigner02);

    // DEPOSIT AGAIN
    const lpContractu02: LendingPool = await LendingPoolFactory.connect(
      AaveContracts.LendingPool, // LENDING POOL
      signer02
    );
    // APPROVE FOR DAI
    await DAIContractu02.approve(
      AaveContracts.LendingPoolCore,
      ethers.constants.MaxUint256
    );

    const interestRateMode = 1;
    const referralCode = "0";
    const useAsCollateral = true;
    // DEPOSIT WITH THE NEW USER
    await lpContractu02.deposit(Tokens.DAI, balance, referralCode);
    // SET RESERVE AS COLLATERAL
    await lpContractu02.setUserUseReserveAsCollateral(
      Tokens.DAI,
      useAsCollateral
    );

    // BORROW WITH OTHER STABLE COIN
    await lpContractu02.borrow(
      Tokens.USDC,
      1000,
      interestRateMode,
      referralCode
    );
    super.endLog();
    return;
  }
}

export default Job02;
