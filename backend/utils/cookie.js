// 認證 Cookie 的統一設定。
// 生產環境走 Next.js rewrites 代理，瀏覽器視為同源請求，
// 用 sameSite: "lax" 即可正常帶 Cookie，同時阻擋跨站請求偽造（CSRF）。
const isProd = process.env.NODE_ENV === "production";

export const cookieBaseOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
};

export function setAuthCookie(res, token, maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
  res.cookie("accessToken", token, {
    ...cookieBaseOptions,
    maxAge: maxAgeMs,
  });
}

// 清除 Cookie 必須帶與設定時相同的 options，否則部分瀏覽器不會真的清掉
export function clearAuthCookie(res) {
  res.clearCookie("accessToken", { ...cookieBaseOptions });
}
