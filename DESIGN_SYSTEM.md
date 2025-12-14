# 🎨 JUPAS 设计系统规范

## 配色方案：专业信任蓝

### 设计理念
蓝色普遍与**专业、信任、冷静、可靠**相关联，非常适合教育及申请类系统。

---

## 📊 完整配色表

### 主色系 (Primary Colors)

#### 主色：#2563EB
- **RGB:** rgb(37, 99, 235)
- **用途：**
  - ✅ 主要按钮背景
  - ✅ 关键操作图标
  - ✅ 激活的导航项
  - ✅ Logo和品牌标识
  - ✅ 链接文字
- **示例：**
  ```css
  .btn-primary { background: #2563EB; }
  .nav-item.active { background: #2563EB; }
  ```

#### 主色悬停：#1d4ed8
- **用途：**
  - ✅ 主要按钮悬停状态
  - ✅ 交互元素深色状态

#### 辅色：#7DD3FC
- **RGB:** rgb(125, 211, 252)
- **用途：**
  - ✅ 按钮悬停背景（浅色）
  - ✅ 次要信息高亮
  - ✅ 进度条背景
  - ✅ 选中状态提示
  - ✅ 权益点数背景
- **示例：**
  ```css
  .btn:hover { background: #7DD3FC; }
  .navbar-points { 
    background: rgba(125, 211, 252, 0.1);
    border-color: #7DD3FC; 
  }
  ```

---

### 中性色系 (Neutral Colors)

#### 页面背景：#F8FAFC
- **RGB:** rgb(248, 250, 252)
- **用途：**
  - ✅ 整体页面背景
  - ✅ 大面积背景区域
- **示例：**
  ```css
  body { background: #F8FAFC; }
  .page { background: #F8FAFC; }
  ```

#### 卡片背景：#FFFFFF
- **RGB:** rgb(255, 255, 255)
- **用途：**
  - ✅ 卡片、模块背景
  - ✅ 表单容器背景
  - ✅ Modal弹窗背景
- **示例：**
  ```css
  .card { background: #FFFFFF; }
  .modal { background: #FFFFFF; }
  ```

#### 浅色背景：#F1F5F9
- **RGB:** rgb(241, 245, 249)
- **用途：**
  - ✅ 悬停状态背景
  - ✅ 禁用状态背景
  - ✅ 分组区域背景
- **示例：**
  ```css
  .btn:hover { background: #F1F5F9; }
  .input:disabled { background: #F1F5F9; }
  ```

#### 主标题文字：#1E293B
- **RGB:** rgb(30, 41, 59)
- **用途：**
  - ✅ 页面主标题
  - ✅ 卡片标题
  - ✅ 重要正文
  - ✅ 表单标签
- **示例：**
  ```css
  h1, h2, h3 { color: #1E293B; }
  .input-label { color: #1E293B; }
  ```

#### 次要文字：#64748B
- **RGB:** rgb(100, 116, 139)
- **用途：**
  - ✅ 次要说明文字
  - ✅ 占位符文本
  - ✅ 辅助信息
  - ✅ 时间戳
- **示例：**
  ```css
  .description { color: #64748B; }
  input::placeholder { color: #64748B; }
  ```

---

### 系统状态色 (System Colors)

#### 成功 (Success)

**主色：#10B981**
- **RGB:** rgb(16, 185, 129)
- **用途：**
  - ✅ 成功提示图标
  - ✅ 完成状态标识
  - ✅ 确认操作按钮
  - ✅ 高成功率标签
- **示例：**
  ```css
  .success-icon { color: #10B981; }
  .success-rate-high { color: #10B981; }
  ```

**背景色：#D1FAE5**
- **RGB:** rgb(209, 250, 229)
- **用途：**
  - ✅ 成功提示背景
  - ✅ 成功状态区域
- **示例：**
  ```css
  .alert-success { 
    background: #D1FAE5;
    border-color: #10B981;
    color: #10B981;
  }
  ```

#### 警告 (Warning)

**主色：#F59E0B**
- **RGB:** rgb(245, 158, 11)
- **用途：**
  - ✅ 非阻塞性提醒
  - ✅ 等待状态标识
  - ✅ 中等成功率标签
  - ✅ 收藏星标
- **示例：**
  ```css
  .warning-icon { color: #F59E0B; }
  .success-rate-medium { color: #F59E0B; }
  .favorite-btn.favorited { color: #F59E0B; }
  ```

**背景色：#FEF3C7**
- **RGB:** rgb(254, 243, 199)
- **用途：**
  - ✅ 警告提示背景
  - ✅ 注意事项区域
- **示例：**
  ```css
  .alert-warning { 
    background: #FEF3C7;
    border-color: #F59E0B;
    color: #F59E0B;
  }
  ```

#### 错误 (Error/Danger)

**主色：#EF4444**
- **RGB:** rgb(239, 68, 68)
- **用途：**
  - ✅ 错误提示图标
  - ✅ 严重错误文字
  - ✅ 删除/危险按钮
  - ✅ 表单验证错误
  - ✅ 低成功率标签
- **示例：**
  ```css
  .error-text { color: #EF4444; }
  .btn-danger { 
    color: #EF4444;
    border-color: #EF4444;
  }
  .success-rate-low { color: #EF4444; }
  ```

**背景色：#FEE2E2**
- **RGB:** rgb(254, 226, 226)
- **用途：**
  - ✅ 错误提示区域背景
  - ✅ 表单验证错误背景
  - ✅ 危险操作警告区域
- **示例：**
  ```css
  .alert-error { 
    background: #FEE2E2;
    border-color: #EF4444;
    border-left: 4px solid #EF4444;
    color: #EF4444;
  }
  .input-error-text {
    background: #FEE2E2;
    border-left: 3px solid #EF4444;
  }
  ```

---

### 边框色系 (Border Colors)

#### 默认边框：#E2E8F0
- **用途：** 卡片边框、输入框边框

#### 悬停边框：#CBD5E1
- **用途：** 元素悬停时的边框颜色

---

## 🎯 设计原则

### 1. 颜色层次
- **主要操作：** 使用主色 #2563EB
- **次要操作：** 使用中性色或辅色
- **危险操作：** 使用错误色 #EF4444

### 2. 状态反馈
- **成功：** 绿色系 (#10B981 + #D1FAE5)
- **警告：** 橙色系 (#F59E0B + #FEF3C7)
- **错误：** 红色系 (#EF4444 + #FEE2E2)

### 3. 交互效果
- **悬停：** 使用辅色 #7DD3FC 背景
- **激活：** 使用主色 #2563EB
- **禁用：** 降低透明度至 0.5-0.6

### 4. 对比度
- 确保文字与背景的对比度 ≥ 4.5:1
- 重要文字使用 #1E293B
- 次要文字使用 #64748B

---

## 🔧 CSS 变量定义

```css
:root {
  /* 主色系 */
  --color-primary: #2563EB;
  --color-primary-hover: #1d4ed8;
  --color-primary-light: #7DD3FC;
  
  /* 文字色 */
  --color-text-primary: #1E293B;
  --color-text-secondary: #64748B;
  
  /* 系统状态色 */
  --color-success: #10B981;
  --color-success-bg: #D1FAE5;
  --color-warning: #F59E0B;
  --color-warning-bg: #FEF3C7;
  --color-danger: #EF4444;
  --color-danger-bg: #FEE2E2;
  
  /* 背景色 */
  --color-bg-page: #F8FAFC;
  --color-bg-card: #FFFFFF;
  --color-bg-light: #F1F5F9;
  
  /* 边框色 */
  --color-border: #E2E8F0;
  --color-border-hover: #CBD5E1;
  
  /* 其他 */
  --border-radius: 8px;
  --border-radius-lg: 12px;
  --box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --box-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
```

---

## 📝 使用示例

### 按钮
```css
/* 主要按钮 */
.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

/* 次要按钮 */
.btn-secondary {
  background: white;
  color: var(--color-text-primary);
  border: 1.5px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-primary-light);
}

/* 危险按钮 */
.btn-danger {
  background: transparent;
  color: var(--color-danger);
  border: 1.5px solid var(--color-danger);
}

.btn-danger:hover {
  background: var(--color-danger);
  color: white;
}
```

### 提示框
```css
/* 成功提示 */
.alert-success {
  background: var(--color-success-bg);
  border: 1.5px solid var(--color-success);
  border-left: 4px solid var(--color-success);
  color: var(--color-success);
}

/* 警告提示 */
.alert-warning {
  background: var(--color-warning-bg);
  border: 1.5px solid var(--color-warning);
  border-left: 4px solid var(--color-warning);
  color: var(--color-warning);
}

/* 错误提示 */
.alert-error {
  background: var(--color-danger-bg);
  border: 1.5px solid var(--color-danger);
  border-left: 4px solid var(--color-danger);
  color: var(--color-danger);
}
```

### 表单
```css
/* 输入框 */
.input {
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border);
  color: var(--color-text-primary);
}

.input:hover {
  border-color: var(--color-border-hover);
}

.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* 错误状态 */
.input-error {
  border-color: var(--color-danger);
}

.input-error:focus {
  box-shadow: 0 0 0 3px var(--color-danger-bg);
}

.input-error-text {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-left: 3px solid var(--color-danger);
}
```

---

## ✅ 可访问性检查清单

- ✅ 所有文字对比度符合 WCAG AA 标准
- ✅ 交互元素有明确的视觉反馈
- ✅ 错误提示使用颜色+图标+文字三重反馈
- ✅ 禁用状态清晰可见
- ✅ 链接和按钮可区分

---

## 🎨 配色灵感来源

- **信任感：** 蓝色代表可靠、专业
- **清晰度：** 高对比度确保可读性
- **友好性：** 柔和的中性色减少视觉疲劳
- **现代感：** 渐变和阴影增强层次

---

**设计系统版本：** v1.0  
**最后更新：** 2025-12-14  
**适用项目：** JUPAS 成绩计算与专业推荐系统

