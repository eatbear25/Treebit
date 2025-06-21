# Auth API 文檔

## 概述

這是用戶認證系統的 API 文檔，提供註冊、登入、登出和用戶資料獲取功能。所有 API 都使用 JSON 格式進行資料交換。

## 基礎資訊

- **Base URL**: `/api/auth`
- **Content-Type**: `application/json`
- **認證方式**: JWT Token (存儲在 HttpOnly Cookie 中)

## API 端點

### 1. 測試連接

**GET** `/api/auth/`

檢查 Auth API 是否正常運作。

#### 回應

```json
{
  "status": "success",
  "message": "Auth API 運作正常",
  "endpoints": {
    "register": "POST /api/auth/register",
    "login": "POST /api/auth/login",
    "logout": "POST /api/auth/logout",
    "me": "GET /api/auth/me"
  }
}
```

---

### 2. 用戶註冊

**POST** `/api/auth/register`

註冊新用戶帳戶。

#### 請求內容

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### 參數驗證

| 欄位     | 類型   | 必填 | 驗證規則           |
| -------- | ------ | ---- | ------------------ |
| username | string | ✅   | 最少 2 個字符      |
| email    | string | ✅   | 有效的電子郵件格式 |
| password | string | ✅   | 6-20 個字符        |

#### 成功回應 (201)

```json
{
  "status": "success",
  "message": "註冊成功",
  "data": {
    "user": {
      "id": 1,
      "username": "example_user",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 錯誤回應

**400 - 電子郵件已存在**

```json
{
  "status": "error",
  "message": "電子郵件已被註冊"
}
```

**400 - 驗證失敗**

```json
{
  "status": "error",
  "message": "輸入資料驗證失敗",
  "errors": [
    {
      "code": "too_small",
      "minimum": 2,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "用戶名稱至少需 2 個字",
      "path": ["username"]
    }
  ]
}
```

---

### 3. 用戶登入

**POST** `/api/auth/login`

用戶登入系統。

#### 請求內容

```json
{
  "email": "string",
  "password": "string"
}
```

#### 參數驗證

| 欄位     | 類型   | 必填 | 驗證規則           |
| -------- | ------ | ---- | ------------------ |
| email    | string | ✅   | 有效的電子郵件格式 |
| password | string | ✅   | 不可為空           |

#### 成功回應 (200)

```json
{
  "status": "success",
  "message": "登入成功",
  "data": {
    "user": {
      "id": 1,
      "username": "example_user",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 錯誤回應

**401 - 認證失敗**

```json
{
  "status": "error",
  "message": "找不到該用戶，請檢查電子郵件或密碼"
}
```

**400 - 驗證失敗**

```json
{
  "status": "error",
  "message": "輸入資料驗證失敗",
  "errors": [...]
}
```

---

### 4. 用戶登出

**POST** `/api/auth/logout`

登出當前用戶，清除認證 Cookie。

#### 請求內容

無需請求內容。

#### 成功回應 (200)

```json
{
  "status": "success",
  "message": "登出成功"
}
```

---

### 5. 獲取當前用戶資料

**GET** `/api/auth/me`

獲取當前已登入用戶的資料。

#### 認證要求

需要有效的 JWT Token (透過 Cookie 或 Authorization Header)。

#### 成功回應 (200)

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "username": "example_user",
      "email": "user@example.com",
      "created_at": "2024-01-01T00:00:00.000Z",
      "last_login": "2024-01-02T10:30:00.000Z"
    }
  }
}
```

#### 錯誤回應

**401 - 未認證**

```json
{
  "status": "error",
  "message": "未提供認證令牌"
}
```

**404 - 用戶不存在**

```json
{
  "status": "error",
  "message": "用戶不存在"
}
```

---

## HTTP 狀態碼

| 狀態碼 | 說明            |
| ------ | --------------- |
| 200    | 請求成功        |
| 201    | 創建成功 (註冊) |
| 400    | 請求參數錯誤    |
| 401    | 認證失敗        |
| 404    | 資源不存在      |
| 500    | 伺服器內部錯誤  |

## Cookie 設定

成功登入或註冊後，系統會設定以下 Cookie：

- **名稱**: `accessToken`
- **類型**: HttpOnly
- **Secure**: 生產環境為 true
- **SameSite**: lax
- **過期時間**: 7 天

## 錯誤處理

所有錯誤回應都遵循統一格式：

```json
{
  "status": "error",
  "message": "錯誤描述",
  "errors": [] // 僅在驗證錯誤時包含
}
```

## 安全性

- 密碼使用 bcrypt 進行哈希處理 (saltRounds: 10)
- JWT Token 預設 7 天過期
- 使用 HttpOnly Cookie 防止 XSS 攻擊
- 密碼錯誤時不洩露具體錯誤原因

## 環境變數

| 變數名         | 預設值       | 說明           |
| -------------- | ------------ | -------------- |
| JWT_SECRET     | "JWT_SECRET" | JWT 簽名密鑰   |
| JWT_EXPIRES_IN | "7d"         | Token 過期時間 |
| NODE_ENV       | -            | 運行環境       |
