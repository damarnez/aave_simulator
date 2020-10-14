import { ethers } from "ethers";
import { LendingPoolFactory } from "../types/LendingPoolFactory";
import { LendingPool } from "../types/LendingPool";
import { ATokenFactory } from "../types/ATokenFactory";
import { AToken } from "../types/AToken";
import { Erc20Factory } from "../types/Erc20Factory";
import { Erc20 } from "../types/Erc20";
import { aTokens, Tokens, AaveContracts } from "../utils/constants";

import Job from "../helpers/job";

class Job02 extends Job {
  public async exec(): Promise<void> {
    super.startLog();
    const provider = super.connect();
    const user = super.getUser();

    const signer01 = provider.getSigner(user.address);
    const signer02 = provider.getSigner(0);

    // Factory ADAI from Owner
    const aDAIContract: AToken = ATokenFactory.connect(aTokens.DAI, signer01);
    // Get addresses
    const addressSigner01 = await signer01.getAddress();
    const addressSigner02 = await signer02.getAddress();
    // Get balance 01
    const balanceBefore01 = await aDAIContract.balanceOf(addressSigner01);
    // Transfer aDAI tokens to user02
    await aDAIContract.transfer(addressSigner02, balanceBefore01);

    const aDAIContractUser02: AToken = ATokenFactory.connect(
      aTokens.DAI,
      signer02
    );
    // Get balance user02
    const balanceAfter02 = await aDAIContract.balanceOf(addressSigner02);
    // Redem coins
    await aDAIContractUser02.redeem(balanceAfter02);

    const USDCContractu01: Erc20 = Erc20Factory.connect(Tokens.USDC, signer01);
    const usdcAmount = await USDCContractu01.balanceOf(addressSigner01);

    await USDCContractu01.transfer(addressSigner02, usdcAmount);

    const DAIContractu02: Erc20 = Erc20Factory.connect(Tokens.DAI, signer02);
    const balance = await DAIContractu02.balanceOf(addressSigner02);

    // Second deposit
    const lpContractu02: LendingPool = await LendingPoolFactory.connect(
      AaveContracts.LendingPool, // LENDING POOL
      signer02
    );
    // Approve DAI
    await DAIContractu02.approve(
      AaveContracts.LendingPoolCore,
      ethers.constants.MaxUint256
    );

    const interestRateMode = 1;
    const referralCode = "0";
    const useAsCollateral = true;
    // Deposit with the new user
    await lpContractu02.deposit(Tokens.DAI, balance, referralCode);
    // Set reserve as collateral
    await lpContractu02.setUserUseReserveAsCollateral(
      Tokens.DAI,
      useAsCollateral
    );

    // Borrow with other stable coin
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
