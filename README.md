# 小升初自学驾驶舱

一个面向杭州滨江区小升初学生的本地网页 MVP，用于完成语文、数学、英语查漏补缺和初一衔接预习闭环。

## 功能

- 今日 90 分钟学习航线
- 数学、英语、语文、初一预习站点
- 自动批改和教练式反馈
- 错因选择和知识点状态
- 一句话复盘
- 家长“今日观察”简报
- 浏览器本地保存学习记录
- Claude 导出内容筛选后的学习教练卡片

## 本地运行

```bash
python3 -m http.server 5174 --bind 127.0.0.1 --directory app
```

然后打开：

```text
http://127.0.0.1:5174/
```

## 测试

```bash
node --test tests/learning.test.mjs
```

## GitHub Pages

仓库推送到 GitHub 后，`Deploy GitHub Pages` 工作流会把 `app/` 目录部署为静态站点。

首次使用时，需要在 GitHub 仓库设置中确认 Pages 的部署来源为 GitHub Actions。
