---
name: pawtrace-theme-and-modal-repair-release
overview: 在 5.1.1 界面收口版本基础上，继续完成一轮“修问题而不是堆功能”的稳定性迭代：重建整站夜间模式体系，修复对话框消失与状态错乱问题，并统一不同页面之间的壳层、顶部留白和内容对齐。 / Based on the 5.1.1 UI stabilization release, deliver another issue-fix iteration rather than a feature-heavy release: rebuild the site-wide dark-mode system, fix disappearing dialog and modal-state bugs, and unify page shells, top spacing, and cross-page alignment.
todos:
  - id: dark-mode-rebuild
    content: 删除旧的分散式夜间模式覆盖，改为统一的主题变量系统，确保所有页面和组件共用同一套亮暗色逻辑。 / Remove the old fragmented dark-mode overrides and replace them with a unified theme-token system so all pages and components share the same light/dark logic.
    status: completed
  - id: modal-stability-fix
    content: 修复资料编辑和图片分享对话框的消失、状态残留、遮罩交互和关闭逻辑不稳定问题。 / Fix disappearing, stale-state, overlay interaction, and close-behavior issues in the profile-edit and image-share dialogs.
    status: completed
  - id: page-shell-alignment
    content: 统一各页面外边距、顶部壳层、内容宽度和 tab 区块对齐，减少顶部空白和不同页面“不在一条线”的问题。 / Unify page margins, top shells, content widths, and tab-section alignment to reduce blank top space and cross-page misalignment.
    status: completed
  - id: dark-mode-component-pass
    content: 补齐导航、卡片、聊天列表、地图标记、徽章、按钮和输入框在夜间模式下的颜色与文字反转。 / Complete dark-mode styling for navigation, cards, chat lists, map markers, badges, buttons, and inputs.
    status: completed
  - id: regression-check
    content: 完成基础语法与构建验证，确认 5.1.2 报告对应的修复版本可以继续迭代。 / Complete baseline syntax and build verification to confirm the 5.1.2 fixes are safe to continue iterating on.
    status: completed
isProject: false
---

# PawTrace 5.1.2 夜间模式与弹窗修复报告 / PawTrace 5.1.2 Dark Mode and Modal Repair Report

## 版本定位 / Release Positioning

- **5.1.1 定位 / 5.1.1 Focus**：完成一轮界面收口、地图/NFC/健康监测落位、移动端压缩和基础交互稳定 / stabilize the main UI, land map/NFC/health-monitoring surfaces, compress mobile layout, and fix baseline interaction issues
- **5.1.2 当前定位 / 5.1.2 Focus**：不新增模块，专注修复“对话框消失、夜间模式失效、页面不对齐”这三类直接影响体验的问题 / add no new modules and focus on three experience-breaking issues: disappearing dialogs, broken dark mode, and cross-page misalignment
- **版本关键词 / Release Keywords**：夜间模式重构、弹窗修复、页面对齐、主题统一、稳定性回收 / dark-mode rebuild, modal repair, page alignment, theme unification, and stability recovery

## 5.1.2 主要更新内容 / Key Updates in 5.1.2

### 1) 夜间模式整套重建 / Dark Mode Rebuilt from the Ground Up

- 删除旧的 `body.dark` 内联覆盖，不再让 HTML 内部的临时补丁和样式文件互相打架 / Remove the old inline `body.dark` overrides so temporary HTML patches no longer conflict with the stylesheet.
- 建立统一主题变量体系，集中管理背景、文字、边框、按钮、卡片、导航、悬浮层和地图滤镜 / Build a unified token-based theme system to manage backgrounds, text, borders, buttons, cards, navigation, overlays, and map filters in one place.
- 夜间模式切换逻辑改为统一使用 `theme-dark`，同时同步 `theme-color` 和浏览器 `color-scheme` / Switch the dark-mode logic to a single `theme-dark` class and synchronize `theme-color` plus browser `color-scheme`.

### 2) 对话框消失 Bug 修复 / Dialog Disappearing Bug Fix

- `Profile Edit` 和 `Share Image` 弹窗改成统一 modal 壳层，不再各自直接切 `hidden` / Convert `Profile Edit` and `Share Image` into a shared modal shell instead of each one directly toggling `hidden`.
- 新增统一的弹窗状态管理，处理打开、关闭、聚焦、遮罩点击、`Esc` 退出和滚动锁定 / Add shared modal state management for open/close, focus handoff, overlay click close, `Esc` exit, and body scroll lock.
- 在页面重绘、切页、重新进入应用或退出登录时，会自动清理残留弹窗状态，避免“弹窗莫名消失”或“背景仍被锁住” / Automatically clear stale modal state during rerender, app re-entry, tab changes, or logout to avoid disappearing dialogs and stuck background scroll.

### 3) 页面壳层与对齐修复 / Page Shell and Alignment Repair

- 统一 `Map / Pets / Chat / Health / AI / Profile` 的外层内容宽度、页头位置、顶部说明区和 tab 页面拉伸行为 / Unify outer content width, page-header position, top description block, and tab stretch behavior across Map, Pets, Chat, Health, AI, and Profile.
- 修掉部分页面顶部多余空白和内容起点不一致的问题，让各页标题与正文落点在同一视觉基线 / Remove excess top whitespace and inconsistent content starting points so page titles and bodies share the same visual baseline.
- 调整主内容区域、侧栏与移动底部导航的布局关系，减少不同设备下页面“挤、偏、错位”的感觉 / Adjust the relationship between main content, sidebar, and mobile bottom navigation to reduce cramped, offset, or misaligned layouts on different devices.

### 4) 夜间组件补齐 / Dark-Mode Component Coverage

- 补齐卡片、输入框、按钮、导航按钮、底部 tab、聊天联系人、空状态、悬浮资料卡、地图宠物点和推荐卡在夜间模式下的配色 / Complete dark-mode coverage for cards, inputs, buttons, nav buttons, bottom tabs, chat contacts, empty states, hover cards, map pet pins, and recommendation cards.
- 补齐登录页、徽章、标签、地图标记和健康/AI 文本面板的暗色视觉，减少“部分变黑、部分还停留白天模式”的割裂 / Extend dark-mode visuals to the login page, badges, tags, map markers, and health/AI text panels to remove the mixed dark/light appearance.
- 保留原本偏暖的品牌色方向，但把夜间层级改得更克制，避免透明过头、文字发灰或卡片发脏 / Preserve the warmer brand direction while making dark-mode layers more restrained, avoiding over-transparency, gray text, or muddy cards.

## 具体交付结果 / Delivered Outcomes

- live 前端夜间模式从“多处补丁叠加”改成“单一主题源” / The live frontend dark mode moves from stacked patches to a single source of truth.
- 当前两个核心对话框已统一到同一交互规则，关闭方式和状态回收一致 / The two core dialogs now follow the same interaction rules and state cleanup path.
- 页面壳层、页头与内容宽度进一步统一，为后续继续做 App 适配打下更稳的结构基础 / Page shells, headers, and content widths are further unified to support later app adaptation work on a more stable structure.
- 新增 `pawtrace-5.1.2.plan.md` 作为当前轮次的修复报告 / Add `pawtrace-5.1.2.plan.md` as the report for this repair iteration.

## 验证状态 / Verification Status

- 已完成 `node --check frontend/public/legacy/app.js` / Completed `node --check frontend/public/legacy/app.js`
- 已完成 `node --check frontend/public/map.js` / Completed `node --check frontend/public/map.js`
- 已完成 `npm run build --prefix frontend` / Completed `npm run build --prefix frontend`
- 未完成自动化浏览器页面校验：本地 Playwright CLI 包装脚本不可用 / Automated browser-page validation was not completed because the local Playwright CLI wrapper is currently unavailable

## 下一步建议 / Recommended Next Step

- 在 5.1.2 基线之上继续做逐页精修，优先检查 `Chat / Health / AI Assist / Profile` 在手机端和暗色模式下的细节统一 / Continue page-by-page refinement on top of the 5.1.2 baseline, prioritizing `Chat / Health / AI Assist / Profile` details in mobile and dark mode.
