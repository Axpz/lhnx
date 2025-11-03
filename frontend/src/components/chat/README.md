# 客服聊天机器人 ChatWidget

## 功能特性

✅ 右下角悬浮按钮，可打开/关闭聊天窗口  
✅ **拖动窗口**：点击头部可拖动窗口到任意位置  
✅ **最大化/还原**：支持窗口大小切换，最大化时占满屏幕  
✅ **会话时间记录**：欢迎消息包含会话开始时间，方便追溯对话  
✅ **头像标识**：用户和客服助手消息带有不同的头像图标  
✅ **自适应输入框**：输入框高度根据内容自动调整（1-5行）  
✅ SSE 流式输出，机器人回答实时显示（打字效果）  
✅ 支持回车发送和 Shift+Enter 换行  
✅ 自动滚动到底部  
✅ Loading 状态显示，防止重复发送  
✅ 错误处理和请求取消  
✅ 响应式设计  
✅ 符合 Next.js 和 shadcn 最佳实践  

## 已集成

组件已自动添加到 `src/app/layout.tsx`，在全站可用。

## 后端 API 接口要求

### 接口地址
```
POST /api/v1/chat/stream
```

### 请求格式
```json
{
  "message": "用户输入的消息",
  "history": [
    {
      "id": "1234567890",
      "role": "user",
      "content": "之前的消息",
      "timestamp": "2025-11-03T10:00:00.000Z"
    }
  ]
}
```

### 响应格式（SSE）

**Content-Type**: `text/event-stream`

每一行数据格式：
```
data: {"content": "这"}
data: {"content": "是"}
data: {"content": "流"}
data: {"content": "式"}
data: {"content": "输"}
data: {"content": "出"}
data: [DONE]
```

或者使用其他字段名（组件会自动识别）：
```
data: {"delta": "内容片段"}
data: {"text": "内容片段"}
```

### 后端实现示例（Go）

```go
func ChatStreamHandler(c *gin.Context) {
    var req struct {
        Message string    `json:"message"`
        History []Message `json:"history"`
    }
    
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    // 设置 SSE 响应头
    c.Header("Content-Type", "text/event-stream")
    c.Header("Cache-Control", "no-cache")
    c.Header("Connection", "keep-alive")
    
    // 调用大模型 API（示例）
    response := callLLMAPI(req.Message, req.History)
    
    // 流式输出
    for _, chunk := range response {
        data := fmt.Sprintf("data: {\"content\":\"%s\"}\n\n", chunk)
        c.Writer.Write([]byte(data))
        c.Writer.Flush()
    }
    
    // 发送结束标记
    c.Writer.Write([]byte("data: [DONE]\n\n"))
    c.Writer.Flush()
}
```

## 配置

### 环境变量

在 `.env.local` 中配置后端 API 地址：

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

如果不设置，默认为 `http://localhost:8080`。

## 使用技巧

### 拖动窗口
- 点击并按住聊天窗口**头部**区域，拖动到想要的位置
- 可以自由拖动到屏幕任意位置
- 关闭窗口后再次打开，会恢复到默认位置（右下角）
- **性能优化**：使用 CSS transform 实现流畅拖动，无卡顿

### 最大化/还原
- 点击头部的 **⛶** 图标可以最大化窗口
- 最大化后再次点击 **⊟** 图标可以还原
- 最大化状态下无法拖动窗口
- 关闭窗口后再次打开，会恢复到正常大小

### 输入框使用
- **发送消息**：直接按 `Enter` 键
- **换行**：按 `Shift + Enter` 组合键
- **自适应高度**：输入框会根据内容自动调整高度（最多 5 行）
- 超过 5 行后会出现滚动条
- **自动聚焦**：打开窗口或发送消息后，焦点自动回到输入框，方便连续输入

### 会话管理
- **欢迎消息**：打开窗口时，机器人会自动发送欢迎消息，包含会话开始时间
- **会话隔离**：关闭窗口会清空消息历史，每次打开都是新的会话
- **时间格式**：显示月/日 时:分（如：11/4 14:30）
- **消息持久化**：对话历史以消息的形式保存，滚动即可查看

## 设计理念

### 科技感蓝色系配色

ChatBot 采用独立的蓝色系配色方案，与项目主色调（暖黄色）形成区分：

**配色方案：**
- 🔵 **用户消息**：
  - 消息气泡：`bg-blue-500 text-white` - 现代蓝色，科技感强
  - 头像：蓝色圆形背景 + 白色用户图标
- ⚪ **机器人消息**：
  - 消息气泡：`bg-white text-slate-800 border-slate-200` - 白色背景，专业清晰
  - 头像：灰色圆形背景 + 深灰机器人图标
- 🎨 **窗口装饰**：
  - 头部：`bg-linear-to-r from-blue-50 to-white` - 微妙的蓝色渐变
  - 边框：`border-blue-200` - 淡蓝色边框
  - 阴影：`shadow-blue-100` - 蓝色投影
  - 消息区：`bg-slate-50` - 浅灰背景
- 🔘 **按钮**：`bg-blue-500 hover:bg-blue-600` - 蓝色主按钮

**为什么选择蓝色系？**
1. ✅ 科技感、现代感强
2. ✅ 与项目暖色调形成对比，区分度高
3. ✅ 符合用户对 AI 助手的视觉认知
4. ✅ 保持简洁专业的风格

### 自定义样式

组件使用标准 Tailwind CSS 类名，易于自定义：

- **窗口尺寸**：
  - 正常模式：`400px × 600px`
  - 最大化模式：`calc(100vw - 40px) × calc(100vh - 40px)`
  - 可在组件中直接修改 `style` 属性

- **消息气泡**：
  - 用户：`bg-blue-600 text-white`
  - 机器人：`bg-white text-slate-800 border border-slate-200`
  - 可在 `ChatWidget.tsx` 中修改对应的 className

- **其他颜色调整**：
  - 头部背景：`bg-linear-to-r from-blue-50 to-white`
  - 边框颜色：`border-blue-100` / `border-blue-200`
  - 按钮颜色：`bg-blue-600 hover:bg-blue-700`

## 使用建议

1. **生产环境**：确保后端 API 支持 CORS 跨域请求
2. **错误监控**：建议添加错误日志上报
3. **会话持久化**：可扩展 localStorage 存储历史对话
4. **身份验证**：如需登录，可在请求头添加 token（参考 `api-client.ts`）

## 待扩展功能

- [ ] 消息持久化（localStorage）
- [ ] 历史对话记录查看
- [ ] 富文本消息（Markdown 渲染）
- [ ] 文件上传
- [ ] 快捷回复按钮
- [ ] 多语言支持

