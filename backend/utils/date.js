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

// 週達標門檻：週執行率（各任務完成次數以目標封頂後加總 ÷ 目標加總）達 85% 即算該週達標。
// 取自《The 12 Week Year》的每週執行分數標準——不要求完美，85% 以上就視為成功的一週。
export const WEEKLY_PASS_PERCENT = 85;

// 計算「連續達標週數」：從本週往回數，週週達標即延續。
// 本週還沒結束，未達標不算中斷（從上一週起算）；已達標則計入。
// 未開始的週（start_date 在今天之後）不計；沒建任務的週（target 為 0）視為未達標。
// weeks 為 [{ week_number, start_date, done, target }]，start_date 為 "YYYY-MM-DD" 字串，
// done 為該週各任務完成次數以目標封頂後的加總，target 為該週目標次數加總。
export function computeWeeklyStreak(weeks, todayYMD = getTaiwanTodayYMD()) {
  const started = weeks
    .filter((w) => w.start_date <= todayYMD)
    .sort((a, b) => a.week_number - b.week_number);
  if (started.length === 0) return 0;

  const passed = (w) =>
    w.target > 0 && w.done * 100 >= w.target * WEEKLY_PASS_PERCENT;

  let i = started.length - 1;
  const latest = started[i];
  const latestEnd = addDaysToYMD(latest.start_date, 6);
  if (todayYMD <= latestEnd && !passed(latest)) i--;

  let streak = 0;
  for (; i >= 0; i--) {
    if (!passed(started[i])) break;
    streak++;
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
