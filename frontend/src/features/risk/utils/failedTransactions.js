const FAILED_TX_KEY = "dexck-failed-transactions";

export function getFailedTransactions() {
  try {
    return JSON.parse(localStorage.getItem(FAILED_TX_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveFailedTransaction(payload) {
  const failed = getFailedTransactions();

  const next = [
    {
      id: `failed-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: "FAILED",
      source: "frontend-guard",
      createdAt: new Date().toISOString(),
      ...payload,
    },
    ...failed,
  ].slice(0, 50);

  localStorage.setItem(FAILED_TX_KEY, JSON.stringify(next));
  return next;
}

export function clearFailedTransactions() {
  localStorage.removeItem(FAILED_TX_KEY);
}