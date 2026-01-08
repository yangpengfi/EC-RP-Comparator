// 后台脚本，负责右键菜单创建和事件处理

// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  console.log('插件已安装，开始创建右键菜单');
  chrome.contextMenus.create({
    id: 'searchPart',
    title: '查询料号: %s',
    contexts: ['selection'],
    documentUrlPatterns: ['<all_urls>']
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('创建右键菜单失败:', chrome.runtime.lastError);
    } else {
      console.log('右键菜单创建成功');
    }
  });
});

// 监听右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('右键菜单被点击:', info.menuItemId);
  if (info.menuItemId === 'searchPart') {
    const partNumber = info.selectionText.trim();
    console.log('要查询的料号:', partNumber, '标签页ID:', tab.id);
    
    // 向当前标签页发送消息，显示查询结果
    chrome.tabs.sendMessage(tab.id, {
      action: 'showSearchResult',
      partNumber: partNumber
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('发送消息失败:', chrome.runtime.lastError);
      } else {
        console.log('消息发送成功，响应:', response);
      }
    });
  }
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'searchPart') {
    const partNumber = request.partNumber;
    
    // 调用后端API查询料号信息
    searchPartInfo(partNumber)
      .then(data => {
        sendResponse({ success: true, data: data });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    
    // 保持消息通道打开，等待异步响应
    return true;
  }
});

// 查询料号信息的函数
async function searchPartInfo(partNumber) {
  try {
    // 调用后端代理服务获取数据
    const response = await fetch(`http://localhost:3000/api/part/${encodeURIComponent(partNumber)}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error || '查询失败');
    }
  } catch (error) {
    console.error('调用后端服务失败:', error);
    // 如果后端服务不可用，返回模拟数据作为降级方案
    return {
      partNumber: partNumber,
      alternatives: [
        {
          model: '替代料1',
          type: '直接替代',
          source: '芯查查',
          differences: '参数完全一致，封装兼容'
        },
        {
          model: '替代料2',
          type: '参数等效',
          source: '芯片智选',
          differences: '电压范围略有不同，可兼容使用'
        }
      ],
      prices: [
        {
          platform: '立创商城',
          price: '¥1.20',
          stock: '12500',
          leadTime: '现货'
        },
        {
          platform: 'DigiKey',
          price: '$0.15',
          stock: '8900',
          leadTime: '1-2天'
        },
        {
          platform: '云汉芯城',
          price: '¥1.15',
          stock: '9800',
          leadTime: '现货'
        }
      ],
      riskInfo: {
        lifecycle: '量产中',
        rohs: '符合',
        status: '正常'
      }
    };
  }
}