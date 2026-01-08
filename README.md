# 电子料替代与比价助手

一个嵌入工作流的Chrome浏览器插件，帮助硬件工程师、采购专员和小型贸易商快速查询电子料号的替代料和跨平台比价信息。

## 📊 项目状态

### 开发阶段
**当前版本**: 1.0.0
**开发状态**: 已完成核心功能开发，进入测试阶段
**发布状态**: 内部测试版，即将提交Chrome商店

## 🌟 功能特点

### 已完成功能

#### 核心功能
- ✅ **智能触发**：在网页中选中料号，右键一键查询
- ✅ **聚合结果面板**：右侧弹窗显示所有查询结果
- ✅ **替代料推荐**：来自多个数据源的替代型号推荐，标注替代类型和关键差异
- ✅ **跨平台比价**：实时显示主流分销商的价格、库存和交货期
- ✅ **风险快照**：产品生命周期状态、合规信息等关键数据

#### 技术实现
- ✅ **前端扩展**：Chrome Extension (Manifest V3)
- ✅ **后端服务**：Node.js + Express
- ✅ **模拟数据**：完整的模拟数据生成系统
- ✅ **缓存机制**：内存缓存，提升查询效率
- ✅ **Docker容器化**：完整的Docker打包和部署方案
- ✅ **自动化打包**：一键生成可安装的ZIP包
- ✅ **代码提交**：GitHub仓库完整提交

### 待实现功能

#### 核心功能增强
- ⏳ **真实API接入**：接入芯查查、芯片智选等真实数据源
- ⏳ **AI推荐**：使用机器学习算法优化替代料推荐
- ⏳ **BOM表分析**：支持上传和分析完整的BOM表
- ⏳ **导出功能**：支持将查询结果导出为Excel或PDF

#### 技术优化
- ⏳ **多浏览器支持**：扩展到Firefox、Edge等浏览器
- ⏳ **企业版功能**：团队协作、历史记录、权限管理
- ⏳ **性能优化**：提升查询速度和响应时间
- ⏳ **单元测试**：完善的测试覆盖

## 🚀 快速开始

### 1. 安装插件

#### 方法一：本地开发模式安装
1. 下载或克隆本项目到本地
2. 打开Chrome浏览器，访问 `chrome://extensions/`
3. 开启右上角"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目根目录

#### 方法二：使用打包好的ZIP文件
1. 从 `dist` 目录获取最新的ZIP安装包
2. 打开Chrome浏览器，访问 `chrome://extensions/`
3. 开启右上角"开发者模式"
4. 直接拖拽ZIP文件到扩展页面

### 2. 启动后端服务

#### 方式一：直接运行
```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动服务
npm start
```

#### 方式二：使用Docker Compose
```bash
# 开发环境启动
docker-compose up -d

# 生产环境启动（包含Nginx）
docker-compose --profile production up -d
```

后端服务默认运行在 `http://localhost:3000`

### 3. 环境配置

1. 复制环境变量示例文件
```bash
cp backend/.env.example backend/.env
```

2. 配置环境变量
编辑 `backend/.env` 文件，配置API密钥（可选，当前支持模拟数据）

### 4. 使用插件

1. 打开任意网页（如测试页面 `test.html`）
2. 选中一个料号，如 `ATMEGA328P-PU`
3. 右键选择"查询料号: ATMEGA328P-PU"
4. 观察右侧弹出的查询结果面板

## 📖 详细使用说明

### 右键查询

1. 在网页中选中任意料号文本
2. 右键菜单中选择"查询料号: [选中的料号]"
3. 右侧会弹出查询结果面板

### 手动查询

1. 点击浏览器右上角的插件图标
2. 在弹出的输入框中输入料号
3. 点击"查询"按钮
4. 结果会显示在当前页面右侧

### 自动识别

插件会自动识别网页中的料号（符合特定格式的文本），并在控制台输出识别结果。

### 查询结果面板

结果面板包含三个主要部分：

1. **料号基本信息**：显示查询的料号、生命周期状态和RoHS合规信息
2. **跨平台比价**：
   - 显示立创商城、DigiKey、云汉芯城等平台的价格
   - 显示实时库存数量
   - 显示交货期信息
   - 点击任意一行可跳转到对应平台的产品页面
3. **替代料推荐**：
   - 显示推荐的替代料型号
   - 标注替代类型（直接替代、参数等效、功能替代等）
   - 显示推荐来源和关键差异
   - 点击替代料可跳转到立创商城查询

## 🛠️ 部署指南

### 环境要求

- Node.js 18+（用于运行后端服务）
- Chrome浏览器 90+（支持Manifest V3）
- Docker 20.10.0+（可选，用于容器化部署）
- Docker Compose 2.0.0+（可选，用于多容器部署）

### 部署方式

#### 1. 传统部署

```bash
# 克隆项目
git clone <项目地址>
cd <项目目录>

# 安装后端依赖
cd backend
npm install --production

# 启动服务
npm start
```

#### 2. Docker部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

#### 3. 生产环境部署

```bash
# 启动生产环境服务（包含Nginx反向代理）
docker-compose --profile production up -d
```

### 配置说明

#### 环境变量配置

| 变量名 | 描述 | 示例值 | 是否必填 |
|-------|------|--------|----------|
| PORT | 服务器端口 | 3000 | 否（默认3000） |
| NODE_ENV | 运行环境 | production | 否（默认production） |
| LCSC_API_KEY | 立创商城API密钥 | your_api_key | 否（支持模拟数据） |
| DIGIKEY_CLIENT_ID | DigiKey API客户端ID | your_client_id | 否（支持模拟数据） |
| DIGIKEY_CLIENT_SECRET | DigiKey API客户端密钥 | your_client_secret | 否（支持模拟数据） |
| ICKEY_API_KEY | 云汉芯城API密钥 | your_api_key | 否（支持模拟数据） |

#### 前端配置

如果后端服务部署在不同的域名或端口，需要修改 `background.js` 中的API地址：

```javascript
// background.js 第64行
const response = await fetch(`http://<your-server>:<port>/api/part/${encodeURIComponent(partNumber)}`);
```

## 📝 开发说明

### 项目结构

```
├── manifest.json          # 插件配置文件（Manifest V3）
├── background.js          # 后台服务脚本
├── content.js             # 内容脚本，处理网页交互
├── popup.html             # 插件图标点击弹窗
├── popup.js               # 弹窗交互脚本
├── icons/                 # 插件图标目录
├── ui-designs/            # UI设计文档和效果图
├── backend/               # 后端代理服务
│   ├── Dockerfile         # 后端Dockerfile
│   ├── package.json       # 后端依赖配置
│   ├── server.js          # 主服务器文件
│   └── .env.example       # 环境变量示例文件
├── dist/                  # 打包输出目录
├── doc/                   # 项目文档
│   ├── 需求文档.md        # 详细需求文档
│   └── Docker部署方案.md  # Docker部署文档
├── test.html              # 测试页面
├── package.json           # 前端打包配置
├── build.js               # 打包脚本
├── validate.js            # 验证脚本
├── docker-compose.yml     # Docker Compose配置
├── .gitignore             # Git忽略文件配置
└── README.md              # 项目说明文档
```

### 开发流程

#### 1. 前端开发

```bash
# 修改前端代码后，在Chrome扩展页面点击"刷新"按钮
```

#### 2. 后端开发

```bash
# 进入后端目录
cd backend

# 启动开发服务器（自动重启）
npm run dev
```

#### 3. 打包测试

```bash
# 安装打包依赖
npm install

# 执行打包
npm run package

# 查看打包结果
ls -la dist/
```

### 技术栈

- **前端**: 原生JavaScript、Chrome Extension API (Manifest V3)
- **后端**: Node.js、Express
- **数据交互**: RESTful API
- **容器化**: Docker、Docker Compose
- **开发工具**: Visual Studio Code

## ❓ 常见问题及解决方案

### Q: 插件无法识别料号？
A: 目前插件使用简单的正则表达式识别料号，格式为5-20个字母数字组合。对于复杂格式的料号，建议手动选中查询。

### Q: 查询结果不准确？
A: 当前版本使用模拟数据，实际应用中需要接入真实的数据源API。模拟数据旨在展示功能和界面。

### Q: 后端服务启动失败？
A: 请检查以下几点：
   1. Node.js版本是否符合要求（18+）
   2. 3000端口是否被占用
   3. 依赖是否正确安装（执行 `npm install`）
   4. 查看日志获取详细错误信息

### Q: 插件没有右键菜单？
A: 请确保：
   1. 插件已正确安装
   2. 在当前网页有选中的文本内容
   3. 浏览器版本支持Manifest V3

### Q: Docker部署失败？
A: 请检查以下几点：
   1. Docker服务是否正在运行
   2. 端口是否被占用
   3. 查看Docker日志获取详细错误信息
   ```bash
   docker-compose logs -f
   ```

### Q: API访问超时？
A: 当前网络环境可能无法访问某些API提供商，建议：
   1. 检查网络连接
   2. 确认防火墙设置
   3. 暂时使用模拟数据（不配置API密钥）

## 📈 未来规划

### 短期计划（1-2个月）
1. 接入真实数据源API（芯查查、芯片智选等）
2. 优化替代料推荐算法
3. 完善UI设计和用户体验
4. 提交Chrome网上应用店

### 长期计划（3-6个月）
1. **BOM表分析**：支持上传和分析完整的BOM表
2. **导出功能**：支持将查询结果导出为Excel或PDF
3. **多浏览器支持**：扩展到Firefox、Edge等浏览器
4. **企业版功能**：团队协作、历史记录、权限管理
5. **移动端适配**：支持移动端浏览器
6. **AI增强**：使用机器学习优化替代料推荐

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 贡献流程

1. Fork本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 代码规范

- 遵循JavaScript Standard Style
- 保持代码简洁明了
- 添加必要的注释
- 提交前运行打包测试 (`npm run package`)

### 报告问题

如果您发现bug或有功能建议，请：
1. 检查是否已有相关Issue
2. 开启新Issue，提供详细描述
3. 包括复现步骤、预期结果和实际结果
4. 如有可能，提供截图或日志

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，欢迎联系我们：
- **项目地址**: https://github.com/yangpengfi/EC-RP-Comparator
- **邮箱**: pf0410y@gmail.com
- **开发者**: 开发团队

---

**电子料替代与比价助手** - 让电子料查询更高效！
