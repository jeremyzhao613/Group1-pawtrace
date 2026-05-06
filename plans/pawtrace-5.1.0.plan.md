---
name: pawtrace-intelligence-design-upgrade
overview: 在 5.0.1 完成产品体验层升级后，继续把 PawTrace 升级为更智能的宠物陪伴与追踪产品：加入习惯学习、个性化 AI 建议、多模态健康历史对比、宠物日报与智能地图推荐，让系统不仅记录状态，还能理解节奏、解释变化并主动给出低打扰帮助。 / After 5.0.1 finishes the product-experience upgrade, evolve PawTrace into a more intelligent pet companionship and tracking product by adding routine learning, personalized AI guidance, multimodal health history comparison, daily pet digests, and smart map recommendations so the system not only records status, but also understands rhythm, explains change, and provides low-noise proactive help.
todos:
  - id: routine-learning
    content: 建立宠物习惯学习系统：学习位置、活动、喂食、睡眠、回家时间等节奏，并识别偏离平时基线的变化。 / Build a routine-learning system that models location, activity, feeding, sleep, return-home time, and other rhythms, then detects deviations from each pet's usual baseline.
    status: pending
  - id: personalized-guidance
    content: 增加个性化 AI 建议引擎：结合年龄、品种、健康历史、近期行为与环境因素生成有上下文的建议。 / Add a personalized AI guidance engine that combines age, breed, health history, recent behavior, and environmental context to produce grounded suggestions.
    status: pending
  - id: multimodal-health-history
    content: 升级多模态健康辅助：支持照片与历史影像对比，识别皮肤、体态、伤口、眼鼻状态等变化趋势。 / Upgrade multimodal health assistance with current-to-history image comparison to detect trend changes in skin condition, posture, wounds, and eye or nose symptoms.
    status: pending
  - id: pet-daily-digest
    content: 新增宠物日报：每天自动汇总位置、活动、健康、提醒与异常信息，用 10 秒可读摘要呈现给主人。 / Add a daily pet digest that automatically summarizes location, activity, health, reminders, and anomalies in a 10-second-readable format.
    status: pending
  - id: smart-map-recommendations
    content: 增加智能地图推荐：自动识别常去安全区、推荐散步路线、提示附近宠物友好点并支持用户反馈。 / Add smart map recommendations that identify frequent safe zones, suggest walking routes, surface nearby pet-friendly places, and support user feedback.
    status: pending
  - id: explainability-and-controls
    content: 为全部智能功能补齐解释与控制：说明“为什么给出这个判断”，并允许用户调节提醒阈值、关闭推荐或删除学习数据。 / Add explainability and control to every intelligence feature: state why a judgment was made, and let users tune thresholds, mute recommendations, or delete learned data.
    status: pending
  - id: release-verification
    content: 完成 5.1.0 自测与发布验证：覆盖基线学习、个性化建议、多模态对比、日报生成、地图推荐与用户控制链路。 / Complete 5.1.0 verification across baseline learning, personalized guidance, multimodal comparison, digest generation, map recommendations, and user-control flows.
    status: pending
isProject: false
---

# PawTrace 5.1.0 智能化设计升级计划 / PawTrace 5.1.0 Intelligence Design Upgrade Plan

## 版本定位 / Release Positioning

- **5.0.1 已完成重点 / 5.0.1 Completed Focus**：主题系统、通知中心、围栏增强、健康趋势、离线容错、多宠协作与隐私控制 / theme system, notification center, stronger geofencing, health trends, offline resilience, multi-pet collaboration, and privacy controls
- **5.1.0 目标方向 / 5.1.0 Direction**：从“体验更完整的产品”升级为“会理解宠物节奏并主动给出帮助的智能产品” / evolve from a more complete product experience into an intelligent product that understands pet rhythm and offers proactive help
- **版本关键词 / Release Keywords**：习惯学习、个性化建议、多模态健康、日报摘要、智能地图、可解释 AI、低打扰提醒 / routine learning, personalized guidance, multimodal health, daily digests, smart maps, explainable AI, and low-noise alerts

## 核心升级目标 / Core Upgrade Goals

- 让 AI 输出建立在宠物个体历史而不是通用模板上 / Ground AI outputs in each pet's own history rather than generic templates.
- 把“异常”从简单阈值报警升级为“偏离平时节奏”的解释型提醒 / Upgrade anomaly detection from threshold alarms into explainable “deviation from usual rhythm” reminders.
- 缩短主人获取关键信息的时间，用日报和摘要替代碎片化信息堆积 / Reduce time-to-awareness for owners by replacing fragmented data piles with digests and summaries.
- 让地图、健康、通知不再孤立，而是共享同一套智能判断结果 / Ensure map, health, and notifications share a common intelligence layer instead of operating independently.
- 保持用户对智能功能的控制权，避免过度打扰、黑箱判断或误报疲劳 / Preserve user control and avoid excessive interruptions, black-box judgments, or alert fatigue.

## 5.1.0 主要更新内容 / Key Updates in 5.1.0

### 1) 习惯学习与节奏识别 / Routine Learning and Rhythm Detection

- 学习宠物的回家时间、活动峰值、散步频率、喂食间隔、睡眠规律等日常节奏 / Learn return-home times, activity peaks, walking frequency, feeding intervals, sleep patterns, and other daily rhythms.
- 识别“今天比平时晚回家 2 小时”“最近活动明显下降”“连续 3 天饮水偏少”这类偏移 / Detect shifts like “returned home two hours later than usual today,” “activity has dropped noticeably lately,” or “water intake has been low for three straight days.”
- 将异常识别与通知优先级联动，减少普通波动引发的误报 / Connect anomaly detection to notification priority to avoid false alarms from ordinary fluctuations.

### 2) 个性化 AI 建议 / Personalized AI Guidance

- 建议不再只基于当前输入，而是结合年龄、品种、既往健康史、近期行为、天气与地点上下文 / Generate advice from age, breed, prior health history, recent behavior, weather, and location context instead of only the current input.
- 输出结构化建议：现象摘要、可能原因、建议观察项、是否需要复查 / Return structured guidance including summary, likely reasons, what to observe next, and whether a follow-up check is worth considering.
- 明确标注“建议依据”，例如“基于最近 14 天活动下降与体重波动” / Clearly state the basis for a recommendation, such as “based on declining activity and weight fluctuation over the last 14 days.”

### 3) 多模态健康历史对比 / Multimodal Health History Comparison

- 拍照分析支持与历史照片并排对比 / Let image-based health checks compare current photos with historical photos side by side.
- 标记红斑范围、毛发稀疏、体态变化、伤口恢复情况等趋势 / Highlight trend changes in redness, fur thinning, posture, wound recovery, and related conditions.
- 为每次图像分析沉淀可回溯记录，形成健康影像时间线 / Store each image analysis as a traceable record to build a health-image timeline.

### 4) 宠物日报与夜间摘要 / Pet Daily Digest and Nightly Summary

- 每天固定时间自动生成宠物日报 / Auto-generate a daily pet digest at a fixed time each day.
- 用 3 到 5 条高价值摘要覆盖位置、活动、健康、提醒、异常 / Summarize location, activity, health, reminders, and anomalies in 3 to 5 high-value bullets.
- 支持“今天一切正常”这类低焦虑反馈，避免只有异常时才有存在感 / Support low-anxiety feedback such as “everything looked normal today” so the product does not speak only when something is wrong.

### 5) 智能地图推荐 / Smart Map Recommendations

- 学习宠物高频停留点，推荐候选安全区并让用户确认 / Learn frequent dwell areas, recommend candidate safe zones, and ask the user to confirm them.
- 结合时间段、天气、宠物偏好与历史路线推荐散步路线 / Recommend walking routes using time of day, weather, pet preference, and route history.
- 自动发现附近宠物友好点并根据用户反馈持续优化推荐质量 / Surface nearby pet-friendly places and improve recommendation quality based on user feedback.

### 6) 可解释性与用户控制 / Explainability and User Controls

- 每条智能建议都给出“为什么会提醒你” / Every smart suggestion should explain why it was shown.
- 用户可调节提醒灵敏度、关闭某类推荐、限制 AI 使用的数据范围 / Let users adjust reminder sensitivity, mute recommendation classes, and limit what data AI may use.
- 提供学习数据清理与重置入口，避免模型长期记住错误习惯 / Provide reset and cleanup controls for learned data to avoid long-lived bad baselines.

## 产品设计原则 / Product Design Principles

- **低打扰 / Low Noise**：宁可少提醒，也不要把主人训练成忽略系统 / Prefer fewer alerts over training users to ignore the system.
- **先解释后建议 / Explain Before Suggesting**：先告诉用户发现了什么变化，再给建议 / State what changed before offering guidance.
- **个体优先 / Individual First**：默认从单只宠物的历史出发，而不是从平均宠物出发 / Start from the individual pet’s history instead of an average pet template.
- **人可接管 / Human Override**：所有智能功能都能被关闭、校准或修正 / Every intelligence feature should be dismissible, calibratable, or correctable.

## 架构与实现侧补充 / Architecture and Implementation Notes

- **前端 / Frontend**：新增日报卡片、建议依据展示、图像对比视图、地图推荐反馈入口与智能设置页 / Add digest cards, “why this suggestion” UI, image-comparison views, map recommendation feedback entry points, and an intelligence settings page.
- **后端 / Backend**：增加行为基线计算任务、日报生成任务、推荐打分与反馈回写链路 / Add behavior-baseline jobs, digest-generation jobs, and recommendation scoring plus feedback write-back pipelines.
- **数据库 / Database**：新增行为基线表、日报表、健康影像快照表、推荐反馈表与智能配置表 / Add behavior-baseline, daily-digest, health-image snapshot, recommendation-feedback, and intelligence-preference tables.
- **AI 服务 / AI Service**：支持结构化建议输出、历史记录拼接、图像前后对比说明与摘要生成 / Support structured guidance output, historical context stitching, before-vs-after image explanation, and digest generation.

## 具体实施步骤 / Implementation Steps

### 1) 行为基线建模 / Behavior Baseline Modeling

- 汇总位置、活动、喂食、健康日志形成宠物个体画像 / Aggregate location, activity, feeding, and health logs into a per-pet profile.
- 建立按日/周的行为基线与偏移检测逻辑 / Build daily and weekly baselines plus deviation detection logic.
- 对异常提醒进行分级，避免所有偏移都被视为告警 / Grade anomaly reminders so not every deviation becomes an alert.

### 2) 个性化建议引擎 / Personalized Guidance Engine

- 规范建议输入上下文，包括年龄、品种、既往记录、近期行为和环境信息 / Standardize guidance input context across age, breed, prior records, recent behavior, and environmental data.
- 输出可解释的结构化结果，便于前端渲染与用户理解 / Produce explainable structured results for clearer frontend rendering and user understanding.
- 建立建议质量反馈入口，持续修正泛化过强的问题 / Add a feedback loop to improve suggestions that feel too generic.

### 3) 健康影像时间线 / Health Image Timeline

- 统一健康图片上传、标注、存储与版本关联方式 / Standardize health-image upload, annotation, storage, and version linking.
- 实现“本次 vs 上次”图像对比视图 / Implement a “current vs previous” comparison view.
- 在报告中标记趋势而不是只输出一次性判断 / Mark trend direction in reports instead of only giving one-off assessments.

### 4) 日报生成与分发 / Digest Generation and Delivery

- 定义日报模板与优先级规则 / Define digest templates and priority rules.
- 支持站内首页卡片、通知中心摘要和可选推送文案复用 / Reuse digest output across home cards, notification center summaries, and optional push copy.
- 对“无异常日”提供简洁总结，提升陪伴感 / Provide concise calm-day summaries to improve companionship.

### 5) 智能地图推荐落地 / Smart Map Recommendation Delivery

- 建立高频地点识别、路线评分、推荐反馈闭环 / Build a loop for frequent-place detection, route scoring, and recommendation feedback.
- 接入天气与时间维度，避免静态推荐 / Include weather and time-of-day signals to avoid static recommendations.
- 为地图推荐增加用户确认与纠错入口 / Add user confirmation and correction controls for map recommendations.

### 6) 验证与发布准备 / Verification and Release Readiness

- 验证智能建议是否有明确依据展示 / Verify that smart guidance always shows clear reasoning.
- 验证图像历史对比是否能稳定追踪变化趋势 / Verify that history-based image comparison reliably tracks trend changes.
- 验证日报、推荐和异常提醒不会造成通知噪音 / Verify that digests, recommendations, and anomaly reminders do not create alert noise.

## 交付物清单 / Deliverables

- 新的 `pawtrace-5.1.0.plan.md` 智能化设计文档 / A new `pawtrace-5.1.0.plan.md` intelligence design document
- 习惯学习、个性化建议、多模态健康、宠物日报、智能地图的功能设计清单 / Feature design checklists for routine learning, personalized guidance, multimodal health, pet digests, and smart maps
- 面向 5.1.0 的数据模型、任务调度与 AI 输出结构规划 / Data model, job-scheduling, and AI output structure planning for 5.1.0
- 智能功能的解释性、控制项与验证标准 / Explainability, control surfaces, and verification criteria for intelligence features

## 预期结果 / Expected Outcome

- PawTrace 从“体验完整的宠物产品”升级为“具备主动理解能力的智能宠物产品” / PawTrace moves from a complete pet product experience toward an intelligent pet product with proactive understanding.
- 用户能更快知道“今天有没有异常、为什么异常、我现在该做什么” / Users can quickly understand “whether something changed today, why it changed, and what to do next.”
- 智能能力与地图、健康、通知形成统一闭环，而不是孤立功能堆叠 / Intelligence becomes a shared layer across map, health, and notifications rather than a stack of isolated features.
