import { ethers } from "ethers";
import { CONTRACTS } from "../config/contracts";

import SimpleAMMArtifact from "../abi/SimpleAMM.json";
import MockERC20Artifact from "../abi/MockERC20.json";
import LPTokenArtifact from "../abi/LPToken.json";

function getAbi(artifactOrAbi) {
  return artifactOrAbi.abi ?? artifactOrAbi;
}

export function getAMM(signerOrProvider) {
  return new ethers.Contract(
    CONTRACTS.amm,
    getAbi(SimpleAMMArtifact),
    signerOrProvider
  );
}

export function getTokenA(signerOrProvider) {
  return new ethers.Contract(
    CONTRACTS.tokenA,
    getAbi(MockERC20Artifact),
    signerOrProvider
  );
}

export function getTokenB(signerOrProvider) {
  return new ethers.Contract(
    CONTRACTS.tokenB,
    getAbi(MockERC20Artifact),
    signerOrProvider
  );
}

export function getLPToken(lpTokenAddress, signerOrProvider) {
  return new ethers.Contract(
    lpTokenAddress,
    getAbi(LPTokenArtifact),
    signerOrProvider
  );
}