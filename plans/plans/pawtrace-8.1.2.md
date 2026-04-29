---
name: pawtrace-8-1-2-yolo-packaging-dependency-hardening
version: 8.1.2
type: patch
status: remote-branch
---

# PawTrace 8.1.2 更新日志

## 版本定位

- **版本类型**：Bug 修复 / 依赖加固，`+0.0.1`
- **GitHub 状态**：远端分支已包含，尚未看到独立 tag
- **对应提交**：`ba329a5`
- **核心主题**：YOLO 与打包依赖加固

## 修复

- 加固 YOLO 服务依赖声明，减少 Python 环境、OpenCV、Ultralytics 和模型加载差异带来的运行问题。
- 加固前端与打包依赖锁定，降低不同机器安装后构建结果不一致的风险。
- 补充 README 中的 YOLO 服务、模型文件和本地启动说明。

## 主要影响文件

- `ai-video-service/requirements.txt`
- `ai-video-service/README.md`
- `frontend/package-lock.json`
- `backend/package-lock.json`
- `README.txt`
