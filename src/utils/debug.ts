import { ethers } from "ethers";

export const printBigNumers = (
  text: string,
  numbers: ethers.BigNumber,
  units = 18
) => {
  console.log(text, ethers.utils.formatUnits(numbers, units));
};
