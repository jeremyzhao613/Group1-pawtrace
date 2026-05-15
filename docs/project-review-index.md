# PawTrace Project Review Index

Use this page as the reviewer-facing route through the repository. It groups the product brief, validation evidence, technical documentation, and runnable app surfaces in the order a marker or teammate is likely to need them.

## 1. Product Scope

| Need | File |
| --- | --- |
| Product overview, target users, modules, and demo flow | [product/README.md](product/README.md) |
| Web-readable product requirements | [product/product-requirements.md](product/product-requirements.md) |
| Original PRD PDF | [product/PRD.pdf](product/PRD.pdf) |
| Web-readable MoSCoW prioritization | [product/feature-prioritization.md](product/feature-prioritization.md) |
| Original MoSCoW PDF | [product/pawtrace-moscow-prioritization.pdf](product/pawtrace-moscow-prioritization.pdf) |

## 2. Validation Evidence

| Need | File |
| --- | --- |
| Validation evidence folder index | [../validation-report（User testing and product improvement）/README.md](<../validation-report（User testing and product improvement）/README.md>) |
| Complete validation report | [Complete validation report DOCX](<../validation-report（User testing and product improvement）/Session[3]Group[1]_ValidationReport.docx>) |
| Questionnaire summary spreadsheet | [pawtrace-25-questionnaires-survey-summary.xlsx](<../validation-report（User testing and product improvement）/pawtrace-25-questionnaires-survey-summary.xlsx>) |
| Individual user validation files | [User 1](<../validation-report（User testing and product improvement）/user-1-validation.docx>), [User 2](<../validation-report（User testing and product improvement）/user-2-validation.docx>), [User 3](<../validation-report（User testing and product improvement）/user-3-validation.docx>), [User 4](<../validation-report（User testing and product improvement）/user-4-validation.docx>), [User 5](<../validation-report（User testing and product improvement）/user-5-validation.docx>) |

## 3. Technical Understanding

| Need | File |
| --- | --- |
| Source folder map | [reference/project-structure.md](reference/project-structure.md) |
| Tech stack, resolved issues, and known limits | [reference/technical-stack-and-known-issues.md](reference/technical-stack-and-known-issues.md) |
| Extended technical README | [reference/extended-technical-readme.md](reference/extended-technical-readme.md) |
| Repository organization rules | [reference/repository-maintenance.md](reference/repository-maintenance.md) |
| Cloudflare deployment guide | [deployment/cloudflare.md](deployment/cloudflare.md) |
| M5Stack telemetry flow | [hardware/m5stack-telemetry.md](hardware/m5stack-telemetry.md) |
| Packaging guides | [packaging/mobile.md](packaging/mobile.md), [packaging/desktop-exe.md](packaging/desktop-exe.md), [packaging/release-checklist.md](packaging/release-checklist.md) |

## 4. App Surfaces

| Surface | Local URL |
| --- | --- |
| Main app | `http://localhost:5173/` |
| Backend status | `http://localhost:3000/api/status` |
| Monitor | `http://localhost:3000/monitor/index.html` |
| Showcase app | `http://localhost:3001/` |
| YOLO video service | `http://127.0.0.1:8008/analyze-video` |

Demo login:

```text
username: demo
password: demo123
```

## 5. Update History

| Need | File |
| --- | --- |
| Product update and iteration logs | [../plans（Product update and iteration logs）/README.md](<../plans（Product update and iteration logs）/README.md>) |
| Latest release note | [pawtrace-10.1.0.md](<../plans（Product update and iteration logs）/pawtrace-10.1.0.md>) |
