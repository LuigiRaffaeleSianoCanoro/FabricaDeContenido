/**
 * Computes the next publish time from a ContentConfig.postingSchedule.
 *
 * Supported `postingSchedule` shapes (stored as JSON):
 *  - ["09:00", "18:30"]                          → daily times
 *  - [{ hour: 9, minute: 0 }, { hour: 18 }]      → daily times (object form)
 *  - [{ dayOfWeek: 1, hour: 9, minute: 0 }]      → weekly (0=Sun … 6=Sat)
 *
 * Falls back to `from + 1h` when the schedule is empty or unparseable.
 * Times are interpreted in UTC (timezone support is planned for the autopilot phase).
 */
export type ScheduleSlot = {
  dayOfWeek?: number;
  hour: number;
  minute: number;
};

function parseSlots(postingSchedule: unknown): ScheduleSlot[] {
  if (!Array.isArray(postingSchedule)) return [];
  const slots: ScheduleSlot[] = [];
  for (const entry of postingSchedule) {
    if (typeof entry === "string") {
      const m = /^(\d{1,2}):(\d{2})$/.exec(entry.trim());
      if (m) {
        slots.push({ hour: Number(m[1]), minute: Number(m[2]) });
      }
    } else if (entry && typeof entry === "object") {
      const e = entry as Record<string, unknown>;
      const hour = Number(e.hour);
      if (Number.isFinite(hour)) {
        slots.push({
          hour,
          minute: Number.isFinite(Number(e.minute)) ? Number(e.minute) : 0,
          dayOfWeek: Number.isFinite(Number(e.dayOfWeek)) ? Number(e.dayOfWeek) : undefined,
        });
      }
    }
  }
  return slots.filter((s) => s.hour >= 0 && s.hour <= 23 && s.minute >= 0 && s.minute <= 59);
}

export function computeNextScheduledAt(postingSchedule: unknown, from: Date = new Date()): Date {
  const slots = parseSlots(postingSchedule);
  if (slots.length === 0) {
    return new Date(from.getTime() + 60 * 60 * 1000);
  }

  let best: Date | null = null;
  // Look ahead up to 8 days to find the earliest future slot.
  for (let dayOffset = 0; dayOffset < 8; dayOffset += 1) {
    const day = new Date(from);
    day.setUTCDate(from.getUTCDate() + dayOffset);
    const dow = day.getUTCDay();
    for (const slot of slots) {
      if (slot.dayOfWeek !== undefined && slot.dayOfWeek !== dow) continue;
      const candidate = new Date(
        Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), slot.hour, slot.minute, 0, 0),
      );
      if (candidate.getTime() > from.getTime() && (!best || candidate < best)) {
        best = candidate;
      }
    }
    if (best) break;
  }

  return best ?? new Date(from.getTime() + 60 * 60 * 1000);
}

/**
 * Slot start time for the autopilot dispatch currently due (idempotency key input).
 * Uses nextRunAt when set; otherwise the most recent schedule slot at or before `now`.
 */
export function resolveAutopilotSlotStart(
  nextRunAt: Date | null,
  postingSchedule: unknown,
  now: Date = new Date(),
): Date {
  if (nextRunAt && nextRunAt.getTime() <= now.getTime()) {
    return nextRunAt;
  }

  const slots = parseSlots(postingSchedule);
  if (slots.length === 0) return now;

  let best: Date | null = null;
  for (let dayOffset = 0; dayOffset >= -7; dayOffset -= 1) {
    const day = new Date(now);
    day.setUTCDate(now.getUTCDate() + dayOffset);
    const dow = day.getUTCDay();
    for (const slot of slots) {
      if (slot.dayOfWeek !== undefined && slot.dayOfWeek !== dow) continue;
      const candidate = new Date(
        Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), slot.hour, slot.minute, 0, 0),
      );
      if (candidate.getTime() <= now.getTime() && (!best || candidate > best)) {
        best = candidate;
      }
    }
  }

  return best ?? now;
}
