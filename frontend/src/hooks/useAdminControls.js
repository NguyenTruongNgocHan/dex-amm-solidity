import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { CONTRACTS } from "../config/contracts";
import { getAMM, getStakingRewards } from "../lib/contracts";

export const ROLE_KEYS = {
  ADMIN: "ADMIN",
  OPERATOR: "OPERATOR",
  AUDITOR: "AUDITOR",
};

export const ROLE_LABELS = {
  ADMIN: "Admin",
  OPERATOR: "Operator",
  AUDITOR: "Auditor",
};

export function getRoleBytes(roleKey) {
  if (roleKey === ROLE_KEYS.ADMIN) return ethers.ZeroHash;
  if (roleKey === ROLE_KEYS.OPERATOR) return ethers.id("OPERATOR_ROLE");
  if (roleKey === ROLE_KEYS.AUDITOR) return ethers.id("AUDITOR_ROLE");
  throw new Error("Unsupported role");
}

export default function useAdminControls(wallet) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [ammState, setAmmState] = useState(null);
  const [stakingState, setStakingState] = useState(null);

  const connected = Boolean(wallet?.address && wallet?.provider);

  const contracts = useMemo(() => {
    if (!wallet?.provider) return null;

    return {
      amm: getAMM(wallet.provider),
      staking: getStakingRewards(wallet.provider),
    };
  }, [wallet?.provider]);

  const signerContracts = useCallback(() => {
    if (!wallet?.signer) {
      throw new Error("Connect wallet first.");
    }

    return {
      amm: getAMM(wallet.signer),
      staking: getStakingRewards(wallet.signer),
    };
  }, [wallet?.signer]);

  const reload = useCallback(async () => {
    if (!connected || !contracts) {
      setAmmState(null);
      setStakingState(null);
      return;
    }

    try {
      setLoading(true);

      const [
        ammAdmin,
        ammOperator,
        ammAuditor,
        ammPaused,
        tradingEnabled,
        lpApprovalRequired,
        participantStatus,
      ] = await contracts.amm.getRoleSummary(wallet.address);

      const [
        isPaused,
        isTradingEnabled,
        isTokenAWhitelisted,
        isTokenBWhitelisted,
        isLpApprovalRequired,
      ] = await contracts.amm.getProductionPolicy();

      const [
        stakingAdmin,
        stakingOperator,
        stakingAuditor,
        stakingPaused,
      ] = await contracts.staking.getRoleSummary(wallet.address);

      setAmmState({
        isAdmin: ammAdmin,
        isOperator: ammOperator,
        isAuditor: ammAuditor,
        paused: ammPaused || isPaused,
        tradingEnabled: tradingEnabled && isTradingEnabled,
        lpApprovalRequired: lpApprovalRequired || isLpApprovalRequired,
        participantStatus: Number(participantStatus),
        tokenAWhitelisted: isTokenAWhitelisted,
        tokenBWhitelisted: isTokenBWhitelisted,
      });

      setStakingState({
        isAdmin: stakingAdmin,
        isOperator: stakingOperator,
        isAuditor: stakingAuditor,
        paused: stakingPaused,
      });
    } catch (error) {
      console.error(error);
      setStatus(error.shortMessage || error.message || "Failed to load roles.");
    } finally {
      setLoading(false);
    }
  }, [connected, contracts, wallet?.address]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function runTx(label, callback) {
    try {
      setLoading(true);
      setStatus(`${label}...`);

      const tx = await callback();
      await tx.wait();

      setStatus(`${label} completed.`);
      await reload();
    } catch (error) {
      console.error(error);
      setStatus(error.shortMessage || error.message || `${label} failed.`);
    } finally {
      setLoading(false);
    }
  }

  function getTargetContract(target) {
    const signed = signerContracts();

    if (target === "amm") return signed.amm;
    if (target === "staking") return signed.staking;

    throw new Error("Unsupported target contract.");
  }

  async function grantRole(target, roleKey, account) {
    await runTx("Grant role", async () => {
      const contract = getTargetContract(target);
      return contract.grantRole(getRoleBytes(roleKey), account);
    });
  }

  async function revokeRole(target, roleKey, account) {
    await runTx("Revoke role", async () => {
      const contract = getTargetContract(target);
      return contract.revokeRole(getRoleBytes(roleKey), account);
    });
  }

  async function pause(target) {
    await runTx("Pause contract", async () => getTargetContract(target).pause());
  }

  async function unpause(target) {
    await runTx("Unpause contract", async () =>
      getTargetContract(target).unpause()
    );
  }

  async function setTradingEnabled(enabled) {
    await runTx("Update AMM trading status", async () => {
      const signed = signerContracts();
      return signed.amm.setTradingEnabled(enabled);
    });
  }

  async function setTokenWhitelist(tokenAddress, whitelisted) {
    await runTx("Update token whitelist", async () => {
      const signed = signerContracts();
      return signed.amm.setTokenWhitelist(tokenAddress, whitelisted);
    });
  }

  async function setLiquidityProviderApprovalRequired(required) {
    await runTx("Update LP approval policy", async () => {
      const signed = signerContracts();
      return signed.amm.setLiquidityProviderApprovalRequired(required);
    });
  }

  async function reviewLiquidityProvider(participant, approved, evidenceURI) {
    await runTx(approved ? "Approve liquidity provider" : "Reject liquidity provider", async () => {
      const signed = signerContracts();
      return signed.amm.reviewLiquidityProvider(
        participant,
        approved,
        evidenceURI || ""
      );
    });
  }

  async function submitAuditNote(target, subjectText, noteURI) {
    await runTx("Submit audit note", async () => {
      const contract = getTargetContract(target);
      const subject = ethers.keccak256(
        ethers.toUtf8Bytes(subjectText || `audit-note-${Date.now()}`)
      );

      return contract.submitAuditNote(subject, noteURI);
    });
  }

  return {
    loading,
    status,
    ammState,
    stakingState,
    connected,
    tokenAAddress: CONTRACTS.tokenA,
    tokenBAddress: CONTRACTS.tokenB,
    reload,
    grantRole,
    revokeRole,
    pause,
    unpause,
    setTradingEnabled,
    setTokenWhitelist,
    setLiquidityProviderApprovalRequired,
    reviewLiquidityProvider,
    submitAuditNote,
  };
}