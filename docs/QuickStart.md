# 快速开始
本文是项目 **Overwatch-Gaming** 自述文件的一部分。在这篇自述中，我将指导你如何快速部署本项目。

## 部署
本项目可以直接通过 Git 或 Gitee 部署到本地。

```Bash
gh repo clone FishMoies/Overwatch-Gaming
```

或者是：

```Bash
git clone https://gitee.com/omaekumiko529/Overwatch-Gaming.git
```

若你没有 gh，也可以使用 git 原生方法：

```Bash
git clone https://github.com/FishMoies/Overwatch-Gaming.git
```

克隆完毕后，请检查克隆的产物是否正确，根目录应该包含以下部分：

```
Overwatch-Gaming/
├── public/                    # 静态资源（不经过 Vite 打包处理）
│   ├── favicon.ico            # 网站图标
│   ├── logo.svg               # 守望先锋图标
│   ├── default-avatar.png     # 默认用户头像（PNG）
│   ├── default-avatar.webp    # 默认用户头像（WebP）
│   ├── font-smiley-sans.ttf   # 自定义标题字体
│   ├── font-maple-mono.ttf    # 自定义等宽字体
│   ├── role-icon-damage.webp  # 输出职责图标
│   ├── role-icon-support.webp # 支援职责图标
│   ├── role-icon-tank.webp    # 重装职责图标
│   ├── seed-data.json         # 种子数据
│   ├── damage/                # 输出英雄图片
│   ├── support/               # 支援英雄图片
│   └── tank/                  # 重装英雄图片
├── src/                       # 前端源代码
│   ├── App.vue                # 根组件
│   ├── main.js                # 应用入口
│   ├── router/index.js        # 路由配置（Hash 模式，含懒加载与守卫）
│   ├── components/            # 可复用组件
│   ├── pages/                 # 页面级组件
│   ├── services/              # API 调用封装
│   ├── stores/                # Pinia 状态仓库
│   ├── utils/
│   ├── constants/             # 常量定义
│   └── types/                 # 类型定义
├── server/                    # 后端源代码
│   ├── index.js               # Express 服务入口（含 ASCI 启动动画）
│   ├── db.js                  # 数据库初始化与工具函数（OMAESQL 核心）
│   ├── bootstrap/env.js       # 环境变量引导配置
│   ├── setup-env.js           # .env 配置引导脚本
│   ├── package.json
│   ├── middleware/auth.js     # JWT 认证中间件（auth / optionalAuth / adminMiddleware）
│   ├── routes/                # 路由模块（自动扫描注册）
│   └── utils/                 # 后端工具函数（标识符生成、Banner 等）
├── scripts/
│   └── optimize-assets.cjs    # 资源优化脚本
├── vite.config.js
├── index.html
├── package.json
├── jsconfig.json
└── docs/                      # 项目文档
```

## 安装包体与测试

由于项目包含前端与后端，需要分离单独部署与启动：

```Bash
cd Overwatch-Gaming
npm install
npm run dev
```

后端在目录 `server` 中：

```Bash
cd server
npm install
```

启动服务端后，会输出自定义 CLI 界面，包括 ASCII Banner 和初始化提示。

```Bash
npm run dev
...
Restarting 'index.js'
...
欢迎使用KUMIKO API服务接口
回车以使用默认配置
```

首先设置初始管理员密码，在前端页面只有管理员级别能够直接操作 `data.db` 等后端数据。

```Bash
> Admin Password:
  ADMIN_PASSWORD (DEFAULT 88888888):88888888
```

然后是JWT密钥：

```Bash
> JWT 签名密钥
  请输入密钥 | 或回车使用自动生成:
```

接着是服务器内部端口与CORS源：

```Bash
> 服务器端口
  请输入端口号 (默认: 3001):

> CORS 允许的源（多个地址用逗号分隔）
  请输入允许的来源 (默认: http://localhost:5173,http://localhost:3000):
```

随后 `.env` 环境会自动展开：

```Bash
环境文件已创建 server/.env

  配置摘要:
  ┌─────────────────────────────────────────────────────
  │  ADMIN_PASSWORD  = HsHsbXsy2626
  │  JWT_SECRET      = fcb773bdff460c50...
  │  PORT            = 3001
  │  CORS_ORIGINS    = http://localhost:5173,http://localhost:3000
  └─────────────────────────────────────────────────────

◇ injected env (4) from .env // tip: ⌘ custom filepath { path: '/custom/path/.env' }
环境变量已重新加载

数据库已初始化
Server is running on: http://localhost:3001
SQL server data on: server/data.db
```

此时服务端已经启动完备。

### 注入种子数据（可选）

如果需要快速填充测试数据，管理员可访问前端页面的 `/generate` 路由，点击"注入种子数据"按钮即可从 `public/seed-data.json` 中读取预定义的测试用户和帖子并写入数据库。所有测试账号密码统一为 `123123`。