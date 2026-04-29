---
name: pawtrace-8-6-0-video-behavior-check-real-flow
version: 8.6.0
type: minor
status: local-draft
---

# PawTrace 8.6.0 更新日志

## 版本定位

- **版本类型**：大更新，`+0.1.0`
- **发布状态**：当前工作区草案，尚未发布 tag
- **核心主题**：Video Behavior Check 真实流程收口

## 新增

- Video Check 页面增加更明确的空状态、上传状态、风险指标和真实分析流程提示。
- 结果展示聚焦真实上传视频后的检测结果、summary、timeline、events、advice 和 disclaimer。

## 改进

- UI 文案从内部模型命名逐步转为产品化的 `Video Behavior Check`，减少用户直接感知 YOLO 技术名。
- 清理过强的 demo 行为状态，让页面更接近真实产品流程。
- 加强认证后的视频检测错误处理，避免请求失败后界面停留在不明确状态。

## 主要影响文件

- `frontend/public/app/app.js`
- `frontend/public/app/style.tailwind.css`
- `frontend/index.html`
