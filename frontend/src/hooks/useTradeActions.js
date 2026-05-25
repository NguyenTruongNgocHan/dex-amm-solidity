import { useState } from "react";
import { getAMM, getTokenA, getTokenB } from "../lib/contracts";
import { CONTRACTS, SYMBOLS } from "../config/contracts";
import { parseToken, formatToken } from "../lib/format";
import { saveFailedTransaction } from "../features/risk/utils/failedTransactions";
import {
  createTradeReceipt,
  evidenceURIFromCid,
  hashJsonContent,
  saveTradeReceipt,
  subjectFromTxHash,
  uploadJsonToIPFS,
} from "../lib/ipfs";

function getErrorMessage(error, fallback) {
  return (
    error?.reason ||
    error?.shortMessage ||
    error?.info?.error?.message ||
    error?.data?.message ||
    error?.message ||
    fallback
  );
}

async function approveIfNeeded(token, owner, spender, amount, label, setStatus) {
  const allowance = await token.allowance(owner, spender);

  if (allowance >= amount) return;

  setStatus?.(`Approving ${label}...`);
  const approveTx = await token.approve(spender, amount);
  await approveTx.wait();
}

function calculateFee(amountIn) {
  const value = Number(amountIn || 0);

  if (!Number.isFinite(value)) return "0";

  return (value * 0.003).toFixed(8);
}

function sameHash(a, b) {
  return String(a || "").toLowerCase() === String(b || "").toLowerCase();
}

async function assertEvidenceContractReady(amm, subject) {
  try {
    await amm.getEvidence(subject);
  } catch (error) {
    throw new Error(
      `AMM contract at current frontend address does not expose Evidence Registry. Redeploy and sync frontend. Original error: ${getErrorMessage(
        error,
        "Evidence registry unavailable."
      )}`
    );
  }
}

export default function useTradeActions(signer, reload, setStatus) {
  const [pending, setPending] = useState(false);

  async function uploadAndAnchorReceipt(amm, receipt) {
    const upload = await uploadJsonToIPFS(
      receipt,
      `trade-receipt-${receipt.txHash}.json`
    );

    const evidenceURI = evidenceURIFromCid(upload.cid);
    const subject = subjectFromTxHash(receipt.txHash);
    const contentHash = receipt.receiptHash || hashJsonContent(receipt);

    let anchorTxHash = "";
    let anchorStatus = "not-anchored";
    let anchorError = "";

    try {
      setStatus?.("Checking Evidence Registry on deployed AMM...");
      await assertEvidenceContractReady(amm, subject);

      setStatus?.("Anchoring receipt hash on-chain...");

      const anchorTx = await amm.submitEvidence(
        subject,
        1,
        contentHash,
        evidenceURI
      );

      await anchorTx.wait();

      anchorTxHash = anchorTx.hash;
      anchorStatus = "anchored";
    } catch (error) {
      const message = getErrorMessage(error, "Evidence anchoring failed.");
      console.error("Evidence anchoring failed:", error);

      try {
        const existing = await amm.getEvidence(subject);
        const existingHash = existing.contentHash ?? existing[1];

        if (sameHash(existingHash, contentHash)) {
          anchorStatus = "anchored";
          anchorError =
            "Evidence already existed on-chain with the same content hash.";
        } else {
          anchorStatus = "anchor-failed";
          anchorError = `Evidence exists but content hash is different. ${message}`;
        }
      } catch {
        anchorStatus = "anchor-failed";
        anchorError = message;
      }
    }

    const savedReceipt = {
      ...receipt,
      cid: upload.cid,
      ipfsUrl: upload.url,
      ipfsMode: upload.mode,
      evidenceURI,
      evidenceSubject: subject,
      evidenceContentHash: contentHash,
      anchorTxHash,
      anchorStatus,
      anchorError,
    };

    saveTradeReceipt(savedReceipt);

    return savedReceipt;
  }

  async function swapTokenAForTokenB(amountIn, minAmountOut = "0") {
    if (!signer) {
      setStatus?.("Please connect wallet first.");
      return;
    }

    try {
      setPending(true);

      const amm = getAMM(signer);
      const tokenA = getTokenA(signer);
      const ammAddress = await amm.getAddress();
      const trader = await signer.getAddress();

      const parsedAmountIn = parseToken(amountIn);
      const parsedMinAmountOut = parseToken(minAmountOut);

      if (parsedAmountIn <= 0n) {
        throw new Error("Please enter swap amount greater than 0.");
      }

      const balance = await tokenA.balanceOf(trader);

      if (balance < parsedAmountIn) {
        throw new Error(`Insufficient ${SYMBOLS.tokenA} balance.`);
      }

      const quotedOut = await amm.getAmountOut(CONTRACTS.tokenA, parsedAmountIn);

      if (quotedOut < parsedMinAmountOut) {
        throw new Error("Slippage too high. Please refresh quote.");
      }

      await approveIfNeeded(
        tokenA,
        trader,
        ammAddress,
        parsedAmountIn,
        SYMBOLS.tokenA,
        setStatus
      );

      setStatus?.(`Swapping ${SYMBOLS.tokenA} to ${SYMBOLS.tokenB}...`);

      const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

      const swapTx = await amm[
        "swapExactTokenAForTokenB(uint256,uint256,uint256)"
      ](parsedAmountIn, parsedMinAmountOut, deadline);

      const receipt = await swapTx.wait();

      const tradeReceipt = createTradeReceipt({
        txHash: swapTx.hash,
        trader,
        direction: "A_TO_B",
        tokenIn: SYMBOLS.tokenA,
        tokenOut: SYMBOLS.tokenB,
        amountIn,
        minAmountOut,
        amountOut: formatToken(quotedOut, 18, 8),
        blockNumber: receipt.blockNumber,
        contractAddress: ammAddress,
        slippageTolerance: "User-defined in swap panel",
        priceImpact: "Calculated in frontend preview",
        fee: `${calculateFee(amountIn)} ${SYMBOLS.tokenA}`,
      });

      const savedReceipt = await uploadAndAnchorReceipt(amm, tradeReceipt);

      setStatus?.(
        savedReceipt.anchorStatus === "anchored"
          ? "Swap successful. Receipt uploaded and anchored on-chain."
          : `Swap successful. Receipt saved, but on-chain anchor failed: ${savedReceipt.anchorError}`
      );

      await reload?.();
    } catch (error) {
      console.error(error);

      saveFailedTransaction({
        title: `Failed ${SYMBOLS.tokenA} → ${SYMBOLS.tokenB} Swap`,
        user: signer ? await signer.getAddress().catch(() => "") : "",
        amountIn,
        tokenIn: SYMBOLS.tokenA,
        tokenOut: SYMBOLS.tokenB,
        reason: getErrorMessage(error, "Swap failed."),
      });

      setStatus?.(getErrorMessage(error, "Swap failed."));
    } finally {
      setPending(false);
    }
  }

  async function swapTokenBForTokenA(amountIn, minAmountOut = "0") {
    if (!signer) {
      setStatus?.("Please connect wallet first.");
      return;
    }

    try {
      setPending(true);

      const amm = getAMM(signer);
      const tokenB = getTokenB(signer);
      const ammAddress = await amm.getAddress();
      const trader = await signer.getAddress();

      const parsedAmountIn = parseToken(amountIn);
      const parsedMinAmountOut = parseToken(minAmountOut);

      if (parsedAmountIn <= 0n) {
        throw new Error("Please enter swap amount greater than 0.");
      }

      const balance = await tokenB.balanceOf(trader);

      if (balance < parsedAmountIn) {
        throw new Error(`Insufficient ${SYMBOLS.tokenB} balance.`);
      }

      const quotedOut = await amm.getAmountOut(CONTRACTS.tokenB, parsedAmountIn);

      if (quotedOut < parsedMinAmountOut) {
        throw new Error("Slippage too high. Please refresh quote.");
      }

      await approveIfNeeded(
        tokenB,
        trader,
        ammAddress,
        parsedAmountIn,
        SYMBOLS.tokenB,
        setStatus
      );

      setStatus?.(`Swapping ${SYMBOLS.tokenB} to ${SYMBOLS.tokenA}...`);

      const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

      const swapTx = await amm[
        "swapExactTokenBForTokenA(uint256,uint256,uint256)"
      ](parsedAmountIn, parsedMinAmountOut, deadline);

      const receipt = await swapTx.wait();

      const tradeReceipt = createTradeReceipt({
        txHash: swapTx.hash,
        trader,
        direction: "B_TO_A",
        tokenIn: SYMBOLS.tokenB,
        tokenOut: SYMBOLS.tokenA,
        amountIn,
        minAmountOut,
        amountOut: formatToken(quotedOut, 18, 8),
        blockNumber: receipt.blockNumber,
        contractAddress: ammAddress,
        slippageTolerance: "User-defined in swap panel",
        priceImpact: "Calculated in frontend preview",
        fee: `${calculateFee(amountIn)} ${SYMBOLS.tokenB}`,
      });

      const savedReceipt = await uploadAndAnchorReceipt(amm, tradeReceipt);

      setStatus?.(
        savedReceipt.anchorStatus === "anchored"
          ? "Swap successful. Receipt uploaded and anchored on-chain."
          : `Swap successful. Receipt saved, but on-chain anchor failed: ${savedReceipt.anchorError}`
      );

      await reload?.();
    } catch (error) {
      console.error(error);

      saveFailedTransaction({
        title: `Failed ${SYMBOLS.tokenB} → ${SYMBOLS.tokenA} Swap`,
        user: signer ? await signer.getAddress().catch(() => "") : "",
        amountIn,
        tokenIn: SYMBOLS.tokenB,
        tokenOut: SYMBOLS.tokenA,
        reason: getErrorMessage(error, "Swap failed."),
      });

      setStatus?.(getErrorMessage(error, "Swap failed."));
    } finally {
      setPending(false);
    }
  }

  return {
    pending,
    swapTokenAForTokenB,
    swapTokenBForTokenA,
  };
}