---
name: pawtrace-product-experience-upgrade
overview: 在 4.0.1 完整前后端重构完成后，继续把 PawTrace 升级为更成熟的日常宠物追踪与陪伴产品：加入夜晚模式、通知中心、智能围栏预警、健康趋势分析、离线能力、多宠协作与隐私控制，提升可用性、稳定性与产品完成度。 / After the 4.0.1 full-stack rebuild, upgrade PawTrace into a more mature day-to-day pet tracking and companionship product by adding dark mode, a notification center, smart geofence alerts, health trend analysis, offline support, multi-pet collaboration, and privacy controls.
todos:
  - id: theme-system
    content: 建立完整主题系统：支持浅色/深色/跟随系统三种模式，覆盖地图、聊天、健康、监控、登录等核心页面。 / Build a complete theme system with Light, Dark, and System modes across core pages including map, chat, health, monitor, and login.
    status: pending
  - id: notification-center
    content: 新增通知中心：整合围栏告警、健康异常、NFC 扫描记录、设备离线提醒，并支持站内已读/未读状态。 / Add a notification center that aggregates geofence alerts, health anomalies, NFC scans, device offline reminders, and in-app read/unread states.
    status: pending
  - id: smart-geofence
    content: 增强地理围栏能力：支持安全区域配置、离开/进入提醒、异常停留识别与历史轨迹回放。 / Enhance geofencing with safe-zone configuration, enter/exit alerts, abnormal dwell detection, and historical route playback.
    status: pending
  - id: health-insights
    content: 上线健康趋势看板：体重、饮水、活动量、体温等指标图表化，并给出 AI 风险提示与护理建议。 / Launch a health insights dashboard with charts for weight, water intake, activity, temperature, and AI-assisted risk prompts plus care suggestions.
    status: pending
  - id: offline-mode
    content: 提供弱网与离线模式：缓存最近宠物资料、地图快照、聊天历史与待同步上报数据。 / Provide weak-network and offline mode with cached pet data, map snapshots, chat history, and pending sync records.
    status: pending
  - id: multi-pet-family
    content: 支持多宠家庭与成员协作：主人/家人/宠物店角色分级，允许共享查看与操作权限。 / Support multi-pet households and role-based collaboration for owners, family members, and pet-care providers.
    status: pending
  - id: nfc-upgrade
    content: 升级 NFC 名片体验：新增走失求助卡片、紧急联系人展示、扫码日志与一键联系入口。 / Upgrade the NFC card experience with lost-pet help cards, emergency contacts, scan logs, and one-tap contact actions.
    status: pending
  - id: privacy-controls
    content: 增加隐私与安全控制：位置共享开关、数据保留周期、设备授权管理与异常登录提醒。 / Add privacy and security controls including location-sharing toggles, data retention settings, device authorization management, and suspicious-login alerts.
    status: pending
  - id: engagement-features
    content: 增加互动体验：宠物成长记录、每日陪伴任务、喂食/遛宠提醒与成就系统。 / Add engagement features such as pet growth logs, daily care tasks, feeding/walking reminders, and an achievement system.
    status: pending
  - id: release-verification
    content: 完成 5.0.1 自测与发布验证：主题切换、通知链路、围栏告警、离线同步、权限协作等核心流程覆盖。 / Complete 5.0.1 verification across theme switching, notification flow, geofence alerts, offline sync, collaboration, and permission-sensitive flows.
    status: pending
isProject: false
---

# PawTrace 5.0.1 产品体验升级计划 / PawTrace 5.0.1 Product Experience Upgrade Plan

## 版本定位 / Release Positioning

- **4.0.1 已完成重点 / 4.0.1 Completed Focus**：完整前后端重构、标准鉴权、数据迁移、AI 代理规范化、前端 React 化与开发/生产流程打通 / full-stack rebuild, standard auth, data migration, AI proxy standardization, React frontend migration, and aligned dev/prod workflows
- **5.0.1 目标方向 / 5.0.1 Direction**：从“能跑的完整系统”升级为“更适合真实用户长期使用的产品” / evolve from a technically complete system into a product better suited for long-term real-world use
- **版本关键词 / Release Keywords**：夜晚模式、智能提醒、健康洞察、离线容错、多人协作、隐私安全 / dark mode, smart alerts, health insights, offline resilience, multi-user collaboration, and privacy and security

## 核心升级目标 / Core Upgrade Goals

- 提升日常使用体验，让用户在白天/夜间、强网/弱网环境下都能稳定使用 / Improve everyday usability so the app remains reliable in day/night and strong/weak network conditions.
- 增加主动提醒与智能洞察，让 PawTrace 不只是记录工具，而是有陪伴和预警能力的产品 / Add proactive alerts and intelligent insights so PawTrace becomes more than a logging tool.
- 优化家庭协作与权限体系，支持真实多角色场景 / Improve household collaboration and permissions for real multi-role usage.
- 为后续会员功能、设备接入与运营增长能力预留扩展空间 / Leave room for future memberships, device integrations, and growth-oriented product features.

## 5.0.1 主要更新内容 / Key Updates in 5.0.1

### 1) 夜晚模式与主题系统 / Dark Mode and Theme System

- 新增 **Light / Dark / System** 三种主题模式 / Add **Light / Dark / System** theme modes.
- 地图、聊天、健康面板、监控页、登录页统一主题变量 / Unify theme variables across map, chat, health panels, monitor, and login pages.
- 深色模式下优化高对比度文字、按钮与卡片层级，降低夜间刺眼感 / Tune high-contrast text, buttons, and card hierarchy for comfortable nighttime use.
- 将现有橙色品牌风格延展为白天与夜间两套视觉语言 / Extend the current orange brand system into distinct daytime and nighttime visual languages.

### 2) 通知中心与消息聚合 / Notification Center and Event Aggregation

- 首页新增通知中心入口，统一展示围栏告警、健康异常提醒、NFC 扫描记录、设备离线提醒、AI 建议卡片 / Add a notification center entry on the home screen to aggregate geofence alerts, health anomalies, NFC scans, device offline reminders, and AI suggestion cards.
- 支持已读/未读状态、按类型筛选、最近时间排序 / Support read/unread states, type-based filters, and reverse-chronological sorting.
- 为后续接入邮件/短信/推送通知预留事件模型 / Reserve an event model for future email, SMS, and push notification integrations.

### 3) 智能围栏与轨迹增强 / Smart Geofence and Route Enhancements

- 允许用户为宠物设置多个安全区域（家、宠物医院、寄养点、常去公园） / Let users configure multiple safe zones such as home, vet clinic, boarding, or a favorite park.
- 宠物离开安全区时触发提醒，重新进入时自动恢复状态 / Trigger alerts when a pet exits a safe zone and restore state when it re-enters.
- 支持历史轨迹回放、停留时长分析与异常移动速度提示 / Support historical route playback, dwell-time analysis, and abnormal speed prompts.
- 在地图上区分实时位置、最后活跃位置与异常位置 / Distinguish live position, last active position, and abnormal locations on the map.

### 4) 健康趋势与 AI 洞察 / Health Trends and AI Insights

- 将健康数据从“单次记录”升级为“趋势分析” / Upgrade health data from isolated records to trend analysis.
- 提供体重、饮水、活动量、心情/状态、体温等维度图表 / Add charts for weight, water intake, activity, mood/status, and temperature.
- 结合 AI 服务生成简洁的阶段性提示，例如活动量持续下降、饮水量异常波动、建议复查或调整喂养节奏 / Use AI to generate concise phase-based prompts, such as declining activity, unstable hydration, or suggestions for follow-up checks and feeding adjustments.
- 健康页支持周/月视图切换 / Support weekly and monthly views in the health page.

### 5) 弱网与离线能力 / Weak-Network and Offline Support

- 前端缓存最近一次宠物列表、详情、聊天历史与地图快照 / Cache the latest pet lists, details, chat history, and map snapshots on the frontend.
- 弱网环境下允许先记录健康数据与位置上报，恢复联网后自动同步 / Allow health records and location reports to be queued locally and synced once connectivity returns.
- 聊天页面提供“消息待发送”状态，避免用户误以为内容丢失 / Show a pending-send state in chat so users do not assume messages were lost.
- 对关键接口增加重试与冲突处理策略 / Add retry and conflict-handling strategies to key APIs.

### 6) 多宠家庭与协作权限 / Multi-Pet Households and Collaborative Permissions

- 支持一个账号管理多个宠物档案 / Support multiple pet profiles under one account.
- 支持邀请家庭成员共同查看宠物动态 / Allow family members to be invited to view and collaborate on pet activity.
- 角色区分：Owner、Family、Caregiver / Define roles for Owner, Family, and Caregiver.
- 对位置共享、健康修改、NFC 配置等敏感操作增加权限控制 / Apply permission controls to sensitive operations such as location sharing, health edits, and NFC configuration.

### 7) NFC 名片与走失模式升级 / NFC Card and Lost-Pet Mode Upgrade

- 宠物 NFC 页面新增“走失求助模式” / Add a lost-pet assistance mode to the pet NFC page.
- 扫描后可展示宠物名称、注意事项、紧急联系人、是否可直接拨号/发消息 / After scanning, display the pet name, care notes, emergency contacts, and direct call/message actions where appropriate.
- 后台记录每次扫码时间与大致来源，便于主人追踪找回线索 / Record scan time and rough source context to help owners trace recovery leads.
- 签名与公开信息仍保持服务端校验，避免被恶意篡改 / Keep server-side validation for signatures and public data to prevent tampering.

### 8) 隐私与安全增强 / Privacy and Security Enhancements

- 用户可配置位置共享时段与共享对象 / Let users configure location-sharing windows and sharing targets.
- 增加设备授权管理页，查看最近登录设备与活跃状态 / Add a device authorization page for recent logins and active sessions.
- 支持异常登录提醒、敏感操作二次确认 / Support suspicious-login alerts and confirmation steps for sensitive actions.
- 数据可配置保留周期，便于后续满足合规需求 / Support configurable data retention periods to prepare for future compliance needs.

### 9) 陪伴型互动功能 / Engagement and Companion Features

- 新增宠物成长记录时间线，支持上传照片、事件笔记、纪念日 / Add a pet growth timeline with photos, notes, and milestone dates.
- 增加每日提醒：喂食、遛宠、洗澡、驱虫、复诊 / Add daily reminders for feeding, walking, bathing, deworming, and follow-up visits.
- 增加轻量成就系统，例如“连续记录 7 天健康数据” / Add a lightweight achievement system such as “recorded health data for 7 straight days.”
- 提升产品粘性，为后续会员订阅功能做准备 / Improve retention and lay groundwork for future subscription features.

## 架构与实现侧补充 / Architecture and Implementation Notes

- **前端 / Frontend**：引入统一 design tokens（颜色、阴影、圆角、状态色），扩展全局状态与缓存策略，支持通知、主题、离线队列 / Introduce shared design tokens and extend app state/cache strategy to support notifications, themes, and offline queues.
- **后端 / Backend**：新增通知事件表、围栏规则表、成员协作关系表、设备授权表，并增加离线同步接口、消息状态回执与通知聚合查询 / Add tables for notification events, geofence rules, collaboration relationships, and device authorizations, plus offline sync APIs, message receipts, and notification aggregation queries.
- **数据库 / Database**：补充通知、围栏、协作、登录设备、成长记录相关 schema 与迁移 / Add schemas and migrations for notifications, geofences, collaboration, login devices, and growth records.
- **AI 服务 / AI Service**：在健康分析场景提供可解释的摘要，不直接替代医疗结论 / Provide explainable summaries for health analysis without presenting them as medical conclusions.

## 具体实施步骤 / Implementation Steps

### 1) 主题系统重构 / Theme System Refactor

- 把现有 UI 配色抽离为统一主题变量 / Extract current UI colors into a unified theme variable system.
- 为深色模式补齐地图底图、弹窗、表单、卡片、图表的视觉方案 / Add dark-mode visuals for map layers, modals, forms, cards, and charts.
- 增加主题切换入口与本地持久化 / Add a theme switcher and persist the user preference locally.

### 2) 通知中心落地 / Notification Center Delivery

- 建立通知事件模型与通知查询接口 / Build a notification event model and notification query APIs.
- 在前端加入通知列表、红点状态与消息详情跳转 / Add a frontend notification list, red-dot indicators, and detail-page navigation.
- 打通围栏、NFC、健康异常等事件来源 / Connect geofence, NFC, and health anomaly events into the same pipeline.

### 3) 围栏与轨迹能力扩展 / Geofence and Route Capability Expansion

- 支持安全区域 CRUD / Support CRUD for safe zones.
- 增加轨迹回放接口与地图绘制能力 / Add route playback APIs and corresponding map rendering.
- 定义异常移动、离开安全区、长时间静止等规则 / Define rules for abnormal movement, zone exit, and prolonged inactivity.

### 4) 健康数据分析升级 / Health Analytics Upgrade

- 将健康记录标准化 / Standardize health records.
- 接入图表组件并实现周/月统计 / Integrate chart components with weekly and monthly aggregations.
- 联动 AI 输出健康摘要与建议卡片 / Connect AI-generated summaries and recommendation cards.

### 5) 离线缓存与同步 / Offline Cache and Sync

- 设计前端离线队列与重试机制 / Design a frontend offline queue with retry behavior.
- 为关键写操作增加幂等标识 / Add idempotency identifiers to critical write operations.
- 处理同步成功、失败、冲突三类状态 / Handle success, failure, and conflict states during sync.

### 6) 协作与权限系统 / Collaboration and Permissions

- 扩展用户与宠物之间的关系模型 / Extend the relationship model between users and pets.
- 增加成员邀请、权限修改、权限校验中间件 / Add member invites, permission editing, and permission-check middleware.
- 保护敏感操作接口 / Protect sensitive APIs.

### 7) NFC 与走失模式增强 / NFC and Lost-Pet Mode Enhancement

- 调整 NFC public 页面结构 / Revise the NFC public page structure.
- 增加走失联系人与注意事项展示 / Add lost-pet contact info and care notes.
- 打通扫码记录与通知中心 / Connect scan logs to the notification center.

### 8) 验证与发布准备 / Verification and Release Readiness

- 验证主题切换是否覆盖全部关键页面 / Verify that theme switching covers all key pages.
- 验证围栏告警、通知聚合、扫码记录、离线同步等主流程 / Verify core flows including geofence alerts, notification aggregation, scan logs, and offline sync.
- 完成移动端与桌面端基础体验检查 / Complete baseline UX checks on both mobile and desktop.

## 交付物清单 / Deliverables

- 新的 `pawtrace-5.0.1.plan.md` 版本规划文档 / A new `pawtrace-5.0.1.plan.md` release planning document
- 主题系统、通知中心、围栏能力、健康洞察的功能设计清单 / Feature design checklists for theme system, notification center, geofencing, and health insights
- 面向 5.0.1 的数据库迁移与接口扩展规划 / Database migration and API expansion plans for 5.0.1
- 离线能力、协作权限、隐私控制的实施路线 / Implementation roadmap for offline support, collaborative permissions, and privacy controls

## 预期结果 / Expected Outcome

- PawTrace 从“完整 demo / 重构完成版”升级为“更接近正式产品体验的版本” / PawTrace moves from a complete demo or rebuilt system toward a more production-like product experience.
- 用户能在真实使用场景中获得更稳定、更主动、更个性化的宠物陪伴与追踪体验 / Users get a more stable, proactive, and personalized pet tracking and companionship experience in real-world usage.
- 项目具备继续向会员化、设备联动和运营活动方向演进的基础 / The project gains a stronger foundation for subscriptions, device integrations, and future product growth.
