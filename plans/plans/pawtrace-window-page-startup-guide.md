---
name: pawtrace-window-page-startup-guide
overview: 说明 PawTrace 当前各页面在浏览器 window 中的启动方式，包括 legacy 单窗口 tab 页面、React 路由页、pawtrace-glass 独立窗口页，以及关键的 window 级初始化逻辑。
isProject: false
---

# PawTrace 所有页面在 Window 里的启动方式

## 1. 总体结论

- 当前主站 `frontend/index.html` 不是“一个页面一个新窗口”。
- 主站的大多数页面都运行在同一个浏览器 `window` 里，通过单页壳层切换不同 `tab-page`。
- 真正独立成单独窗口/单独端口运行的，主要是 `pawtrace-glass`。
- 项目里另外还有一套 React 路由版前端，它也是单个 `window` 内切路由，不是 `window.open()` 弹新窗。

## 2. 入口分类

### A. Legacy 主站单窗口入口

- 入口文件：[frontend/index.html](/Users/jeremy/Desktop/Group1-pawtrace/frontend/index.html:1)
- 主逻辑：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:319)
- 地图控制器：[frontend/public/map.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/map.js:160)

特点：

- 浏览器先加载 `index.html`
- 页面底部再加载 `/legacy/app.js`
- 然后加载 `/map.js`
- 登录成功后只显示 `#app-root`
- 各业务页通过 `data-tab` 和 `#tab-*` 在同一个 window 内切换

### B. React 路由版前端入口

- React 入口：[frontend/src/main.tsx](/Users/jeremy/Desktop/Group1-pawtrace/frontend/src/main.tsx:1)
- 路由配置：[frontend/src/App.tsx](/Users/jeremy/Desktop/Group1-pawtrace/frontend/src/App.tsx:1)

特点：

- 使用 `createRoot(document.getElementById('root'))`
- 使用 `BrowserRouter`
- 页面通过路由 `/map`、`/pets`、`/chat`、`/profile`、`/monitor` 启动
- 仍然是同一个 window，不是弹新窗

### C. `pawtrace-glass` 独立展示页入口

- 入口：[pawtrace-glass/src/main.tsx](/Users/jeremy/Desktop/Group1-pawtrace/pawtrace-glass/src/main.tsx:1)
- 应用根组件：[pawtrace-glass/src/App.tsx](/Users/jeremy/Desktop/Group1-pawtrace/pawtrace-glass/src/App.tsx:36)

特点：

- 单独挂到自己的 `#root`
- 通常单独跑在一个独立端口窗口里，例如 `http://localhost:3001/`
- 它不是主站 tab 内页，而是独立窗口页

## 3. Legacy 主站的 Window 启动流程

### 3.1 浏览器打开 `frontend/index.html`

页面初始结构有两层：

- 登录层：`#login-screen` [frontend/index.html](/Users/jeremy/Desktop/Group1-pawtrace/frontend/index.html:85)
- 主应用层：`#app-root` [frontend/index.html](/Users/jeremy/Desktop/Group1-pawtrace/frontend/index.html:220)

默认行为：

- 如果本地没有当前用户，就显示 `#login-screen`
- 如果本地已有登录用户，就直接 `showApp(existing)`

对应代码：

- 登录态判断：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:1041)
- 启动主应用函数 `showApp(user)`：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:919)

### 3.2 `DOMContentLoaded` 是 legacy 主站真正的启动时机

主站核心初始化发生在：

- [frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:319)

这里会做的事包括：

- 初始化 modal 系统
- 抓取所有页面 DOM 引用
- 初始化地图控制器
- 初始化 AI 面板默认状态
- 绑定登录、注册、游客进入按钮
- 绑定聊天联系人切换按钮
- 读取本地用户并决定显示登录页还是主应用页

也就是说：

- 页面不是靠 `window.onload` 才启动
- 主要业务启动点是 `document.addEventListener('DOMContentLoaded', ...)`
- 只有少量视觉效果使用了 `window.addEventListener('load', ...)`

## 4. 主站每个页面在 Window 里的启动方式

### 4.1 Login 页面启动方式

页面节点：

- [frontend/index.html](/Users/jeremy/Desktop/Group1-pawtrace/frontend/index.html:85)

启动方式：

- 浏览器进入 `index.html` 时先出现
- 如果 `localStorage` 没有当前用户，就保持显示
- 用户登录、注册或游客进入后，调用 `showApp(user)` 隐藏登录页

触发入口：

- 登录表单提交：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:958)
- 注册表单提交：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:972)
- 游客进入：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:1033)

结论：

- Login 页不是单独窗口
- 它只是同一个 window 里的初始壳层

### 4.2 Map 页面启动方式

页面节点：

- [frontend/index.html](/Users/jeremy/Desktop/Group1-pawtrace/frontend/index.html:304)

启动方式：

- 它是默认 tab
- `initTabs()` 最后会执行 `activateTab('map')`
- 登录后 `showApp()` 调 `initTabs()`，所以 Map 是主站的默认第一页

对应代码：

- `initTabs()`：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:1084)
- `activateTab('map')`：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:1143)

Map 的 window 级附加启动：

- 页面启动时，如果存在 `window.PawMapController`，会 `new window.PawMapController(mapOptions)` 然后 `init()`
- 代码位置：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:373)
- 地图控制器类定义在：[frontend/public/map.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/map.js:160)

Map 的特殊 window 逻辑：

- 绑定了 `window.focusPetOnMap = (petId) => { ... }`
- 代码位置：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:378)
- 作用是其他页面可以通过全局函数把当前 window 切回 Map 并聚焦某只宠物

结论：

- Map 页在同一个 window 里启动
- 默认启动方式是“登录成功后自动激活”
- 不是新开窗口

### 4.3 Pets 页面启动方式

页面节点：

- [frontend/index.html](/Users/jeremy/Desktop/Group1-pawtrace/frontend/index.html:410)

启动方式：

- 登录后 `showApp()` 会执行 `initPets()`
- 但 `Pets` 页默认不显示
- 只有点击 `.app-tab[data-tab="pets"]` 时，才在同一个 window 内把 `#tab-pets` 显示出来

对应代码：

- `showApp()` 调 `initPets()`：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:934)
- tab 激活逻辑：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:1108)

结论：

- Pets 页属于“预初始化 + 点击切换显示”
- 页面本身不弹新窗

### 4.4 Chat 页面启动方式

页面节点：

- [frontend/index.html](/Users/jeremy/Desktop/Group1-pawtrace/frontend/index.html:538)

启动方式：

- 登录后 `showApp()` 会执行 `initChat()`
- 真正显示要靠点击 `data-tab="chat"`
- 在移动端，如果切到 Chat，代码会自动打开联系人侧栏状态

对应代码：

- `showApp()` 调 `initChat()`：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:937)
- Chat tab 激活处理：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:1125)

结论：

- Chat 页也是单 window tab 页
- 不是新窗口，而是当前 window 内切显示

### 4.5 Health 页面启动方式

页面节点：

- [frontend/index.html](/Users/jeremy/Desktop/Group1-pawtrace/frontend/index.html:725)

启动方式：

- 登录后 `showApp()` 会执行 `initHealthMonitor()`
- 页面默认隐藏
- 点击 `data-tab="health"` 后在当前 window 内显示 `#tab-health`

对应代码：

- `showApp()` 调 `initHealthMonitor()`：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:935)
- tab 切换逻辑：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:1108)

结论：

- Health 是“登录后初始化，点击 tab 才显示”的单窗口页面

### 4.6 AI 页面启动方式

页面节点：

- [frontend/index.html](/Users/jeremy/Desktop/Group1-pawtrace/frontend/index.html:874)

启动方式：

- DOMContentLoaded 时先抓取 AI 面板相关 DOM
- 默认调用 `setSelectedAIService('diagnosis')`
- 页面实际显示要靠 `data-tab="ai"` 切换

对应代码：

- AI 控件初始化：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:327)
- 默认服务选择：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:486)

结论：

- AI 页也是当前 window 内的 tab 启动
- 不是单独窗口

### 4.7 Profile 页面启动方式

页面节点：

- [frontend/index.html](/Users/jeremy/Desktop/Group1-pawtrace/frontend/index.html:642)

启动方式：

- 登录成功后 `showApp(user)` 会立即把当前用户资料写进 Profile 相关 DOM
- 页面默认隐藏
- 点击 `data-tab="profile"` 后显示

对应代码：

- `showApp(user)` 中更新 Profile：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:925)
- tab 切换显示：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:1108)

结论：

- Profile 页属于“数据先写入，页面后显示”的同窗口页

## 5. 主站里的弹窗页面在 Window 里的启动方式

这类页面不是独立路由，也不是新窗口，而是 modal：

- Profile Edit Modal
- Share Image Modal

启动方式：

- `DOMContentLoaded` 时先 `initModalSystem()`
- 再通过按钮事件调用 `setModalState(modalId, true)`

对应代码：

- Modal 系统初始化：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:127)
- 打开资料编辑弹窗 `openProfileEditModal()`：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:154)
- 打开图片分享弹窗 `openShareImageModal()`：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:174)

结论：

- 这些“页面”本质上不是页面
- 它们只是同一 window 里的浮层

## 6. React 路由版页面在 Window 里的启动方式

React 版入口：

- [frontend/src/main.tsx](/Users/jeremy/Desktop/Group1-pawtrace/frontend/src/main.tsx:1)

启动方式：

- 浏览器加载 React 构建产物
- `createRoot(document.getElementById('root'))` 挂载应用
- 再由 `BrowserRouter` 决定显示哪个页面

路由页面：

- `/map`
- `/pets`
- `/chat`
- `/profile`
- `/monitor`

对应代码：

- 路由定义：[frontend/src/App.tsx](/Users/jeremy/Desktop/Group1-pawtrace/frontend/src/App.tsx:22)

结论：

- React 版不是靠 `data-tab` 启动
- 而是靠浏览器地址路径启动
- 但依然是同一个 window 内的 SPA 路由切换

## 7. `pawtrace-glass` 页面在 Window 里的启动方式

入口：

- [pawtrace-glass/src/main.tsx](/Users/jeremy/Desktop/Group1-pawtrace/pawtrace-glass/src/main.tsx:1)

启动方式：

- Vite 启动独立应用
- 浏览器打开独立端口，例如 `http://localhost:3001/`
- `ReactDOM.createRoot(rootElement).render(<App />)` 挂载整个大屏应用

结论：

- 这是当前项目里最明确的“独立窗口页”
- 它不和主站 `Map / Pets / Chat / Health / AI / Profile` 共用一个 tab 壳

## 8. 当前项目里和 Window 直接相关的关键全局行为

### 8.1 `window.PawMapController`

- 来源：[frontend/public/map.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/map.js:1)
- 用法：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:373)
- 作用：主站在当前 window 内初始化地图控制器

### 8.2 `window.focusPetOnMap`

- 定义：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:378)
- 作用：从别的模块跳回 Map 页并聚焦宠物

### 8.3 `window.addEventListener('load', handleScrollReveal)`

- 位置：[frontend/public/legacy/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/legacy/app.js:225)
- 作用：页面加载后触发滚动 reveal 动效

### 8.4 `window.open(url, '_blank')`

- 位置：[frontend/public/map.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/map.js:516)
- 作用：地图店铺外链会新开标签页
- 这不是业务页面启动方式，只是外链打开方式

## 9. 最简总结

- `frontend/index.html` 主站：所有业务页都在同一个 browser window 里，通过 tab 显示隐藏启动。
- `Map / Pets / Chat / Health / AI / Profile`：都不是新窗口，都是 `#tab-*` 页面。
- Login：是同一个 window 里的初始登录壳层。
- Modal：也是同一个 window 里的浮层，不算独立页面。
- React 版前端：通过 `BrowserRouter` 在同一个 window 内按路径切换。
- `pawtrace-glass`：是独立窗口/独立端口的单独页面。

## 10. 如果你后面还要继续用

如果你要把这份文档继续扩成“老师答辩版”或“开发交接版”，下一步最适合补两部分：

- 一份“页面启动顺序图”
- 一份“每个页面对应的 JS 初始化函数清单”
