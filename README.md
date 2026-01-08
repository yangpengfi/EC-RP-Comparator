# 电子料替代与比价助手

一个嵌入工作流的Chrome浏览器插件，帮助硬件工程师、采购专员和小型贸易商快速查询电子料号的替代料和跨平台比价信息。

## 🌟 功能特点

### 核心功能
- **智能触发**：在网页中选中料号，右键一键查询
- **聚合结果面板**：右侧弹窗显示所有查询结果
- **替代料推荐**：来自多个数据源的替代型号推荐，标注替代类型和关键差异
- **跨平台比价**：实时显示主流分销商的价格、库存和交货期
- **风险快照**：产品生命周期状态、合规信息等关键数据

### 差异化亮点
- **工作流嵌入**：零跳转查询，无需切换标签页
- **决策辅助**：综合推荐指数，根据价格、库存、交期等自动排序
- **聚焦中国供应链**：加强国产替代料标注和推荐
- **支持多种场景**：PDF规格书、Excel物料清单、网页自动识别

## 🚀 快速开始

### 1. 安装插件

#### 方法一：Chrome商店安装（待发布）
1. 打开Chrome浏览器
2. 访问Chrome网上应用店
3. 搜索"电子料替代与比价助手"
4. 点击"添加至Chrome"

#### 方法二：本地开发模式安装
1. 下载或克隆本项目到本地
2. 打开Chrome浏览器，访问 `chrome://extensions/`
3. 开启右上角"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目根目录

### 2. 启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动服务
npm start
```

后端服务默认运行在 `http://localhost:3000`

### 3. 使用插件

1. 打开任意网页（如测试页面 `test.html`）
2. 选中一个料号，如 `ATMEGA328P-PU`
3. 右键选择"查询料号"
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

- Node.js 14+（用于运行后端服务）
- Chrome浏览器 90+（支持Manifest V3）

### 后端部署

1. 克隆项目到服务器

```bash
git clone <项目地址>
cd <项目目录>/backend
```

2. 安装依赖

```bash
npm install --production
```

3. 启动服务

```bash
# 直接启动
npm start

# 或使用进程管理工具
pm install -g pm2
pm run build
pm run start:prod
```

4. 配置环境变量（必需）

创建 `.env` 文件，配置以下环境变量：

```env
# 服务器配置
PORT=3000

# 立创商城API配置
LCSC_API_KEY=your_lcsc_api_key

# DigiKey API配置
DIGIKEY_CLIENT_ID=your_digikey_client_id
DIGIKEY_CLIENT_SECRET=your_digikey_client_secret

# 云汉芯城API配置
ICKEY_API_KEY=your_ickey_api_key

# 芯查查API配置（可选）
ICCHAX_API_KEY=your_icchax_api_key

# Mouser API配置（可选）
MOUSER_API_KEY=your_mouser_api_key

# Arrow API配置（可选）
ARROW_API_KEY=your_arrow_api_key

# 替代料API配置
ALTERNATIVE_API_KEY=your_alternative_api_key

# 风险信息API配置
RISK_INFO_API_KEY=your_risk_info_api_key
```

**说明**：
- 复制 `backend/.env.example` 文件为 `backend/.env` 并填充实际API密钥
- 至少需要配置立创商城API密钥以获取基本功能
- 其他API密钥为可选，配置后可获得更全面的数据
- 请确保保护好您的API密钥，不要将其提交到版本控制

### 前端配置

如果后端服务部署在不同的域名或端口，需要修改 `background.js` 中的API地址：

```javascript
// background.js
const response = await fetch(`http://<your-server>:<port>/api/part/${encodeURIComponent(partNumber)}`);
```

## 📝 开发说明

### 项目结构

```
├── manifest.json      # 插件配置文件（Manifest V3）
├── background.js      # 后台服务脚本
├── content.js         # 内容脚本，处理网页交互
├── popup.html         # 插件图标点击弹窗
├── popup.js           # 弹窗交互脚本
├── icons/             # 插件图标目录
├── ui-designs/        # UI设计文档和效果图
│   ├── popup-demo.html              # 主弹窗设计示例
│   ├── loading-popup-demo.html      # 加载弹窗设计示例
│   ├── error-popup-demo.html        # 错误弹窗设计示例
│   ├── result-popup-demo.html       # 结果弹窗设计示例
│   └── *.png                        # 设计效果图（PNG格式）
├── backend/           # 后端代理服务
│   ├── server.js      # 主服务器文件
│   ├── package.json   # 后端依赖配置
│   └── .env.example   # 环境变量示例文件
├── test.html          # 测试页面
├── .gitignore         # Git忽略文件配置
└── README.md          # 项目说明文档
```

### 开发流程

1. 前端开发

```bash
# 修改前端代码后，在Chrome扩展页面点击"刷新"按钮
```

2. 后端开发

```bash
# 进入后端目录
cd backend

# 启动开发服务器（自动重启）
npm run dev
```

### 技术栈

- 前端：原生JavaScript、Chrome Extension API
- 后端：Node.js、Express
- 数据交互：RESTful API

## ❓ 常见问题

### Q: 插件无法识别料号？
A: 目前插件使用简单的正则表达式识别料号，格式为5-20个字母数字组合。对于复杂格式的料号，建议手动选中查询。

### Q: 查询结果不准确？
A: 目前使用模拟数据，实际应用中需要接入真实的数据源API。

### Q: 后端服务启动失败？
A: 请检查Node.js版本是否符合要求（14+），并确保3000端口未被占用。

### Q: 插件没有右键菜单？
A: 请确保插件已正确安装，并且在当前网页有选中的文本内容。

## 📈 未来规划

1. **数据接入**：接入真实的数据源API（芯查查、芯片智选等）
2. **AI推荐**：使用机器学习算法优化替代料推荐
3. **BOM表分析**：支持上传和分析完整的BOM表
4. **导出功能**：支持将查询结果导出为Excel或PDF
5. **多浏览器支持**：扩展到Firefox、Edge等浏览器
6. **企业版功能**：团队协作、历史记录、权限管理

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，欢迎联系我们：
- 项目地址：<git@github.com:yangpengfi/EC-RP-Comparator.git>
- 邮箱：<pf0410y@gmail.com>

---

**电子料替代与比价助手** - 让电子料查询更高效！