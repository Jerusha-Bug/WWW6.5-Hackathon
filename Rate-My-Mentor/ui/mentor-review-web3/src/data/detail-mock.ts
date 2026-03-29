// Mentor / Company / Review 详情页用模拟数据

export interface MentorDetail {
  id: string;
  name: string;
  title: string;
  domain: string;
  bio: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  createdAt: string;
  stats: {
    communication: number;
    technical: number;
    responsiveness: number;
    overall: number;
  };
  distribution: { stars: number; count: number; pct: number }[];
  twitter?: string;
  github?: string;
}

export interface CompanyDetail {
  id: string;
  name: string;
  industry: string;
  region: string;
  description: string;
  score: number;
  mentorCount: number;
  reviewCount: number;
  tags: string[];
  createdAt: string;
  stats: {
    culture: number;
    growth: number;
    management: number;
    overall: number;
  };
  distribution: { stars: number; count: number; pct: number }[];
  website?: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  authorAddress: string;
  rating: number;
  date: string;
  comment: string;
  tags: string[];
  txHash?: string;
}

export const MOCK_MENTOR_DETAIL: Record<string, MentorDetail> = {
  "m-demo-01": {
    id: "m-demo-01",
    name: "Alex Chen",
    title: "Solidity · DeFi 架构",
    domain: "智能合约 / 安全审计",
    bio: "资深智能合约开发者，专注于 DeFi 协议架构与安全审计。拥有 5 年区块链开发经验，曾参与多个头部 DeFi 项目的合约开发。",
    rating: 4.95,
    reviewCount: 428,
    tags: ["DeFi", "Solidity", "安全审计", "架构设计"],
    createdAt: "2023-06-15",
    stats: { communication: 4.9, technical: 5.0, responsiveness: 4.8, overall: 4.95 },
    distribution: [
      { stars: 5, count: 406, pct: 95 },
      { stars: 4, count: 18, pct: 4 },
      { stars: 3, count: 3, pct: 1 },
      { stars: 2, count: 1, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
    twitter: "alexchen_eth",
    github: "alexchen-dev",
  },
  "m-demo-02": {
    id: "m-demo-02",
    name: "Jordan Wu",
    title: "全栈 · 链上产品",
    domain: "dApp / 钱包集成",
    bio: "全栈工程师，擅长将 Web2 产品思维带入 Web3。专注 dApp 开发与钱包集成，为多个知名项目提供技术支持。",
    rating: 4.91,
    reviewCount: 356,
    tags: ["dApp", "钱包集成", "前端", "产品设计"],
    createdAt: "2023-08-20",
    stats: { communication: 4.9, technical: 4.85, responsiveness: 4.95, overall: 4.91 },
    distribution: [
      { stars: 5, count: 324, pct: 91 },
      { stars: 4, count: 28, pct: 8 },
      { stars: 3, count: 4, pct: 1 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
    github: "jordanwu-web3",
  },
  "m-demo-03": {
    id: "m-demo-03",
    name: "Samira Okonkwo",
    title: "密码学 · L2",
    domain: "Rollup / 零知识入门",
    bio: "密码学研究人员，专注于零知识证明与 Layer2 扩容方案。曾发表多篇学术论文，致力于推动 ZK 技术的普及与应用。",
    rating: 4.88,
    reviewCount: 290,
    tags: ["零知识证明", "L2", "密码学", "Rollup"],
    createdAt: "2023-09-01",
    stats: { communication: 4.8, technical: 4.95, responsiveness: 4.85, overall: 4.88 },
    distribution: [
      { stars: 5, count: 258, pct: 89 },
      { stars: 4, count: 27, pct: 9 },
      { stars: 3, count: 5, pct: 2 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
    github: "samira-zk",
  },
  "m-demo-04": {
    id: "m-demo-04",
    name: "Li Wei",
    title: "Move · 基础设施",
    domain: "节点 / 索引器",
    bio: "Move 语言专家，专注于区块链基础设施与高性能节点开发。为多个公链提供节点运维与索引器搭建支持。",
    rating: 4.85,
    reviewCount: 241,
    tags: ["Move", "节点运维", "索引器", "基础设施"],
    createdAt: "2023-10-10",
    stats: { communication: 4.8, technical: 4.9, responsiveness: 4.85, overall: 4.85 },
    distribution: [
      { stars: 5, count: 208, pct: 86 },
      { stars: 4, count: 28, pct: 12 },
      { stars: 3, count: 5, pct: 2 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
  },
  "m-demo-05": {
    id: "m-demo-05",
    name: "Noah Park",
    title: "前端 · Web3 UX",
    domain: "RainbowKit / wagmi",
    bio: "专注 Web3 前端开发，React 技术栈深度用户。精通 RainbowKit、wagmi 等主流 Web3 库，致力于提升用户体验。",
    rating: 4.82,
    reviewCount: 198,
    tags: ["React", "RainbowKit", "wagmi", "UX"],
    createdAt: "2023-11-15",
    stats: { communication: 4.85, technical: 4.8, responsiveness: 4.8, overall: 4.82 },
    distribution: [
      { stars: 5, count: 167, pct: 84 },
      { stars: 4, count: 26, pct: 13 },
      { stars: 3, count: 5, pct: 3 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
  },
};

export const MOCK_COMPANY_DETAIL: Record<string, CompanyDetail> = {
  "c-demo-01": {
    id: "c-demo-01",
    name: "NovaChain Labs",
    industry: "基础设施",
    region: "新加坡",
    description: "NovaChain Labs 是一家专注于区块链基础设施开发的科技公司，致力于为 Web3 开发者提供安全、高效的区块链解决方案。",
    score: 96.4,
    mentorCount: 42,
    reviewCount: 156,
    tags: ["基础设施", "Layer1", "节点服务", "RPC"],
    createdAt: "2022-05-01",
    stats: { culture: 4.9, growth: 4.8, management: 4.7, overall: 96.4 },
    distribution: [
      { stars: 5, count: 140, pct: 90 },
      { stars: 4, count: 12, pct: 8 },
      { stars: 3, count: 4, pct: 2 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
    website: "novachain.io",
  },
  "c-demo-02": {
    id: "c-demo-02",
    name: "Aurora Guild",
    industry: "开发者教育",
    region: "远程",
    description: "Aurora Guild 是一个去中心化开发者社区，专注于 Web3 人才培养与技术布道。通过线上课程、社群辅导等方式培养新一代区块链开发者。",
    score: 94.8,
    mentorCount: 38,
    reviewCount: 124,
    tags: ["开发者教育", "Web3培训", "社群", "课程"],
    createdAt: "2022-08-15",
    stats: { culture: 4.85, growth: 4.7, management: 4.6, overall: 94.8 },
    distribution: [
      { stars: 5, count: 108, pct: 87 },
      { stars: 4, count: 12, pct: 10 },
      { stars: 3, count: 4, pct: 3 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
    website: "auroraguild.xyz",
  },
  "c-demo-03": {
    id: "c-demo-03",
    name: "LedgerForge",
    industry: "安全审计",
    region: "香港",
    description: "LedgerForge 是领先的安全审计机构，团队由多位顶尖安全研究员组成。已为超过 50 个项目提供智能合约审计服务，发现并修复数百个高危漏洞。",
    score: 93.1,
    mentorCount: 31,
    reviewCount: 98,
    tags: ["安全审计", "智能合约", "渗透测试", "漏洞修复"],
    createdAt: "2022-03-20",
    stats: { culture: 4.7, growth: 4.6, management: 4.7, overall: 93.1 },
    distribution: [
      { stars: 5, count: 82, pct: 84 },
      { stars: 4, count: 11, pct: 11 },
      { stars: 3, count: 5, pct: 5 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
  },
  "c-demo-04": {
    id: "c-demo-04",
    name: "Citadel DAO Tools",
    industry: "DAO 工具",
    region: "北美",
    description: "Citadel DAO Tools 提供一站式 DAO 治理工具集，包括投票系统、提案管理、链上签名等核心功能。帮助组织实现透明、高效的链上治理。",
    score: 91.5,
    mentorCount: 27,
    reviewCount: 76,
    tags: ["DAO工具", "投票系统", "提案管理", "治理"],
    createdAt: "2023-01-10",
    stats: { culture: 4.65, growth: 4.5, management: 4.55, overall: 91.5 },
    distribution: [
      { stars: 5, count: 61, pct: 80 },
      { stars: 4, count: 10, pct: 13 },
      { stars: 3, count: 5, pct: 7 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
  },
  "c-demo-05": {
    id: "c-demo-05",
    name: "Zenith Pay",
    industry: "支付 / RWA",
    region: "欧盟",
    description: "Zenith Pay 致力于构建合规的链上支付基础设施，支持法币与加密货币的无缝转换。专注于 RWA（真实世界资产）代币化与跨境支付场景。",
    score: 90.2,
    mentorCount: 24,
    reviewCount: 65,
    tags: ["支付", "RWA", "合规", "跨境支付"],
    createdAt: "2023-02-28",
    stats: { culture: 4.55, growth: 4.5, management: 4.45, overall: 90.2 },
    distribution: [
      { stars: 5, count: 51, pct: 78 },
      { stars: 4, count: 10, pct: 15 },
      { stars: 3, count: 4, pct: 7 },
      { stars: 2, count: 0, pct: 0 },
      { stars: 1, count: 0, pct: 0 },
    ],
  },
};

export const MOCK_REVIEWS: Record<string, ReviewItem[]> = {
  "m-demo-01": [
    {
      id: "r1",
      author: "Alice",
      authorAddress: "0x1234...abcd",
      rating: 5,
      date: "2026-03-20",
      comment: "Alex 在 DeFi 架构方面非常专业，帮助我们设计了一套安全可靠的合约方案。响应速度快，沟通清晰，非常推荐！",
      tags: ["专业", "高效", "安全"],
      txHash: "0xabcd...1234",
    },
    {
      id: "r2",
      author: "Bob",
      authorAddress: "0x5678...efgh",
      rating: 5,
      date: "2026-03-15",
      comment: "安全审计做得非常细致，发现了我们遗漏的多个潜在风险点。讲解清晰，提供了详细的修复建议。",
      tags: ["审计", "细心", "清晰"],
      txHash: "0xefgh...5678",
    },
    {
      id: "r3",
      author: "Charlie",
      authorAddress: "0x9abc...ijkl",
      rating: 5,
      date: "2026-03-10",
      comment: "Solidity 开发能力顶尖，对 Gas 优化有深刻理解。合作过程中学到了很多实用的技巧。",
      tags: ["Gas优化", "技术强", "学习"],
      txHash: "0xijkl...9abc",
    },
    {
      id: "r4",
      author: "Diana",
      authorAddress: "0xdef0...mnop",
      rating: 4,
      date: "2026-03-05",
      comment: "整体不错，对复杂合约逻辑有深入浅出的讲解。建议增加一些文档方便跟进。",
      tags: ["讲解清晰", "文档待提升"],
    },
    {
      id: "r5",
      author: "Evan",
      authorAddress: "0x1111...2222",
      rating: 5,
      date: "2026-02-28",
      comment: "参与了 Alex 的 DeFi 工作坊，干货满满。实操部分非常实用，学完就能上手。",
      tags: ["工作坊", "实用", "干货"],
      txHash: "0x2222...1111",
    },
  ],
  "c-demo-01": [
    {
      id: "cr1",
      author: "Dev1",
      authorAddress: "0xaaaa...bbbb",
      rating: 5,
      date: "2026-03-18",
      comment: "NovaChain Labs 的 RPC 服务非常稳定，延迟极低。团队响应及时，技术支持专业。强烈推荐！",
      tags: ["稳定", "低延迟", "专业"],
      txHash: "0xbbbb...aaaa",
    },
    {
      id: "cr2",
      author: "Dev2",
      authorAddress: "0xcccc...dddd",
      rating: 5,
      date: "2026-03-12",
      comment: "节点部署文档非常完善，出了问题技术支持团队能快速定位解决。基础设施值得信赖。",
      tags: ["文档完善", "支持好", "可靠"],
      txHash: "0xdddd...cccc",
    },
    {
      id: "cr3",
      author: "Dev3",
      authorAddress: "0xeeee...ffff",
      rating: 4,
      date: "2026-03-05",
      comment: "服务稳定，不过价格偏高。建议有更多套餐选择会更灵活。",
      tags: ["价格偏高", "服务好"],
    },
    {
      id: "cr4",
      author: "Dev4",
      authorAddress: "0x8888...9999",
      rating: 5,
      date: "2026-02-25",
      comment: "与 NovaChain 合作两年了，一直很稳定。他们对新公链的支持速度也很快。",
      tags: ["长期合作", "更新快"],
      txHash: "0x9999...8888",
    },
    {
      id: "cr5",
      author: "Dev5",
      authorAddress: "0x0000...1111",
      rating: 5,
      date: "2026-02-20",
      comment: "API 设计合理，SDK 文档清晰。集成过程比预期顺利很多。",
      tags: ["SDK好用", "文档清晰", "易集成"],
      txHash: "0x1111...0000",
    },
  ],
};

export function getMentorReviews(id: string): ReviewItem[] {
  return MOCK_REVIEWS[id] ?? [];
}

export function getCompanyReviews(id: string): ReviewItem[] {
  return MOCK_REVIEWS[id] ?? [];
}