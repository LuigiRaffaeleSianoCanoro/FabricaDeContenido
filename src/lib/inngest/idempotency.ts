/**
 * Deterministic idempotency key for autopilot slot dispatch (M4 / D19).
 * One key per (contentConfigId, scheduled slot start).
 */
export function buildAutopilotIdempotencyKey(configId: string, slotStart: Date): string {
  return `autopilot:${configId}:${slotStart.toISOString()}`;
}
