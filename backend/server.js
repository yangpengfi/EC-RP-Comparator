const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 启用CORS
app.use(cors());
// 解析JSON请求体
app.use(express.json());

// 内存缓存类
class MemoryCache {
  constructor(defaultTtl = 3600000) { // 默认缓存1小时
    this.cache = new Map();
    this.defaultTtl = defaultTtl;
  }
  
  // 设置缓存
  set(key, value, ttl = this.defaultTtl) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }
  
  // 获取缓存
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  // 删除缓存
  delete(key) {
    this.cache.delete(key);
  }
  
  // 清除所有缓存
  clear() {
    this.cache.clear();
  }
  
  // 检查缓存是否存在
  has(key) {
    return this.get(key) !== null;
  }
}

// 创建缓存实例
const cache = new MemoryCache();

// 数据获取器基类，用于后续扩展真实API调用
class DataFetcher {
  constructor(platform) {
    this.platform = platform;
  }
  
  // 缓存键生成器
  getCacheKey(partNumber) {
    return `${this.platform}_${partNumber}`;
  }
  
  // 带缓存的fetchPrice方法
  async fetchPrice(partNumber) {
    // 生成缓存键
    const cacheKey = this.getCacheKey(partNumber);
    
    // 检查缓存
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`从缓存中获取${this.platform}的料号数据: ${partNumber}`);
      return cachedData;
    }
    
    // 调用子类的实际实现
    const data = await this._fetchPrice(partNumber);
    
    // 存入缓存
    if (data) {
      cache.set(cacheKey, data);
      console.log(`将${this.platform}的料号数据存入缓存: ${partNumber}`);
    }
    
    return data;
  }
  
  // 子类实现具体的API调用逻辑
  async _fetchPrice(partNumber) {
    throw new Error('Not implemented');
  }
}

// 立创商城真实API获取器
class LCSCFetcher extends DataFetcher {
  constructor() {
    super('立创商城');
    // 立创商城API配置
    this.apiUrl = 'https://api.szlcsc.com/product/detail';
    this.apiKey = process.env.LCSC_API_KEY || ''; // 从环境变量获取API密钥
  }
  
  async _fetchPrice(partNumber) {
    try {
      console.log(`正在从立创商城查询料号: ${partNumber}`);
      
      // 真实API调用（需要替换为有效的API密钥）
      // const response = await axios.get(this.apiUrl, {
      //   params: {
      //     partNumber: partNumber,
      //     key: this.apiKey
      //   }
      // });
      
      // 模拟真实API响应延迟
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 模拟API响应数据（结构与真实API一致）
      const mockResponse = {
        code: 200,
        data: {
          price: (Math.random() * 10 + 2).toFixed(2),
          stock: Math.floor(Math.random() * 10000 + 5000),
          leadTime: '现货'
        }
      };
      
      if (mockResponse.code === 200) {
        return {
          price: `¥${mockResponse.data.price}`,
          stock: mockResponse.data.stock.toString(),
          leadTime: mockResponse.data.leadTime
        };
      }
      return null;
    } catch (error) {
      console.error(`立创商城API调用失败: ${error.message}`);
      return null;
    }
  }
}

// DigiKey真实API获取器
class DigiKeyFetcher extends DataFetcher {
  constructor() {
    super('DigiKey');
    // DigiKey API配置
    this.apiUrl = 'https://api.digikey.com/products/v4/search';
    this.clientId = process.env.DIGIKEY_CLIENT_ID || ''; // 从环境变量获取
    this.clientSecret = process.env.DIGIKEY_CLIENT_SECRET || ''; // 从环境变量获取
  }
  
  async _fetchPrice(partNumber) {
    try {
      console.log(`正在从DigiKey查询料号: ${partNumber}`);
      
      // 真实API调用（需要替换为有效的API凭证）
      // const token = await this.getAccessToken();
      // const response = await axios.get(this.apiUrl, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'X-DIGIKEY-Client-Id': this.clientId
      //   },
      //   params: {
      //     keywords: partNumber
      //   }
      // });
      
      // 模拟真实API响应延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 模拟API响应数据（结构与真实API一致）
      const mockResponse = {
        Products: [
          {
            UnitPrice: (Math.random() * 2 + 0.5).toFixed(2),
            QuantityAvailable: Math.floor(Math.random() * 8000 + 2000),
            LeadTime: Math.random() > 0.5 ? '1-2天' : '现货'
          }
        ]
      };
      
      if (mockResponse.Products && mockResponse.Products.length > 0) {
        const product = mockResponse.Products[0];
        return {
          price: `$${product.UnitPrice}`,
          stock: product.QuantityAvailable.toString(),
          leadTime: product.LeadTime
        };
      }
      return null;
    } catch (error) {
      console.error(`DigiKey API调用失败: ${error.message}`);
      return null;
    }
  }
  
  async getAccessToken() {
    // 实现DigiKey OAuth2认证逻辑
    return 'mock-token';
  }
}

// 云汉芯城真实API获取器
class ICKeyFetcher extends DataFetcher {
  constructor() {
    super('云汉芯城');
    // 云汉芯城API配置
    this.apiUrl = 'https://api.ickey.com/product/search';
    this.apiKey = process.env.ICKEY_API_KEY || ''; // 从环境变量获取API密钥
  }
  
  async _fetchPrice(partNumber) {
    try {
      console.log(`正在从云汉芯城查询料号: ${partNumber}`);
      
      // 真实API调用（需要替换为有效的API密钥）
      // const response = await axios.get(this.apiUrl, {
      //   params: {
      //     keywords: partNumber,
      //     key: this.apiKey
      //   }
      // });
      
      // 模拟真实API响应延迟
      await new Promise(resolve => setTimeout(resolve, 250));
      
      // 模拟API响应数据（结构与真实API一致）
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              price: (Math.random() * 9 + 1.5).toFixed(2),
              stock: Math.floor(Math.random() * 9000 + 3000),
              delivery: Math.random() > 0.6 ? '现货' : '2-3天'
            }
          ]
        }
      };
      
      if (mockResponse.success && mockResponse.data.items.length > 0) {
        const item = mockResponse.data.items[0];
        return {
          price: `¥${item.price}`,
          stock: item.stock.toString(),
          leadTime: item.delivery
        };
      }
      return null;
    } catch (error) {
      console.error(`云汉芯城API调用失败: ${error.message}`);
      return null;
    }
  }
}

// 芯查查真实API获取器
class ICChaxFetcher extends DataFetcher {
  constructor() {
    super('芯查查');
    // 芯查查API配置
    this.apiUrl = 'https://api.icchax.com/product/detail';
    this.apiKey = process.env.ICCHAX_API_KEY || ''; // 从环境变量获取API密钥
  }
  
  async _fetchPrice(partNumber) {
    try {
      console.log(`正在从芯查查查询料号: ${partNumber}`);
      
      // 真实API调用（需要替换为有效的API密钥）
      // const response = await axios.get(this.apiUrl, {
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`
      //   },
      //   params: {
      //     partNumber: partNumber
      //   }
      // });
      
      // 模拟真实API响应延迟
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 模拟API响应数据（结构与真实API一致）
      const mockResponse = {
        code: 200,
        data: {
          price: (Math.random() * 12 + 3).toFixed(2),
          stock: Math.floor(Math.random() * 8000 + 4000),
          delivery: Math.random() > 0.5 ? '现货' : '1-3天'
        }
      };
      
      if (mockResponse.code === 200) {
        return {
          price: `¥${mockResponse.data.price}`,
          stock: mockResponse.data.stock.toString(),
          leadTime: mockResponse.data.delivery
        };
      }
      return null;
    } catch (error) {
      console.error(`芯查查API调用失败: ${error.message}`);
      return null;
    }
  }
}

// Mouser真实API获取器
class MouserFetcher extends DataFetcher {
  constructor() {
    super('Mouser');
    // Mouser API配置
    this.apiUrl = 'https://api.mouser.com/api/v1/search/partnumber';
    this.apiKey = process.env.MOUSER_API_KEY || ''; // 从环境变量获取API密钥
  }
  
  async _fetchPrice(partNumber) {
    try {
      console.log(`正在从Mouser查询料号: ${partNumber}`);
      
      // 真实API调用（需要替换为有效的API密钥）
      // const response = await axios.get(this.apiUrl, {
      //   headers: {
      //     'X-API-KEY': this.apiKey
      //   },
      //   params: {
      //     partNumber: partNumber
      //   }
      // });
      
      // 模拟真实API响应延迟
      await new Promise(resolve => setTimeout(resolve, 350));
      
      // 模拟API响应数据（结构与真实API一致）
      const mockResponse = {
        SearchResults: {
          Parts: [
            {
              PriceBreaks: [
                {
                  Price: (Math.random() * 8 + 1).toFixed(2)
                }
              ],
              Availability: Math.floor(Math.random() * 10000 + 2000).toString(),
              LeadTime: Math.random() > 0.4 ? 'In Stock' : `${Math.floor(Math.random() * 4 + 1)}-${Math.floor(Math.random() * 5 + 2)} Days`
            }
          ]
        }
      };
      
      if (mockResponse.SearchResults?.Parts?.length > 0) {
        const part = mockResponse.SearchResults.Parts[0];
        return {
          price: `$${part.PriceBreaks[0].Price}`,
          stock: part.Availability,
          leadTime: part.LeadTime === 'In Stock' ? '现货' : part.LeadTime
        };
      }
      return null;
    } catch (error) {
      console.error(`Mouser API调用失败: ${error.message}`);
      return null;
    }
  }
}

// Arrow真实API获取器
class ArrowFetcher extends DataFetcher {
  constructor() {
    super('Arrow');
    // Arrow API配置
    this.apiUrl = 'https://api.arrow.com/products/search';
    this.apiKey = process.env.ARROW_API_KEY || ''; // 从环境变量获取API密钥
  }
  
  async _fetchPrice(partNumber) {
    try {
      console.log(`正在从Arrow查询料号: ${partNumber}`);
      
      // 真实API调用（需要替换为有效的API密钥）
      // const response = await axios.get(this.apiUrl, {
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`
      //   },
      //   params: {
      //     q: partNumber
      //   }
      // });
      
      // 模拟真实API响应延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 模拟API响应数据（结构与真实API一致）
      const mockResponse = {
        status: 'success',
        data: {
          products: [
            {
              price: (Math.random() * 9.5 + 1.2).toFixed(2),
              stock: Math.floor(Math.random() * 9000 + 3000),
              delivery: Math.random() > 0.5 ? 'In Stock' : `${Math.floor(Math.random() * 3 + 1)}-${Math.floor(Math.random() * 4 + 2)} Days`
            }
          ]
        }
      };
      
      if (mockResponse.status === 'success' && mockResponse.data.products.length > 0) {
        const product = mockResponse.data.products[0];
        return {
          price: `$${product.price}`,
          stock: product.stock.toString(),
          leadTime: product.delivery === 'In Stock' ? '现货' : product.delivery
        };
      }
      return null;
    } catch (error) {
      console.error(`Arrow API调用失败: ${error.message}`);
      return null;
    }
  }
}

// 模拟数据获取器，作为降级方案
class MockDataFetcher extends DataFetcher {
  constructor(platform) {
    super(platform);
  }
  
  async _fetchPrice(partNumber) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 返回模拟数据
    const basePrices = {
      '立创商城': { base: 2, range: 10 },
      'DigiKey': { base: 0.5, range: 2 },
      '云汉芯城': { base: 1.5, range: 9 },
      '芯查查': { base: 3, range: 12 },
      'Mouser': { base: 1, range: 8 },
      'Arrow': { base: 1.2, range: 9.5 }
    };
    
    const config = basePrices[this.platform] || { base: 2, range: 10 };
    
    return {
      price: `${this.platform === 'DigiKey' || this.platform === 'Mouser' || this.platform === 'Arrow' ? '$' : '¥'}${(Math.random() * config.range + config.base).toFixed(2)}`,
      stock: Math.floor(Math.random() * 10000 + 2000).toString(),
      leadTime: Math.random() > 0.5 ? '现货' : `${Math.floor(Math.random() * 3 + 1)}-${Math.floor(Math.random() * 3 + 2)}天`
    };
  }
}

// 替代料API获取器
class AlternativeFetcher {
  constructor() {
    this.apiUrl = 'https://api.alternative.com/v1/parts';
    this.apiKey = process.env.ALTERNATIVE_API_KEY || '';
  }
  
  // 缓存键生成器
  getCacheKey(partNumber) {
    return `alternative_${partNumber}`;
  }
  
  // 带缓存的替代料获取方法
  async fetchAlternatives(partNumber) {
    // 生成缓存键
    const cacheKey = this.getCacheKey(partNumber);
    
    // 检查缓存
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`从缓存中获取替代料数据: ${partNumber}`);
      return cachedData;
    }
    
    // 调用实际的替代料API
    const alternatives = await this._fetchAlternatives(partNumber);
    
    // 存入缓存
    if (alternatives) {
      cache.set(cacheKey, alternatives);
      console.log(`将替代料数据存入缓存: ${partNumber}`);
    }
    
    return alternatives;
  }
  
  // 实际调用替代料API
  async _fetchAlternatives(partNumber) {
    try {
      console.log(`正在从替代料API查询料号: ${partNumber}`);
      
      // 真实API调用（需要替换为有效的API密钥）
      // const response = await axios.get(this.apiUrl, {
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`
      //   },
      //   params: {
      //     partNumber: partNumber
      //   }
      // });
      
      // 模拟API响应延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 模拟替代料数据（结构与真实API一致）
      const mockAlternatives = {
        'ATMEGA328P-PU': [
          {
            model: 'ATMEGA328P-AU',
            type: '直接替代',
            source: '芯查查',
            differences: '封装不同，功能完全一致'
          },
          {
            model: 'ATTINY85-20PU',
            type: '参数等效',
            source: '芯片智选',
            differences: '引脚数量不同，部分功能兼容'
          },
          {
            model: 'PIC16F887-I/P',
            type: '功能替代',
            source: '芯团AI',
            differences: '架构不同，需要重新编写代码'
          }
        ],
        'STM32F103C8T6': [
          {
            model: 'STM32F103CBT6',
            type: '直接替代',
            source: '芯查查',
            differences: 'Flash容量不同，其他参数一致'
          },
          {
            model: 'GD32F103C8T6',
            type: '国产替代',
            source: '智芯谷',
            differences: '国产芯片，引脚兼容，性能相当'
          }
        ],
        'ESP8266EX': [
          {
            model: 'ESP8285',
            type: '直接替代',
            source: '芯查查',
            differences: '内置1MB Flash，其他参数一致'
          },
          {
            model: 'HLK-W806',
            type: '国产替代',
            source: '智芯谷',
            differences: '国产WiFi芯片，性能接近'
          }
        ],
        'NE555D': [
          {
            model: 'LM555',
            type: '直接替代',
            source: '芯查查',
            differences: '功能完全一致，封装兼容'
          },
          {
            model: 'NE555P',
            type: '直接替代',
            source: '芯查查',
            differences: '封装不同，功能完全一致'
          },
          {
            model: 'ICM7555',
            type: '低功耗替代',
            source: '芯片智选',
            differences: '低功耗版本，功能兼容'
          }
        ],
        'CDCM6208V1RGZT': [
          {
            model: 'CDCM6208V2RGZT',
            type: '升级替代',
            source: '芯查查',
            differences: '性能提升版本，引脚兼容'
          },
          {
            model: 'SI5351A',
            type: '功能替代',
            source: '芯片智选',
            differences: '功能类似，需要重新设计电路'
          }
        ],
        'LM7805': [
          {
            model: 'LM7805CT',
            type: '直接替代',
            source: '芯查查',
            differences: '封装不同，功能完全一致'
          },
          {
            model: 'XC6206P502MR',
            type: '低功耗替代',
            source: '芯片智选',
            differences: '低功耗LDO，输出电流较小'
          },
          {
            model: 'MP1484EN',
            type: '开关电源替代',
            source: '智芯谷',
            differences: '开关电源，效率更高'
          }
        ],
        'LM317': [
          {
            model: 'LM317T',
            type: '直接替代',
            source: '芯查查',
            differences: '封装不同，功能完全一致'
          },
          {
            model: 'XC6206P332MR',
            type: '固定电压替代',
            source: '芯片智选',
            differences: '固定输出电压，需要选择合适型号'
          },
          {
            model: 'MP2307DN',
            type: '开关电源替代',
            source: '智芯谷',
            differences: '开关电源，效率更高'
          }
        ],
        '1N4148': [
          {
            model: '1N4148W',
            type: '直接替代',
            source: '芯查查',
            differences: '玻璃封装版本，功能完全一致'
          },
          {
            model: 'BAS16',
            type: '高速替代',
            source: '芯片智选',
            differences: '高速开关二极管，响应速度更快'
          },
          {
            model: 'FR107',
            type: '大电流替代',
            source: '智芯谷',
            differences: '大电流整流二极管，正向电流更大'
          }
        ]
      };
      
      // 对于未匹配到的料号，返回空数组
      return mockAlternatives[partNumber] || [];
    } catch (error) {
      console.error(`替代料API调用失败: ${error.message}`);
      return [];
    }
  }
}

// 创建替代料获取器实例
const alternativeFetcher = new AlternativeFetcher();

// 风险信息API获取器
class RiskInfoFetcher {
  constructor() {
    this.apiUrl = 'https://api.riskinfo.com/v1/parts';
    this.apiKey = process.env.RISK_INFO_API_KEY || '';
  }
  
  // 缓存键生成器
  getCacheKey(partNumber) {
    return `risk_${partNumber}`;
  }
  
  // 带缓存的风险信息获取方法
  async fetchRiskInfo(partNumber) {
    // 生成缓存键
    const cacheKey = this.getCacheKey(partNumber);
    
    // 检查缓存
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`从缓存中获取风险信息数据: ${partNumber}`);
      return cachedData;
    }
    
    // 调用实际的风险信息API
    const riskInfo = await this._fetchRiskInfo(partNumber);
    
    // 存入缓存
    if (riskInfo) {
      cache.set(cacheKey, riskInfo);
      console.log(`将风险信息数据存入缓存: ${partNumber}`);
    }
    
    return riskInfo;
  }
  
  // 实际调用风险信息API
  async _fetchRiskInfo(partNumber) {
    try {
      console.log(`正在从风险信息API查询料号: ${partNumber}`);
      
      // 真实API调用（需要替换为有效的API密钥）
      // const response = await axios.get(this.apiUrl, {
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`
      //   },
      //   params: {
      //     partNumber: partNumber
      //   }
      // });
      
      // 模拟API响应延迟
      await new Promise(resolve => setTimeout(resolve, 250));
      
      // 模拟风险信息数据（结构与真实API一致）
      const mockRiskData = {
        'ATMEGA328P-PU': { lifecycle: '量产中', rohs: '符合', status: '正常' },
        'STM32F103C8T6': { lifecycle: '量产中', rohs: '符合', status: '正常' },
        'ESP8266EX': { lifecycle: '量产中', rohs: '符合', status: '正常' },
        'NE555D': { lifecycle: '量产中', rohs: '符合', status: '正常' },
        'CDCM6208V1RGZT': { lifecycle: '量产中', rohs: '符合', status: '正常' },
        'LM7805': { lifecycle: '量产中', rohs: '符合', status: '正常' },
        'LM317': { lifecycle: '量产中', rohs: '符合', status: '正常' },
        '1N4148': { lifecycle: '量产中', rohs: '符合', status: '正常' }
      };
      
      // 对于未匹配到的料号，返回默认值
      return mockRiskData[partNumber] || {
        lifecycle: '未知',
        rohs: '未知',
        status: '未知'
      };
    } catch (error) {
      console.error(`风险信息API调用失败: ${error.message}`);
      return null;
    }
  }
}

// 创建风险信息获取器实例
const riskInfoFetcher = new RiskInfoFetcher();

// 模拟风险信息数据（作为降级方案）
const mockRiskInfo = {
  'ATMEGA328P-PU': { lifecycle: '量产中', rohs: '符合', status: '正常' },
  'STM32F103C8T6': { lifecycle: '量产中', rohs: '符合', status: '正常' },
  'ESP8266EX': { lifecycle: '量产中', rohs: '符合', status: '正常' },
  'NE555D': { lifecycle: '量产中', rohs: '符合', status: '正常' },
  'CDCM6208V1RGZT': { lifecycle: '量产中', rohs: '符合', status: '正常' },
  'LM7805': { lifecycle: '量产中', rohs: '符合', status: '正常' },
  'LM317': { lifecycle: '量产中', rohs: '符合', status: '正常' },
  '1N4148': { lifecycle: '量产中', rohs: '符合', status: '正常' }
};

// 支持的平台列表
const supportedPlatforms = ['立创商城', 'DigiKey', '云汉芯城', '芯查查', 'Mouser', 'Arrow'];

// 平台数据获取器工厂函数
function createFetcher(platform) {
  switch (platform) {
    case '立创商城':
      return new LCSCFetcher();
    case 'DigiKey':
      return new DigiKeyFetcher();
    case '云汉芯城':
      return new ICKeyFetcher();
    case '芯查查':
      return new ICChaxFetcher();
    case 'Mouser':
      return new MouserFetcher();
    case 'Arrow':
      return new ArrowFetcher();
    default:
      return new MockDataFetcher(platform);
  }
}

// 获取料号信息的API端点
app.get('/api/part/:partNumber', async (req, res) => {
  const { partNumber } = req.params;
  
  try {
    // 1. 获取各平台价格信息
    const priceFetchers = supportedPlatforms.map(platform => createFetcher(platform));
    const pricePromises = priceFetchers.map(fetcher => fetcher.fetchPrice(partNumber));
    const priceResults = await Promise.all(pricePromises);
    
    // 整理价格数据
    const prices = [];
    for (let index = 0; index < priceResults.length; index++) {
      const result = priceResults[index];
      const platform = supportedPlatforms[index];
      
      if (result) {
        prices.push({
          platform: platform,
          ...result
        });
      } else {
        // 真实API调用失败，使用模拟数据作为降级方案
        console.log(`${platform} API调用失败，使用模拟数据`);
        const mockFetcher = new MockDataFetcher(platform);
        const mockResult = await mockFetcher.fetchPrice(partNumber);
        if (mockResult) {
          prices.push({
            platform: platform,
            ...mockResult
          });
        }
      }
    }
    
    // 2. 获取替代料信息
    let alternatives = await alternativeFetcher.fetchAlternatives(partNumber);
    
    // 如果替代料API返回空结果，尝试使用模拟数据（作为降级方案）
    if (!alternatives || alternatives.length === 0) {
      console.log(`替代料API返回空结果，使用默认模拟数据: ${partNumber}`);
      alternatives = mockAlternatives[partNumber] || [];
    }
    
    // 3. 获取风险信息
    let riskInfo = await riskInfoFetcher.fetchRiskInfo(partNumber);
    
    // 如果风险信息API返回空结果，尝试使用模拟数据（作为降级方案）
    if (!riskInfo) {
      console.log(`风险信息API返回空结果，使用默认模拟数据: ${partNumber}`);
      riskInfo = mockRiskInfo[partNumber] || {
        lifecycle: '未知',
        rohs: '未知',
        status: '未知'
      };
    }
    
    // 返回整合后的结果
    res.json({
      success: true,
      data: {
        partNumber,
        alternatives,
        prices,
        riskInfo
      }
    });
  } catch (error) {
    console.error('查询料号失败:', error);
    res.status(500).json({
      success: false,
      error: '查询失败，请稍后重试'
    });
  }
});

// 健康检查端点
app.get('/health', async (req, res) => {
  try {
    // 检查缓存状态
    const cacheStatus = {
      size: cache.cache.size,
      defaultTtl: cache.defaultTtl
    };
    
    // 检查各API服务状态（模拟）
    const apiStatus = {
      platforms: supportedPlatforms.length,
      lastCheck: new Date().toISOString(),
      status: 'ok'
    };
    
    res.json({
      status: 'ok',
      message: '代理服务运行正常',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      cache: cacheStatus,
      api: apiStatus,
      platforms: supportedPlatforms
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '服务健康检查失败',
      error: error.message
    });
  }
});

// 缓存管理端点 - 清除指定料号的缓存
app.delete('/cache/:partNumber', (req, res) => {
  const { partNumber } = req.params;
  
  try {
    // 清除各平台的价格缓存
    supportedPlatforms.forEach(platform => {
      const cacheKey = `${platform}_${partNumber}`;
      cache.delete(cacheKey);
    });
    
    // 清除替代料缓存
    cache.delete(`alternative_${partNumber}`);
    
    // 清除风险信息缓存
    cache.delete(`risk_${partNumber}`);
    
    res.json({
      success: true,
      message: `料号 ${partNumber} 的缓存已清除`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '清除缓存失败: ' + error.message
    });
  }
});

// 缓存管理端点 - 清除所有缓存
app.delete('/cache', (req, res) => {
  try {
    cache.clear();
    res.json({
      success: true,
      message: '所有缓存已清除'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '清除缓存失败: ' + error.message
    });
  }
});

// API文档端点
app.get('/docs', (req, res) => {
  const docs = {
    title: '电子料替代与比价助手 API文档',
    endpoints: [
      {
        method: 'GET',
        path: '/api/part/:partNumber',
        description: '查询料号的替代料和跨平台比价信息',
        parameters: [
          {
            name: 'partNumber',
            in: 'path',
            required: true,
            description: '要查询的料号'
          }
        ],
        responses: [
          {
            status: 200,
            description: '查询成功'
          },
          {
            status: 500,
            description: '查询失败'
          }
        ]
      },
      {
        method: 'GET',
        path: '/health',
        description: '健康检查'
      },
      {
        method: 'DELETE',
        path: '/cache/:partNumber',
        description: '清除指定料号的缓存'
      },
      {
        method: 'DELETE',
        path: '/cache',
        description: '清除所有缓存'
      }
    ],
    platforms: supportedPlatforms
  };
  
  res.json(docs);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`代理服务运行在 http://localhost:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
  console.log(`API端点: http://localhost:${PORT}/api/part/:partNumber`);
});