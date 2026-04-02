=======
# Rate My Mentor 后端服务
黑客松项目后端，提供身份验证、AI结构化评分、IPFS加密存储、声誉数据聚合能力

## 技术栈
Node.js + Express + TypeScript + OpenAI GPT-4o + Pinata IPFS

## 快速启动
1. 复制 `.env.example` 为 `.env`，填写所有配置项
2. 执行 `npm install` 安装依赖
3. 执行 `npm run dev` 启动开发服务
4. 访问 http://localhost:3001/health 检查服务是否正常

## 接口文档
所有接口统一前缀：`/api/v1`
- 身份验证相关：`/auth`
- AI评分相关：`/ai`
- IPFS存储相关：`/ipfs`
- 声誉看板相关：`/reputation`
- 合约交互相关：`/contract`

backend/
├── .env.example              # 环境变量示例（不上传Git，仅本地填写）
├── .gitignore                # Git忽略规则文件
├── package.json              # 项目依赖与脚本配置
├── tsconfig.json             # TypeScript编译配置
├── README.md                 # 后端项目说明文档
└── src/
    ├── app.ts                # 项目入口文件
    ├── config/               # 统一配置管理模块
    │   ├── env.ts            # 环境变量加载与校验
    │   ├── openai.ts         # OpenAI API配置
    │   ├── pinata.ts         # IPFS Pinata配置
    │   ├── email.ts          # 邮箱OTP服务配置
    │   └── contract.ts       # 智能合约交互配置
    ├── types/                 # 类型定义（100%对齐产品最小字段表）
    │   ├── auth.types.ts     # 身份验证相关类型
    │   ├── review.types.ts   # 评价与AI评分维度类型
    │   └── common.types.ts   # 通用响应类型
    ├── middlewares/           # 全局中间件模块
    │   ├── error.middleware.ts # 全局错误处理中间件
    │   ├── validate.middleware.ts # 请求参数校验中间件
    │   └── logger.middleware.ts  # 请求日志中间件
    ├── utils/                 # 通用工具函数模块
    │   ├── response.util.ts  # 统一接口响应格式
    │   ├── encryption.util.ts # 评价内容AES加解密
    │   └── validator.util.ts # 参数校验工具
    ├── services/              # 核心业务服务层（所有核心逻辑在这里）
    │   ├── auth.service.ts   # 身份验证服务（邮箱OTP+Offer OCR）
    │   ├── ai.service.ts     # AI结构化评分提取服务
    │   ├── ipfs.service.ts   # IPFS加密存储服务
    │   ├── reputation.service.ts # 声誉看板数据聚合服务
    │   └── contract.service.ts # 链上合约交互服务
    ├── controllers/           # 接口控制层（处理请求与响应）
    │   ├── auth.controller.ts
    │   ├── ai.controller.ts
    │   ├── ipfs.controller.ts
    │   ├── reputation.controller.ts
    │   └── contract.controller.ts
    └── routes/                # 接口路由层（统一管理所有API）
        ├── auth.routes.ts
        ├── ai.routes.ts
        ├── ipfs.routes.ts
        ├── reputation.routes.ts
        ├── contract.routes.ts
        └── index.ts           # 路由总入口
<<<<<<< HEAD
>>>>>>> f459229 (后端代码)
=======
```

>>>>>>> 04d6931b6f3ff54d0864ea7d82069bf512b33508
