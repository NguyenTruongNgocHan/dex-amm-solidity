import { ethers } from "ethers";
import { CONTRACTS } from "../config/contracts";

import SimpleAMMAbi from "../abi/SimpleAMM.json";
import MockERC20Abi from "../abi/MockERC20.json";
import LPTokenAbi from "../abi/LPToken.json";

export function getAMM(signerOrProvider) {
  return new ethers.Contract(CONTRACTS.amm, SimpleAMMAbi, signerOrProvider);
}

export function getTokenA(signerOrProvider) {
  return new ethers.Contract(CONTRACTS.tokenA, MockERC20Abi, signerOrProvider);
}

export function getTokenB(signerOrProvider) {
  return new ethers.Contract(CONTRACTS.tokenB, MockERC20Abi, signerOrProvider);
}

export function getLPToken(lpTokenAddress, signerOrProvider) {
  return new ethers.Contract(lpTokenAddress, LPTokenAbi, signerOrProvider);
}

export function format18(value) {
  return ethers.formatUnits(value, 18);
}

export function parse18(value) {
  return ethers.parseUnits(value || "0", 18);
}