export function resolveInboxFocusId(
  requestedId: string | undefined,
  priorVisibleIds: readonly string[],
  eligibleCurrentIds: readonly string[],
): string | null {
  if (eligibleCurrentIds.length === 0) return null;
  const eligible = new Set(eligibleCurrentIds);
  if (requestedId !== undefined && eligible.has(requestedId)) return requestedId;
  const priorIndex = requestedId === undefined ? -1 : priorVisibleIds.indexOf(requestedId);
  if (priorIndex >= 0) {
    for (let index = priorIndex + 1; index < priorVisibleIds.length; index++) {
      const id = priorVisibleIds[index];
      if (eligible.has(id)) return id;
    }
    for (let index = priorIndex - 1; index >= 0; index--) {
      const id = priorVisibleIds[index];
      if (eligible.has(id)) return id;
    }
  }
  return eligibleCurrentIds[0] ?? null;
}
