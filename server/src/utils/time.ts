/**
 * Parses a time string ("HH:mm" or "HH:mm:ss") to minutes since midnight.
 */
export function timeToMinutes(timeStr: string): number {
  const parts = timeStr.trim().split(":");
  const hours = parseInt(parts[0] ?? "0", 10);
  const minutes = parseInt(parts[1] ?? "0", 10);
  return hours * 60 + minutes;
}

/**
 * Returns true if two time intervals [open1, close1] and [open2, close2] overlap.
 * Intervals are in the same day; overlap is defined as (a < d and c < b).
 */
export function doTimeSlotsOverlap(
  open1: string,
  close1: string,
  open2: string,
  close2: string,
): boolean {
  const a = timeToMinutes(open1);
  const b = timeToMinutes(close1);
  const c = timeToMinutes(open2);
  const d = timeToMinutes(close2);
  return a < d && c < b;
}

/**
 * Returns true if slot [slotOpen, slotClose] is fully within range [rangeOpen, rangeClose].
 */
export function isSlotWithinRange(
  slotOpen: string,
  slotClose: string,
  rangeOpen: string,
  rangeClose: string,
): boolean {
  const slotStart = timeToMinutes(slotOpen);
  const slotEnd = timeToMinutes(slotClose);
  const rangeStart = timeToMinutes(rangeOpen);
  const rangeEnd = timeToMinutes(rangeClose);
  return slotStart >= rangeStart && slotEnd <= rangeEnd;
}
