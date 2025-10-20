# 習慣管理 API 文檔

## 基本資訊

- 基礎路徑：`/api/habits`
- 認證：所有 API 都需要通過 `authenticate` 中間件驗證
- 回傳格式：統一 JSON 格式

```json
{
  "success": true/false,
  "message": "訊息內容",
  "data": {} // 資料內容
}
```

---

## 🏠 習慣管理

### 1. 建立習慣

**POST** `/`

**請求參數：**

```json
{
  "title": "習慣名稱",
  "total_weeks": 10
}
```

**回傳範例：**

```json
{
  "success": true,
  "message": "新增習慣成功，已建立對應週次",
  "data": {
    "habit_id": 1
  }
}
```

### 2. 取得所有習慣

**GET** `/`

**回傳範例：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "學吉他",
      "total_weeks": 10,
      "is_archived": 0,
      "created_at": "2025-07-03T10:00:00.000Z"
    }
  ]
}
```

### 3. 查看單一習慣

**GET** `/:habitId`

**回傳範例：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "學吉他",
    "total_weeks": 10,
    "is_archived": 0,
    "created_at": "2025-07-03T10:00:00.000Z"
  }
}
```

### 4. 獲取習慣統計資料 🆕

**GET** `/:habitId/stats`

**回傳範例：**

```json
{
  "success": true,
  "data": {
    "total_weeks": 10,
    "total_logs": 20,
    "completed_logs": 12,
    "completion_rate": 60
  }
}
```

### 5. 封存習慣

**PATCH** `/:habitId/archive`

**回傳範例：**

```json
{
  "success": true,
  "message": "習慣已封存"
}
```

### 6. 刪除習慣

**DELETE** `/:habitId`

**回傳範例：**

```json
{
  "success": true,
  "message": "刪除習慣成功"
}
```

---

## 📅 週次管理

### 7. 查詢習慣的所有週

**GET** `/:habitId/weeks`

**回傳範例：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "habit_id": 1,
      "week_number": 1,
      "start_date": "2025-07-03"
    }
  ]
}
```

### 8. 刪除週

**DELETE** `/weeks/:weekId`

**回傳範例：**

```json
{
  "success": true,
  "message": "刪除週次成功"
}
```

---

## ✅ 任務管理

### 9. 建立任務

**POST** `/weeks/:weekId/tasks`

**請求參數：**

```json
{
  "name": "畫畫30分鐘",
  "target_days": 4
}
```

**回傳範例：**

```json
{
  "success": true,
  "message": "新增任務成功",
  "data": {
    "task_id": 1
  }
}
```

### 10. 查詢週任務

**GET** `/weeks/:weekId/tasks`

**回傳範例：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "habit_week_id": 1,
      "name": "畫畫30分鐘",
      "target_days": 4
    }
  ]
}
```

### 11. 刪除任務

**DELETE** `/tasks/:taskId`

**回傳範例：**

```json
{
  "success": true,
  "message": "刪除任務成功"
}
```

---

## 📊 打卡記錄

### 12. 更新打卡記錄

**PATCH** `/tasks/:taskId/logs`

**請求參數：**

```json
{
  "date": "2025-07-03",
  "is_completed": 1
}
```

**回傳範例：**

```json
{
  "success": true,
  "message": "更新打卡成功"
}
```

### 13. 查詢單一任務的打卡記錄 🆕

**GET** `/tasks/:taskId/logs`

**回傳範例：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "task_id": 1,
      "date": "2025-07-03",
      "is_completed": 1
    }
  ]
}
```

### 14. 查詢某週所有任務的打卡記錄 🆕

**GET** `/weeks/:weekId/logs`

**回傳範例：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "task_id": 1,
      "date": "2025-07-03",
      "is_completed": 1,
      "task_name": "畫畫30分鐘",
      "target_days": 4
    }
  ]
}
```

---

## 📝 每週筆記

### 15. 新增/更新筆記

**POST** `/weeks/:weekId/notes`

**請求參數：**

```json
{
  "content": "這週進步很多！"
}
```

**回傳範例：**

```json
{
  "success": true,
  "message": "新增筆記成功"
}
```

### 16. 查詢筆記

**GET** `/weeks/:weekId/notes`

**回傳範例：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "habit_week_id": 1,
      "content": "這週進步很多！",
      "created_at": "2025-07-03T10:00:00.000Z",
      "updated_at": "2025-07-03T10:00:00.000Z"
    }
  ]
}
```

### 17. 刪除筆記

**DELETE** `/weeks/:weekId/notes`

**回傳範例：**

```json
{
  "success": true,
  "message": "刪除筆記成功"
}
```

---

## 📋 前端實作建議

### 習慣列表頁面

```javascript
// 取得習慣列表和統計資料
const fetchHabitsWithStats = async () => {
  const habitsResponse = await fetch("/api/habits");
  const habits = await habitsResponse.json();

  const habitsWithStats = await Promise.all(
    habits.data.map(async (habit) => {
      const statsResponse = await fetch(`/api/habits/${habit.id}/stats`);
      const stats = await statsResponse.json();
      return { ...habit, stats: stats.data };
    })
  );
};
```

### 週詳情頁面

```javascript
// 取得某週的任務和打卡記錄
const fetchWeekData = async (weekId) => {
  const [tasksResponse, logsResponse, notesResponse] = await Promise.all([
    fetch(`/api/habits/weeks/${weekId}/tasks`),
    fetch(`/api/habits/weeks/${weekId}/logs`),
    fetch(`/api/habits/weeks/${weekId}/notes`),
  ]);

  const tasks = await tasksResponse.json();
  const logs = await logsResponse.json();
  const notes = await notesResponse.json();

  return { tasks: tasks.data, logs: logs.data, notes: notes.data };
};
```

### 打卡功能

```javascript
// 切換打卡狀態
const toggleTask = async (taskId, date, currentStatus) => {
  await fetch(`/api/habits/tasks/${taskId}/logs`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: date,
      is_completed: currentStatus ? 0 : 1,
    }),
  });
};
```

---

## 🆕 新增功能說明

1. **GET** `/:habitId/stats` - 提供習慣的完整統計資料，包含總週數、總打卡次數、完成次數和達成率
2. **GET** `/tasks/:taskId/logs` - 查詢特定任務的所有打卡記錄
3. **GET** `/weeks/:weekId/logs` - 批量查詢某週所有任務的打卡記錄，包含任務名稱和目標天數

這些 API 完全支援你的頁面功能需求！
