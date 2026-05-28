import { useCallback, useEffect, useMemo, useState } from "react";
import { getAMM } from "../lib/contracts";

export const PARTICIPANT_STATUS = {
  NONE: 0,
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
};

export function getParticipantStatusLabel(status) {
  const normalized = Number(status ?? 0);

  if (normalized === PARTICIPANT_STATUS.PENDING) return "Pending LP Review";
  if (normalized === PARTICIPANT_STATUS.APPROVED) return "Verified LP";
  if (normalized === PARTICIPANT_STATUS.REJECTED) return "LP Rejected";

  return "Public Trader";
}

export default function useAccessProfile(wallet) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({
    connected: false,
    isAdmin: false,
    isOperator: false,
    isAuditor: false,
    isPaused: false,
    isTradingEnabled: true,
    isLpApprovalRequired: false,
    participantStatus: PARTICIPANT_STATUS.NONE,
    participantLabel: "Public Trader",
    canTrade: true,
    canAddLiquidity: false,
    canUseFarm: false,
    canViewDashboard: true,
    canViewAdmin: false,
    canManagePolicy: false,
    canAudit: false,
    canSubmitTradeReceipt: false,
    canSubmitLiquidityReceipt: false,
    canSubmitPoolAuditReport: false,
    canSubmitGovernanceProposal: false,
    canUploadTokenList: false,
  });

  const amm = useMemo(() => {
    if (!wallet?.provider) return null;
    return getAMM(wallet.provider);
  }, [wallet?.provider]);

  const reload = useCallback(async () => {
    if (!wallet?.address || !amm) {
      setProfile((prev) => ({
        ...prev,
        connected: false,
        canTrade: false,
        canAddLiquidity: false,
        canUseFarm: false,
        canViewAdmin: false,
        canManagePolicy: false,
        canAudit: false,
        canSubmitTradeReceipt: false,
        canSubmitLiquidityReceipt: false,
        canSubmitPoolAuditReport: false,
        canSubmitGovernanceProposal: false,
        canUploadTokenList: false,
      }));
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        isAdmin,
        isOperator,
        isAuditor,
        isPaused,
        isTradingEnabled,
        isLpApprovalRequired,
        participantStatusRaw,
      ] = await amm.getRoleSummary(wallet.address);

      let evidencePermission = {
        canSubmitTradeReceipt: false,
        canSubmitLiquidityReceipt: false,
        canSubmitPoolAuditReport: false,
        canSubmitGovernanceProposal: false,
      };

      try {
        const [
          canSubmitTradeReceipt,
          canSubmitLiquidityReceipt,
          canSubmitPoolAuditReport,
          canSubmitGovernanceProposal,
        ] = await amm.getEvidencePermissionSummary(wallet.address);

        evidencePermission = {
          canSubmitTradeReceipt,
          canSubmitLiquidityReceipt,
          canSubmitPoolAuditReport,
          canSubmitGovernanceProposal,
        };
      } catch (permissionError) {
        console.warn(
          "Evidence permission summary unavailable. Sync frontend ABI after compiling contract.",
          permissionError
        );
      }

      const participantStatus = Number(participantStatusRaw);
      const isVerifiedLp =
        participantStatus === PARTICIPANT_STATUS.APPROVED;

      const canUseProtocol = !isPaused && isTradingEnabled;

      setProfile({
        connected: true,
        isAdmin,
        isOperator,
        isAuditor,
        isPaused,
        isTradingEnabled,
        isLpApprovalRequired,
        participantStatus,
        participantLabel: getParticipantStatusLabel(participantStatus),
        canTrade: canUseProtocol,
        canAddLiquidity:
          canUseProtocol && (!isLpApprovalRequired || isVerifiedLp),
        canUseFarm: canUseProtocol,
        canViewDashboard: true,
        canViewAdmin: isAdmin || isOperator || isAuditor,
        canManagePolicy: isAdmin || isOperator,
        canAudit: isAuditor || isAdmin,
        canUploadTokenList: isOperator || isAdmin,
        ...evidencePermission,
      });
    } catch (err) {
      console.error(err);
      setError(err.shortMessage || err.message || "Failed to load access profile.");
    } finally {
      setLoading(false);
    }
  }, [amm, wallet?.address]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    loading,
    error,
    profile,
    reload,
  };
}