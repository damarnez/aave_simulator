import { utils, BigNumber } from "ethers";

const DEBUG = process.env.DEBUG === "true" || false;

export const printBigNumers = (
  text: string,
  numbers: BigNumber,
  units = 18
): void => {
  return DEBUG && console.log(text, utils.formatUnits(numbers, units));
};
