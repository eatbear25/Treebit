import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import db from "../config/connect-mysql.js";
import "dotenv/config.js";

const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:3001/api/auth/google/redirect";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value?.toLowerCase() || null;
        const emailVerified = profile.emails?.[0]?.verified ? 1 : 0;
        const username = (profile.displayName || "Google User").trim();
        const avatar = profile.photos?.[0]?.value || null;

        if (!googleId) {
          return done(new Error("Google ID 遺失"));
        }

        // 1) 用 (provider, provider_user_id) 查
        const [rows] = await db.query(
          "SELECT id FROM users WHERE provider='google' AND provider_user_id=? LIMIT 1",
          [googleId]
        );

        let userId;
        if (rows.length) {
          userId = rows[0].id;

          // *** 修正：現有用戶不要更新 username，只更新其他欄位 ***
          await db.query(
            "UPDATE users SET email_verified=?, last_login=NOW(), updated_at=CURRENT_TIMESTAMP WHERE id=?",
            [emailVerified, userId]
          );
          console.log(`Google 用戶登入成功: ${userId}`);
        } else {
          // 新用戶註冊時才設定預設 username
          const [r] = await db.query(
            `INSERT INTO users (provider, provider_user_id, username, email, email_verified, password_hash, last_login)
             VALUES ('google', ?, ?, ?, ?, NULL, NOW())`,
            [googleId, username, email, emailVerified]
          );

          userId = r.insertId;
          console.log(`新 Google 用戶註冊成功: ${userId}`);
        }

        return done(null, { id: userId, provider: "google" });
      } catch (error) {
        console.error("Google 認證錯誤:", error);
        return done(error);
      }
    }
  )
);

export default passport;
