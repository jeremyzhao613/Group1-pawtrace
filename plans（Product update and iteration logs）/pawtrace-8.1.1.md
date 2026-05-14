---
name: pawtrace-8-1-1-yolov8-service-defaults-fix
version: 8.1.1
type: patch
status: remote-branch
---

# PawTrace 8.1.1 更新日志

## 版本定位

- **版本类型**：Bug 修复，`+0.0.1`
- **GitHub 状态**：远端分支已包含，尚未看到独立 tag
- **对应提交**：`9aebe2c`
- **核心主题**：YOLOv8 服务加载默认值修复

## 修复

- 修复 YOLOv8 服务默认加载配置，降低本地首次启动时因为模型路径、默认参数或权重文件准备不完整导致失败的概率。
- 优化视频分析服务启动体验，让没有完整本地模型缓存的环境更容易定位问题。

## 主要影响文件

- `ai-video-service/app.py`
- `ai-video-service/README.md`
