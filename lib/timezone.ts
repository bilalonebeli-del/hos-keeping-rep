import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const TZ = "Asia/Dubai";

export function calcElapsedMinutes(timeIn: string, timeOut: string, date: string): number {
  const inUtc = fromZonedTime(`${date}T${timeIn}:00`, TZ);
  const outUtc = fromZonedTime(`${date}T${timeOut}:00`, TZ);
  return Math.max(0, Math.round((outUtc.getTime() - inUtc.getTime()) / 60000));
}

export function formatDateTZ(date: Date | string, fmt = "yyyy-MM-dd") {
  return formatInTimeZone(date, TZ, fmt);
}

export function todayInTZ() {
  return formatDateTZ(new Date());
}

export function toTimestamptz(date: string, time: string): string {
  return fromZonedTime(`${date}T${time}:00`, TZ).toISOString();
}
