// 日期工具：統一以「台灣時區（UTC+8）的純日期字串 YYYY-MM-DD」處理，
// 避免伺服器時區不同造成日期位移。

// 取得台灣時區的今天，回傳 "YYYY-MM-DD"
export function getTaiwanTodayYMD() {
  // en-CA 的格式即為 YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// 計算「目前連續打卡天數」：從今天（或昨天）往回數，每天至少完成一次打卡即延續。
// 今天還沒打卡不算中斷（當天結束前都還有機會），從昨天起算。
// dates 為 "YYYY-MM-DD" 字串陣列（不需排序）。
export function computeCurrentStreak(dates, todayYMD = getTaiwanTodayYMD()) {
  const set = new Set(dates);
  let cursor = todayYMD;
  if (!set.has(cursor)) cursor = addDaysToYMD(cursor, -1);

  let streak = 0;
  while (set.has(cursor)) {
    streak++;
    cursor = addDaysToYMD(cursor, -1);
  }
  return streak;
}

// 將 "YYYY-MM-DD" 加上指定天數，回傳新的 "YYYY-MM-DD"
// 以 UTC 計算純日期，避免本地時區造成位移
export function addDaysToYMD(ymd, days) {
  const [year, month, day] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day));
  dt.setUTCDate(dt.getUTCDate() + days);

  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
