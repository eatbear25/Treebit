import jsonwebtoken from "jsonwebtoken";

const accessTokenSecret = process.env.JWT_SECRET || "JWT_SECRET";

// 一定要登入的 middleware
export default function authenticate(req, res, next) {
  try {
    // 先從 Authorization header 取得 token (Bearer Token)
    let token = null;

    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.accessToken) {
      // 如果沒有 Authorization header，則從 cookie 中取得
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "請先登入以繼續使用",
        code: "NO_TOKEN",
      });
    }

    jsonwebtoken.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        let message = "不合法的存取令牌，請重新登入";
        let code = "INVALID_TOKEN";

        if (err.name === "TokenExpiredError") {
          message = "登入已過期，請重新登入";
          code = "TOKEN_EXPIRED";
        } else if (err.name === "JsonWebTokenError") {
          message = "存取令牌格式錯誤，請重新登入";
          code = "MALFORMED_TOKEN";
        }

        // Token 過期或無效時，清除 cookie
        res.clearCookie("accessToken");

        return res.status(401).json({
          status: "error",
          message,
          code,
          requireLogin: true,
        });
      }

      // 如果驗證成功，將用戶資訊存到 req.user
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("認證中間件錯誤:", error);
    return res.status(500).json({
      status: "error",
      message: "伺服器內部錯誤",
      code: "SERVER_ERROR",
    });
  }
}

// 可登入可不登入的 middleware
export function optionalAuthenticate(req, res, next) {
  try {
    let token = null;

    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // 如果沒有 token，直接繼續，不設定 req.user
    if (!token) {
      return next();
    }

    // 如果有 token，就繼續進行驗證
    jsonwebtoken.verify(token, accessTokenSecret, (err, user) => {
      if (!err && user) {
        req.user = user;
      } else if (err && err.name === "TokenExpiredError") {
        res.clearCookie("accessToken");
      }

      next();
    });
  } catch (error) {
    console.error("可選認證中間件錯誤:", error);
    next();
  }
}
