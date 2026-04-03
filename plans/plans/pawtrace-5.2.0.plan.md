---
name: pawtrace-layout-and-map-adaptation-release
overview: 在 5.1.2 夜间模式与弹窗修复版本基础上，继续完成一轮以“页面结构统一、地图可用性恢复、手机端适配修正”为核心的界面修复迭代：修掉 Map 页面的大面积空白、统一 tab 切换后的页面壳层表现，恢复店铺与宠物在校园地图上的可见性，并重新调整手机端地图与详情卡的展示逻辑。 / Based on the 5.1.2 dark-mode and modal-repair release, deliver another UI-fix iteration centered on structural consistency, map usability recovery, and mobile adaptation: remove oversized blank areas in Map, stabilize tab-shell behavior across page switches, restore visible shop and pet markers on the campus map, and redesign how the mobile map and detail card are presented.
todos:
  - id: tab-shell-normalization
    content: 统一主内容区和 tab 页面结构，修复页面切换后高度不一致、局部页面被异常拉长的问题。 / Normalize the main-content and tab-page structure so tab switches no longer produce inconsistent heights or abnormally stretched pages.
    status: completed
  - id: map-sidebar-layout-fix
    content: 修复桌面端 Map 侧栏列宽塌陷导致的整体空白和内容竖向拉长问题。 / Fix the desktop Map sidebar column collapse that caused large blank regions and extreme vertical stretching.
    status: completed
  - id: marker-visibility-recovery
    content: 提升店铺与宠物定位点的视觉强度，并重新校准校园地图上的默认坐标。 / Increase the visibility of shop and pet markers and recalibrate their default coordinates on the campus map.
    status: completed
  - id: mobile-map-behavior
    content: 调整手机端地图首屏逻辑，避免详情卡默认覆盖地图，确保用户先看到地图本体与关键点位。 / Adjust the mobile map first-screen behavior so the detail card does not cover the map by default and users see the map itself first.
    status: completed
  - id: ui-density-cleanup
    content: 收掉 AI / Health 等页面里会制造空白的拉伸卡片和过高容器，减轻页面“空”和“不齐”的问题。 / Remove stretch cards and oversized containers in AI / Health and similar pages to reduce emptiness and visual misalignment.
    status: completed
  - id: browser-verification
    content: 完成语法、构建与桌面/手机浏览器截图验证，确认 5.2.0 报告对应的界面修复确实在 live 页面生效。 / Complete syntax, build, and desktop/mobile browser screenshot verification to confirm the 5.2.0 fixes are actually reflected in the live frontend.
    status: completed
isProject: false
---

# PawTrace 5.2.0 页面结构与地图适配修复报告 / PawTrace 5.2.0 Layout and Map Adaptation Repair Report

## 版本定位 / Release Positioning

- **5.1.2 定位 / 5.1.2 Focus**：重建夜间模式体系、修复对话框消失和页面壳层对齐 / rebuild dark mode, fix disappearing dialogs, and repair basic shell alignment
- **5.2.0 当前定位 / 5.2.0 Focus**：继续解决“看起来还像坏的”问题，重点收掉页面空缺、tab 切换尺寸跳动、地图点位缺失和手机地图体验不对的问题 / continue fixing issues that still make the product feel broken, especially blank page regions, tab-size jumping, missing map points, and the awkward mobile map experience
- **版本关键词 / Release Keywords**：布局统一、地图修复、点位回归、手机适配、页面收口、真实浏览器验证 / layout unification, map repair, marker recovery, mobile adaptation, page tightening, and real-browser verification

## 5.2.0 主要更新内容 / Key Updates in 5.2.0

### 1) 页面壳层与尺寸统一 / Page Shell and Size Normalization

- 修复 `Map / Pets / Health / AI` 等页面在 tab 切换后视觉高度不一致的问题，不再因为容器拉伸策略不同而出现“这一页很高、那一页很短”的割裂感 / Fix cross-tab height inconsistency so pages no longer feel mismatched because of different stretch behaviors.
- 收掉主内容区里会制造大面积空白的结构性问题，避免页面被无意义拉长 / Remove the structural causes of oversized blank areas inside the main content shell.
- 保留完整内容展示，但让页面高度更接近真实内容体量，不再用错误的外层撑开整页 / Keep full content visible while making page height reflect actual content instead of being forced by the wrong wrapper.

### 2) Map 桌面布局修复 / Desktop Map Layout Repair

- 修复 Map 页面右侧栏在桌面端宽度塌成 `0px` 的问题，这个问题原本会把推荐卡和宠物定位卡挤成极窄列，并把整页高度异常拉长 / Fix the desktop Map sidebar collapsing to `0px`, which previously squeezed recommendation and pet-location cards into a near-zero-width column and stretched the page vertically.
- 将地图主区域与右侧栏重新交给统一的自定义栅格控制，不再混用失效的列宽写法 / Move the map content and sidebar back to a stable custom grid instead of relying on a broken column declaration.
- 桌面端现在恢复为“地图主视区 + 正常宽度侧栏”的可读布局 / The desktop map now returns to a readable “main map area + properly sized sidebar” layout.

### 3) 地图点位与坐标修复 / Marker Visibility and Coordinate Repair

- 重做店铺 marker 的视觉样式，加入更明显的图标、外框和标签，让用户一眼能看出地图上确实有店铺点位 / Redesign shop markers with clearer icons, outlines, and labels so users can immediately see that shop locations exist on the map.
- 提升宠物定位点的可见性，补充更强的圆形底、阴影和 focus 状态 / Increase tracked-pet visibility with stronger circular backing, shadow, and focus states.
- 按 `m1.jpg` 校园图重新微调默认店铺与宠物坐标，使演示点位落到更合理的位置 / Recalibrate default shop and pet coordinates against the `m1.jpg` campus map so demo points land in more believable locations.
- 切回 `Map` tab 时会自动重新同步地图框与 marker，避免切页后点位错位或像消失一样 / Re-sync the map frame and markers when switching back to the Map tab so points do not appear offset or missing after tab changes.

### 4) 手机端 Map 体验修复 / Mobile Map Experience Repair

- 手机端不再默认弹出第一家店铺详情卡，首屏优先展示地图本体 / On mobile, the first shop detail card no longer opens by default; the map itself is shown first.
- `location-card` 的定位规则重新分离为桌面 absolute、手机 static，避免手机上详情卡错误覆盖地图 / Split `location-card` positioning into desktop absolute and mobile static behavior so the mobile detail card no longer wrongly covers the map.
- 提高手机端地图容器高度，让点位不会过度贴边，也减少“地图像被压扁”的感觉 / Increase the mobile map container height so markers do not sit too close to the edges and the map no longer feels overly compressed.

### 5) 页面空白与信息密度优化 / Whitespace and Density Cleanup

- AI 与 Health 页里几个会制造空白的 `h-full`、超高占位面板和过松的间距被压缩 / Several `h-full` patterns, oversized placeholders, and loose gaps in AI and Health were tightened to reduce empty space.
- 诊断区和健康区改成更贴近内容长度的容器，不再为了“看起来齐”而撑出不必要的空块 / Diagnosis and health panels now size closer to their real content instead of creating fake visual balance with excess empty area.

## 具体交付结果 / Delivered Outcomes

- `Map` 页已经恢复为可读、可点、可看懂的布局，店铺和宠物点位不会再像“没加载出来” / The `Map` page is readable and interactive again, and shop/pet markers no longer look like they failed to load.
- 桌面端的大面积空白已经明显收掉，页面不再因为侧栏异常而整页被拉长 / Large blank areas on desktop have been substantially removed, and the page is no longer stretched by a broken sidebar.
- 手机端 `Map` 首屏先展示地图，详情卡变成按需展开，更符合 App 视角下的浏览逻辑 / The mobile `Map` first screen now shows the map first, with the detail card opened on demand in a way that better fits an app-style flow.
- 新增 `pawtrace-5.2.0.plan.md` 作为本轮版本报告文件 / Add `pawtrace-5.2.0.plan.md` as the report file for this iteration.

## 验证状态 / Verification Status

- 已完成 `node --check frontend/public/legacy/app.js` / Completed `node --check frontend/public/legacy/app.js`
- 已完成 `node --check frontend/public/map.js` / Completed `node --check frontend/public/map.js`
- 已完成 `npm run build --prefix frontend` / Completed `npm run build --prefix frontend`
- 已完成桌面端与 iPhone 13 视角的 Playwright 截图验证，用于确认布局和地图修复效果 / Completed Playwright screenshot verification for desktop and iPhone 13 views to confirm the layout and map fixes

## 下一步建议 / Recommended Next Step

- 在 5.2.0 基线上继续做逐页精修，优先处理 `Pets / Chat / Profile` 的手机端密度与统一性，再决定是否进入 `5.2.1` 的打包准备版本 / Continue page-by-page refinement on top of 5.2.0, prioritizing mobile density and visual consistency in `Pets / Chat / Profile`, then decide whether to move into a `5.2.1` packaging-prep release.
