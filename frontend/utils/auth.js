const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function apiRequest(url, options = {}) {
  try {
    // 如果 URL 不是完整路徑，則加上基礎 URL
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`

    const response = await fetch(fullUrl, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    // 檢查是否需要重新登入
    if (response.status === 401) {
      handleAuthError()
      throw new Error(data.message || '請重新登入')
    }

    if (!response.ok) {
      throw new Error(data.message || '請求失敗')
    }

    return data
  } catch (error) {
    console.error('API 請求錯誤:', error)
    throw error
  }
}

// 處理認證錯誤（token 過期等）
export function handleAuthError() {
  if (typeof window !== 'undefined') {
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }
}

// 登入 API
export async function login(email, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// 註冊 API
export async function register(username, email, password) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  })
}

// 登出 API
export async function logout() {
  return apiRequest('/api/auth/logout', {
    method: 'POST',
  })
}

// 獲取當前用戶資料
export async function getCurrentUser() {
  return apiRequest('/api/auth/me')
}
