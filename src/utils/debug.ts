import { ethers } from "ethers";

const DEBUG = process.env.DEBUG === "true" || false;

export const printBigNumers = (
  text: string,
  numbers: ethers.BigNumber,
  units = 18
) => {
  DEBUG && console.log(text, ethers.utils.formatUnits(numbers, units));
};
