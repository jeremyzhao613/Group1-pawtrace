---
name: pawtrace-7-1-0-ui-consistency-hotfix-release
overview: 7.1.0 是 7.0.0 之后的 UI 稳定性和内容一致性改进版：重点修复主站登录首屏在移动端的裁切、首屏顺序、默认暗色模式、占位文案和 Qwen/Gemini 命名不一致问题。 / 7.1.0 is a UI stability and content-consistency release after 7.0.0: it focuses on fixing mobile login clipping, first-screen ordering, default dark mode behavior, placeholder copy, and Qwen/Gemini naming mismatch.
todos:
  - id: mobile-login-layout
    content: 修复移动端登录首屏右侧裁切和表单溢出问题。 / Fix right-side clipping and form overflow on the mobile login first screen.
    status: completed
  - id: first-screen-order
    content: 移动端首屏优先展示 PawTrace 品牌说明，再展示登录表单。 / Show PawTrace branding and value copy before the login form on mobile.
    status: completed
  - id: copy-consistency
    content: 替换 Logo、True Focus、PawTrace OS 等不匹配占位文案。 / Replace mismatched placeholder copy such as Logo, True Focus, and PawTrace OS.
    status: completed
  - id: qwen-route-naming
    content: 统一前端 AI 诊断文案和接口为 Qwen 命名，并保留旧 Gemini 路径兼容。 / Align frontend AI diagnosis copy and API naming with Qwen while keeping old Gemini routes as compatibility aliases.
    status: completed
  - id: verification
    content: 完成构建检查、空白检查和 Chrome headless 移动端截图复查。 / Complete build checks, whitespace checks, and Chrome headless mobile screenshot verification.
    status: completed
isProject: false
---

# PawTrace 7.1.0 UI 改进日志 / PawTrace 7.1.0 UI Improvement Log

## 版本定位 / Release Positioning

- **7.1.0 类型 / 7.1.0 Type**：7.0.0 之后的快速 UI 修复与内容一致性更新 / A fast UI polish and content-consistency update after 7.0.0.
- **核心目标 / Core Goal**：让主站首屏在桌面和移动端都能正确展示，不再出现裁切、顺序不合理、文案不匹配或 AI 命名混乱 / Make the main first screen render correctly on desktop and mobile without clipping, awkward ordering, mismatched copy, or AI naming confusion.
- **更新范围 / Scope**：主站登录首屏、移动端布局、前端 AI 请求命名、后端 AI 兼容路由、7.1.0 日志 / Main-site login first screen, mobile layout, frontend AI request naming, backend AI compatibility routes, and this 7.1.0 log.

## 7.1.0 更新内容 / 7.1.0 Updates

### 1) 移动端登录首屏修复 / Mobile Login First-Screen Fix

- 移动端不再先显示登录表单，改为先显示 PawTrace 品牌、主标题、功能标签，再显示登录卡片 / Mobile now shows PawTrace branding, the main headline, and feature chips before the login card.
- 新增专用 `login-shell` 布局容器，避免 Tailwind 通用宽度类在窄屏下把登录卡片撑出视口 / Added a dedicated `login-shell` layout container to prevent generic Tailwind width classes from pushing the login card outside narrow viewports.
- 窄屏下限制登录区域宽度，修复 `Create account`、输入框、按钮和右侧说明被截断的问题 / Constrained the login area width on narrow screens, fixing clipping of `Create account`, inputs, buttons, and right-side copy.
- 移动端登录页从居中改为更稳定的左对齐布局，避免 headless Chrome 和真实小屏出现右侧裁切 / Mobile login layout now uses a more stable left-aligned flow to prevent right-side clipping in headless Chrome and real narrow screens.

### 2) 首屏内容一致性修复 / First-Screen Content Consistency

- 页面标题从 `PawTrace · Pixel Pet Social` 改为 `PawTrace · Pet Map & Social`，避免“Pixel”与当前产品表达不匹配 / Page title changed from `PawTrace · Pixel Pet Social` to `PawTrace · Pet Map & Social` to avoid mismatched "Pixel" wording.
- 首屏 `Logo` 占位改为 `PawTrace` / The `Logo` placeholder on the first screen is now `PawTrace`.
- 登录卡片 `True Focus` 改为 `Pet Map`，更贴合当前页面功能 / Login-card `True Focus` is now `Pet Map`, matching the actual feature.
- `PawTrace OS / Signature glass UI` 改为 `Live nearby / Map · Pets · Chat`，避免 UI 风格文案压过产品功能 / `PawTrace OS / Signature glass UI` is now `Live nearby / Map · Pets · Chat`, so product functionality is clearer than style language.
- 样式加载失败日志从 `legacy styles` 改为 `app styles`，避免 7.0.0 已移除 legacy 后继续误导排查 / Style-load error text changed from `legacy styles` to `app styles`, avoiding confusion after legacy removal in 7.0.0.

### 3) 默认主题行为调整 / Default Theme Behavior

- 新用户首次打开不再自动跟随系统暗色模式，默认使用亮色首屏 / First-time users no longer automatically inherit system dark mode; the first screen defaults to light mode.
- 已保存过主题偏好的用户仍保留自己的亮/暗模式选择 / Users with a saved theme preference keep their selected light/dark mode.
- 手动暗色切换继续可用 / Manual dark-mode toggling remains available.

### 4) Qwen AI 命名统一 / Qwen AI Naming Alignment

- 前端视觉诊断请求从 `/api/ai/gemini-diagnosis` 改为 `/api/ai/qwen-diagnosis` / Frontend visual diagnosis now calls `/api/ai/qwen-diagnosis` instead of `/api/ai/gemini-diagnosis`.
- 前端状态文案从 Gemini 改为 Qwen Vision，匹配页面中 Qwen-VL / Qwen-Plus 的模型说明 / Frontend status copy now says Qwen Vision, matching the Qwen-VL / Qwen-Plus model descriptions on the page.
- 后端 `qwen-advice` 和 `qwen-diagnosis` 是当前语义正确入口 / Backend `qwen-advice` and `qwen-diagnosis` are now the semantically correct AI endpoints.
- 后端保留旧 `gemini-advice` 和 `gemini-diagnosis` 路径作为兼容别名，避免旧客户端立即断开 / Backend keeps old `gemini-advice` and `gemini-diagnosis` paths as compatibility aliases so older clients do not immediately break.

## 涉及文件 / Files Changed

- 主站 HTML / Main-site HTML:
  [frontend/index.html](/Users/jeremy/Desktop/Group1-pawtrace/frontend/index.html:1)
- 主站逻辑 / Main-site logic:
  [frontend/public/app/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/app/app.js:1)
- 主站样式 / Main-site styles:
  [frontend/public/app/style.tailwind.css](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/app/style.tailwind.css:1)
- 后端 AI 路由 / Backend AI routes:
  [backend/src/registerRoutes.ts](/Users/jeremy/Desktop/Group1-pawtrace/backend/src/registerRoutes.ts:1)
- 发布日志 / Release log:
  [pawtrace-7.1.0.plan.md](/Users/jeremy/Desktop/Group1-pawtrace/plans/plans/pawtrace-7.1.0.plan.md:1)

## 验证状态 / Verification Status

- 已完成 `git diff --check`，未发现空白或补丁格式问题 / Completed `git diff --check`; no whitespace or patch-format issues found.
- 已完成 `npm run build`，主站、pawtrace-glass 和后端构建通过 / Completed `npm run build`; main site, pawtrace-glass, and backend builds passed.
- 已用 Chrome headless 对移动端首屏截图复查，确认登录卡片和按钮不再右侧裁切 / Rechecked the mobile first screen with Chrome headless screenshots and confirmed the login card and buttons are no longer clipped on the right.
- 构建中仍存在 pawtrace-glass 的 Vite 大包 warning，但不影响 7.1.0 修复范围 / The pawtrace-glass Vite large-bundle warning remains, but it does not affect the 7.1.0 fix scope.

## 交付总结 / Delivery Summary

- 7.1.0 把 7.0.0 后发现的主站 UI 问题快速收口，尤其是移动端登录首屏的裁切和内容不匹配 / 7.1.0 closes the main-site UI issues found after 7.0.0, especially mobile login clipping and content mismatch.
- 这次没有改变 7.0.0 的入口架构，仍保持 `5173` 主站、`3000` API/Monitor、`3001` 展示页的职责分离 / This release does not change the 7.0.0 entry architecture and keeps `5173` for the main site, `3000` for API/Monitor, and `3001` for the showcase.
- 重点是让演示时的首屏更稳定、文案更准确、AI 命名更一致 / The focus is making the demo first screen more stable, copy more accurate, and AI naming more consistent.
