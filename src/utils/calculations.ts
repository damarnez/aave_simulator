import { ethers } from "ethers";
import Bignumber from "bignumber.js";

interface CalculationData {
  totalBorrowsEth: ethers.BigNumber;
  healthFactor: ethers.BigNumber;
}

const parseBN = (number: ethers.BigNumber): Bignumber => {
  return new Bignumber(ethers.utils.formatUnits(number.toString()));
};
export const caculateNewBorrorHFToOneDotOne = (
  data: CalculationData,
  priceCoin: ethers.BigNumber
): ethers.BigNumber => {
  // I don't use the library ethers.BigNumber because I found a
  // error with the operator mul.

  // Transform in bignumber.js
  const totalBorrowsEthBN = parseBN(data.totalBorrowsEth);
  const priceCoinBN = parseBN(priceCoin);

  // Calculations
  const ethTotalNeeded = parseBN(data.totalBorrowsEth)
    .multipliedBy(parseBN(data.healthFactor))
    .div("1.1");

  const ethNeeded = ethTotalNeeded.minus(totalBorrowsEthBN);
  const DAINeeded = ethNeeded.div(priceCoinBN);

  // Transform result in ethers.BigNumber again.
  return ethers.utils.parseUnits(
    DAINeeded.toFixed(18, Bignumber.ROUND_CEIL),
    18
  );
};
